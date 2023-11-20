import {PROJECT_NAME} from './constants';

export const PARAMETER_VPC_HA_ID = `/${PROJECT_NAME}/root/vpcha`
export const PARAMETER_VPC_HA_ENDPOINT_HOSTNAME = `/${PROJECT_NAME}/root/vpcha/endpoint/hostname`

export const PARAMETER_FIREHOSE_COMPLIANCE_ROLE_ARN = `/${PROJECT_NAME}/root/iam/firehoseComplianceRoleArn`

export const PARAMETER_FIREHOSE_COMPLIANCE_STREAM_ARN = `/${PROJECT_NAME}/root/firehose/firehoseComplianceStreamArn`

export const PARAMETER_LOG_KEY_ARN = `/${PROJECT_NAME}/kms/logsKeyArn`
export const PARAMETER_COMPLIANCE_BUCKET_ARN = `/root/complianceBucketArn`
export const PARAMETER_COMPLIANCE_BUCKET_KEY_ARN = `/root/complianceBucketKeyArn`

