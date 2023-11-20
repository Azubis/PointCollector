import {Construct} from "constructs";
import {PROJECT_NAME} from "./constants";
import {S3Backend} from "cdktf";

export function configureTerraformBackend(
    scope: Construct,
    props: {
        awsRegion: string
        awsAccountId: string
        awsProfile?: string
        name: string
    }
) {
    const stateBucketName = `${PROJECT_NAME}-cdktf-state-${props.awsAccountId}`
    const stateDynamoTableName = `${PROJECT_NAME}-cdktf-state`

    new S3Backend(scope, {
        bucket: stateBucketName,
        dynamodbTable: stateDynamoTableName,
        key: `terraform.${props.name}.tfstate`,
        region: props.awsRegion,
        profile: props.awsProfile
    })
}