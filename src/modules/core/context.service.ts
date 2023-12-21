import { Injectable } from '@angular/core';
import { IWindowConfig } from './common.model';
import { USER_PERMISSIONS } from './constants';

@Injectable()
export class ContextService {
    policyLevelName: string;
    policyFlowName: string;
    configTypeName: string;
    policyTypeName: string;
    apiConstant: IWindowConfig;
    userPermission: string;
    policyFlowValue: string;
    ratePlanId: string;
    chainCode: string;
    private isRedirectedFromGroups: boolean;

    constructor() {
        this.apiConstant = window['CONFIG'];
        this.userPermission = this.apiConstant.tokenDecodedData.user_permission;
        this.isRedirectedFromGroups = false;
    }

    setPolicyLevel(level: string) {
        this.policyLevelName = level;
    }

    setPolicyFlow(flow: string) {
        this.policyFlowName = flow;
    }

    setPolicyConfigType(type: string) {
        this.configTypeName = type;
    }

    setPolicyType(type: string) {
        this.policyTypeName = type;
    }

    setPolicyFlowValue(type: string) {
        this.policyFlowValue = type;
    }

    getPolicyFlowValue(): string {
        return this.policyFlowValue;
    }

    get policyFlow(): string {
        return this.policyFlowName;
    }

    get policyLevel(): string {
        return this.policyLevelName;
    }

    get configType(): string {
        return this.configTypeName;
    }

    get policyType(): string {
        return this.policyTypeName;
    }

    getUserPermission(): string {
        return this.userPermission;
    }

    hasEditAccess() {
        return this.userPermission === USER_PERMISSIONS.EDIT;
    }

    setRatePlanId(ratePlanId: string) {
        this.ratePlanId = ratePlanId;
    }

    getRatePlanId() {
        return this.ratePlanId;
    }

    setIsRedirectFromGroups(isRedirectedFromGroups: boolean) {
        this.isRedirectedFromGroups = isRedirectedFromGroups;
    }

    getIsRedirectFromGroups() {
        return this.isRedirectedFromGroups;
    }

    setChainCode(chainCode: string) {
        this.chainCode = chainCode;
    }

    getChainCode() {
        return this.chainCode;
    }
}
