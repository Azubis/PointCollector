import { Construct } from "constructs"
import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule"

interface Props {
  egressSecurityGroupId: string
  ingressSecurityGroupId: string
  description: string
  protocol: string
  toPort: number
  fromPort: number
}

export class EgressIngressSecurityGroupRules extends Construct {
  constructor(scope: Construct, name: string, props: Props) {
    super(scope, name)

    new SecurityGroupRule(this, `${name}-egress`, {
      securityGroupId: props.egressSecurityGroupId,
      description: props.description,
      type: "egress",
      protocol: props.protocol,
      toPort: props.toPort,
      fromPort: props.fromPort,
      sourceSecurityGroupId: props.ingressSecurityGroupId
    })
    new SecurityGroupRule(this, `${name}-ingress`, {
      securityGroupId: props.ingressSecurityGroupId,
      description: props.description,
      type: "ingress",
      protocol: props.protocol,
      toPort: props.toPort,
      fromPort: props.fromPort,
      sourceSecurityGroupId: props.egressSecurityGroupId
    })
  }
}

