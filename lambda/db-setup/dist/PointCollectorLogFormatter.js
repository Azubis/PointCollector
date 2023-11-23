"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointCollectorLogFormatter = void 0;
const logger_1 = require("@aws-lambda-powertools/logger");
class PointCollectorLogFormatter extends logger_1.LogFormatter {
    formatAttributes(attributes) {
        var _a, _b, _c, _d, _e, _f;
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
                awsRequestId: (_a = attributes.lambdaContext) === null || _a === void 0 ? void 0 : _a.awsRequestId,
                xRayTraceId: attributes.xRayTraceId
            },
            lambdaFunction: {
                name: (_b = attributes.lambdaContext) === null || _b === void 0 ? void 0 : _b.functionName,
                arn: (_c = attributes.lambdaContext) === null || _c === void 0 ? void 0 : _c.invokedFunctionArn,
                memoryLimitInMB: (_d = attributes.lambdaContext) === null || _d === void 0 ? void 0 : _d.memoryLimitInMB,
                version: (_e = attributes.lambdaContext) === null || _e === void 0 ? void 0 : _e.functionVersion,
                coldStart: (_f = attributes.lambdaContext) === null || _f === void 0 ? void 0 : _f.coldStart
            },
            logger: {
                sampleRateValue: attributes.sampleRateValue
            }
        };
    }
}
exports.PointCollectorLogFormatter = PointCollectorLogFormatter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9pbnRDb2xsZWN0b3JMb2dGb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUG9pbnRDb2xsZWN0b3JMb2dGb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMERBQTREO0FBRzVELE1BQWEsMEJBQTJCLFNBQVEscUJBQVk7SUFDakQsZ0JBQWdCLENBQUMsVUFBaUM7O1FBQ3JELE9BQU87WUFDSCxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztZQUM1RCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsT0FBTyxFQUFFLFVBQVUsQ0FBQyxXQUFXO1lBQy9CLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWM7WUFDeEMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPO1lBQzNCLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVztZQUNuQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDL0IsYUFBYSxFQUFFLFVBQVUsQ0FBQyxXQUFXO1lBQ3JDLGNBQWMsRUFBRTtnQkFDWixZQUFZLEVBQUUsTUFBQSxVQUFVLENBQUMsYUFBYSwwQ0FBRSxZQUFZO2dCQUNwRCxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7YUFDdEM7WUFDRCxjQUFjLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLE1BQUEsVUFBVSxDQUFDLGFBQWEsMENBQUUsWUFBWTtnQkFDNUMsR0FBRyxFQUFFLE1BQUEsVUFBVSxDQUFDLGFBQWEsMENBQUUsa0JBQWtCO2dCQUNqRCxlQUFlLEVBQUUsTUFBQSxVQUFVLENBQUMsYUFBYSwwQ0FBRSxlQUFlO2dCQUMxRCxPQUFPLEVBQUUsTUFBQSxVQUFVLENBQUMsYUFBYSwwQ0FBRSxlQUFlO2dCQUNsRCxTQUFTLEVBQUUsTUFBQSxVQUFVLENBQUMsYUFBYSwwQ0FBRSxTQUFTO2FBQ2pEO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZTthQUM5QztTQUNKLENBQUE7SUFDTCxDQUFDO0NBQ0o7QUEzQkQsZ0VBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9nRm9ybWF0dGVyIH0gZnJvbSBcIkBhd3MtbGFtYmRhLXBvd2VydG9vbHMvbG9nZ2VyXCJcbmltcG9ydCB7IExvZ0F0dHJpYnV0ZXMsIFVuZm9ybWF0dGVkQXR0cmlidXRlcyB9IGZyb20gXCJAYXdzLWxhbWJkYS1wb3dlcnRvb2xzL2xvZ2dlci9saWIvdHlwZXNcIlxuXG5leHBvcnQgY2xhc3MgUG9pbnRDb2xsZWN0b3JMb2dGb3JtYXR0ZXIgZXh0ZW5kcyBMb2dGb3JtYXR0ZXIge1xuICAgIHB1YmxpYyBmb3JtYXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXM6IFVuZm9ybWF0dGVkQXR0cmlidXRlcyk6IExvZ0F0dHJpYnV0ZXMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGltZXN0YW1wOiBNYXRoLmZsb29yKGF0dHJpYnV0ZXMudGltZXN0YW1wLmdldFRpbWUoKSAvIDEwMDApLFxuICAgICAgICAgICAgbG9nTGV2ZWw6IGF0dHJpYnV0ZXMubG9nTGV2ZWwsXG4gICAgICAgICAgICBzZXJ2aWNlOiBhdHRyaWJ1dGVzLnNlcnZpY2VOYW1lLFxuICAgICAgICAgICAgYXdzQWNjb3VudElkOiBwcm9jZXNzLmVudi5BV1NfQUNDT1VOVF9JRCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGF0dHJpYnV0ZXMubWVzc2FnZSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiBhdHRyaWJ1dGVzLmVudmlyb25tZW50LFxuICAgICAgICAgICAgYXdzUmVnaW9uOiBhdHRyaWJ1dGVzLmF3c1JlZ2lvbixcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IGF0dHJpYnV0ZXMueFJheVRyYWNlSWQsXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkczoge1xuICAgICAgICAgICAgICAgIGF3c1JlcXVlc3RJZDogYXR0cmlidXRlcy5sYW1iZGFDb250ZXh0Py5hd3NSZXF1ZXN0SWQsXG4gICAgICAgICAgICAgICAgeFJheVRyYWNlSWQ6IGF0dHJpYnV0ZXMueFJheVRyYWNlSWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYW1iZGFGdW5jdGlvbjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IGF0dHJpYnV0ZXMubGFtYmRhQ29udGV4dD8uZnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgIGFybjogYXR0cmlidXRlcy5sYW1iZGFDb250ZXh0Py5pbnZva2VkRnVuY3Rpb25Bcm4sXG4gICAgICAgICAgICAgICAgbWVtb3J5TGltaXRJbk1COiBhdHRyaWJ1dGVzLmxhbWJkYUNvbnRleHQ/Lm1lbW9yeUxpbWl0SW5NQixcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiBhdHRyaWJ1dGVzLmxhbWJkYUNvbnRleHQ/LmZ1bmN0aW9uVmVyc2lvbixcbiAgICAgICAgICAgICAgICBjb2xkU3RhcnQ6IGF0dHJpYnV0ZXMubGFtYmRhQ29udGV4dD8uY29sZFN0YXJ0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nZ2VyOiB7XG4gICAgICAgICAgICAgICAgc2FtcGxlUmF0ZVZhbHVlOiBhdHRyaWJ1dGVzLnNhbXBsZVJhdGVWYWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19