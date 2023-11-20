import {Construct} from 'constructs';
import {prefixedName} from '../../common/constants';
import {EcsCluster} from '@cdktf/provider-aws/lib/ecs-cluster';
import {EcsTaskDefinition} from '@cdktf/provider-aws/lib/ecs-task-definition';
import {EcsService} from '@cdktf/provider-aws/lib/ecs-service';
import {Subnet} from '@cdktf/provider-aws/lib/subnet';
import {LbTargetGroup} from '@cdktf/provider-aws/lib/lb-target-group';
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group';
import {IamRole} from '@cdktf/provider-aws/lib/iam-role';
import {CloudwatchLogGroup} from '@cdktf/provider-aws/lib/cloudwatch-log-group';
import {BaseStack} from './base-stack';

type Config = {
    subnets: Subnet[]
    vpcId: string
    desiredServiceCount: number
    targetGroup: LbTargetGroup
    securityGroup: SecurityGroup
    //efsStorageId: string;
    dbUserSecretArn: string,
    dbSchemaName: string,
    dbSecurityGroupId: string,
    vpcEndpointSecurityGroupId: string
};

export class ContainerStack extends BaseStack {
    constructor(scope: Construct, name: string, config: Config) {
        super(scope, name);

        const cluster = new EcsCluster(this, prefixedName("app-cluster"), {
            name: prefixedName("app-cluster"),
        });

        const taskExecutionRole = new IamRole(this, "ecs-task-execution-role", {
            name: prefixedName(`ecs-task-execution-role`),
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "ecs-tasks.amazonaws.com",
                        },
                        Effect: "Allow",
                    },
                ],
            }),
            inlinePolicy: [
                {
                    name: prefixedName("ecs-task-execution-role-policy"),
                    policy: JSON.stringify({
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Action: ["secretsmanager:GetSecretValue"],
                                Effect: "Allow",
                                Resource:
                                    "arn:aws:secretsmanager:eu-west-1:334697558813:secret:github-package-eSV35s",
                            },
                            {
                                Effect: "Allow",
                                Action: [
                                    "logs:CreateLogStream",
                                    "logs:PutLogEvents",
                                ],
                                Resource: "*",
                            },
                        ],
                    }),
                },
            ],
        });

        // Role that allows us to push logs
        const taskRole = new IamRole(this, prefixedName('task-role'), {
            name: prefixedName('task-role'),
            inlinePolicy: [
                {
                    name: "allow-logs",
                    policy: JSON.stringify({
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Effect: "Allow",
                                Action: [
                                    "logs:CreateLogStream",
                                    "logs:PutLogEvents",
                                ],
                                Resource: "*",
                            },
                        ],
                    }),
                },
            ],
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sts:AssumeRole",
                        Effect: "Allow",
                        Sid: "",
                        Principal: {
                            Service: "ecs-tasks.amazonaws.com",
                        },
                    },
                ],
            }),
        });

        const logGroup = new CloudwatchLogGroup(this, prefixedName(`loggroup`), {
            name: prefixedName("log-group"),
            retentionInDays: 30,
        });

        const containerName = prefixedName("app-container")
        const backendTaskDefinition = new EcsTaskDefinition(this, prefixedName("task-definition"), {
            family: prefixedName("app-task"),
            memory: "512",
            cpu: "256",
            networkMode: "awsvpc",
            requiresCompatibilities: ["FARGATE"],
            executionRoleArn: taskExecutionRole.arn,
            taskRoleArn: taskRole.arn,
            // volume: [
            //     {
            //         efsVolumeConfiguration: {
            //             /*
            //                     authorizationConfig: {
            //                         accessPointId: test.id,
            //                         iam: "ENABLED",
            //                     },
            //              */
            //             //fileSystemId: config.efsStorageId,
            //             rootDirectory: "/opt/data",
            //             transitEncryption: "ENABLED",
            //             transitEncryptionPort: 2999,
            //         },
            //         name: prefixedName("service-storage"),
            //     },
            // ],
            containerDefinitions: JSON.stringify([
                {
                    name: containerName,
                    image: "ghcr.io/micromata/nora:latest",
                    repositoryCredentials: {
                        credentialsParameter:
                            "arn:aws:secretsmanager:eu-west-1:334697558813:secret:github-package-eSV35s",
                    },
                    environment: [
                        { name: "SPRING_PROFILES_ACTIVE", value: "AWS" },
                    ],

                    cpu: 256,
                    memory: 512,
                    essential: true,
                    portMappings: [
                        {
                            containerPort: 8080,
                            hostPort: 8080,
                        },
                    ],
                    logConfiguration: {
                        logDriver: "awslogs",
                        options: {
                            // Defines the log
                            "awslogs-group": logGroup.name,
                            "awslogs-stream-prefix": name, // TODO
                            "awslogs-region": this.awsConfiguration.awsRegion,
                        },
                    },
                    healthCheck: {
                        command: [
                            "CMD-SHELL",
                            "curl --fail http://localhost:8080/ || exit 1",
                        ],
                        interval: 10,
                        retries: 3,
                        startPeriod: 120, // needs to be quite high, since a simple spring application takes ~1min to start
                    },
                },
            ]),
        });

        new EcsService(this, prefixedName("app-service"), {
            name: prefixedName("app-service"),
            cluster: cluster.arn,
            desiredCount: config.desiredServiceCount,
            taskDefinition: backendTaskDefinition.arn,
            launchType: "FARGATE",

            networkConfiguration: {
                securityGroups: [config.securityGroup.id],
                subnets: config.subnets.map((subnet) => subnet.id),
                assignPublicIp: false,
            },

            loadBalancer: [
                {
                    targetGroupArn: config.targetGroup.arn,
                    containerName: containerName,
                    containerPort: 8080,
                },
            ],
        });
    }
}
