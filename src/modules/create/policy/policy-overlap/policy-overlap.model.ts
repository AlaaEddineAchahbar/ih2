export interface IOverlapPolicyInfo {
    id: string;
    name: string;
    policyDateRange: string;
    policyName: string;
    issue: string;
    policyLevel?: string;
    ruleStartDate?: string | Date;
    ruleEndDate?: string | Date;
}
