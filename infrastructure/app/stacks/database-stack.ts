import {AssetType, TerraformAsset} from 'cdktf'
import {Construct} from 'constructs'
import {DbSubnetGroup} from '@cdktf/provider-aws/lib/db-subnet-group'
import {SecretsmanagerSecret} from '@cdktf/provider-aws/lib/secretsmanager-secret'
import {SecretsmanagerSecretVersion} from '@cdktf/provider-aws/lib/secretsmanager-secret-version'
import {RdsClusterParameterGroup} from '@cdktf/provider-aws/lib/rds-cluster-parameter-group'
import {SecretsmanagerSecretRotation} from '@cdktf/provider-aws/lib/secretsmanager-secret-rotation'
import {IamRole} from '@cdktf/provider-aws/lib/iam-role'
import {IamPolicy} from '@cdktf/provider-aws/lib/iam-policy'
import {LambdaPermission} from '@cdktf/provider-aws/lib/lambda-permission'
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group'
import {SecurityGroupRule} from '@cdktf/provider-aws/lib/security-group-rule'
import {CloudwatchLogGroup} from '@cdktf/provider-aws/lib/cloudwatch-log-group'
import {prefixedName, PROJECT_NAME} from '../../common/constants'
import {createEncryptedLogGroup} from '../../common/create-encrypted-log-group'
import {CompliantLambda} from '../../common/constructs/compliant-lambda'
import {DisallowAllOutboundRule} from '../../common/constructs/disallow-all-outbound-rule'
import {EgressIngressSecurityGroupRules} from '../../common/constructs/egress-ingress-security-group-rules'

import {ResourcePolicyStatement} from './resource-policy-stack'
import {BaseStack} from './base-stack';
import {servicePolicyName} from '../../config/configuration';
import {Password} from '@cdktf/provider-random/lib/password';
import {RandomProvider} from '@cdktf/provider-random/lib/provider';
import {createKmsKey} from '../../common/create-kms-key';
import {RdsCluster} from '@cdktf/provider-aws/lib/rds-cluster';
import {RdsClusterInstance} from '@cdktf/provider-aws/lib/rds-cluster-instance';
import {Id} from '@cdktf/provider-random/lib/id';

interface Props {
  vpcId: string
  vpcCidrBlock: string
  subnetIds: string[]
  availabilityZones: string[]
  vpcEndpointSecurityGroupId: string
  numberOfInstances: number
}

export class DatabaseStack extends BaseStack {
  readonly dbSecurityGroup: SecurityGroup
  readonly databaseName = `${PROJECT_NAME}db`
  readonly schemaName = 'nora'
  readonly rootUserSecret: SecretsmanagerSecret
  readonly appUserName = `${PROJECT_NAME}_app_user`
  readonly appUserSecret: SecretsmanagerSecret
  readonly secretsManagerEndpointPolicyStatements: ResourcePolicyStatement[] = []
  readonly clusterUrl: string
  readonly clusterEndpoints: string[]

  constructor(scope: Construct, name: string, props: Props) {
    super(scope, name)

    //Because of the random password generation, we need to add the random provider
    new RandomProvider(this, 'random')

    const subnetGroup = new DbSubnetGroup(this, prefixedName('subnet-group'), {
      name: prefixedName('subnet-group'),
      subnetIds: props.subnetIds
    })

    const {dbSecurityGroup, dbMaintenanceFunctionsSecurityGroup} = this.createSecurityGroups(props)
    this.dbSecurityGroup = dbSecurityGroup

    const clusterIdentifier = prefixedName('db-cluster')
    const rootUserName = `${PROJECT_NAME}admin`
    const rootUserPassword = new Password(this, prefixedName('root-user-password'), {
      length: 48,
      special: false
    })
    const {key: kmsKey} = createKmsKey(this, prefixedName('db-cluster-encryption-key'), {
      awsAccountId: this.awsConfiguration.awsAccountId,
      keyName: `alias/${prefixedName('db-cluster-encryption-key')}`
    })
    const parameterGroup = this.createParameterGroup()
    const cloudWatchExports = ['postgresql']
    const logGroups = this.createLogGroups(clusterIdentifier, cloudWatchExports)

    // Datenbank Cluster erstellen
    const cluster = new RdsCluster(this, prefixedName('db-cluster'), {
      dbSubnetGroupName: subnetGroup.name,
      availabilityZones: props.availabilityZones,
      clusterIdentifier: clusterIdentifier,
      databaseName: this.databaseName,
      engine: 'aurora-postgresql',
      engineVersion: '14.6',
      engineMode: 'provisioned', // Serverless v2
      serverlessv2ScalingConfiguration: this.awsConfiguration.appConfig.database.scalingConfiguration,
      masterUsername: rootUserName,
      masterPassword: rootUserPassword.result,
      iamDatabaseAuthenticationEnabled: true,
      storageEncrypted: true,
      kmsKeyId: kmsKey.arn,
      backupRetentionPeriod: this.awsConfiguration.appConfig.database.backupRetentionPeriod,
      deletionProtection: this.awsConfiguration.appConfig.database.deletionProtection,
      skipFinalSnapshot: this.awsConfiguration.appConfig.database.skipFinalSnapshot,
      finalSnapshotIdentifier: prefixedName('db-cluster-final-snapshot'),
      copyTagsToSnapshot: true,
      enabledCloudwatchLogsExports: cloudWatchExports,
      dbClusterParameterGroupName: parameterGroup.name,
      vpcSecurityGroupIds: [dbSecurityGroup.id],
      preferredMaintenanceWindow: this.awsConfiguration.appConfig.database.preferredMaintenanceWindow,
      dependsOn: logGroups
    })
    this.clusterEndpoints = [cluster.endpoint, cluster.readerEndpoint]

    // 2 Instanzen erstellen: 1 für Lesen, 1 für Schreiben
    const instances = []
    for (let instanceIndex = 0; instanceIndex < props.numberOfInstances; instanceIndex++) {
      const instanceId = prefixedName(`instance-${instanceIndex}`)
      instances.push(
        new RdsClusterInstance(this, instanceId, {
          identifier: instanceId,
          clusterIdentifier: cluster.clusterIdentifier,
          instanceClass: 'db.serverless',
          engine: cluster.engine,
          engineVersion: cluster.engineVersion,
          performanceInsightsEnabled: true,
          performanceInsightsRetentionPeriod: 31,
        })
      )
    }

    this.clusterUrl = instances[0].endpoint

    // Secrets that are destroyed are scheduled for deletion and cannot be recreated with the same name during this
    // period. That is why we append a random suffix to the secret name.
    const secretNameSuffix = new Id(this, prefixedName('secret-name-suffix'), {byteLength: 6}).b64Std

    // Initiale Root Secrets erstellen
    this.rootUserSecret = this.createSecret(
      prefixedName(`root-db-user`),
      prefixedName(`root-db-user-${secretNameSuffix}`),
      rootUserPassword,
      clusterIdentifier,
      this.databaseName,
      cluster.endpoint,
      rootUserName,
        "Credentials for the db root user",
    )

    const appUserPassword = new Password(this, prefixedName('app-user-password'), {
      length: 48,
      special: false
    })

    // Initialer App Secrets erstellen
    this.appUserSecret = this.createSecret(
      prefixedName(`app-db-user`),
      prefixedName(`app-db-user-${secretNameSuffix}`),
      appUserPassword,
      clusterIdentifier,
      this.databaseName,
      cluster.endpoint,
      this.appUserName,
        'Credentials for the application user',
    )

    this.createSecretRotation(
      this.awsConfiguration.awsRegion,
      props.subnetIds,
      dbMaintenanceFunctionsSecurityGroup,
      this.rootUserSecret,
      this.appUserSecret,
    )
  }

  private createSecurityGroups(props: Props) {
    const dbSecurityGroup = new SecurityGroup(this, prefixedName('db-sg'), {
      vpcId: props.vpcId,
      name: prefixedName('database-sg')
    })
    new DisallowAllOutboundRule(this, prefixedName('db-sg-disallow-all-outbound'), {
      securityGroupId: dbSecurityGroup.id
    })
    const dbMaintenanceFunctionsSecurityGroup = new SecurityGroup(
      this,
      prefixedName('db-maintenance-functions-sg'),
      {
        vpcId: props.vpcId,
        name: prefixedName('database-maintenance-functions-sg')
      }
    )
    new SecurityGroupRule(this, prefixedName('db-maintenance-functions-sg-ingress'), {
      securityGroupId: dbMaintenanceFunctionsSecurityGroup.id,
      description: 'Allow access from VPC for execution of secret rotation function',
      type: 'ingress',
      protocol: 'tcp',
      toPort: 443,
      fromPort: 443,
      cidrBlocks: [props.vpcCidrBlock]
    })

    new EgressIngressSecurityGroupRules(
      this,
      prefixedName('db-maintenance-functions-sg-ingress-vpc-endpoint-rules'),
      {
        egressSecurityGroupId: dbMaintenanceFunctionsSecurityGroup.id,
        ingressSecurityGroupId: props.vpcEndpointSecurityGroupId,
        description: 'Allow access from DB maintenance functions to VPC endpoints',
        protocol: 'tcp',
        toPort: 443,
        fromPort: 443
      }
    )
    new EgressIngressSecurityGroupRules(this, prefixedName('db-migration-function-to-db-sg-rules'), {
      egressSecurityGroupId: dbMaintenanceFunctionsSecurityGroup.id,
      ingressSecurityGroupId: dbSecurityGroup.id,
      description: 'Allow access from DB maintenance functions to DB',
      protocol: 'tcp',
      toPort: 5432,
      fromPort: 5432
    })

    return {dbSecurityGroup, dbMaintenanceFunctionsSecurityGroup}
  }

  createSecret(
    resourceId: string,
    secretName: string,
    password: Password,
    clusterIdentifier: string,
    dbName: string,
    host: string,
    username: string,
    description: string,
    additionalFields: Record<string, string> = {},
  ) {
    const secret = new SecretsmanagerSecret(this, `${resourceId}-secret`, {
      name: secretName,
      description: description
    })
    new SecretsmanagerSecretVersion(this, `${resourceId}-secret-version`, {
      secretId: secret.id,
      secretString: JSON.stringify({
        dbClusterIdentifier: clusterIdentifier,
        password: password.result,
        dbname: dbName,
        engine: 'postgres',
        port: 5432,
        host: host,
        username: username,
        ...additionalFields
      })
    })
    return secret
  }

  createParameterGroup(): RdsClusterParameterGroup {
    return new RdsClusterParameterGroup(this, prefixedName('db-cluster-parameter-group'), {
      name: prefixedName('db-cluster-parameter-group'),
      family: 'aurora-postgresql14',
      description: 'Parameter group for the database cluster',
      parameter: [
        {name: 'log_min_messages', value: 'log'},
        {name: 'log_min_error_statement', value: 'log'},
        {name: 'log_connections', value: '1'},
        {name: 'log_disconnections', value: '1'},
        {name: 'rds.log_retention_period', value: '10080'},
        {name: 'rds.force_ssl', value: '1'},
        {name: 'client_min_messages', value: 'warning'},
        {name: 'log_rotation_age', value: '1440'},
        {name: 'log_filename', value: 'postgresql.log.%Y-%m-%d'},
        {name: 'lc_messages', value: 'en_US.UTF-8'},
        {name: 'lc_monetary', value: 'en_US.UTF-8'},
        {name: 'lc_numeric', value: 'en_US.UTF-8'},
        {name: 'lc_time', value: 'en_US.UTF-8'}
      ]
    })
  }

  createLogGroups(clusterIdentifier: string, cloudWatchExports: string[]) {
    const logGroups: CloudwatchLogGroup[] = []
    cloudWatchExports.forEach((logType) => {
      const logGroupName = `/aws/rds/cluster/${clusterIdentifier}/${logType}`
      logGroups.push(
        createEncryptedLogGroup(this, prefixedName(`db-cluster-log-group-${logType}`), {
          name: logGroupName,
          retentionInDays: 30
        })
      )
    })
    return logGroups
  }

  createEnhancedMonitoringRole() {
    return new IamRole(this, prefixedName('db-enhanced-monitoring-role'), {
      name: prefixedName('db-enhanced-monitoring-role'),
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Principal: {
              Service: 'monitoring.rds.amazonaws.com'
            },
            Effect: 'Allow',
            Sid: ''
          }
        ]
      }),
      managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole']
    })
  }

  private createSecretRotationFunction(
    awsRegion: string,
    subnetIds: string[],
    securityGroupIds: string[],
    ...secrets: SecretsmanagerSecret[]
  ) {
    const rotationActions = [
      'secretsmanager:DescribeSecret',
      'secretsmanager:GetSecretValue',
      'secretsmanager:PutSecretValue',
      'secretsmanager:UpdateSecretVersionStage',
      'secretsmanager:UpdateSecret',
      'secretsmanager:ListSecretVersionIds'
    ]
    const getRandomPasswordAction = ['secretsmanager:GetRandomPassword']

    const customManagedPolicy = new IamPolicy(this, prefixedName('secret-rotation-function-policy'), {
      name: servicePolicyName('secret-rotation-function'),
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: rotationActions,
            Resource: secrets.map((s) => s.arn)
          },
          {
            Effect: 'Allow',
            Action: getRandomPasswordAction,
            Resource: ['*'] // "GetRandomPassword" is not scoped to individual resources
          }
        ]
      })
    })
    const executionRole = new IamRole(this, prefixedName('secret-rotation-function-role'), {
      name: prefixedName('secret-rotation-function-role'),
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Principal: {
              Service: 'lambda.amazonaws.com'
            },
            Effect: 'Allow',
            Sid: ''
          }
        ]
      }),
      managedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
        customManagedPolicy.arn
      ]
    })

    this.secretsManagerEndpointPolicyStatements.push(
      {
        Effect: 'Allow',
        Principal: {AWS: executionRole.arn},
        Action: rotationActions,
        Resource: secrets.map((s) => s.arn)
      },
      {
        Effect: 'Allow',
        Principal: {AWS: executionRole.arn},
        Action: getRandomPasswordAction,
        Resource: ['*'] // "GetRandomPassword" is not scoped to individual resources
      }
    )

    const assets = new TerraformAsset(this, prefixedName('secret-rotation-function-assets'), {
      path: '../lambda/rds-secret-rotation/secret-rotation-func',
      type: AssetType.ARCHIVE
    })

    const secretRotationFunction = new CompliantLambda(this, prefixedName('secret-rotation-function'), {
      functionName: prefixedName('secret-rotation-function'),
      description: 'Rotates database credentials',
      vpcConfig: {
        subnetIds,
        securityGroupIds
      },
      role: executionRole.arn,
      filename: assets.path,
      handler: 'lambda_function.lambda_handler',
      runtime: 'python3.7', // AWS-provided script does not work with Python 3.8
      timeout: 15,
      memorySize: 128,
      reservedConcurrentExecutions: secrets.length,
      logRetentionDays: 30,
      environment: {
        variables: {
          EXCLUDE_CHARACTERS: ':/@"\'\\',
          SECRETS_MANAGER_ENDPOINT: `https://secretsmanager.${awsRegion}.amazonaws.com`
        }
      }
    })

    const lambdaPermission = new LambdaPermission(
      this,
      prefixedName('secret-rotation-function-invoke-permission'),
      {
        functionName: secretRotationFunction.functionName,
        action: 'lambda:InvokeFunction',
        principal: 'secretsmanager.amazonaws.com'
      }
    )

    return {customManagedPolicy, executionRole, secretRotationFunction, lambdaPermission}
  }

  createSecretRotation(
    awsRegion: string,
    subnetIds: string[],
    dbMaintenanceFunctionsSecurityGroup: SecurityGroup,
    ...secrets: SecretsmanagerSecret[]
  ) {
    const {customManagedPolicy, executionRole, secretRotationFunction, lambdaPermission} =
      this.createSecretRotationFunction(
        awsRegion,
        subnetIds,
        [dbMaintenanceFunctionsSecurityGroup.id],
        ...secrets
      )
    secrets.forEach((secret, index) => {
      const rotation = new SecretsmanagerSecretRotation(this, `secret-rotation-${index}`, {
        rotationLambdaArn: secretRotationFunction.arn,
        secretId: secret.id,
        rotationRules: {
          automaticallyAfterDays: 90
        }
      })
      // Rotation is executed once immediately after deployment, so ensure that all resources required for execution are created before
      rotation.node.addDependency(customManagedPolicy, executionRole, secretRotationFunction, lambdaPermission)
      return rotation
    })
  }
}
