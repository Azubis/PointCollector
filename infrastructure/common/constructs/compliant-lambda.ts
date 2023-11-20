import { Construct } from "constructs"
import { LambdaFunction, LambdaFunctionConfig } from "@cdktf/provider-aws/lib/lambda-function"

import { createEncryptedLogGroup } from "../create-encrypted-log-group"

interface Props extends LambdaFunctionConfig {
  logRetentionDays: number
}
export class CompliantLambda extends LambdaFunction {
  constructor(scope: Construct, name: string, props: Props) {
    super(scope, name, props)

    createEncryptedLogGroup(scope, `${name}-log-group`, {
      name: `/aws/lambda/${props.functionName}`,
      retentionInDays: props.logRetentionDays
    })
  }
}
