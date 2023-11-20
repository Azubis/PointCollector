export const serviceName = (serviceName: string) => `nora-${serviceName}`

export const logData = (data: any) => {
    // SiKo requirement: All additional logging data must be child of "data" field
    return {
        data: data
    }
}
