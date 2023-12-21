import { Injectable } from '@angular/core';
import { SharedDataService } from '../../core/shared.data.service';
import { GLOBAL_CONFIG, PAYMENT_PROCESSING_STATUS, POLICY_CONFIG, POLICY_FLOW, POLICY_TYPE } from '../../core/constants';
import { ContextService } from '../../core/context.service';
import { POLICY_LEVEL, CONFIG_TYPE, POLICY_TYPE_FOR_API, API_CONTEXT_PATH, API_RESPONSE_CODE } from '../../core/constants';
import { HTTPService } from '../../core/http.service';
import { IHTTPResponse } from '../../core/common.model';
import { map } from 'rxjs/operators';
import {
    ITemplateVersionHistoryResponse, ITemplateHistoryVersionData, IHistoryRecord, ITemplateRevisions,
    TRANSLATE_VERSION_HISTORY, HistoryFieldsModified, IPolicyVersionHistoryResponse,
     IPolicyVersionHistoryData, IPolicyRevisions, DAY_OF_WEEK, IRatePlanList, IRateCategoryList,
     IChainCategoryList, ITemplateVersionHistoryEnterpriseResponse, ITemplateHistoryVersionEnterpriseData
} from './version-history.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../core/translation.constant';
import { CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS } from '../../core/rules-config.constant';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { IDropDownItem } from '../../core/common.model';
import { IPolicyMetadata } from '../../core/rules-metadata.model';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_METADATA_TYPE } from '../../core/rules.constant';
import { RulesMataDataService } from '../../core/rules-meta-data.service';

@Injectable()
export class VersionHistoryService {
    /**
     * Holds dropdown metadata for ratePlan and rateCategory
     */
    dropdownList: {
        ratePlanList: Array<IPolicyMetadata>,
        rateCategoryList: Array<IPolicyMetadata>,
        chainCategories?: Array<IPolicyMetadata>
    };

    /**
     * Holds Rate Plans list
     */
    ratePlans: Array<IRatePlanList> = [];

    /**
     * Holds Rate Categories list
     */
    rateCategories: Array<IRateCategoryList> = [];

    /**
     * Holds Chain Categories list
     */
    chainCategories: Array<IChainCategoryList> = [];

    constructor(
        private sharedDataService: SharedDataService,
        private contextService: ContextService,
        private httpService: HTTPService,
        private translate: TcTranslateService,
        private utilityService: PolicyMgmtUtilityService,
        private rulesMetaDataService: RulesMataDataService
    ) { }

    /**
     * Function used to generate Rate Plans and Rate Categories list
     */
    generateRatePlansAndCategoriesList() {
        if(this.contextService.policyLevel === POLICY_LEVEL.PROPERTY){
            this.dropdownList.ratePlanList.forEach(ratePlansArray => {
                ratePlansArray.list.forEach(ratePlan => {
                    this.ratePlans.push(ratePlan);
                });
            });
        } else {
            this.ratePlans = this.dropdownList.ratePlanList;
            this.dropdownList.chainCategories.forEach(chainCategoriesArray => {
                chainCategoriesArray.list.forEach(chainCategory => {
                    this.chainCategories.push(chainCategory);
                });
            });
        }
        this.rateCategories = this.dropdownList.rateCategoryList;
    }

    /**
     * Makes Version History API call
     * @param id: template/policy id
     */
    getVersionHistoryData(id: number) {
        let apiUrl;
        if (GLOBAL_CONFIG.PRODUCTION) {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
            const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
                if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
                    apiUrl = 'hotels/' + hotelCode + '/policy-template/'
                        + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/history'
                        + '/' + id;
                } else {
                    apiUrl = 'hotels/' + hotelCode + '/policy/'
                        + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/history'
                        + '/' + id;
                }
                return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map(this.mapVersionHistoryData));
            } else {
                const chainCode = this.sharedDataService.getChainInfo().chainCode;
                if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
                    apiUrl = 'enterprise/' + chainCode + '/policyTemplate/version-history'
                        + '/' + id;
                    return this.httpService.get(apiUrl, API_CONTEXT_PATH.IHONBOARDING)
                    .pipe(map(this.mapVersionHistoryData));
                } else {
                    apiUrl = 'enterprise/' + chainCode + '/policy/'
                        + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/history'
                        + '/' + id;
                    return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map(this.mapVersionHistoryData));
                }
            }
        } else {
            // local data
            return null;
        }
    }

    /**
     * Version History Mapper function
     */
    mapVersionHistoryData = (res: IHTTPResponse): Array<IHistoryRecord> | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
              if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
                const response: ITemplateVersionHistoryEnterpriseResponse = res.body;
                return this.getTemplateHistoryRecords(response.versionHistory);
              } else {
                const response: ITemplateVersionHistoryResponse = res.body;
                return this.getTemplateHistoryRecords(response.policyTemplateHistory);
              }
            } else {
              const policyResponse: IPolicyVersionHistoryResponse = res.body;
              return this.getPolicyHistoryRecords(policyResponse.versionHistory);
            }
        } else {
            return false;
        }
    };

    /**
     * Returns History Data in UI format for Policies
     * @param data: Policy Verision history data
     */
    getPolicyHistoryRecords(data: Array<IPolicyVersionHistoryData>) {
        const historyRecord: Array<IHistoryRecord> = [];

        if(this.contextService.policyLevel === POLICY_LEVEL.PROPERTY){
            this.dropdownList = {
                ratePlanList: this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.ratePlan),
                rateCategoryList: this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.rateCategory)
            };
        } else {
            this.dropdownList = {
                ratePlanList: this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs),
                rateCategoryList: this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCategories),
                chainCategories: this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.chainCategories)
            };
        }
        // setting rateplan and rate categories lists
        this.generateRatePlansAndCategoriesList();

        data.forEach((versionData: IPolicyVersionHistoryData) => {
            if (versionData.revisionHistory.revisions.length !== 0) {
                versionData.revisionHistory.revisions.forEach((revisionData: IPolicyRevisions) => {
                    // Date Range, Template ID and Rule Override fields check
                    if (revisionData.field && (revisionData.oldValue || revisionData.newValue) &&
                     revisionData.field !== HistoryFieldsModified.policyDateRange &&
                     revisionData.field !== HistoryFieldsModified.policyTemplateId) {
                        const record: IHistoryRecord = {};
                        record.id = versionData.metadata.policyTemplateHistoryId;

                        // converting record time and date in property time zone
                        if(this.contextService.policyLevel === POLICY_LEVEL.PROPERTY){
                            const hotelInfo = this.sharedDataService.getHotelInfo();
                            record.date = this.utilityService
                                .convertToPropertyTimeZone(hotelInfo.timezone, versionData.metadata.versionDate);
                        } else {
                            record.date = this.utilityService
                                .convertToPropertyTimeZone('UTC', versionData.metadata.versionDate);
                        }
                        record.userName = versionData.metadata.modifiedByUsername;
                        // setting record field column values
                        record.field = this.setRecordField(revisionData.field);

                        if (revisionData.field === HistoryFieldsModified.startDate ||
                             revisionData.field === HistoryFieldsModified.multiStartDate ||
                             revisionData.field === HistoryFieldsModified.endDate ||
                             revisionData.field === HistoryFieldsModified.multiEndDate) {
                            record.oldValue = this.setStartAndEndDates(revisionData.field, revisionData.oldValue);
                            record.newValue = this.setStartAndEndDates(revisionData.field, revisionData.newValue);
                        } else {
                            record.oldValue = this.transformHistoryDataValues(revisionData.oldValue, revisionData.field);
                            record.newValue = this.transformHistoryDataValues(revisionData.newValue, revisionData.field);
                        }
                        historyRecord.push(record);
                    }
                });
            }
        });
        return historyRecord;
    }

    /**
     * formatting and returning start date and end date values
     * @param field: field name
     * @param value: field's old or new value
     */
    setStartAndEndDates(field: string, value: string) {
        let transformedDate = [];
        if (value) {
            transformedDate = [...this.transformHistoryDataValues(value, field)];
        } else {
            if ( field === HistoryFieldsModified.endDate || field === HistoryFieldsModified.multiEndDate) {
                transformedDate = [this.translate.translateService.instant(TranslationMap['NO_END_DATE'])];
            } else {
                transformedDate = [value];
            }
        }
        return transformedDate;
    }

    /**
     * formatting and returns Days of Week values in UI format
     * @param field: field name
     * @param value: string
     */
    setDow(value: string) {
        const dowArr = this.splitValues(value);
        const transformedDays = [];
        dowArr.forEach((day) => {
            transformedDays.push(this.translate.translateService.instant(TranslationMap[DAY_OF_WEEK[day]]));
        });
        return transformedDays;
    }

    /**
     * Function returning array of rate plans using rate plan id
     * @param ids Array of rate plan Ids
     */
    getRatePlanNameById(ids: Array<string>) {
        const ratePlanNames = [];
        let ratePlanDetails;
        ids.forEach( (id) => {
            ratePlanDetails = this.ratePlans.find(item => item.id.toString() === id);
            if (ratePlanDetails) {
                ratePlanNames.push(ratePlanDetails.name);
            }
        });
        return ratePlanNames;
    }

    /**
     * Function returning array of chain categories using chain category id
     * @param ids Array of chain categories Ids
     * @return Array of chain categories names
     */
    getChainCategoryNameById(ids: Array<string>){
        const chainCategoryNames = [];
        let chainCategory;
        ids.forEach( (id) => {
            chainCategory = this.chainCategories.find(item => item.id.toString() === id);
            if (chainCategory) {
                chainCategoryNames.push(chainCategory.name);
            }
        });
        return chainCategoryNames;
    }

    /**
     * Function returning rate category using Id
     * @param ids Array of rate categories
     */
    getRateCategoryById(ids: Array<string>) {
        const rateCategoryArray = [];
        let rateCategoryDetails;
        ids.forEach((id) => {
            rateCategoryDetails = this.rateCategories.find(item => item.id.toString() === id);
            if (rateCategoryDetails) {
                rateCategoryArray.push(rateCategoryDetails.name);
            }
        });
        return rateCategoryArray;
    }

    /**
     * Function returning template name using Id
     * @param id template id
     */
    getTemplateNameById(id: string) {
        return this.rulesMetaDataService.getTemplateNameById(parseInt(id, 10));
    }

    /**
     * Function returning 'Default' or 'Dated' policy type
     * @param value type value string
     */
    setPolicyType(value: string) {
        return value === 'true' ? this.getTranslatedField('DEFAULT') : this.getTranslatedField('DATED');
    }

    /**
     * Used to set record field column values
     * @param field Record field value
     */
    setRecordField(field: string) {
        if (field === HistoryFieldsModified.multiEndDate) {
            return this.getTranslatedField(HistoryFieldsModified.endDate.toUpperCase());
        } else if (field === HistoryFieldsModified.multiStartDate) {
            return this.getTranslatedField(HistoryFieldsModified.startDate.toUpperCase());
        } else if (TranslationMap[TRANSLATE_VERSION_HISTORY[this.contextService.configType][field.toUpperCase()]]) {
            return this.getTranslatedField(field.toUpperCase());
        } else {
            return field;
        }
    }

    /**
     * Function returning array by spliting '='
     * @param value String value
     */
    splitValues(value: string) {
        const outputArr = value.split('=');
        return outputArr;
    }

    /**
     * Returns History Data in UI format
     * @param data: history data
     */
    getTemplateHistoryRecords(data: Array<ITemplateHistoryVersionData | ITemplateHistoryVersionEnterpriseData>) {
        const historyRecord: Array<IHistoryRecord> = [];
        const hotelInfo = this.sharedDataService.getHotelInfo();

        data.forEach((versionData: ITemplateHistoryVersionData) => {
          const revisionHistory = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE ? versionData['revisionHistory']
          : versionData.policyTemplate;
            if (revisionHistory.revisions.length !== 0) {
              revisionHistory.revisions.forEach((revisionData: ITemplateRevisions) => {
                    if (revisionData.field && (revisionData.oldValue || revisionData.newValue)) {

                        // if deposit rule data present but payment processing mode is disabled,
                        // then dont show version history for deposit rules
                        if (this.contextService.policyType === POLICY_TYPE.DEPOSIT
                            && hotelInfo && hotelInfo.paymentInfo.processingMode === PAYMENT_PROCESSING_STATUS.DISABLED
                            && revisionData.field === HistoryFieldsModified.depositRule) {
                                return;
                        }

                        const record: IHistoryRecord = {};
                        record.id = versionData.metadata.policyTemplateHistoryId;
                        const timezone = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE ? 'UTC' : hotelInfo.timezone;
                        record.date = this.utilityService.convertToPropertyTimeZone(timezone, versionData.metadata.versionDate);
                        record.userName = versionData.metadata.modifiedByUsername;

                        // checking whether field is Online_Call_Center_Message
                        const lastIndex = revisionData.field.lastIndexOf('_');
                        const revisedField = revisionData.field.slice(0, lastIndex);

                        if (revisedField.toLowerCase() === HistoryFieldsModified.onlineCCMessage.toLowerCase()) {
                            record.field = this.getTranslatedField(revisedField.toLowerCase());

                            const languageId = revisionData.field.slice(lastIndex + 1);
                            record.oldValue = this.transformHistoryDataValues(revisionData.oldValue,
                               revisedField.toLowerCase(), languageId);
                            record.newValue = this.transformHistoryDataValues(revisionData.newValue,
                               revisedField.toLowerCase(), languageId);

                        } else if (revisedField.toLowerCase().startsWith(HistoryFieldsModified.gdsMessage.toLowerCase())){
                          record.field = this.getTranslatedField(revisedField);
                          record.oldValue = this.transformHistoryDataValues(revisionData.oldValue, HistoryFieldsModified.gdsMessage);
                          record.newValue = this.transformHistoryDataValues(revisionData.newValue, HistoryFieldsModified.gdsMessage);
                      } else {
                            record.field = this.getTranslatedField(revisionData.field);
                            record.oldValue = this.transformHistoryDataValues(revisionData.oldValue, revisionData.field);
                            record.newValue = this.transformHistoryDataValues(revisionData.newValue, revisionData.field);
                        }
                        historyRecord.push(record);
                    }
                });
            }
        });
        return historyRecord;
    }

    /**
     * Return translated field
     * @param field: field to translate
     */
    getTranslatedField(field: string, variableField?: any): string {
        return this.translate.translateService.instant(
            TranslationMap[TRANSLATE_VERSION_HISTORY[this.contextService.configType][field]],
            variableField
        );
    }

    /**
     * Transforms History Values
     * @param value: value to updatee
     * @param field: field to modify
     * @param languageId: Language selected
     */
    transformHistoryDataValues(value: string, field?: string, languageId?: string) {
        let translatedValue = [];
        if (value !== '' && value !== null && value !== undefined) {
            switch (field) {
                // Cancellation Notice Value Modification
                case HistoryFieldsModified.cancelNotice:
                    const noticeArr = value.split('|');
                    let revisedValue = '';
                    if (noticeArr[0] === CANCELLATION_OPTIONS.SAME_DAY) {
                        revisedValue = this.getTranslatedField(noticeArr[0]) + ' - ' + noticeArr[1] + ':00';

                    } else if (noticeArr[0] === CANCELLATION_OPTIONS.ADVANCE_NOTICE) {
                        revisedValue = this.getTranslatedField(noticeArr[0]) + ' - '
                            + noticeArr[1] + ' ' + this.getTranslatedField('DAYS_PLUS') + ' '
                            + noticeArr[2] + ' ' + this.getTranslatedField('HOURS');

                    } else {
                        revisedValue = this.getTranslatedField('NON_REFUNDABLE');
                    }
                    translatedValue = [revisedValue];
                    break;

                // Ota Cacnellation Charge Value Modification
                case HistoryFieldsModified.otaCancelCharge:
                    const otaArr = value.split('|');
                    if (otaArr[0] === OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX
                        || otaArr[0] === 'NUMBER_OF_NIGHTS') {
                        translatedValue = [this.getTranslatedField(otaArr[0], { '#': otaArr[1] })];
                    } else {
                        translatedValue = [this.getTranslatedField(otaArr[0]) + ' - ' + otaArr[1]];
                    }
                    break;

                // Free Cancellation Value Modification
                case HistoryFieldsModified.freeCancellation:
                    const val = value === 'true' ? 'SELECTED' : 'NOT_SELECTED';
                    translatedValue = [this.getTranslatedField(val)];
                    break;

                // installment Enabled Value Modification
                case HistoryFieldsModified.installmentEnabled:
                    const installmentEnabledVal = value === 'true' ? 'SELECTED' : 'NOT_SELECTED';
                    translatedValue = [this.getTranslatedField(installmentEnabledVal)];
                    break;

                // Template Status Value Modification
                case HistoryFieldsModified.templateStatus:
                    translatedValue = [this.getTranslatedField(value)];
                    break;

                // Online CC Message Value Modification
                case HistoryFieldsModified.onlineCCMessage:
                  let languageList;
                  let currentLanguage;
                  if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
                    languageList = this.sharedDataService.getChainInfo().chainHotels.flatMap(x => x.supportedLanguages);
                    currentLanguage =  this.sharedDataService.getLanguages().languages.filter(x => languageList.includes(x.id))
                    .find(x => x.id.toString() === languageId);
                  } else {
                    languageList = this.sharedDataService.getHotelInfo().languageList;
                    currentLanguage = languageList.find(languageData => languageData.id.toString() === languageId);
                  }
                    const languageName = currentLanguage ? currentLanguage.name : 'N/A';
                    const merchandiseLang = this.translate.translateService.instant(TranslationMap['MERCHANDISING_TEXT'])
                        + ': ' + languageName;
                    translatedValue = [merchandiseLang, value];
                    break;

                // Accepted Tender
                case HistoryFieldsModified.acceptedTender:
                    const metaData = this.sharedDataService.getMetaData();
                    const acceptedTenderList: Array<IDropDownItem> = metaData.acceptedTender[this.contextService.policyType];
                    const acceptedTenderSelected = acceptedTenderList.find(item => item.id.toString() === value);
                    translatedValue = [acceptedTenderSelected.name];
                    break;

                // Full prepaid GDS rate Notification
                case HistoryFieldsModified.isPrePay:
                    const isPrePayValue = value === 'true' ? 'SELECTED' : 'NOT_SELECTED';
                    translatedValue = [this.getTranslatedField(isPrePayValue)];
                    break;

                // Deposit Rule
                case HistoryFieldsModified.depositRule:
                    const depositRuleList = this.sharedDataService.getDepositRulesList()
                        ? this.sharedDataService.getDepositRulesList() : [];
                    const selectedDepositRule = depositRuleList.find(item => item.id.toString() === value);
                    translatedValue = [selectedDepositRule ? selectedDepositRule.name : ''];
                    break;

                case HistoryFieldsModified.startDate:
                case HistoryFieldsModified.multiStartDate:
                case HistoryFieldsModified.endDate:
                case HistoryFieldsModified.multiEndDate:
                    translatedValue = [...this.splitValues(value)];
                    break;

                case HistoryFieldsModified.rateCategory:
                    const outputArray = this.getRateCategoryById(this.splitValues(value));
                    translatedValue = [...outputArray];
                    break;

                case HistoryFieldsModified.ratePlan:
                    const ratePlansArray = this.getRatePlanNameById(this.splitValues(value));
                    translatedValue = [...ratePlansArray];
                    break;

                case HistoryFieldsModified.level:
                  if (value.toLowerCase() === POLICY_LEVEL.ENTERPRISE.toLowerCase()
                   && this.contextService.configType === CONFIG_TYPE.POLICY) {
                    value = 'CHAIN';
                  }
                  translatedValue = [this.getTranslatedField(value)];
                  break;
                case HistoryFieldsModified.policyStatus:
                case HistoryFieldsModified.policyType:
                    translatedValue = [this.getTranslatedField(value)];
                    break;

                // Override policies flag
                case HistoryFieldsModified.ruleOverride:
                    const ruleOverrideValue = value === '1' ? 'SELECTED' : 'NOT_SELECTED';
                    translatedValue = [this.getTranslatedField(ruleOverrideValue)];
                    break;

                case HistoryFieldsModified.dow:
                    const daysArray = this.setDow(value);
                    translatedValue = [...daysArray];
                    break;
                case HistoryFieldsModified.chainCategory:
                    const chainCategoriesArray = this.getChainCategoryNameById(this.splitValues(value));
                    translatedValue = [...chainCategoriesArray];
                    break;

                default:
                    translatedValue = [value];
                    break;
            }
        }
        return translatedValue;
    }
}
