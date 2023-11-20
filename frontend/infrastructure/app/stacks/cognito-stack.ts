import {TerraformOutput, Token} from 'cdktf';
import {CognitoUserPool} from '@cdktf/provider-aws/lib/cognito-user-pool';
import {Construct} from 'constructs';
import {prefixedName} from '../../common/constants';
import {CognitoUserPoolClient} from '@cdktf/provider-aws/lib/cognito-user-pool-client';
import {BaseStack} from './base-stack';
import {getFullDomainName} from '../../config/configuration';
import {CognitoUserPoolDomain} from '@cdktf/provider-aws/lib/cognito-user-pool-domain';

export class CognitoStack extends BaseStack {
    readonly userPoolArn: string
    readonly userPoolClientSecret: string
    readonly userPoolClientId: string
    readonly userPoolClientOauthScopes: string[] = ["email", "openid"]
    readonly userPoolDomain: string
    readonly authenticationPath = "/"
    constructor(scope: Construct, name: string) {
        super(scope, name)

        const userPool = new CognitoUserPool(this, prefixedName("user-pool"), {
            name: prefixedName("user-pool"),
            autoVerifiedAttributes: ['email'],
            usernameAttributes: ['email'],
            verificationMessageTemplate: {
                defaultEmailOption: "CONFIRM_WITH_CODE",
                emailMessage: "Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}",
                emailSubject: "Verify your email for our awesome app!",
            },
            schema: [
                {
                    attributeDataType: "String",
                    developerOnlyAttribute: false,
                    mutable: true,
                    name: "dealerId",
                    required: false,
                    stringAttributeConstraints: {
                        maxLength: Token.asString(2048),
                        minLength: Token.asString(0),
                    },
                },
            ],
        })

        const poolDomain =  new CognitoUserPoolDomain(this, 'UserPoolDomain', {
            domain: prefixedName("user-pool-domain"),
            userPoolId: userPool.id,
        });

        this.userPoolDomain = poolDomain.domain

        const fullSubDomainName = getFullDomainName(this.awsConfiguration)
        const client = new CognitoUserPoolClient(this, prefixedName("user-pool-client"), {
            allowedOauthFlows: ["code", "implicit"],
            allowedOauthFlowsUserPoolClient: true,
            allowedOauthScopes: ["email", "openid"],
            callbackUrls: [`https://${fullSubDomainName}/oauth2/idpresponse`],
            logoutUrls: [`https://${fullSubDomainName}/logout`],
            name: prefixedName("user-pool-app-client"),
            supportedIdentityProviders: ["COGNITO"],
            userPoolId: userPool.id,
            generateSecret: true, // Dies wird ein Client Secret generieren
        });

        new TerraformOutput(this, 'UserPoolARN', { value: userPool.arn })
        //new TerraformOutput(this, 'UserPoolClientSecret', { value: client.clientSecret })
        new TerraformOutput(this, 'UserPoolClientId', { value: client.id })

        this.userPoolArn = userPool.arn
        this.userPoolClientSecret = client.clientSecret
        this.userPoolClientId = client.id
        this.userPoolClientOauthScopes = client.allowedOauthScopes
    }

}
