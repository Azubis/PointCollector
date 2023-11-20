import {BaseStack} from './base-stack';
import {DEFAULT_LAMBDA_RUNTIME_VERSION, prefixedName} from '../../common/constants';
import {Construct} from 'constructs';
import {DataArchiveFile} from '@cdktf/provider-archive/lib/data-archive-file';
import {LambdaLayerVersion} from '@cdktf/provider-aws/lib/lambda-layer-version';
import {AssetType, Fn, TerraformAsset} from 'cdktf';
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group';
import {EgressIngressSecurityGroupRules} from '../../common/constructs/egress-ingress-security-group-rules';
import {IamPolicy} from '@cdktf/provider-aws/lib/iam-policy';
import {servicePolicyName} from '../../config/configuration';
import {IamRole} from '@cdktf/provider-aws/lib/iam-role';
import {CompliantLambda} from '../../common/constructs/compliant-lambda';
import {ResourcePolicyStatement, SecretPolicyConfig} from './resource-policy-stack';
import {ArchiveProvider} from '@cdktf/provider-archive/lib/provider';
import {LambdaFunction} from '@cdktf/provider-aws/lib/lambda-function';

interface Props {
    vpcId: string
    subnetIds: string[]
    dbSecurityGroupId: string
    vpcEndpointSecurityGroupId: string
    databaseName: string
    schemaName: string
    rootUserSecretArn: string
    appUserSecretArn: string
}

export class DatabaseSetupStack extends BaseStack {
    readonly dbSetupFunction: LambdaFunction
    readonly dbAccessFunction: LambdaFunction
    readonly secretsManagerEndpointPolicyStatements: ResourcePolicyStatement[] = []
    readonly secretsPolicyConfigs: SecretPolicyConfig[] = []

    constructor(scope: Construct, name: string, props: Props) {
        super(scope, name)
        new ArchiveProvider(this, "archive")

        const securityGroup = this.createSecurityGroup(props)
        this.dbSetupFunction = this.createSetupLambda(this.awsConfiguration.awsRegion, securityGroup, props)
        this.dbAccessFunction = this.createAccessLambda(this.awsConfiguration.awsRegion, securityGroup, props)
    }

    private createSecurityGroup(props: Props) {
        const setupFunctionSg = new SecurityGroup(this, prefixedName("db-access-functions-sg"), {
            vpcId: props.vpcId,
            name: prefixedName("database-setup-functions-sg")
        })
        new EgressIngressSecurityGroupRules(this, prefixedName("db-access-functions-to-vpc-endpoints-sg-rules"), {
            egressSecurityGroupId: setupFunctionSg.id,
            ingressSecurityGroupId: props.vpcEndpointSecurityGroupId,
            description: "Allow access from db access function to VPC endpoints",
            protocol: "tcp",
            toPort: 443,
            fromPort: 443
        })
        new EgressIngressSecurityGroupRules(this, prefixedName("db-access-functions-to-db-sg-rules"), {
            egressSecurityGroupId: setupFunctionSg.id,
            ingressSecurityGroupId: props.dbSecurityGroupId,
            description: "Allow access from db access function to DB",
            protocol: "tcp",
            toPort: 5432,
            fromPort: 5432
        })
        return setupFunctionSg
    }


    private createAccessLambda(awsRegion: string, securityGroup: SecurityGroup, props: Props): CompliantLambda {
        const customManagedPolicy = new IamPolicy(this, prefixedName("db-access-function-policy"), {
            name: servicePolicyName("db-access-function"),
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: ["secretsmanager:GetSecretValue"],
                        Resource: [props.appUserSecretArn]
                    }
                ]
            })
        })
        const executionRole = new IamRole(this, prefixedName("db-access-function-role"), {
            name: prefixedName("db-access-function-role"),
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "lambda.amazonaws.com"
                        },
                        Effect: "Allow",
                        Sid: ""
                    }
                ]
            }),
            managedPolicyArns: [
                "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
                customManagedPolicy.arn
            ]
        })

        this.secretsManagerEndpointPolicyStatements.push({
            Effect: "Allow",
            Principal: { AWS: executionRole.arn },
            Action: ["secretsmanager:GetSecretValue"],
            Resource: [props.appUserSecretArn]
        })
        this.secretsPolicyConfigs.push({
            secretArn: props.appUserSecretArn,
            policyStatements: [
                {
                    Effect: "Allow",
                    Principal: { AWS: executionRole.arn },
                    Action: ["secretsmanager:GetSecretValue"],
                    Resource: ["*"]
                }
            ]
        })

        const lambdaLayerArchive = new DataArchiveFile(this, prefixedName("db-access-function-layer-archive"), {
            type: "zip",
            sourceDir: "../../../../lambda/db-access/lambda-layer/dependency-layer/",
            outputPath: "../../../../lambda/db-access/lambda-layer/dependency-layer.zip"
        })

        const layer = new LambdaLayerVersion(this, prefixedName("db-access-function-layer"), {
            layerName: prefixedName("db-access-function-layer"),
            filename: lambdaLayerArchive.outputPath,
            sourceCodeHash: Fn.filebase64sha256(lambdaLayerArchive.outputPath)
        })

        const assets = new TerraformAsset(this, prefixedName("db-access-function-assets"), {
            path: "../lambda/db-access/dist",
            type: AssetType.ARCHIVE
        })

        const lambda = new CompliantLambda(this, prefixedName("db-access-function"), {
            functionName: prefixedName("db-access-function"),
            description: "Allows access to run RDS SQL commands",
            vpcConfig: {
                subnetIds: props.subnetIds,
                securityGroupIds: [securityGroup.id]
            },
            role: executionRole.arn,
            filename: assets.path,
            handler: "index.handler",
            runtime: DEFAULT_LAMBDA_RUNTIME_VERSION,
            layers: [layer.arn],
            timeout: 60,
            memorySize: 128,
            reservedConcurrentExecutions: 1, // executed once during deployment
            logRetentionDays: 30,
            environment: {
                variables: {
                    REGION: awsRegion,
                    DB_NAME: props.databaseName,
                    DB_SCHEMA_NAME: props.schemaName,
                    DB_USER_SECRET_ARN: props.appUserSecretArn
                }
            }
        })

        return lambda
    }

    private createSetupLambda = (awsRegion: string, securityGroup: SecurityGroup, props: Props): CompliantLambda => {
        const customManagedPolicy = new IamPolicy(this, prefixedName("db-setup-function-policy"), {
            name: servicePolicyName("db-setup-function"),
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: ["secretsmanager:GetSecretValue"],
                        Resource: [props.rootUserSecretArn, props.appUserSecretArn]
                    }
                ]
            })
        })
        const executionRole = new IamRole(this, prefixedName("db-setup-function-role"), {
            name: prefixedName("db-setup-function-role"),
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "lambda.amazonaws.com"
                        },
                        Effect: "Allow",
                        Sid: ""
                    }
                ]
            }),
            managedPolicyArns: [
                "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
                customManagedPolicy.arn
            ]
        })

        this.secretsManagerEndpointPolicyStatements.push({
            Effect: "Allow",
            Principal: { AWS: executionRole.arn },
            Action: ["secretsmanager:GetSecretValue"],
            Resource: [props.rootUserSecretArn, props.appUserSecretArn]
        })
        this.secretsPolicyConfigs.push({
            secretArn: props.rootUserSecretArn,
            policyStatements: [
                {
                    Effect: "Allow",
                    Principal: { AWS: executionRole.arn },
                    Action: ["secretsmanager:GetSecretValue"],
                    Resource: ["*"]
                }
            ]
        })

        const lambdaLayerArchive = new DataArchiveFile(this, prefixedName("db-setup-function-layer-archive"), {
            type: "zip",
            sourceDir: "../../../../lambda/db-setup/lambda-layer/dependency-layer/",
            outputPath: "../../../../lambda/db-setup/lambda-layer/dependency-layer.zip"
        })
        const layer = new LambdaLayerVersion(this, prefixedName("db-setup-function-layer"), {
            layerName: prefixedName("db-setup-function-layer"),
            filename: lambdaLayerArchive.outputPath,
            sourceCodeHash: Fn.filebase64sha256(lambdaLayerArchive.outputPath)
        })

        const assets = new TerraformAsset(this, prefixedName("db-setup-function-assets"), {
            path: "../lambda/db-setup/dist",
            type: AssetType.ARCHIVE
        })

        const lambda = new CompliantLambda(this, prefixedName("db-setup-function"), {
            functionName: prefixedName("db-setup-function"),
            description: "Sets up database with schema, roles and privileges",
            vpcConfig: {
                subnetIds: props.subnetIds,
                securityGroupIds: [securityGroup.id]
            },
            role: executionRole.arn,
            filename: assets.path,
            handler: "index.handler",
            runtime: DEFAULT_LAMBDA_RUNTIME_VERSION,
            layers: [layer.arn],
            timeout: 60,
            memorySize: 128,
            reservedConcurrentExecutions: 1, // executed once during deployment
            logRetentionDays: 30,
            environment: {
                variables: {
                    REGION: awsRegion,
                    DB_NAME: props.databaseName,
                    DB_SCHEMA_NAME: props.schemaName,
                    DB_SECRET_ARN: props.rootUserSecretArn,
                    DB_USER_SECRET_ARN: props.appUserSecretArn,
                }
            }
        })

        return lambda
    };

}
