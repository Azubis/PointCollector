import { AwsProviderDefaultTags } from "@cdktf/provider-aws/lib/provider"

import { AwsEnvironments } from "../config/configuration"

export function getProjectTags(projectName: string, environment: AwsEnvironments): AwsProviderDefaultTags[] {
    return [
        {
            tags: {
                ProjectName: projectName,
                Owner: "",
                Environment: environment
            }
        }
    ]
}
