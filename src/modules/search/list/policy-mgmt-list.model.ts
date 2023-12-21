export interface ITemplateSearchListModel {
    name?: string;
    id?: number;
    ids?: string[];
    status?: string;
    isCreatedAtEnterpriseLevel?: boolean;
    policyCode?: string;
    cancellationRule?: string;
    otaSetting?: string;
    depositeRule?: string;
    acceptedTender?: string;
    arrivalTime?: string;
    isFreeCancellation?: string;
    isInstallmentEnabled?: string;
}

export interface IEMTemplateSearchListModel extends ITemplateSearchListModel {
    emPolicyTemplateId?: number;
    jobId?: string,
    total_hotels_count?: number;
    failed_hotels_count?: number;
}

export interface CallOutListItem {
    header: string;
    body: string;
    footer: string;
}

export interface IPolicySearchListModel {
    name?: string;
    templateName?: string;
    id?: string;
    ids?: string[];
    status?: string;
    level?: string;
    templateCode?: string;
    date?: string;
    dow?: string;
    rank?: string;
    callOutListItem?: CallOutListItem;
    linkedMetaDataList?: Array<string>;
    dateRangeList?: Array<string>;
    isCreatedAtEnterpriseLevel?: boolean;
    historyAuxId?: string;
}

export interface IDepositConfigurationListModel {
    name?: string;
    id?: number;
    ids?: string[];
    numberOfConfigurations?: string;
    chargeAmount?: string;
    isCreatedAtEnterpriseLevel?: boolean;
}

export interface IPaginationModel {
    pageSize: number;
    page?: number;
    startIndex?: number;
    endIndex?: number;
    collectionSize: number;
}
