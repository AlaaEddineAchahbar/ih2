import { Injectable } from '@angular/core';
import { ITemplateResponseModel } from '../../create/template/policy-mgmt-create-template.model';
import { TcTranslateService } from 'tc-angular-services';
import {
  CANCELLATION_OPTIONS,
  DEPOSIT_CONFIGURATION_CHARGE_TYPE,
  STATUS_LIST,
  ENTERPRISE_POLICY_CREATION_LEVEL,
  PROPERTY_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_LEVEL_FILTERS,
  DEPOSIT_CONFIGURATION_OWNER_TYPE
} from '../../core/rules-config.constant';
import {
  ITemplateSearchListModel,
  IPolicySearchListModel,
  IDepositConfigurationListModel,
  IEMTemplateSearchListModel
} from './policy-mgmt-list.model';
import { TranslationMap } from '../../core/translation.constant';
import { ContextService } from '../../core/context.service';
import { SharedDataService } from '../../core/shared.data.service';
import { IDropDownItem, IHotelInfo } from '../../core/common.model';
import { POLICY_TYPE, PAYMENT_PROCESSING_STATUS, dayOfweekEnum } from '../../core/constants';
import {
  IEmPaymentDepositRulesResponseModel,
  IPolicySearchRepsonseModel,
  IEMPolicySearchResponseModel,
  IEMTemplateResponseModel,
  IPaymentDepositRulesResponseModel
} from '../policy-mgmt-search.model';
import { DEFAULT_DATED_POLICY_TYPE, POLICY_METADATA_TYPE, ENTERPRISE_POLICY_METADATA_TYPE } from '../../core/rules.constant';
import { DaysOfWeek } from '../../create/policy/policy-mgmt-create-policy.model';
import { IPolicyMetadata } from '../../core/rules-metadata.model';
import * as moment from 'moment';
import { PolicyMgmtUtilityService } from '../../core/utility.service';

@Injectable()
export class PolicyMgmtListParsingService {
  constructor(
    private translate: TcTranslateService,
    private contextService: ContextService,
    private sharedDataService: SharedDataService,
    private utilityService: PolicyMgmtUtilityService
  ) { }

  /**
   * Parses search response in UI list format
   * @param parseListData: search response
   */
  parseTemplateListData(listData: Array<ITemplateResponseModel>): Array<ITemplateSearchListModel> {
    const parseListData: Array<ITemplateSearchListModel> = [];
    const hotelInfo: IHotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
    listData.forEach((templateData: ITemplateResponseModel) => {
      const listItem: ITemplateSearchListModel = {};

      // Name with policy code
      listItem.name = templateData.name;
      listItem.name += templateData.policyCode ? ' (' + templateData.policyCode + ')' : '';

      // Template id
      listItem.id = templateData.id;

      // Status
      listItem.status = templateData.status;

      // Is Template created at enterprise level
      listItem.isCreatedAtEnterpriseLevel = templateData.isEnterpriseLevel;

      // policy-settings
      if (templateData.policySetting) {

        // Cancellation Rule
        if (templateData.policySetting.hasOwnProperty('cancellationRule')) {
          const cancellationRule = templateData.policySetting.cancellationRule;

          if (cancellationRule.chargeType === CANCELLATION_OPTIONS.SAME_DAY) {
            listItem.cancellationRule = this.getTranslatedField('SAME_DAY') + ' - ' + cancellationRule.priorHours + ':00';

          } else if (cancellationRule.chargeType === CANCELLATION_OPTIONS.ADVANCE_NOTICE) {
            listItem.cancellationRule = this.getTranslatedField('ADVANCE_NOTICE') + ' - '
              + cancellationRule.priorDays + ' ' + this.getTranslatedField('DAYS_PLUS') + ' '
              + cancellationRule.priorHours + ' ' + this.getTranslatedField('HOURS');

          } else {
            listItem.cancellationRule = this.getTranslatedField('NON_REFUNDABLE');
          }
        }

        // OTA cancellation charge notification
        if (templateData.policySetting.hasOwnProperty('otaSetting')) {
          const otaSetting = templateData.policySetting.otaSetting;
          if (otaSetting.otaChargeAmount || otaSetting.otaChargeNights || otaSetting.otaChargePercentage) {
            if (otaSetting.otaChargeNights) {
              listItem.otaSetting = this.getTranslatedField('VARIABLE_NIGHTS', { '#': otaSetting.otaChargeNights });
            } else if (otaSetting.otaChargeAmount) {
              listItem.otaSetting = this.getTranslatedField('VARIABLE_FLAT_AMT', { '#': otaSetting.otaChargeAmount });
            } else if (otaSetting.otaChargePercentage) {
              listItem.otaSetting = this.getTranslatedField('VARIABLE_PERCENT_AMT', { '#': otaSetting.otaChargePercentage });
            }
          }
        }

        // Free Cancellation
        if (templateData.policySetting.hasOwnProperty('isFreeCancellation')) {
          listItem.isFreeCancellation = templateData.policySetting.isFreeCancellation
            ? this.getTranslatedField('SELECTED')
            : this.getTranslatedField('NOT_SELECTED');
        }

        // Accepted Tender
        if (templateData.policySetting.hasOwnProperty('acceptedTender')) {
          listItem.acceptedTender = this.getAcceptedTenderNameById(Number(templateData.policySetting.acceptedTender));
        }

        // Late Arrival time
        if (templateData.policySetting.hasOwnProperty('holdTime') && templateData.policySetting.holdTime) {
          listItem.arrivalTime = this.getTranslatedField('HOLD_UNTIL') + ' ' +
            templateData.policySetting.holdTime + this.getTranslatedField('WITHOUT_PAYMENT');
        }

        // If the property has been activated for Payment Processing, and a Deposit Rule has been assigned
        if (this.contextService.policyType === POLICY_TYPE.DEPOSIT && hotelInfo
          && (hotelInfo.paymentInfo.processingMode !== PAYMENT_PROCESSING_STATUS.DISABLED
            || hotelInfo.hotelSettings.isGdsEnabled)) {
          if (templateData.policySetting.hasOwnProperty('depositRuleName') && templateData.policySetting.depositRuleName) {
            listItem.depositeRule = String(templateData.policySetting.depositRuleName);
          }
        }

        if (templateData.policySetting.hasOwnProperty('isInstallmentEnabled')) {
          if (templateData.policySetting.isInstallmentEnabled) {
            listItem.isInstallmentEnabled = this.getTranslatedField('ACTIVE_TEXT');
          } else {
            listItem.isInstallmentEnabled = this.getTranslatedField('INACTIVE_TEXT');
          }
        }
      }

      parseListData.push(listItem);
    });
    return parseListData;
  }

  /**
   * Parses search policy response in UI list format
   * @param parseListData: policy search response
   */
  parsePropertyPolicyListData(listData: Array<IPolicySearchRepsonseModel>): Array<IPolicySearchListModel> {
    const parsedList: Array<IPolicySearchListModel> = [];
    const dayOfWeekKeys = Object.keys(new DaysOfWeek());
    const hotelInfo: IHotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
    const propertyTodayDate = this.utilityService.getStartDate(hotelInfo.timezone);
    const todaysDate = moment(propertyTodayDate).toDate();

    listData.forEach((policyData: IPolicySearchRepsonseModel) => {
      const listItem: IPolicySearchListModel = {};
      listItem.name = policyData.uxGroupName;
      if (policyData.rules[0].auxId) {
        listItem.id = policyData.rules[0].auxId.toString();
      } else {
        listItem.id = null;
      }
      listItem.templateName = policyData.uxpolicyTemplateName;
      listItem.templateName += policyData.uxpolicyTemplateCode ? ' (' + policyData.uxpolicyTemplateCode + ')' : '';

      const enterpriseLevelValues: string[] = Object.values(ENTERPRISE_POLICY_CREATION_LEVEL);
      listItem.isCreatedAtEnterpriseLevel = enterpriseLevelValues.includes(policyData.uxPolicyLevel);

      // set policy type: dated/default with dateRangeList
      if (policyData.uxPolicyType === DEFAULT_DATED_POLICY_TYPE.default) {
        listItem.date = this.getTranslatedField('DEFAULT');
      } else {
        const dateRangeList = [];
        if (policyData.uxPolicyDateRange) {
          policyData.uxPolicyDateRange.split(',').forEach(dateRange => {
            const startDate = moment(dateRange.split('/')[0]).format('DD-MMM-YYYY');
            const endDate = dateRange.split('/')[1] ?
              moment(dateRange.split('/')[1]).format('DD-MMM-YYYY')
              : this.getTranslatedField('NO_END_DATE');
            dateRangeList.push(startDate + ' - ' + endDate);
          });
        }

        if (dateRangeList.length === 1) {
          listItem.date = dateRangeList[0];
        } else if (dateRangeList.length > 1) {
          listItem.date = this.getTranslatedField('VIEW_DATES');
          listItem.dateRangeList = dateRangeList;
        }
      }

      const ruleEndDate = policyData.rules[0].ruleEndDate;

      // set rule status - Active/Inactive/Expired
      const isExpired = ruleEndDate && moment(ruleEndDate).isBefore(todaysDate);
      listItem.status = isExpired ? STATUS_LIST.EXPIRED : policyData.uxPolicyStatus;

      // set call-out item(list right side panel)
      if (ruleEndDate) {
        const diff = moment(ruleEndDate).diff(todaysDate, 'days');
        if (moment(ruleEndDate).isSameOrAfter(todaysDate) && diff <= 30) {
          listItem.callOutListItem = {
            header: this.getTranslatedField('POLICY_ENDS_IN'),
            body: diff.toString(),
            footer: this.getTranslatedField('DAYS')
          };
        }
      }

      // Set Day of Week
      if (policyData.uxDOW) {
        const dowArr = policyData.uxDOW.split(',');
        if (dowArr.length === 7) {
          listItem.dow = this.getTranslatedField('ALL_DAYS');
        } else {
          const parsedDow = [];
          dayOfWeekKeys.forEach(day => {
            const dowIndex = dowArr.findIndex(dow => dow === dayOfweekEnum[day]);
            if (dowIndex !== -1) {
              parsedDow.push(this.getTranslatedField(day));
            }
          });
          listItem.dow = parsedDow.join(', ');
        }
      }

      listItem.level = policyData.uxPolicyLevel;
      switch (listItem.level) {
        case PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN: {
          listItem.linkedMetaDataList = this.getMetaDataNamesByIds2ndLevel(POLICY_METADATA_TYPE.ratePlan,
            policyData.uxRatePlanIds);
          break;
        }
        case PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY: {
          listItem.linkedMetaDataList = this.getMetaDataNamesByIdsForRateCategory(policyData.uxRateCategoryIds);
          break;
        }
        case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG: {
          listItem.linkedMetaDataList = policyData.uxRateCatalogs.map(e => e.rateCatalogName);
          break;
        }
        case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY: {
          listItem.linkedMetaDataList = this.getMetaDataNamesByIdsForRateCategory(policyData.rules.map(e => e.uniqueID.toString()));
          break;
        }
        default: {
          listItem.linkedMetaDataList = null;
          break;
        }
      }

      parsedList.push(listItem);
    });
    return parsedList;
  }

  /**
   * Parses search response in UI enterprise list format
   * @param listData: search response
   */
  parseEMTemplateListData(listData: Array<IEMTemplateResponseModel>): Array<IEMTemplateSearchListModel> {
    const parseListData: Array<IEMTemplateSearchListModel> = [];

    listData.forEach((templateData: IEMTemplateResponseModel) => {
      const listItem: IEMTemplateSearchListModel = {};
      listItem.name = templateData.name;
      listItem.name += templateData.policyCode ? ' (' + templateData.policyCode + ')' : '';
      listItem.id = templateData.emPolicyTemplateId;
      listItem.status = templateData.status;

      // Parse JobInfo to display copy clone error details
      if (!templateData.jobInfo) {
        templateData.jobInfo = {
          status: 'Pending',
          total_hotels_count: 0,
          failed_hotels_count: 0,
          pending_hotels_count: 0,
          success_hotels_count: 0
        };
      }
      listItem.jobId = templateData.jobId;
      listItem.total_hotels_count = templateData.jobInfo.total_hotels_count;
      listItem.failed_hotels_count = templateData.jobInfo.failed_hotels_count;

      // Parse PolicySetting
      if (templateData.policySetting) {
        this.parseEMTemplateListDataPolicySetting(listItem, templateData);
      }

      parseListData.push(listItem);
    });
    return parseListData;
  }

  /**
   * Parses policySetting for enterprise template search response in UI enterprise list format
   * @param listItem : list of enterprise template to be parsed
   * @param templateData : search response
   */
  parseEMTemplateListDataPolicySetting(listItem: IEMTemplateSearchListModel, templateData: IEMTemplateResponseModel) {
    const hotelInfo: IHotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
    // Cancellation Rule
    if (templateData.policySetting.hasOwnProperty('cancellationRule')) {
      const cancellationRule = templateData.policySetting.cancellationRule;

      if (cancellationRule.chargeType === CANCELLATION_OPTIONS.SAME_DAY) {
        listItem.cancellationRule = this.getTranslatedField('SAME_DAY') + ' - ' + cancellationRule.priorHours + ':00';

      } else if (cancellationRule.chargeType === CANCELLATION_OPTIONS.ADVANCE_NOTICE) {
        listItem.cancellationRule = this.getTranslatedField('ADVANCE_NOTICE') + ' - '
          + cancellationRule.priorDays + ' ' + this.getTranslatedField('DAYS_PLUS') + ' '
          + cancellationRule.priorHours + ' ' + this.getTranslatedField('HOURS');

      } else {
        listItem.cancellationRule = this.getTranslatedField('NON_REFUNDABLE');
      }
    }

    // OTA cancellation charge notification
    if (templateData.policySetting.hasOwnProperty('otaSetting')) {
      const otaSetting = templateData.policySetting.otaSetting;
      if (otaSetting.otaChargeAmount || otaSetting.otaChargeNights || otaSetting.otaChargePercentage) {
        if (otaSetting.otaChargeNights) {
          listItem.otaSetting = this.getTranslatedField('VARIABLE_NIGHTS', { '#': otaSetting.otaChargeNights });
        } else if (otaSetting.otaChargeAmount) {
          listItem.otaSetting = this.getTranslatedField('VARIABLE_FLAT_AMT', { '#': otaSetting.otaChargeAmount });
        } else if (otaSetting.otaChargePercentage) {
          listItem.otaSetting = this.getTranslatedField('VARIABLE_PERCENT_AMT', { '#': otaSetting.otaChargePercentage });
        }
      }
    }

    // Free Cancellation
    if (templateData.policySetting.hasOwnProperty('isFreeCancellation')) {
      listItem.isFreeCancellation = templateData.policySetting.isFreeCancellation
        ? this.getTranslatedField('SELECTED')
        : this.getTranslatedField('NOT_SELECTED');
    }

    // Accepted Tender
    if (templateData.policySetting.hasOwnProperty('acceptedTender')) {
      listItem.acceptedTender = this.getAcceptedTenderNameById(Number(templateData.policySetting.acceptedTender));
    }

    // Late Arrival time
    if (templateData.policySetting.hasOwnProperty('holdTime') && templateData.policySetting.holdTime) {
      listItem.arrivalTime = this.getTranslatedField('HOLD_UNTIL') + ' ' +
        templateData.policySetting.holdTime + this.getTranslatedField('WITHOUT_PAYMENT');
    }

    // If the property has been activated for Payment Processing, and a Deposit Rule has been assigned
    if (this.contextService.policyType === POLICY_TYPE.DEPOSIT && hotelInfo
      && (hotelInfo.paymentInfo.processingMode !== PAYMENT_PROCESSING_STATUS.DISABLED
        || hotelInfo.hotelSettings.isGdsEnabled)) {
      if (templateData.policySetting.hasOwnProperty('depositRuleName') && templateData.policySetting.depositRuleName) {
        listItem.depositeRule = String(templateData.policySetting.depositRuleName);
      }
    }

    if (templateData.policySetting.hasOwnProperty('isInstallmentEnabled')) {
      if (templateData.policySetting.isInstallmentEnabled) {
        listItem.isInstallmentEnabled = this.getTranslatedField('ACTIVE_TEXT');
      } else {
        listItem.isInstallmentEnabled = this.getTranslatedField('INACTIVE_TEXT');
      }
    }
  }

  parseDepositConfigurationListData(listData: Array<IPaymentDepositRulesResponseModel>): Array<IDepositConfigurationListModel> {
    const parsedList: Array<IDepositConfigurationListModel> = [];

    listData.forEach((depositConfigurationData: IPaymentDepositRulesResponseModel) => {
      const listItem: IDepositConfigurationListModel = {};
      listItem.name = depositConfigurationData.name;
      listItem.id = depositConfigurationData.depositRuleId;
      listItem.isCreatedAtEnterpriseLevel =
        depositConfigurationData.ownerType === DEPOSIT_CONFIGURATION_OWNER_TYPE.ENTERPRISE;

      if (depositConfigurationData.ruleInfo) {
        const rules = depositConfigurationData.ruleInfo;
        listItem.numberOfConfigurations = this.getTranslatedField('NUMBER_OF_DEPOSIT_CONFIGURATIONS') + ': ' + rules.length;
        if (rules[0]) {
          const rule = rules[0];
          listItem.chargeAmount = this.getTranslatedField('CONFIGURATION') + ' 1 - ';
          if (rule.chargeType === '1') {
            if (Number(rule.chargePercentage) === 0 && Number(rule.chargeAmount) > 0) {
              listItem.chargeAmount += this.getTranslatedField('FLAT_AMOUNT') + ': ' + rule.chargeAmount;
            }
            if ((Number(rule.chargeAmount) === 0 && Number(rule.chargePercentage) === 0) ||
              (Number(rule.chargeAmount) === 0 && Number(rule.chargePercentage) > 0)) {
              listItem.chargeAmount += this.getTranslatedField('PERCENTAGE_AMOUNT') + ': ' + rule.chargePercentage;
            }
          } else {
            listItem.chargeAmount += this.getTranslatedField('ARRIVAL_DAY');
          }
        }
      }
      parsedList.push(listItem);
    });
    return parsedList;
  }

  parseEmDepositConfigurationListData(listData: Array<IEmPaymentDepositRulesResponseModel>): Array<IDepositConfigurationListModel> {
    const parsedList: Array<IDepositConfigurationListModel> = [];

    listData.forEach((depositConfigurationData: IEmPaymentDepositRulesResponseModel) => {
      const listItem: IDepositConfigurationListModel = {};
      listItem.name = depositConfigurationData.emPaymentDepositRuleTemplateName;
      listItem.id = depositConfigurationData.emPaymentDepositRuleTemplateId;

      if (depositConfigurationData.paymentDepositRule && depositConfigurationData.paymentDepositRule.rules) {
        const rules = depositConfigurationData.paymentDepositRule.rules;
        listItem.numberOfConfigurations = this.getTranslatedField('NUMBER_OF_DEPOSIT_CONFIGURATIONS') + ': ' + rules.length;
        if (rules[0]) {
          const rule = rules[0];
          listItem.chargeAmount = this.getTranslatedField('CONFIGURATION') + ' 1 - ';
          if (rule.chargeType === DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE) {
            listItem.chargeAmount += this.getTranslatedField('PERCENTAGE_AMOUNT') + ': ' + rule.chargePercentage;
          } else if (rule.chargeType === DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT) {
            listItem.chargeAmount += this.getTranslatedField('FLAT_AMOUNT') + ': ' + rule.chargeAmounts[0].chargeAmount;
          } else {
            listItem.chargeAmount += this.getTranslatedField('ARRIVAL_DAY');
          }
        }
      }

      parsedList.push(listItem);
    });
    return parsedList;
  }

  parseEMPolicyListData(listData: Array<IEMPolicySearchResponseModel>): Array<IPolicySearchListModel> {
    const parsedList: Array<IPolicySearchListModel> = [];
    const dayOfWeekKeys = Object.keys(new DaysOfWeek());
    listData.forEach((policyData: IEMPolicySearchResponseModel) => {
      const listItem: IPolicySearchListModel = {};
      listItem.name = policyData.groupName;
      listItem.status = policyData.policyStatus;
      if (policyData.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE
        && (!policyData.chainCategoryIds || policyData.chainCategoryIds.length === 0)) {
        listItem.level = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN;
      } else {
        listItem.level = policyData.policyLevel;
      }
      listItem.templateCode = policyData.policyTemplateCode;
      listItem.dow = policyData.dow;

      listItem.templateName = policyData.policyTemplateName ?? '';
      listItem.templateName += policyData.policyTemplateCode ? ' (' + policyData.policyTemplateCode + ')' : '';

      if (policyData.rules[0].ruleID) {
        listItem.id = policyData.rules[0].ruleID.toString();
        listItem.ids = policyData.rules.map(x => x.ruleID.toString());
      } else {
        listItem.id = null;
      }

      if (policyData.rules[0].auxId) {
        listItem.historyAuxId = policyData.rules[0].auxId.toString();
      } else {
        listItem.historyAuxId = null;
      }

      if (policyData.policyType === DEFAULT_DATED_POLICY_TYPE.default) {
        listItem.date = this.getTranslatedField('DEFAULT');
      } else {
        const dateRangeList = [];
        if (policyData.policyDateRange) {
          policyData.policyDateRange.split(',').forEach(dateRange => {
            const startDate = moment(dateRange.split('/')[0]).format('DD-MMM-YYYY');
            const endDate = dateRange.split('/')[1] ?
              moment(dateRange.split('/')[1]).format('DD-MMM-YYYY')
              : this.getTranslatedField('NO_END_DATE');
            dateRangeList.push(startDate + ' - ' + endDate);
          });
        }

        if (dateRangeList.length === 1) {
          listItem.date = dateRangeList[0];
        } else if (dateRangeList.length > 1) {
          listItem.date = this.getTranslatedField('VIEW_DATES');
          listItem.dateRangeList = dateRangeList;
        }
      }

      const chainTodaysDate = this.utilityService.getStartDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const todaysDate = moment(chainTodaysDate).toDate();
      const ruleEndDate = policyData.rules[0].ruleEndDate;
      const isExpired = ruleEndDate && moment(ruleEndDate).isBefore(todaysDate);
      listItem.status = isExpired ? STATUS_LIST.EXPIRED : policyData.policyStatus;

      // set call-out item(list right side panel)
      if (ruleEndDate) {
        const diff = moment(ruleEndDate).diff(todaysDate, 'days');
        if (moment(ruleEndDate).isSameOrAfter(todaysDate) && diff <= 30) {
          listItem.callOutListItem = {
            header: this.getTranslatedField('POLICY_ENDS_IN'),
            body: diff.toString(),
            footer: this.getTranslatedField('DAYS')
          };
        }
      }

      // Set Day of Week
      if (policyData.dow) {
        const dowArr = policyData.dow.split(',');
        if (dowArr.length === 7) {
          listItem.dow = this.getTranslatedField('ALL_DAYS');
        } else {
          const parsedDow = [];
          dayOfWeekKeys.forEach(day => {
            const dowIndex = dowArr.findIndex(dow => dow === dayOfweekEnum[day]);
            if (dowIndex !== -1) {
              parsedDow.push(this.getTranslatedField(day));
            }
          });
          listItem.dow = parsedDow.join(', ');
        }
      }

      switch (listItem.level) {
        case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG: {
          listItem.linkedMetaDataList = this.getMetaDataNamesByIds(ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs,
            policyData.rateCatalogIds);
          break;
        }
        case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY: {
          listItem.linkedMetaDataList = this.getMetaDataNamesByIds(ENTERPRISE_POLICY_METADATA_TYPE.rateCategories,
            policyData.emRateCategoryIds);
          break;
        }
        case ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE: {
          listItem.linkedMetaDataList = this.getMetaDataNamesByIds2ndLevel(ENTERPRISE_POLICY_METADATA_TYPE.chainCategories,
            policyData.chainCategoryIds);
          break;
        }
        default: {
          listItem.linkedMetaDataList = null;
          break;
        }
      }

      parsedList.push(listItem);
    });
    return parsedList;
  }

  /**
   * Return translated field
   * @param field: field to translate
   */
  getTranslatedField(field: string, variableField?: any): string {
    return this.translate.translateService.instant(TranslationMap[field], variableField);
  }

  /**
   * Return name for given accepted tender id
   * @param id: id
   */
  getAcceptedTenderNameById(id: number): string {
    const acceptedTenderList: Array<IDropDownItem> =
      this.sharedDataService.getMetaData().acceptedTender[this.contextService.policyType];
    return acceptedTenderList?.find((tender: IDropDownItem) => tender.id === id)?.name;
  }

  /**
     * Returns list of policy meta data names for all given ids
     * @param metaDataIds: list of meta data ids
     */
  getMetaDataNamesByIds(metaDataType: string, metaDataIds: Array<string>): Array<string> {
    const metaDataList: Array<IPolicyMetadata> = this.sharedDataService.getPolicyMetadata(metaDataType);
    const metaDataNameList = [];
    if (metaDataIds && metaDataIds.length) {
      metaDataIds.forEach(metaDataId => {
        const metaDataItem = metaDataList.find(list => list.id === metaDataId);
        if (metaDataItem) {
          metaDataNameList.push(metaDataItem.name);
        }
      });
    }
    return metaDataNameList;
  }

  /**
   * Transform the id rate category to name rate category (use metadata to realise the transformation)
   * @param metaDataIds the rate category id to transform
   * @returns the rates categrory name
   */
  getMetaDataNamesByIdsForRateCategory(metaDataIds: Array<string>): Array<string> {
    const metaDataList: Array<IPolicyMetadata> = this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.rateCategory);
    const metaDataNameList = [];
    const metaDataWithCategoryIdOnly = metaDataList.map(({ id, name }) => ({ name, id: id.substring(id.length - 2) }));
    if (metaDataIds && metaDataIds.length) {
      metaDataIds.forEach(metaDataId => {
        const metaDataItem = metaDataWithCategoryIdOnly.find(item => metaDataId.endsWith(item.id));
        if (metaDataItem) {
          metaDataNameList.push(metaDataItem.name);
        }
      });
    }
    return metaDataNameList;
  }

  /**
   * Returns the list of meta data names names for all given ids fetched one level deeper from meta data
   * @param metaDataIds: list of meta data ids
   */
  getMetaDataNamesByIds2ndLevel(metaDataType: string, metaDataIds: Array<string>): Array<string> {
    const metaDataList: Array<IPolicyMetadata>
      = this.sharedDataService.getPolicyMetadata(metaDataType);
    const metaDataNameList: Array<string> = [];
    if (metaDataIds && metaDataIds.length) {
      metaDataIds.forEach(metaDataId => {
        for (const category of metaDataList) {
          const metaDataItem = category.list.find(list => list.id === metaDataId);
          if (metaDataItem) {
            metaDataNameList.push(metaDataItem.name);
          }
        }
      });
    }
    return metaDataNameList;
  }
}

