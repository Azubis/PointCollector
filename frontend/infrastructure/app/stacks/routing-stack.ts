import {Construct} from 'constructs';
import {Lb} from '@cdktf/provider-aws/lib/lb';
import {prefixedName} from '../../common/constants';
import {SecurityGroup} from '@cdktf/provider-aws/lib/security-group';
import {Subnet} from '@cdktf/provider-aws/lib/subnet';
import {LbTargetGroup} from '@cdktf/provider-aws/lib/lb-target-group';
import {AlbListener} from '@cdktf/provider-aws/lib/alb-listener';
import {BaseStack} from './base-stack';
import {route53Record} from '@cdktf/provider-aws';
import {Route53Zone} from '@cdktf/provider-aws/lib/route53-zone';
import {getFullDomainName} from '../../config/configuration';
import {AlbListenerRule} from '@cdktf/provider-aws/lib/alb-listener-rule';
import {Token} from 'cdktf';

interface Config {
    publicSubnets: Subnet[]
    vpcId: string
    lbSecurityGroup: SecurityGroup
    userPoolArn: string
    userPoolClientId: string
    userPoolDomain: string
    authenticationPath: string
}

export class RoutingStack extends BaseStack {
    public targetGroup: LbTargetGroup;
    constructor(scope: Construct, name: string, config: Config) {
        super(scope, name);

        const { targetGroup, lb } = this.createApplicationLoadBalancer(config);
        this.targetGroup = targetGroup;

        this.createDomainName(lb)
    }

    private createApplicationLoadBalancer = (config: Config) => {
        const lb = new Lb(this, "lb", {
            name: prefixedName("app-load-balancer"),
            internal: false,
            loadBalancerType: "application",
            securityGroups: [config.lbSecurityGroup.id],
            subnets: config.publicSubnets.map((subnet) => subnet.id),
        });

        const targetGroup = new LbTargetGroup(this, prefixedName("app-target-group"), {
            name: prefixedName("app-target-group"), // TODO naming
            vpcId: config.vpcId,
            targetType: "ip",
            port: 8080,
            protocol: "HTTP",
            healthCheck: {
                path: '/health',
                interval: 30, // should not be too low, otherwise the service start seems to fail
                timeout: 10,
                healthyThreshold: 2,
                unhealthyThreshold: 5 // should not be too low, otherwise the service start seems to fail
            },
        });

        new AlbListener(this, "alb-listener-http", {
            loadBalancerArn: lb.arn,
            port: 80,
            protocol: "HTTP",
            defaultAction: [
                {
                    type: "redirect",
                    redirect: {
                        protocol: "HTTPS",
                        port: "443",
                        statusCode: "HTTP_301"
                    }
                }
            ]
        });

        const httpsListener= new AlbListener(this, "lb-listener-https", {
            loadBalancerArn: lb.arn,
            port: 443,
            protocol: "HTTPS",
            certificateArn: this.awsConfiguration.appConfig.certificateArn,
            defaultAction: [
                {
                    type: "forward",
                    targetGroupArn: targetGroup.arn,
                },
            ],
        });

        new AlbListenerRule(this, prefixedName('listener-auth'), {
            listenerArn: Token.asString(httpsListener.arn),
            priority: 100,
            action: [
                {
                    type: "authenticate-cognito",
                    authenticateCognito: {
                        scope: "openid",
                        userPoolArn: config.userPoolArn,
                        userPoolClientId: config.userPoolClientId,
                        userPoolDomain: config.userPoolDomain
                    }
                },
                {
                    type: "forward",
                    targetGroupArn: Token.asString(targetGroup.arn)
                }
            ],
            condition: [{
                pathPattern: {
                    values: [config.authenticationPath]
                }
            }]
        });

        return {
            targetGroup, lb
        };
    };

    private createDomainName = (loadBalancer: Lb) => {
        const fullSubDomainName = getFullDomainName(this.awsConfiguration)
        const subDomain = new Route53Zone(this, prefixedName('SubDomain'), {
            name: fullSubDomainName,
        });

        // A Record
        // Verweist auf eine IPv4-Adresse. Beispiel: 192.168.1.1
        // Die Service werden über IPv$ erreichbar
        new route53Record.Route53Record(this, 'a-record', {
            name: fullSubDomainName,
            type: 'A',
            zoneId: subDomain.zoneId,
            //Dies wird verwendet, um einen Alias-Record in Route53 zu erstellen,
            //der auf eine AWS-Ressource (z.B. ein ELB, CloudFront-Distribution usw.) zeigt,
            //ohne dass die eigentliche IP-Adresse bekannt ist
            alias: {
                name: loadBalancer.dnsName,
                zoneId: loadBalancer.zoneId,
                evaluateTargetHealth: true
            },
            // Dies ist die eigentliche IP-Adresse oder der CNAME-Wert für Standard-DNS-Records.
            // records: [loadBalancer.id],
        });

        // AAAA Record
        // Verweist auf eine IPv6-Adresse. Beispiel: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
        // Die Service werden über IPv6 erreichbar
        new route53Record.Route53Record(this, 'aaaa-record', {
            name: fullSubDomainName,
            type: 'AAAA',
            zoneId: subDomain.zoneId,
            alias: {
                name: loadBalancer.dnsName,
                zoneId: loadBalancer.zoneId,
                evaluateTargetHealth: true
            },
        });

        const rootDomain = new Route53Zone(this, prefixedName('RootDomain'), {
            name: this.awsConfiguration.appConfig.rootDomain,
        });
        // Wird zu einem anderen DNS-Namen aufgelöst. Beispiel: example.com
        // Die Service werden über einen DNS-Namen erreichbar
        // Ein TTL-Wert von 300 bedeutet also, dass der DNS-Record für 5 Minuten (300 Sekunden) im Cache gespeichert bleibt,
        // bevor eine erneute Abfrage durchgeführt wird.
        // TTL hat mehrere Vorteile: Performance, Reduzierter Traffic, Kontrolle über DNS-Änderungen
        new route53Record.Route53Record(this, 'ns-record', {
            name: fullSubDomainName,
            type: 'NS',
            zoneId: rootDomain.zoneId,
            ttl:300, // Time to Live
            records: rootDomain.nameServers,
        });
    };
}
