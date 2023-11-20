import {TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import {AwsConfiguration, getAwsConfiguration, parseAWSEnvironment} from '../../config/configuration';
import {configureTerraformBackend} from '../../common/configure-terraform-backend';
import {configureAwsProvider} from '../../common/configure-aws-provider';
import {PROJECT_NAME} from '../../common/constants';

export class BaseStack extends TerraformStack {
    readonly awsConfiguration: AwsConfiguration

    constructor(scope: Construct, name: string) {
        super(scope, name);

        this.awsConfiguration = getAwsConfiguration(
            parseAWSEnvironment(process.env.ENV)
        )

        configureTerraformBackend(this, {
            awsRegion: this.awsConfiguration.awsRegion,
            awsAccountId: this.awsConfiguration.awsAccountId,
            awsProfile: this.awsConfiguration.awsProfile,
            name
        })

        configureAwsProvider(this, {
            awsRegion: this.awsConfiguration.awsRegion,
            awsAccountId: this.awsConfiguration.awsAccountId,

            awsProfile: this.awsConfiguration.awsProfile,
            environment: this.awsConfiguration.environment,
            projectName: `${PROJECT_NAME}`
        })
    }
}
