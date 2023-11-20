import {TerraformStack} from "cdktf";
import {Construct} from "constructs";
import {getAwsConfiguration, parseAWSEnvironment} from "../../config/configuration";
import {configureAwsProvider} from "../../common/configure-aws-provider";
import {PROJECT_NAME} from "../../common/constants";
import {configureTerraformBackend} from "../../common/configure-terraform-backend";
import {createS3Bucket} from "../../common/create-s3-bucket";
import {S3BucketVersioningA} from "@cdktf/provider-aws/lib/s3-bucket-versioning";
import {createDynamodbTable} from "../../common/create-dynamodb-table";
import {S3BucketLifecycleConfiguration} from "@cdktf/provider-aws/lib/s3-bucket-lifecycle-configuration";

export class CdkTfBootstrapStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        const { awsRegion, awsAccountId, environment, awsProfile } = getAwsConfiguration(
            parseAWSEnvironment(process.env.ENV)
        )

        configureAwsProvider(this, {
            awsRegion,
            awsAccountId,
            awsProfile,
            environment,
            projectName: PROJECT_NAME
        })

        const stateBucketName = `${PROJECT_NAME}-cdktf-state-${awsAccountId}`
        const stateDynamoTableName = `${PROJECT_NAME}-cdktf-state`

        const isInitialized = false
        if (isInitialized) {
            configureTerraformBackend(this, {
                awsRegion,
                awsAccountId,
                awsProfile,
                name
            })
        }

        const { bucket } = createS3Bucket(this, 'state-bucket', {
            bucket: stateBucketName,
            account: awsAccountId,
            region: awsRegion
        })

        const versioning = new S3BucketVersioningA(this, 'bucket-versioning', {
            bucket: bucket.bucket,
            versioningConfiguration: {
                status: "Enabled"
            }
        })

        new S3BucketLifecycleConfiguration(this, "bucket-lifecycle-configuration", {
            dependsOn: [versioning],
            bucket: bucket.bucket,
            rule: [
                {
                    id: "default",
                    filter: {},
                    noncurrentVersionExpiration: {
                        noncurrentDays: 90
                    },
                    noncurrentVersionTransition: [
                        { noncurrentDays: 30, storageClass: "STANDARD_IA" },
                        { noncurrentDays: 60, storageClass: "GLACIER" }
                    ],
                    status: "Enabled"
                }
            ]
        })
        createDynamodbTable(this, "table", {
            name: stateDynamoTableName,
            billingMode: "PAY_PER_REQUEST",
            hashKey: "LockID",
            attribute: [
                {
                    name: "LockID",
                    type: "S"
                }
            ],
            awsAccountId: awsAccountId
        })
    }
}