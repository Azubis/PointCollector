import {RdsClusterServerlessv2ScalingConfiguration} from '@cdktf/provider-aws/lib/rds-cluster';
import {PROJECT_NAME} from '../common/constants';
import {Md5} from 'ts-md5';

export enum AwsEnvironments {
    dev = "dev",
    prod = "prod"
}

export const parseAWSEnvironment = (env?: string): AwsEnvironments => {
    switch (env) {
        case AwsEnvironments.dev:
            return AwsEnvironments.dev
        case AwsEnvironments.prod:
            return AwsEnvironments.prod
        default:
            return AwsEnvironments.dev
    }
}



export interface AwsConfiguration {
    awsRegion: string
    awsAccountId: string
    awsProfile?: string
    appConfig: AppConfiguration
    environment: AwsEnvironments
}

/**
 * Hier können wir unsere App-Konfiguration definieren
 */
export interface AppConfiguration {
    rootDomain: string,
    certificateArn?: string
    database: DatabaseConfiguration
}


export interface DatabaseConfiguration {
    scalingConfiguration: RdsClusterServerlessv2ScalingConfiguration
    backupRetentionPeriod: number
    deletionProtection: boolean
    skipFinalSnapshot: boolean
    preferredMaintenanceWindow: string
}


const awsConfigurations: Record<AwsEnvironments, AwsConfiguration> = {
    [AwsEnvironments.dev]: {
        awsRegion: "eu-west-1",
        awsAccountId: "334697558813",
        awsProfile: "mic-dev",
        appConfig: {
            rootDomain: "aws.micromata.de",
            certificateArn: "arn:aws:acm:eu-west-1:334697558813:certificate/1b508200-0293-4bea-be3f-762cd5533998",
            database: {
                scalingConfiguration: {
                    minCapacity: 0.5,
                    maxCapacity: 1
                },
                backupRetentionPeriod: 1,
                deletionProtection: false,
                skipFinalSnapshot: true,
                preferredMaintenanceWindow: "thu:22:47-thu:23:17"
            },

        },
        environment: AwsEnvironments.dev
    },
    [AwsEnvironments.prod]: {
        awsRegion: "eu-west-1",
        awsAccountId: "",
        awsProfile: "mic-prod",
        appConfig: {
            rootDomain: "aws.micromata.de",
            certificateArn: "arn:aws:acm:eu-west-1:334697558813:certificate/1b508200-0293-4bea-be3f-762cd5533998",
            database: {
                scalingConfiguration: {
                    minCapacity: 1,
                    maxCapacity: 2
                },
                backupRetentionPeriod: 1,
                deletionProtection: false,
                skipFinalSnapshot: true,
                preferredMaintenanceWindow: "thu:22:47-thu:23:17"
            },
        },
        environment: AwsEnvironments.prod
    }

}
export const getAwsConfiguration = (env: AwsEnvironments) => {
    const configuration = awsConfigurations[env]
    return {
        ...configuration,
        awsProfile: process.env.CI ? undefined : configuration.awsProfile,
        environment: env
    }
}

const projectPrefix = "nora"
export const name = (resourceType: string, resourceName: string) => `${projectPrefix}-${resourceType}-${resourceName}`

export const getFullDomainName = (awsConfiguration: AwsConfiguration) => `${projectPrefix}-${awsConfiguration.environment}.${awsConfiguration.appConfig.rootDomain}`

export const servicePolicyName = (purpose: string) => policyName("service", purpose)

export const userPolicyName = (purpose: string) => policyName("user", purpose)

const policyName = (usage: string, purpose: string) => {
    const projectNameStartIndex = purpose.indexOf(PROJECT_NAME)
    if (projectNameStartIndex !== -1) {
        const projectNameEndIndex = projectNameStartIndex + PROJECT_NAME.length
        return shortenString(
          `${purpose.substring(0, projectNameEndIndex)}-${usage}-${purpose.substring(projectNameEndIndex)}`.replace(
            /--/g,
            "-"
          )
        )
    }
    return shortenString(`${PROJECT_NAME}-${usage}-${purpose}`)
}

export function shortenString(str: string) {
    if (str.length > 128) {
        // TF only allows 128 chars for resource names
        const hash = Md5.hashStr(str).substring(0, 5)
        return `${str.substring(0, 128 - hash.length - 1)}-${hash}`
    }
    return str
}
