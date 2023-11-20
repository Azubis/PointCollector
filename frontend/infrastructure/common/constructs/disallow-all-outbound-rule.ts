import { Construct } from "constructs"
import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule"

interface Props {
  securityGroupId: string
}

export class DisallowAllOutboundRule extends Construct {
  constructor(scope: Construct, name: string, props: Props) {
    super(scope, name)

    /**
     * Egress rule that purposely matches no traffic
     *
     * This is used in order to disable the "all traffic" default of Security Groups.
     *
     * No machine can ever actually have the 255.255.255.255 IP address, but
     * in order to lock it down even more we'll restrict to a nonexistent
     * ICMP traffic type.
     */
    new SecurityGroupRule(scope, `${name}-rule`, {
      securityGroupId: props.securityGroupId,
      description: "Disallow all outbound traffic",
      type: "egress",
      protocol: "icmp",
      fromPort: 252,
      toPort: 86,
      cidrBlocks: ["255.255.255.255/32"]
    })
  }
}

