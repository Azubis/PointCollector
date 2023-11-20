# NORA@ Infastrukture
Die Infrastruktur Für NORA@ wird mit [CDK for Terraform](https://learn.hashicorp.com/tutorials/terraform/cdktf) erstellt.

## Voraussetzungen
- [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- [CDK for Terraform](https://learn.hashicorp.com/tutorials/terraform/cdktf-install)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [AWS CLI Konfiguration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
- [AWS CLI Konfiguration für CDK](https://docs.aws.amazon.com/cdk/latest/guide/cli.html#cli-configure)
- [AWS CLI Konfiguration für CDKTF](https://learn.hashicorp.com/tutorials/terraform/cdktf-install#configure-aws-credentials)

## Local bauen:
```
cdktf get
```
## Aufgaben einzelner Stacks
Klar! Hier ist eine kurze Beschreibung für Ihre `README.md`:

---
## Konfiguration
die Konfigurationsdetails von AWS, wie Region und Konto-ID.

## ApplicationStack
Hier werden zum Beispiel die S3 Buckets für die Applikation erstellt.

## NetworkStack
Erstelle VPC, Subnets, Security Groups, Internet Gateway, NAT Gateway, Route Tables, etc.

## DatabaseStack
Database mit Aurora Serverless und dazu gehörige Credentials, was in Secrets Manager gespeichert wird.

## CognitoStack
Erstellt die Cognito User Pool und die dazugehörigen Clients.

## RoutingStack
Erstellt die Route53 Einträge für die Domains und Subdomains.

## ContainerStack
Erstellt die ECS Cluster, die ECR Repositories und die dazugehörigen IAM Rollen. Wo die Container Images hochgefahren werden.


## Deployment
Um die Infrastruktur zu erstellen, müssen Sie die folgenden Schritte ausführen:

### Was mache ich, wenn das Löschen von Stacks fehlschlägt?
