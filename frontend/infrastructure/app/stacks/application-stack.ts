import {BaseStack} from './base-stack';
import {Construct} from 'constructs';
import {KmsKey} from '@cdktf/provider-aws/lib/kms-key';
import {KmsAlias} from '@cdktf/provider-aws/lib/kms-alias';
import {prefixedName} from '../../common/constants';
import {SsmParameter} from '@cdktf/provider-aws/lib/ssm-parameter';
import {PARAMETER_LOG_KEY_ARN} from '../../common/parameters';

export class ApplicationStack extends BaseStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        const policy = this.createKeyPolicy(this.awsConfiguration.awsRegion, this.awsConfiguration.awsAccountId);

        //1. neue KMS Key erstellen für Log Group Encryption. Alias soll definiert werden, damit in AWS console zuordnenbar
        const logGroupKey = new KmsKey(this, prefixedName('log-group'), {
            description: 'KMS Key für Log Group Encryption',
            enableKeyRotation: true,
            policy: policy,
        });

        new KmsAlias(this, prefixedName('log-group-kms-key-alias'), {
            name: `alias/${prefixedName("log-group-kms-key")}`,
            targetKeyId: logGroupKey.arn,
        });

        //2. ssm Parameter erstellen: mit Arn des KMS Keys, name: PARAMETER_LOG_KEY_ARN
        new SsmParameter(this, prefixedName('log-group-parameter'), {
            name: PARAMETER_LOG_KEY_ARN,
            type: 'String',
            value: logGroupKey.arn,
        });
        //3. Alle anderen Stacks müssen auf den KMS Key zugreifen können, von diesem Stack abhängig machen
    }

    private createKeyPolicy = (region: string, account: string) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: {
                    AWS: `arn:aws:iam::${account}:root`
                },
                Action: "kms:*",
                Resource: "*"
            },
            {
                Effect: "Allow",
                Principal: {
                    Service: `logs.${region}.amazonaws.com`
                },
                Action: ["kms:Encrypt*", "kms:Decrypt*", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:Describe*"],
                Resource: "*",
                Condition: {
                    ArnLike: {
                        "kms:EncryptionContext:aws:logs:arn": `arn:aws:logs:${region}:${account}:*`
                    }
                }
            }
        ]
    });
}
