import { Construct } from "constructs"
import { SnsTopic } from "@cdktf/provider-aws/lib/sns-topic"
import { SnsTopicPolicy } from "@cdktf/provider-aws/lib/sns-topic-policy"

import { createKmsKey } from "../create-kms-key"

interface Props {
  name: string
  awsAccountId: string
  awsRegion: string
  additionalPublisherPrincipals?: { type: string; identifier: string }[]
  policyStatements?: any[]
  skipKeyDenyStatement?: boolean
}

export class EncryptedSnsTopic extends Construct {
  readonly topic: SnsTopic

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const additionalKeyPolicies =
      props.additionalPublisherPrincipals?.map((principal) => ({
        effect: "Allow",
        principals: [
          {
            type: principal.type,
            identifiers: [principal.identifier]
          }
        ],
        actions: ["kms:Decrypt", "kms:GenerateDataKey"],
        resources: ["*"]
      })) || []

    const { key: masterKey } = createKmsKey(
      scope,
      `${id}-key`,
      {
        awsAccountId: props.awsAccountId,
        keyName: `alias/${props.name}-key`,
        policyStatements: [
          {
            effect: "Allow",
            principals: [
              {
                type: "Service",
                identifiers: ["sns.amazonaws.com"]
              }
            ],
            actions: [
              "kms:Encrypt*",
              "kms:Decrypt*",
              "kms:ReEncrypt*",
              "kms:GenerateDataKey*",
              "kms:Describe*"
            ],
            resources: [`arn:aws:sns:${props.awsRegion}:${props.awsAccountId}:${props.name}`],
            condition: [
              {
                test: "StringEquals",
                variable: "kms:CallerAccount",
                values: [props.awsAccountId]
              }
            ]
          },
          ...additionalKeyPolicies
        ]
      },
      props.skipKeyDenyStatement ?? false
    )

    this.topic = new SnsTopic(this, `${id}-topic`, {
      name: props.name,
      kmsMasterKeyId: masterKey.keyId
    })

    const additionalTopicPolices =
      props.additionalPublisherPrincipals?.map((principal) => ({
        Effect: "Allow",
        Principal: {
          Service: principal.identifier
        },
        Action: "sns:Publish",
        Resource: this.topic.arn
      })) || []

    new SnsTopicPolicy(this, `${id}-access-policy`, {
      arn: this.topic.arn,
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "deny-http-subscription",
            Effect: "Deny",
            Principal: {
              AWS: "*"
            },
            Action: ["sns:Receive", "sns:Subscribe"],
            Resource: "*",
            Condition: {
              StringEquals: {
                "SNS:Protocol": "http"
              }
            }
          },
          {
            Sid: "enforce-secure-transport",
            Effect: "Deny",
            Principal: {
              AWS: "*"
            },
            Action: "sns:Publish",
            Resource: "*",
            Condition: {
              Bool: {
                "aws:SecureTransport": "false"
              }
            }
          },
          ...(props?.policyStatements || []),
          ...additionalTopicPolices
        ]
      })
    })
  }
}

