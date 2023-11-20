import {TerraformStack} from "cdktf";
import {Construct} from "constructs";
import {getAwsConfiguration, parseAWSEnvironment} from "../../config/configuration";
import {configureAwsProvider} from "../../common/configure-aws-provider";
import {PROJECT_NAME} from "../../common/constants";
import {IamRole} from "@cdktf/provider-aws/lib/iam-role";
import {IamPolicy} from "@cdktf/provider-aws/lib/iam-policy";

/**
 * This stack creates shared ressources that are used ie by github and co
 */
export class CdkTfBootstrapDeployStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        const {awsRegion, awsAccountId, environment, awsProfile} = getAwsConfiguration(
            parseAWSEnvironment(process.env.ENV)
        )

        configureAwsProvider(this, {
            awsRegion,
            awsAccountId,
            awsProfile,
            environment,
            projectName: PROJECT_NAME
        })

        const githubDeployPolicy = new IamPolicy(this, 'githubDeployPolicy', {
            name: "nora-github-deploy-policy",
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Action: [
                        "ecs:*",
                        "ecs:DescribeTaskDefinition",
                        "ecr:GetAuthorizationToken",
                        "iam:PassRole"
                    ],
                    Resource: "*"
                }]
            })
        })
        new IamRole(this, 'githubDeployRole', {
            name: "nora-github-deploy-role",
            assumeRolePolicy: JSON.stringify({
                Statement: [{
                    Effect: "Allow",
                    Principal: {
                        Federated: `arn:aws:iam::${awsAccountId}:oidc-provider/token.actions.githubusercontent.com`
                    },
                    Action: ["sts:AssumeRoleWithWebIdentity"],
                    Condition: {
                        StringEquals: {
                            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                        },
                        StringLike: {
                            "token.actions.githubusercontent.com:sub": "repo:micromata/nora:*"
                        }
                    }
                }]
            }),
            managedPolicyArns: [githubDeployPolicy.arn]
        })
    }

}
