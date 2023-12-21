import { Injectable } from '@angular/core';
import { IHotelInfo, IChainInfo, IMetadata, IDropDownItem, ILanguages } from './common.model';
import { IRulesMetaData, IPolicyMetaDataTypes, IPolicyMetadata } from './rules-metadata.model';
import { IPolicySearchRepsonseModel } from '../search/policy-mgmt-search.model';

@Injectable()
export class SharedDataService {
    // Used in both Policy and Template flows
    private hotelInfo: IHotelInfo; // Only use on Property Level
    private metaData: IMetadata;
    private chainInfo: IChainInfo; // Only use on Enterprise Level
    private languages: ILanguages;
    private depositRulesList: Array<IDropDownItem>;

    // Only used for policy flows
    private rulesMetaData: IRulesMetaData;
    private policyMetadata: IPolicyMetaDataTypes;
    private policySearchData: Array<IPolicySearchRepsonseModel>;

    constructor() {
        this.policyMetadata = {};
        this.policySearchData = [];
        this.depositRulesList = [];
    }

    getLanguages(): ILanguages {
        return this.languages;
    }

    getHotelInfo(): IHotelInfo {
        return this.hotelInfo;
    }

    getChainInfo(): IChainInfo {
        return this.chainInfo;
    }

    getMetaData(): IMetadata {
        return this.metaData;
    }

    getDepositRulesList(): Array<IDropDownItem> {
        return this.depositRulesList;
    }

    setLanguages(data: ILanguages) {
        this.languages = data;
    }

    setHotelInfo(data: IHotelInfo) {
        this.hotelInfo = data;
    }

    setChainInfo(data: IChainInfo) {
        this.chainInfo = data;
    }

    setMetaData(data: IMetadata) {
        this.metaData = data;
    }

    setDepositRulesList(data: Array<IDropDownItem>) {
        this.depositRulesList = data;
    }

    setRulesMetaData(data: IRulesMetaData) {
        this.rulesMetaData = data;
    }

    getRulesMetaData(): IRulesMetaData {
        return this.rulesMetaData;
    }

    setPolicyMetadata(type: string, data: Array<IPolicyMetadata>) {
        this.policyMetadata[type] = data;
    }

    getPolicyMetadata(type: string): Array<IPolicyMetadata> {
        return this.policyMetadata[type];
    }

    setPolicySearchData(data: Array<IPolicySearchRepsonseModel>) {
        this.policySearchData = data;
    }

    getPolicySearchData(): Array<IPolicySearchRepsonseModel> {
        return this.policySearchData;
    }
}
