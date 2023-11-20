import {App} from 'cdktf';
import {CdkTfBootstrapStack} from './cdk-tf-bootstrap/stacks/cdk-tf-bootstrap-stack';
import {prefixedName} from './common/constants';
import {ContainerStack} from './app/stacks/container-stack';
import {NetworkingStack} from './app/stacks/networking-stack'
import {RoutingStack} from './app/stacks/routing-stack'
import {TestStack} from './app/stacks/test-stack';
import {StorageStack} from './app/stacks/storage-stack';
import {CdkTfBootstrapDeployStack} from './cdk-tf-bootstrap/stacks/cdk-tf-bootstrap-deploy-stack';
import {CognitoStack} from './app/stacks/cognito-stack';
import {ApplicationStack} from './app/stacks/application-stack';
import {DatabaseStack} from './app/stacks/database-stack';
import {DatabaseSetupStack} from './app/stacks/database-setup-stack';

const app = new App();
new CdkTfBootstrapStack(app, prefixedName('cdktf-bootstrap-stack'));
new CdkTfBootstrapDeployStack(app, prefixedName('cdktf-bootstrap-deploy-stack'))

const appStack = new ApplicationStack(app, prefixedName('application-stack'));

const networkingStack = new NetworkingStack(app, prefixedName('networking-stack'), {
  cidrRange: '172.16.0.0/16',
  numberOfAvailabilityZones: 3,
});
networkingStack.addDependency(appStack)

const dbStack = new DatabaseStack(app, prefixedName('database-stack'), {
  vpcId: networkingStack.vpc.id,
  vpcCidrBlock: networkingStack.vpc.cidrBlock,
  subnetIds: networkingStack.privateIsolatedSubnets.map((subnet) => subnet.id),
  availabilityZones: networkingStack.privateIsolatedSubnets.map((subnet) => subnet.availabilityZone),
  vpcEndpointSecurityGroupId: networkingStack.vpcEndpointSg.id,
  numberOfInstances: 2 // 1 write instance, 1 read replica,
})
dbStack.addDependency(appStack)

const dbSetupStack = new DatabaseSetupStack(app, prefixedName("database-setup-stack"), {
    vpcId: networkingStack.vpc.id,
    subnetIds: networkingStack.privateIsolatedSubnets.map((subnet) => subnet.id),
    dbSecurityGroupId: dbStack.dbSecurityGroup.id,
    vpcEndpointSecurityGroupId: networkingStack.vpcEndpointSg.id,
    databaseName: dbStack.databaseName,
    schemaName: dbStack.schemaName,
    rootUserSecretArn: dbStack.rootUserSecret.arn,
    appUserSecretArn: dbStack.appUserSecret.arn,
})
dbSetupStack.addDependency(appStack)


const cognitoStack = new CognitoStack(app, prefixedName('cognito-stack'))
cognitoStack.addDependency(appStack)

const routing = new RoutingStack(app, prefixedName('routing-stack'), {
  publicSubnets: networkingStack.publicSubnets,
  vpcId: networkingStack.vpc.id,
  lbSecurityGroup: networkingStack.lbSecurityGroup,
  userPoolArn: cognitoStack.userPoolArn,
  userPoolClientId: cognitoStack.userPoolClientId,
  userPoolDomain: cognitoStack.userPoolDomain,
  authenticationPath: cognitoStack.authenticationPath,
});

cognitoStack.addDependency(appStack)

new StorageStack(app, prefixedName('storage-stack'));


const containerStack = new ContainerStack(
  app,
  prefixedName('container-stack'),
  {
    subnets: networkingStack.privateWithNatSubnets,
    desiredServiceCount: 1,
    //efsStorageId: storage.efsStorageId,
    targetGroup: routing.targetGroup,
    vpcId: networkingStack.vpc.id,
    securityGroup: networkingStack.ecsSecurityGroup,
    dbUserSecretArn: dbStack.appUserSecret.arn,
    dbSchemaName: dbStack.schemaName,
    dbSecurityGroupId: dbStack.dbSecurityGroup.id,
    vpcEndpointSecurityGroupId: networkingStack.vpcEndpointSg.id
  }
);
containerStack.addDependency(appStack)

new TestStack(app, prefixedName('test-stack'));

app.synth();
