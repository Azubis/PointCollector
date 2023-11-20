import {AwsEnvironments} from "../config/configuration";
import {Construct} from "constructs";
import {AwsProvider} from "@cdktf/provider-aws/lib/provider";
import {getProjectTags} from "./get-project-tags";

interface AwsProviderProps {
    awsRegion: string
    awsAccountId: string
    awsProfile?: string
    environment: AwsEnvironments
    projectName: string
}

export function configureAwsProvider(scope: Construct, props: AwsProviderProps) {
    new AwsProvider(scope, "aws", {
        region: props.awsRegion,
        profile: props.awsProfile,
        allowedAccountIds: [props.awsAccountId],
        defaultTags: getProjectTags(props.projectName, props.environment)
    })
}