import {KmsAlias} from "@cdktf/provider-aws/lib/kms-alias";
import {KmsKey} from "@cdktf/provider-aws/lib/kms-key";
import {Construct} from "constructs";
import {
    DataAwsIamPolicyDocument,
    DataAwsIamPolicyDocumentStatement
} from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

export interface KmsKeyExport {
    alias: KmsAlias
    key: KmsKey
}

export function createKmsKey(scope: Construct, id: string, props: {
    awsAccountId: string
    keyName?: string
    policyStatements?: DataAwsIamPolicyDocumentStatement[]
}, skipDenyStatement: boolean = false): KmsKeyExport {
    const defaultStatements: DataAwsIamPolicyDocumentStatement[] = [
        {
            sid: "Enable IAM User Permissions",
            effect: "Allow",
            principals: [
                {
                    type: "AWS",
                    identifiers: [`arn:aws:iam::${props.awsAccountId}:root`]
                }
            ],
            actions: ["kms:*"],
            resources: ["*"]
        }
    ]
    if (!skipDenyStatement) {
        defaultStatements.push({
            sid: `denyCrossAccountAccess`,
            effect: "Deny",
            principals: [
                {
                    type: "*",
                    identifiers: ["*"]
                }
            ],
            actions: ["*"],
            condition: [
                {
                    test: "StringNotEquals",
                    variable: "kms:CallerAccount",
                    values: [props.awsAccountId]
                }
            ]
        })
    }
    const policy = new DataAwsIamPolicyDocument(scope, `${id}-policy`, {
        statement: [...defaultStatements, ...(props.policyStatements ?? [])]
    })

    const key = new KmsKey(scope, `${id}-key`, {
        enableKeyRotation: true,
        policy: policy.json
    })
    const alias = new KmsAlias(scope, `${id}-alias`, {
        targetKeyId: key.arn,
        name: props.keyName ?? `alias/${id}-key`
    })

    return { alias, key }

}