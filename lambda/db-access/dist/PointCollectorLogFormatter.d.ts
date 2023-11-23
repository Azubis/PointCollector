import { LogFormatter } from "@aws-lambda-powertools/logger";
import { LogAttributes, UnformattedAttributes } from "@aws-lambda-powertools/logger/lib/types";
export declare class PointCollectorLogFormatter extends LogFormatter {
    formatAttributes(attributes: UnformattedAttributes): LogAttributes;
}
