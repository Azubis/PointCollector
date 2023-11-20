import { LogFormatter } from "@aws-lambda-powertools/logger"
import { LogAttributes, UnformattedAttributes } from "@aws-lambda-powertools/logger/lib/types"

export class NoraLogFormatter extends LogFormatter {
    public formatAttributes(attributes: UnformattedAttributes): LogAttributes {
        return {
            timestamp: Math.floor(attributes.timestamp.getTime() / 1000),
            logLevel: attributes.logLevel,
            service: attributes.serviceName,
            awsAccountId: process.env.AWS_ACCOUNT_ID,
            message: attributes.message,
            environment: attributes.environment,
            awsRegion: attributes.awsRegion,
            correlationId: attributes.xRayTraceId,
            correlationIds: {
                awsRequestId: attributes.lambdaContext?.awsRequestId,
                xRayTraceId: attributes.xRayTraceId
            },
            lambdaFunction: {
                name: attributes.lambdaContext?.functionName,
                arn: attributes.lambdaContext?.invokedFunctionArn,
                memoryLimitInMB: attributes.lambdaContext?.memoryLimitInMB,
                version: attributes.lambdaContext?.functionVersion,
                coldStart: attributes.lambdaContext?.coldStart
            },
            logger: {
                sampleRateValue: attributes.sampleRateValue
            }
        }
    }
}
