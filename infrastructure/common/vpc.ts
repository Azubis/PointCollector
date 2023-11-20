export const SUBNET_TYPE_TAG_NAME = "aws-cdk:subnet-type"

/**
 * Copy of CDK SubnetType
 */
export enum SubnetType {
  PRIVATE_ISOLATED = "Isolated",
  PRIVATE_WITH_NAT = "Private",
  PUBLIC = "Public"
}
