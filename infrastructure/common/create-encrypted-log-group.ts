import {Construct} from 'constructs'
import {CloudwatchLogGroup, CloudwatchLogGroupConfig} from '@cdktf/provider-aws/lib/cloudwatch-log-group'
import {DataAwsSsmParameter} from '@cdktf/provider-aws/lib/data-aws-ssm-parameter'

import {PARAMETER_LOG_KEY_ARN} from './parameters'

let logGroupConfiguration: {
  logKeyArn: string
}

interface ExtendedCloudwatchLogGroupConfig extends CloudwatchLogGroupConfig {
  // do not crete Cloudwatch log group subscription filter
  skipFilter?: boolean
}

export function createEncryptedLogGroup(
  scope: Construct,
  loggedResourceId: string,
  props: ExtendedCloudwatchLogGroupConfig
) {
  if (!logGroupConfiguration) {
    logGroupConfiguration = loadLogGroupConfiguration(scope)
  }

  const logGroup = new CloudwatchLogGroup(scope, `${loggedResourceId}-loggroup`, {
    ...props,
    kmsKeyId: logGroupConfiguration.logKeyArn
  })

  return logGroup
}

function loadLogGroupConfiguration(scope: Construct) {
  const logKeyArn = new DataAwsSsmParameter(scope, 'log-key-arn-lookup', {
    name: PARAMETER_LOG_KEY_ARN
  }).value

  return {
    logKeyArn
  }
}

