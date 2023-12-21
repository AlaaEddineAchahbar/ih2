import { Injectable } from '@angular/core';
import { HTTPService } from './core/http.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedDataService } from './core/shared.data.service';
import { IHTTPResponse,
         IDropDownItem,
         IMetadata,
         IHotelInfo,
         IChainInfo,
         ILanguages,
         IChainCategory,
         ILanguage } from './core/common.model';
import {
    API_RESPONSE_CODE, GLOBAL_CONFIG, POLICY_LEVEL, API_CONTEXT_PATH, POLICY_TYPE, DEFAULT_VALUES, CONFIG_TYPE, RATE_CATEGORIES
  } from './core/constants';
import { ContextService } from './core/context.service';
import { GUARANTEE_ACCEPTED_TENDER_LIST, DEPOSIT_ACCEPTED_TENDER_LIST } from './create/template/policy-mgmt-create-template.constant';
import { ILanguageList } from './create/template/policy-mgmt-create-template.model';
import { TcTranslateService } from 'tc-angular-services';
import { RulesMataDataService } from './core/rules-meta-data.service';
import { IRulesMetaData, IPolicyMetadata, IPolicyMetaDataAPIResponse, IPolicyMetadataRequest } from './core/rules-metadata.model';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_METADATA_TYPE } from './core/rules.constant';
import { PolicyMgmtUtilityService } from './core/utility.service';

@Injectable()
export class PolicyMgmtService {

    constructor(
        private httpService: HTTPService,
        private sharedDataService: SharedDataService,
        private contextService: ContextService,
        private translate: TcTranslateService,
        private rulesMetaDataService: RulesMataDataService,
        private utilityService: PolicyMgmtUtilityService
    ) {
    }

    // This call is made when the search and create components are initialized
    async loadGlobalData(): Promise<any> {
        let hotelInfoObservable;
        let chainInfoObservable;
        let rulesMetadataObservable;
        let languageObservable;

        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
            hotelInfoObservable = await this.getHotelInfo().toPromise();
        } else {
            chainInfoObservable = await this.getChainInfo().toPromise();
            languageObservable = await this.getLanguages().toPromise();
        }

        const metaDataObservable = await this.getMetaData().toPromise();
        if (this.contextService.configType === CONFIG_TYPE.POLICY) {
            rulesMetadataObservable = await this.getRulesMetadata().toPromise();
        }

        return Promise.resolve({
            hotelInfoObservable,
            chainInfoObservable,
            metaDataObservable,
            rulesMetadataObservable,
            languageObservable
        });
    }

    /**
     * Makes Dropdown API call (rate plan, rate category, and templates)
     */
    async makePolicyMetadataAPICalls() {
        const policyType = this.contextService.policyType;
        if (!this.sharedDataService.getHotelInfo() && !this.sharedDataService.getChainInfo()) {
            return null;
        }
        if (!this.rulesMetaDataService.getRuleTypeIdByRuleTypeDisplay(policyType)) {
            return null;
        }
        let hotelID: string;
        let chainID: string;
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
            hotelID = this.sharedDataService.getHotelInfo().hotelCode.toString();
        } else {
            chainID = this.sharedDataService.getChainInfo().chainId.toString();
        }
        const ruleTypeID = this.rulesMetaDataService.getRuleTypeIdByRuleTypeDisplay(policyType).toString();

        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
            for (const key in POLICY_METADATA_TYPE) {
                const type = POLICY_METADATA_TYPE[key];
                let payload: IPolicyMetadataRequest = {
                    hotelID,
                    ruleTypeID,
                    type
                };
                if (type === POLICY_METADATA_TYPE.rateCategory) {
                    payload.owner = 'Property';
                } else if (type === POLICY_METADATA_TYPE.ratePlan) {
                    // Rate plan id will be in context when redirected from groups block screen
                    // Use this rate plan id to determine if rate plans should be retrieved from DB or cache
                    // Rate plans should be retrieved from DB only when redirected from groups block screen
                    if (this.contextService.getRatePlanId()) {
                        payload.Database = true;
                    }
                }
                await this.getPolicyMetadata(payload).toPromise();
            }
        }
        else {
            for (const key in ENTERPRISE_POLICY_METADATA_TYPE) {
                const type = ENTERPRISE_POLICY_METADATA_TYPE[key];
                let payload: IPolicyMetadataRequest = {
                    chainID,
                    ruleTypeID,
                    type
                };
                await this.getPolicyMetadata(payload).toPromise();
            }
        }
    }

    /**
     *  function to get hotelInfo from sharedDataService if available, else from API
     *  HotelInfo: https://api-t1.travelclick.com/propertyinfo/v1/hotels/6938/info?include=roomtypes
     */
    getHotelInfo(): Observable<IHotelInfo | any> {
        let infoUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            const hotelCode = this.contextService.apiConstant.tokenDecodedData.propertyid;
            infoUrl = 'hotels/' + hotelCode + '/info?include=roomtypes';
        } else {
            infoUrl = 'hotel-info.json';
            return this.httpService.get(infoUrl, '').pipe(map(this.mapHotelInfoData));
        }

        if (this.sharedDataService.getHotelInfo()) {
            return new Observable((subscriber) => {
                const temp: IHTTPResponse = {
                    status: API_RESPONSE_CODE.GET_SUCCESS,
                    body: this.sharedDataService.getHotelInfo()
                };
                subscriber.next(temp);
                subscriber.complete();
            }).pipe(map((res: IHTTPResponse) => res.body));
        } else {
            return this.httpService.get(infoUrl, API_CONTEXT_PATH.PROPERTY_INFO).pipe(map(this.mapHotelInfoData));
        }
    }

    getLanguages(): Observable<ILanguages | any> {
        let languageUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            languageUrl = 'common/languages';
        } else {
            languageUrl = 'languages.json';
            return this.httpService.get(languageUrl, '').pipe(map(this.mapLanguagesData));
        }

        if (this.sharedDataService.getLanguages()) {
            return new Observable((subscriber) => {
                const temp: IHTTPResponse = {
                    status: API_RESPONSE_CODE.GET_SUCCESS,
                    body: this.sharedDataService.getLanguages()
                };
                subscriber.next(temp);
                subscriber.complete();
            }).pipe(map((res: IHTTPResponse) => res.body));
        } else {
            return this.httpService.get(languageUrl, API_CONTEXT_PATH.CHAIN_API).pipe(map(this.mapLanguagesData));
        }
    }

    /**
     *  function to get chainInfo from sharedDataService if available, else from API
     *  ChainInfo: https://api-t1.travelclick.com/ihchain/v1/chains/AAM
     */
    getChainInfo(): Observable<IChainInfo | any> {
        let infoUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            const chainCode = this.contextService.getChainCode();
            infoUrl = 'chains/' + chainCode + (this.contextService.configType === CONFIG_TYPE.POLICY ? '?includes=categoryGroups' : '');
        } else {
            infoUrl = 'chain-info.json';
            return this.httpService.get(infoUrl, '').pipe(map(this.mapChainInfoData));
        }

        if (this.sharedDataService.getChainInfo()) {
            return new Observable((subscriber) => {
                const temp: IHTTPResponse = {
                    status: API_RESPONSE_CODE.GET_SUCCESS,
                    body: this.sharedDataService.getChainInfo()
                };
                subscriber.next(temp);
                subscriber.complete();
            }).pipe(map((res: IHTTPResponse) => res.body));
        } else {
            return this.httpService.get(infoUrl, API_CONTEXT_PATH.CHAIN_API).pipe(map(this.mapChainInfoData));
        }
    }

    /**
     *  function to get MetaData from sharedDataService if available, else from API
     *  Metadata: https://api-t1.travelclick.com/policy-mgmt/v1/metadata
     */
    getMetaData(): Observable<any> {
        let infoUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            infoUrl = 'metadata';
        } else {
            infoUrl = 'meta-data.json';
            return this.httpService.get(infoUrl, '').pipe(map(this.mapMetaDataInfo));
        }

        if (this.sharedDataService.getMetaData()) {
            return new Observable((subscriber) => {
                const temp: IHTTPResponse = {
                    status: API_RESPONSE_CODE.GET_SUCCESS,
                    body: this.sharedDataService.getMetaData()
                };
                subscriber.next(temp);
                subscriber.complete();
            }).pipe(map((res: IHTTPResponse) => res.body));
        } else {
            return this.httpService.get(infoUrl, API_CONTEXT_PATH.POLICY_MGMT).pipe(map(this.mapMetaDataInfo));
        }
    }

    /**
     * Function to get RulesMetaData info
     * If not available then makes call, else use it from sharedDataService
     */
    getRulesMetadata(): Observable<any> {
        let infoUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            infoUrl = 'metaData';
        } else {
            infoUrl = 'rulesData/rules-metadata.json';
            return this.httpService.get(infoUrl, '').pipe(map(this.mapRulesMetaData));
        }

        if (this.sharedDataService.getRulesMetaData()) {
            return new Observable((subscriber) => {
                const temp: IHTTPResponse = {
                    status: API_RESPONSE_CODE.GET_SUCCESS,
                    body: this.sharedDataService.getRulesMetaData()
                };
                subscriber.next(temp);
                subscriber.complete();
            }).pipe(map((res: IHTTPResponse) => res.body));
        } else {
            return this.httpService.get(infoUrl, API_CONTEXT_PATH.PRICING_API).pipe(map(this.mapRulesMetaData));
        }
    }

    /**
     * Gets Rate/RateCategory/Templates details for given policy and property
     * @param payload: API request
     */
    getPolicyMetadata(payload: IPolicyMetadataRequest): Observable<any> {
        let infoUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            infoUrl = 'dropDowns';
        } else {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                infoUrl = 'rulesData/' + payload.type + '.json';
            } else {
                infoUrl = 'rateplan-dropdown.json';
            }
            return this.httpService.get(infoUrl, '').pipe(map(this.mapPolicyMetadata));
        }

        if (this.sharedDataService.getPolicyMetadata(payload.type) && payload.type !== POLICY_METADATA_TYPE.template &&
            payload.type !== ENTERPRISE_POLICY_METADATA_TYPE.templates) {
            return new Observable((subscriber) => {
                const temp: IHTTPResponse = {
                    status: API_RESPONSE_CODE.GET_SUCCESS,
                    body: this.sharedDataService.getPolicyMetadata(payload.type)
                };
                subscriber.next(temp);
                subscriber.complete();
            }).pipe(map((res: IHTTPResponse) => res.body));
        } else {
            const methodName = payload.Database ? API_CONTEXT_PATH.PRICING_API_V2 : API_CONTEXT_PATH.PRICING_API;
            return this.httpService.post(infoUrl, payload, methodName).pipe(map(this.mapPolicyMetadata));
        }
    }

    /**
     * function to map hotelInfo
     */
    mapHotelInfoData = (res: IHTTPResponse): IHotelInfo | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const response: IHotelInfo = res.body;
            // assigns languageList from hotelInfo languages
            response.languageList = this.parseAndUpdateLanguageList(response.languages);

            this.sharedDataService.setHotelInfo(response);
            return response;
        } else {
            return false;
        }
    };

    mapChainInfoData = (res: IHTTPResponse): IChainInfo | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const response: IChainInfo = res.body;

            if (!!response.categories) {
                const list = this.utilityService.customSort(1, 'categoryName', response.categories);
                const responseCategories = list as Array<IChainCategory>;
                const chainCategories: Array<IPolicyMetadata> = [];
                for (const category of responseCategories) {
                    const chainCategory = {
                        id: category.categoryId.toString(),
                        name: category.categoryName,
                        status: category.status,
                        list: []
                    };
                    chainCategories.push(chainCategory);

                    for (const group of category.categoryGroups) {
                        const chainCategoryGroup = {
                                id: group.categoryGroupId.toString(),
                                name: group.categoryGroupName,
                                list: []
                            };
                        chainCategory.list.push(chainCategoryGroup);
                    }
                    chainCategory.list = this.utilityService.customSort(1, 'name', chainCategory.list);
                }

                this.sharedDataService.setPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.chainCategories, chainCategories);
            }

            this.sharedDataService.setChainInfo(response);
            return response;
        } else {
            return false;
        }
    };

    mapLanguagesData = (res: IHTTPResponse): ILanguages | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const response: ILanguages = res.body;
            res.body.languages.forEach(x => this.mapLanguageItem(x));
            this.sharedDataService.setLanguages(response);
            return response;
        } else {
            return false;
        }
    };

    mapLanguageItem = (resItem: any): ILanguage => {
        const returnItem: ILanguage = resItem;
        returnItem.id = resItem.languageId;
        returnItem.name = resItem.languageName;
        return returnItem;
    };

    /**
     * funtion to map Metadata info
     */
    mapMetaDataInfo = (res: IHTTPResponse): IMetadata | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const response: IMetadata = res.body;
            response.acceptedTender = {
                guarantee: [],
                deposit: []
            };

            // Arrange order of acceptedTender list
            if (response.acceptedTenderGuarantee && response.acceptedTenderGuarantee.length) {
                response.acceptedTender.guarantee = this.arrangeAcceptedTenderOrder(response.acceptedTenderGuarantee,
                    GUARANTEE_ACCEPTED_TENDER_LIST, POLICY_TYPE.GUARANTEE);
            }
            if (response.acceptedTenderDeposit && response.acceptedTenderDeposit.length) {
                response.acceptedTender.deposit = this.arrangeAcceptedTenderOrder(response.acceptedTenderDeposit,
                    DEPOSIT_ACCEPTED_TENDER_LIST, POLICY_TYPE.DEPOSIT);
            }

            this.sharedDataService.setMetaData(response);
            return response;
        } else {
            return false;
        }
    };

    /**
     * Rules metaData Mapper function
     */
    mapRulesMetaData = (res: IHTTPResponse): IRulesMetaData | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            this.sharedDataService.setRulesMetaData(res.body);
            return res.body;
        } else {
            return false;
        }

    };

    /**
     * Dropdown API calls mapper function
     */
    mapPolicyMetadata = (res: IHTTPResponse): Array<IPolicyMetadata> | boolean => {
        let sortedList: Array<IPolicyMetadata> = [];
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const response: IPolicyMetaDataAPIResponse = res.body;
            let listData: Array<IPolicyMetadata>;

            if (response.type === POLICY_METADATA_TYPE.ratePlan) {
                listData = response.uidataSet && response.uidataSet.categories ? response.uidataSet.categories : [];
            } else {
                listData = response.uidataSet && response.uidataSet.uiData ? response.uidataSet.uiData : [];
            }

            // sort rateCategories
            if (response.type === POLICY_METADATA_TYPE.ratePlan || response.type === POLICY_METADATA_TYPE.rateCategory) {
                sortedList = this.utilityService.sortArrayBasedOnOrder(listData, RATE_CATEGORIES, 'displayName');

                // sort rateplans
                if (response.type === POLICY_METADATA_TYPE.ratePlan) {
                    sortedList.forEach(category => {
                        category.list = this.utilityService.customSort(1, 'displayName', category.ratePlans);
                    });
                }
            } else if (response.type === ENTERPRISE_POLICY_METADATA_TYPE.rateCategories) {
                const listDataCopy = JSON.parse(JSON.stringify(listData));
                listDataCopy.forEach(ld => ld.id = `${this.sharedDataService.getChainInfo().chainId}${String(ld.id).padStart(2, '0')}`);
                sortedList = this.utilityService.customSort(1, 'displayName', listDataCopy);
            } else if (response.type === ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs) {
                sortedList = this.utilityService.customSort(1, 'displayName', listData);
            } else if (response.type === ENTERPRISE_POLICY_METADATA_TYPE.templates) {
                sortedList = this.utilityService.customSort(1, 'displayName', listData.filter(x => !!x.displayName));
            } else {
                sortedList = listData;
            }
            // format metaData
            const policyMetaData: Array<IPolicyMetadata> = this.formatPolicyMetadata(sortedList, response.type);

            this.sharedDataService.setPolicyMetadata(response.type, policyMetaData);
            return policyMetaData;
        } else {
            return false;
        }
    };

    /**
     * Formatting dropdown metadata in required format
     * @param listData: listData
     */
    formatPolicyMetadata(listData: Array<IPolicyMetadata>, metaDataType: string) {
        const metadata = [];
        listData.forEach(category => {
            let itemName: string;
            if (metaDataType === POLICY_METADATA_TYPE.rateCategory) {
                itemName = this.translate.translateService.instant('ratecategories.' + category.referenceId);
            } else if (metaDataType === POLICY_METADATA_TYPE.ratePlan) {
                itemName = this.translate.translateService.instant('ratecategories.' + category.id);
            } else {
                itemName = category.displayName;
            }
            const categoryItem: IPolicyMetadata = {
                name: itemName,
                id: category.id
            };

            if (category.ratePlans) {
                const rateList = [];
                category.ratePlans.forEach(rateplan => {
                    const rateItem: IPolicyMetadata = {
                        name: rateplan.displayName,
                        id: rateplan.id
                    };
                    rateList.push(rateItem);
                });
                categoryItem.list = rateList;
            }
            if (category.status) {
                categoryItem.status = category.status;
            }
            metadata.push(categoryItem);
        });
        return metadata;
    }

    /**
     * return new parsed data which is another property of hotelInfo.
     * @param languageList : property language list
     */
    parseAndUpdateLanguageList(languageList: Array<any>): Array<ILanguageList> {
        const parsedLanguageList: Array<ILanguageList> = [];
        const defaultLanguageObj = {
            id: DEFAULT_VALUES.messageLangDropdown.defaultLangId,
            name: DEFAULT_VALUES.messageLangDropdown.defaultLangName,
            code: DEFAULT_VALUES.messageLangDropdown.defaultLangCode
        };
        let found = false;
        languageList.forEach(item => {
            if (item.languageId === defaultLanguageObj.id) {
                found = true;
            }
            parsedLanguageList.push({
                id: item.languageId,
                name: item.languageName,
                code: item.languageCode
            });
        });
        if (!found) {
            // Add English (US) in the Language List
            parsedLanguageList.push(defaultLanguageObj);
        }
        // Sort the Language List by name
        parsedLanguageList.sort((a, b) => (a.name > b.name) ? 1 : -1);

        return parsedLanguageList;
    }

    /**
     * re-arrange Accepted tender Metadata list as per defined order
     * @param list: list from metadata
     * @param listToCompare: defined list to compare with
     * @param policyType: policyType
     */
    arrangeAcceptedTenderOrder(list: Array<IDropDownItem>, listToCompare: Array<number>, policyType: string): Array<IDropDownItem> {
        const orderedList = [...list];
        const orderedListLength = orderedList.length - 1;

        list.forEach(item => {
            let index = listToCompare.findIndex(elem => elem === item.id);
            index = index === -1 ? orderedListLength : index;
            orderedList[index] = this.getAcceptedTenderListItem(item.id, policyType);
        });

        return orderedList;
    }

    /**
     * Returns accepted tender list item
     * @param id: accepted tender id
     * @param policyType: policy type
     */
    getAcceptedTenderListItem(id: number, policyType: string): IDropDownItem {
        return {
            id,
            name: this.translate.translateService.instant(
                (policyType === POLICY_TYPE.GUARANTEE ? 'acceptedTenderGuaranteeId.' : 'acceptedTenderDepositId.')
                + id)
        };
    }


    getHotelSettingToggle(hotelId: string, hotelSettings: string): Observable<boolean> {
      const urlPath = `hotel/${hotelId}/hotel-settings/${hotelSettings}`;
      return this.httpService.get(urlPath, API_CONTEXT_PATH.PROPERTY_INFO)
      .pipe(map((result: any) => result.body.settingNumValue === 1));
    }
}
