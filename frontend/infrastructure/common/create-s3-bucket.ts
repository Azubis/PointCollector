import {S3Bucket, S3BucketConfig} from "@cdktf/provider-aws/lib/s3-bucket"
import {KmsKey} from "@cdktf/provider-aws/lib/kms-key";
import {DataAwsIamPolicyDocumentStatement} from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import {Construct} from "constructs";
import {createKmsKey} from "./create-kms-key";
export interface S3BucketExport {
    bucket: S3Bucket
    bucketKey: KmsKey
}

export interface ExtendedS3BucketConfig extends S3BucketConfig {
    account: string
    region: string
    policyStatements?: DataAwsIamPolicyDocumentStatement[]
}

export function createS3Bucket(scope: Construct, id: string, props: ExtendedS3BucketConfig): S3BucketExport {
    const { key } = createKmsKey(scope, id, { awsAccountId: props.account})
    const bucket = new S3Bucket(scope, id, props)

    return {bucket: bucket, bucketKey: key}
}