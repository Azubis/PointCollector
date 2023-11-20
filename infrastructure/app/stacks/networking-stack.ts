import {Fn} from 'cdktf';
import {Construct} from 'constructs';
import {prefixedName} from '../../common/constants';
import {Vpc} from '@cdktf/provider-aws/lib/vpc';
import {InternetGateway} from '@cdktf/provider-aws/lib/internet-gateway';
import {RouteTable} from '@cdktf/provider-aws/lib/route-table';
import {DataAwsAvailabilityZones} from '@cdktf/provider-aws/lib/data-aws-availability-zones';
import {Subnet} from '@cdktf/provider-aws/lib/subnet';
import {RouteTableAssociation} from '@cdktf/provider-aws/lib/route-table-association';
import {NatGateway} from '@cdktf/provider-aws/lib/nat-gateway';
import {Eip} from '@cdktf/provider-aws/lib/eip';
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group';
import {SecurityGroupRule} from '@cdktf/provider-aws/lib/security-group-rule';
import {BaseStack} from './base-stack';
import {VpcEndpoint} from '@cdktf/provider-aws/lib/vpc-endpoint';

interface Config {
    cidrRange: string;
    numberOfAvailabilityZones: number;
}

export class NetworkingStack extends BaseStack {
    public vpc: Vpc
    public readonly publicSubnets: Subnet[] = []
    public readonly privateWithNatSubnets: Subnet[] = []
    public readonly privateIsolatedSubnets: Subnet[] = []
    public lbSecurityGroup: SecurityGroup
    public ecsSecurityGroup: SecurityGroup
    readonly vpcEndpointSg: SecurityGroup
    readonly secretsManagerEndpoint: VpcEndpoint

    constructor(scope: Construct, name: string, config: Config) {
        super(scope, name);

        this.vpc = this.createVpc(config);

        this.lbSecurityGroup = new SecurityGroup(this, "lb-sg", {
            name: prefixedName("lb-sg"),
            vpcId: this.vpc.id,
        });
        new SecurityGroupRule(this, "lb-sg-ingress-http", {
            securityGroupId: this.lbSecurityGroup.id,
            type: "ingress",
            protocol: "tcp",
            fromPort: 80,
            toPort: 80,
            cidrBlocks: ["0.0.0.0/0"],
        });
        new SecurityGroupRule(this, "lb-sg-ingress-https", {
            securityGroupId: this.lbSecurityGroup.id,
            type: "ingress",
            protocol: "tcp",
            fromPort: 443,
            toPort: 443,
            cidrBlocks: ["0.0.0.0/0"],
        });
        new SecurityGroupRule(this, "lb-sg-egress", {
            securityGroupId: this.lbSecurityGroup.id,
            type: "egress",
            protocol: "tcp",
            fromPort: 0,
            toPort: 65535,
            cidrBlocks: ["0.0.0.0/0"],
        });

        this.ecsSecurityGroup = new SecurityGroup(this, "ecs-sg", {
            name: prefixedName("ecs-sg"),
            vpcId: this.vpc.id,
        });
        new SecurityGroupRule(this, "ecs-sg-ingress", {
            securityGroupId: this.ecsSecurityGroup.id,
            type: "ingress",
            sourceSecurityGroupId: this.lbSecurityGroup.id,
            protocol: "tcp",
            fromPort: 8080,
            toPort: 8080,
        });
        new SecurityGroupRule(this, "ecs-sg-egress", {
            securityGroupId: this.ecsSecurityGroup.id,
            type: "egress",
            protocol: "all",
            fromPort: 0,
            toPort: 65535,
            cidrBlocks: ["0.0.0.0/0"],
        });

        const { vpcEndpointSg } = this.createSecurityGroups(this.vpc.id)
        this.vpcEndpointSg = vpcEndpointSg

        this.secretsManagerEndpoint = this.createSecretsManagerEndpoint(vpcEndpointSg)
    }

    private createSecurityGroups(vpcId: string) {
        const vpcEndpointSg = new SecurityGroup(this, prefixedName("vpc-endpoint-sg"), {
            vpcId: vpcId,
            name: prefixedName("vpc-endpoint-sg")
        })
        new SecurityGroupRule(this, prefixedName("db-maintenance-functions-sg-egress-secretsmanager"), {
            securityGroupId: vpcEndpointSg.id,
            description: "Allow access to AWS APIs",
            type: "egress",
            protocol: "tcp",
            toPort: 443,
            fromPort: 443,
            cidrBlocks: ["0.0.0.0/0"]
        })
        return { vpcEndpointSg }
    }

    private createSecretsManagerEndpoint(sg: SecurityGroup) {
        return new VpcEndpoint(this, prefixedName("secrets-manager-endpoint"), {
            vpcId: this.vpc.id,
            subnetIds: this.privateIsolatedSubnets.map((s) => s.id),
            serviceName: `com.amazonaws.${this.awsConfiguration.awsRegion}.secretsmanager`,
            vpcEndpointType: "Interface",
            securityGroupIds: [sg.id],
            privateDnsEnabled: true
        })
    }


    private createVpc(config: Config) {
        const vpc = new Vpc(this, "vpc", {
            cidrBlock: config.cidrRange,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: {
                Name: prefixedName("vpc"),
            },
        });

        const dataAvailabilityZones = new DataAwsAvailabilityZones(
            this,
            prefixedName("data-availability-zones"),
            {
                filter: [
                    {
                        name: "opt-in-status",
                        values: ["opt-in-not-required"],
                    },
                ],
            }
        );

        let cidrIndex = 0;
        function getNextCidrBlock() {
            return Fn.cidrsubnet(config.cidrRange, 10, cidrIndex++);
        }

        const internetGateway = new InternetGateway(this, prefixedName("internet-gateway"), {
            vpcId: vpc.id,
            tags: {
                Name: prefixedName("internet-gateway"),
            },
        });
        const publicSubnetRouteTable = new RouteTable(
            this,
            prefixedName("public-subnet-route-table"),
            {
                vpcId: vpc.id,
                route: [
                    {
                        cidrBlock: "0.0.0.0/0",
                        gatewayId: internetGateway?.id,
                    },
                ],
                tags: {
                    Name: prefixedName("public-subnet-route-table"),
                },
            }
        );

        for (
            let scaleIndex = 0;
            scaleIndex < config.numberOfAvailabilityZones;
            scaleIndex++
        ) {
            const availabilityZoneId = Fn.element(
                dataAvailabilityZones.zoneIds,
                scaleIndex
            );

            const publicSubnet = this.createPublicSubnet(
                prefixedName(`public-subnet-${scaleIndex}`),
                vpc,
                getNextCidrBlock(),
                availabilityZoneId,
                publicSubnetRouteTable
            );
            this.publicSubnets.push(publicSubnet);

            const privateWithNatSubnet = this.createPrivateSubnet(
                prefixedName(`private-subnet-${scaleIndex}`),
                vpc,
                getNextCidrBlock(),
                availabilityZoneId,
                publicSubnet
            );
            this.privateWithNatSubnets.push(privateWithNatSubnet);

            const privateIsolatedSubnet = this.createIsolatedSubnet(
                prefixedName(`isolated-subnet-${scaleIndex}`),
                vpc,
                getNextCidrBlock(),
                availabilityZoneId
            );
            this.privateIsolatedSubnets.push(privateIsolatedSubnet);
        }

        return vpc;
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
                SubnetType: "PUBLIC",
            },
        });
        new RouteTableAssociation(this, `${subnetId}-route-table-association`, {
            routeTableId: routeTable.id,
            subnetId: subnet.id,
        });
        return subnet;
    }

    private createPrivateSubnet(
        subnetId: string,
        vpc: Vpc,
        cidrBlock: string,
        availabilityZoneId: string,
        publicSubnetWithInternetGateway: Subnet
    ) {
        const elasticIp = new Eip(this, `${subnetId}-elastic-ip`, {
            domain: "vpc",
        });
        const natGateway = new NatGateway(this, `${subnetId}-nat-gateway`, {
            allocationId: elasticIp.id,
            subnetId: publicSubnetWithInternetGateway.id,
        });
        const privateSubnetRouteTable = new RouteTable(
            this,
            `${subnetId}-route-table`,
            {
                vpcId: vpc.id,
                route: [
                    {
                        cidrBlock: "0.0.0.0/0",
                        gatewayId: natGateway.id,
                    },
                ],
                tags: {
                    Name: prefixedName("private-subnet-route-table"),
                },
            }
        );
        const subnet = new Subnet(this, subnetId, {
            vpcId: vpc.id,
            cidrBlock: cidrBlock,
            availabilityZoneId: availabilityZoneId,
            tags: {
                Name: prefixedName(subnetId),
                SubnetType: "PRIVATE_WITH_NAT",
            },
        });
        new RouteTableAssociation(this, `${subnetId}-route-table-association`, {
            routeTableId: privateSubnetRouteTable.id,
            subnetId: subnet.id,
        });
        return subnet;
    }

    private createIsolatedSubnet(
        subnetId: string,
        vpc: Vpc,
        cidrBlock: string,
        availabilityZoneId: string
    ) {
        return new Subnet(this, subnetId, {
            vpcId: vpc.id,
            cidrBlock: cidrBlock,
            availabilityZoneId: availabilityZoneId,
            tags: {
                Name: prefixedName(subnetId),
                SubnetType: "PRIVATE_ISOLATED",
            },
        });
    }
}
