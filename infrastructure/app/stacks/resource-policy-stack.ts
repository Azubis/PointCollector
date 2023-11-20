import {Construct} from 'constructs'
import {VpcEndpointPolicy} from '@cdktf/provider-aws/lib/vpc-endpoint-policy'
import {SecretsmanagerSecretPolicy} from '@cdktf/provider-aws/lib/secretsmanager-secret-policy'
import {BaseStack} from './base-stack';

export interface ResourcePolicyStatement {
  Effect: string
  Principal: { AWS: string | string[] } | { Service: string | string[] } | "*"
  Action: string[]
  Resource: string[]
}

interface AWSPrincipalResourceStatement extends ResourcePolicyStatement {
  Principal: { AWS: string | string[] }
}

interface ServicePrincipalResourceStatement extends ResourcePolicyStatement {
  Principal: { Service: string | string[] }
}

interface AllPrincipalResourceStatement extends ResourcePolicyStatement {
  Principal: "*"
}

interface EndpointPolicyConfig {
  policyId: string
  vpcEndpointId: string
  policyStatements: ResourcePolicyStatement[]
}

export interface SecretPolicyConfig {
  secretArn: string
  policyStatements: ResourcePolicyStatement[]
}
interface Props {
  vpcEndpointPolicies: EndpointPolicyConfig[]
  secretsPolicies: SecretPolicyConfig[]
}
export class ResourcePolicyStack extends BaseStack {
  constructor(scope: Construct, name: string, props: Props) {
    super(scope, name)

    props.vpcEndpointPolicies.forEach((config) => {
      const policies = this.aggregatePolicies(config.policyStatements)
      if (policies.length > 0) {
        new VpcEndpointPolicy(this, config.policyId, {
          vpcEndpointId: config.vpcEndpointId,
          policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: policies
          })
        })
      }
    })

    const secretArns = new Set<string>(props.secretsPolicies.map((config) => config.secretArn))
    const secretsIterator = secretArns.values()
    for (let index = 0; index < secretArns.size; index++) {
      const secretArn = secretsIterator.next().value
      const statements = props.secretsPolicies
        .filter((config) => config.secretArn === secretArn)
        .flatMap((config) => config.policyStatements)
      // Add general statements to each secret to avoid locking ourselves out
      statements.push(
        {
          Effect: "Allow",
          Principal: {
            AWS: `arn:aws:iam::${this.awsConfiguration.awsAccountId}:root`
          },
          Action: ["secretsmanager:GetSecretValue", "secretsmanager:DeleteResourcePolicy"],
          Resource: ["*"]
        },
        {
          Effect: "Allow",
          Principal: {
            AWS: `arn:aws:iam::${this.awsConfiguration.awsAccountId}:user/gitlab-deployment`
          },
          Action: ["secretsmanager:*"],
          Resource: ["*"]
        }
      )

      // Should probably find a better way to generate resource ids,
      // but Terraform won't let us use the secret arn as the id because
      // it is an unresolved token at the time of synth
      new SecretsmanagerSecretPolicy(this, `secret-policy-${index}`, {
        secretArn: secretArn,
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: this.aggregatePolicies(statements)
        })
      })
    }
  }

  // This aggregates resource policies on a largest scope basis
  // It will combine all policies with the same principal type (AWS, Service, All) and combine them into a single policy
  // This is of course too broad in many cases, so it should only be used for VPC endpoint resource policies
  // in order to avoid the size limitation of 20.480 characters
  private aggregatePolicies(policies: ResourcePolicyStatement[]): ResourcePolicyStatement[] {
    const combinedStatements: ResourcePolicyStatement[] = []
    const allowStatements = policies.filter((policy) => policy.Effect === "Allow")

    const awsPrincipalAllowStatements = allowStatements
      .filter((allowStatement) => allowStatement.Principal !== "*" && "AWS" in allowStatement.Principal)
      .map((allowStatement) => allowStatement as AWSPrincipalResourceStatement)

    const awsPrincipalAllowStatement: AWSPrincipalResourceStatement = {
      Effect: "Allow",
      Principal: {
        AWS: this.stringUnique(
          awsPrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Principal.AWS)
        )
      },
      Action: this.stringUnique(awsPrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Action)),
      Resource: this.stringUnique(
        awsPrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Resource)
      )
    }

    const servicePrincipalAllowStatements = allowStatements
      .filter((allowStatement) => allowStatement.Principal !== "*" && "Service" in allowStatement.Principal)
      .map((allowStatement) => allowStatement as ServicePrincipalResourceStatement)
    const servicePrincipalAllowStatement: ServicePrincipalResourceStatement = {
      Effect: "Allow",
      Principal: {
        Service: this.stringUnique(
          servicePrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Principal.Service)
        )
      },
      Action: this.stringUnique(
        servicePrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Action)
      ),
      Resource: this.stringUnique(
        servicePrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Resource)
      )
    }

    const allPrincipalAllowStatements = allowStatements
      .filter((allowStatement) => allowStatement.Principal === "*")
      .map((allowStatement) => allowStatement as AllPrincipalResourceStatement)
    const allPrincipalAllowStatement: AllPrincipalResourceStatement = {
      Effect: "Allow",
      Principal: "*",
      Action: this.stringUnique(allPrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Action)),
      Resource: this.stringUnique(
        allPrincipalAllowStatements.flatMap((allowStatement) => allowStatement.Resource)
      )
    }

    const denyStatements = policies.filter((policy) => policy.Effect === "Deny")
    const awsPrincipalDenyStatments = denyStatements
      .filter((denyStatement) => denyStatement.Principal !== "*" && "AWS" in denyStatement.Principal)
      .map((denyStatement) => denyStatement as AWSPrincipalResourceStatement)
    const awsPrincipalDenyStatement: AWSPrincipalResourceStatement = {
      Effect: "Deny",
      Principal: {
        AWS: this.stringUnique(
          awsPrincipalDenyStatments.flatMap((denyStatement) => denyStatement.Principal.AWS)
        )
      },
      Action: this.stringUnique(awsPrincipalDenyStatments.flatMap((denyStatement) => denyStatement.Action)),
      Resource: this.stringUnique(awsPrincipalDenyStatments.flatMap((denyStatement) => denyStatement.Resource))
    }
    const servicePrincipalDenyStatements = denyStatements
      .filter((denyStatement) => denyStatement.Principal !== "*" && "Service" in denyStatement.Principal)
      .map((denyStatement) => denyStatement as ServicePrincipalResourceStatement)
    const servicePrincipalDenyStatement: ServicePrincipalResourceStatement = {
      Effect: "Deny",
      Principal: {
        Service: this.stringUnique(
          servicePrincipalDenyStatements.flatMap((denyStatement) => denyStatement.Principal.Service)
        )
      },
      Action: this.stringUnique(servicePrincipalDenyStatements.flatMap((denyStatement) => denyStatement.Action)),
      Resource: this.stringUnique(
        servicePrincipalDenyStatements.flatMap((denyStatement) => denyStatement.Resource)
      )
    }

    const allPrincipalDenyStatements = denyStatements
      .filter((denyStatement) => denyStatement.Principal === "*")
      .map((denyStatement) => denyStatement as AllPrincipalResourceStatement)
    const allPrincipalDenyStatement: AllPrincipalResourceStatement = {
      Effect: "Deny",
      Principal: "*",
      Action: this.stringUnique(allPrincipalDenyStatements.flatMap((denyStatement) => denyStatement.Action)),
      Resource: this.stringUnique(allPrincipalDenyStatements.flatMap((denyStatement) => denyStatement.Resource))
    }

    combinedStatements.push(
      awsPrincipalAllowStatement,
      servicePrincipalAllowStatement,
      allPrincipalAllowStatement,
      awsPrincipalDenyStatement,
      servicePrincipalDenyStatement,
      allPrincipalDenyStatement
    )
    return combinedStatements.filter((statement) => statement.Action.length > 0)
  }

  private stringUnique(array: string[]): string[] {
    return [...new Set(array)]
  }
}

