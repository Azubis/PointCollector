import { Construct } from "constructs"
import { Vpc } from "@cdktf/provider-aws/lib/vpc"
import { DataAwsAvailabilityZones } from "@cdktf/provider-aws/lib/data-aws-availability-zones"
import { Fn } from "cdktf"
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway"
import { RouteTable } from "@cdktf/provider-aws/lib/route-table"
import { Subnet } from "@cdktf/provider-aws/lib/subnet"
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association"
import { SsmParameter } from "@cdktf/provider-aws/lib/ssm-parameter"
import { IamRole } from "@cdktf/provider-aws/lib/iam-role"
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document"
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy"
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment"
import { FlowLog } from "@cdktf/provider-aws/lib/flow-log"
import { NatGateway } from "@cdktf/provider-aws/lib/nat-gateway"

import { createEncryptedLogGroup } from "../create-encrypted-log-group"
import { PARAMETER_VPC_HA_ID } from "../parameters"
import { SUBNET_TYPE_TAG_NAME, SubnetType } from "../vpc"
import {prefixedName} from '../constants';

interface Props {
  cidrRange: string
  numberOfAvailabilityZones: number
  hasPrivateIsolatedSubnets: boolean
  hasPrivateWithNatSubnets: boolean
  hasPublicSubnets: boolean
}
export class CompliantVpc extends Construct {
  vpc: Vpc
  publicSubnets: Subnet[] = []
  privateWithNatSubnets: Subnet[] = []
  privateIsolatedSubnets: Subnet[] = []

  constructor(scope: Construct, name: string, props: Props) {
    super(scope, name)

    this.vpc = this.createHaVpc(props)
  }

  private createHaVpc(props: Props) {
    const {
      cidrRange,
      numberOfAvailabilityZones,
      hasPublicSubnets,
      hasPrivateWithNatSubnets,
      hasPrivateIsolatedSubnets
    } = props
    if (hasPrivateWithNatSubnets && !hasPublicSubnets) {
      throw new Error(
        "VPC with private subnets requires public subnets with internet gateway to route outgoing internet traffic through"
      )
    }

    const vpcName = prefixedName("vpc")
    const vpc = new Vpc(this, prefixedName("vpc"), {
      cidrBlock: cidrRange,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: {
        Name: vpcName
      }
    })

    const dataAvailabilityZones = new DataAwsAvailabilityZones(this, "data-availability-zones", {
      filter: [
        {
          name: "opt-in-status",
          values: ["opt-in-not-required"]
        }
      ]
    })

    let cidrIndex = 0
    function getNextCidrBlock() {
      return Fn.cidrsubnet(cidrRange, 10, cidrIndex++)
    }

    const internetGateway = hasPublicSubnets
      ? new InternetGateway(this, "internet-gateway", {
        vpcId: vpc.id,
        tags: {
          Name: prefixedName("internet-gateway")
        }
      })
      : undefined
    const publicSubnetRouteTable = hasPublicSubnets
      ? new RouteTable(this, "public-subnet-route-table", {
        tags: {
          Name: prefixedName("public-subnet-route-table")
        },
        vpcId: vpc.id,
        route: [
          {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway?.id
          }
        ]
      })
      : undefined

    for (let scaleIndex = 0; scaleIndex < numberOfAvailabilityZones; scaleIndex++) {
      const availabilityZoneId = Fn.element(dataAvailabilityZones.zoneIds, scaleIndex)

      if (hasPublicSubnets || hasPrivateWithNatSubnets) {
        if (!internetGateway) {
          throw new Error("internet gateway missing")
        }
        if (!publicSubnetRouteTable) {
          throw new Error("public subnet route table missing")
        }

        const publicSubnet = this.createPublicSubnet(
          `public-subnet-${scaleIndex}`,
          vpc,
          getNextCidrBlock(),
          availabilityZoneId,
          publicSubnetRouteTable
        )
        this.publicSubnets.push(publicSubnet)

        if (hasPrivateWithNatSubnets) {
          const privateWithNatSubnet = this.createPrivateSubnet(
            `private-subnet-${scaleIndex}`,
            vpc,
            getNextCidrBlock(),
            availabilityZoneId,
            publicSubnet
          )
          this.privateWithNatSubnets.push(privateWithNatSubnet)
        }
      }

      if (hasPrivateIsolatedSubnets) {
        const privateIsolatedSubnet = this.createIsolatedSubnet(
          `isolated-subnet-${scaleIndex}`,
          vpc,
          getNextCidrBlock(),
          availabilityZoneId
        )
        this.privateIsolatedSubnets.push(privateIsolatedSubnet)
      }
    }

    this.createFlowLog(this, vpc, vpcName)

    new SsmParameter(this, "vpc-id-parameter", {
      name: PARAMETER_VPC_HA_ID,
      value: vpc.id,
      type: "String",
      tier: "Advanced"
    })

    return vpc
  }

  private createPublicSubnet(
    subnetId: string,
    vpc: Vpc,
    cidrBlock: string,
    availabilityZoneId: string,
    routeTable: RouteTable
  ) {
    const subnet = new Subnet(this, subnetId, {
      vpcId: vpc.id,
      cidrBlock: cidrBlock,
      availabilityZoneId: availabilityZoneId,
      mapPublicIpOnLaunch: false,
      tags: {
        Name: prefixedName(subnetId),
        [SUBNET_TYPE_TAG_NAME]: SubnetType.PUBLIC
      }
    })
    new RouteTableAssociation(this, `${subnetId}-route-table-association`, {
      routeTableId: routeTable.id,
      subnetId: subnet.id
    })
    return subnet
  }

  private createPrivateSubnet(
    subnetId: string,
    vpc: Vpc,
    cidrBlock: string,
    availabilityZoneId: string,
    publicSubnetWithInternetGateway: Subnet
  ) {
    const natGateway = new NatGateway(this, `${subnetId}-nat-gateway`, {
      subnetId: publicSubnetWithInternetGateway.id
    })
    const privateSubnetRouteTable = new RouteTable(this, `${subnetId}-route-table`, {
      tags: {
        Name: prefixedName(`${subnetId}-route-table`)
      },
      vpcId: vpc.id,
      route: [
        {
          cidrBlock: "0.0.0.0/0",
          gatewayId: natGateway.id
        }
      ]
    })
    const subnet = new Subnet(this, subnetId, {
      vpcId: vpc.id,
      cidrBlock: cidrBlock,
      availabilityZoneId: availabilityZoneId,
      tags: {
        Name: prefixedName(subnetId),
        [SUBNET_TYPE_TAG_NAME]: SubnetType.PRIVATE_WITH_NAT
      }
    })
    new RouteTableAssociation(this, `${subnetId}-route-table-association`, {
      routeTableId: privateSubnetRouteTable.id,
      subnetId: subnet.id
    })
    return subnet
  }

  private createIsolatedSubnet(subnetId: string, vpc: Vpc, cidrBlock: string, availabilityZoneId: string) {
    return new Subnet(this, subnetId, {
      vpcId: vpc.id,
      cidrBlock: cidrBlock,
      availabilityZoneId: availabilityZoneId,
      tags: {
        Name: prefixedName(subnetId),
        [SUBNET_TYPE_TAG_NAME]: SubnetType.PRIVATE_ISOLATED
      }
    })
  }

  private createFlowLog(scope: Construct, vpc: Vpc, vpcName: string) {
    const vpcFlowLogLogGroup = createEncryptedLogGroup(scope, "vpc-flow-log-group", {
      name: `/aws/vpc/flowlogs/${vpcName}-log-group`,
      retentionInDays: 7
    })

    const flowLogRole = new IamRole(scope, "vpc-flow-log-role", {
      name: prefixedName("vpc-flow-log-role"),
      assumeRolePolicy: new DataAwsIamPolicyDocument(scope, "vpc-flow-log-role-policy-document", {
        statement: [
          {
            effect: "Allow",
            principals: [
              {
                type: "Service",
                identifiers: ["vpc-flow-logs.amazonaws.com"]
              }
            ],
            actions: ["sts:AssumeRole"]
          }
        ]
      }).json
    })

    const flowLogPolicy = new IamPolicy(scope, "flow-log-role-policy", {
      name: prefixedName("flow-log-write-policy"),
      policy: new DataAwsIamPolicyDocument(scope, "vpc-flow-policy-document", {
        statement: [
          {
            actions: ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"],
            resources: [
              "arn:aws:logs:eu-west-1:427555860120:log-group:/aws/vpc/flowlogs/VPC-SFM-PAPP-dev-log-group:*"
            ],
            effect: "Allow"
          },
          {
            actions: ["iam:PassRole"],
            resources: ["arn:aws:iam::427555860120:role/VPC-SFM-PAPP-dev-log-role"],
            effect: "Allow"
          }
        ]
      }).json
    })

    new IamRolePolicyAttachment(scope, "flow-log-role-policy-attachment", {
      role: flowLogRole.name,
      policyArn: flowLogPolicy.arn
    })

    new FlowLog(scope, "vpc-flow-log", {
      logDestination: vpcFlowLogLogGroup.arn,
      vpcId: vpc.id,
      iamRoleArn: flowLogRole.arn,
      trafficType: "ALL"
    })
  }
}
