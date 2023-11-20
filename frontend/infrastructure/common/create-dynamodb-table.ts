import {DynamodbTable, DynamodbTableConfig} from "@cdktf/provider-aws/lib/dynamodb-table";
import {Construct} from "constructs";
import {createKmsKey} from "./create-kms-key";

export interface ExtendedDynamodbTable extends DynamodbTableConfig {
    awsAccountId: string
}
export function createDynamodbTable(scope: Construct, id: string, props: ExtendedDynamodbTable): DynamodbTable {
    const { key } = createKmsKey(scope, id, {awsAccountId: props.awsAccountId})

    return new DynamodbTable(scope, id, {
        ...props,
        serverSideEncryption: {
            enabled: true,
            kmsKeyArn: key.arn
        },
        pointInTimeRecovery: {
            enabled: true
        }
    })

}