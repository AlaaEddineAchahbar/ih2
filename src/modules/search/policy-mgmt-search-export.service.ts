// Angular imports
import { Injectable } from '@angular/core';

// Third party library imports
import * as moment from 'moment';
import { TcTranslateService } from 'tc-angular-services';

// Application level imports
import { DAY_OF_WEEK } from '../common/version-history/version-history.model';
import { CONFIG_TYPE, MAX_PAGE_SIZE, POLICY_LEVEL, POLICY_TYPE } from '../core/constants';
import { ContextService } from '../core/context.service';
import {
    CANCELLATION_OPTIONS,
    DEPOSIT_CONFIGURATION_CHARGE_TYPE,
    DEPOSIT_CONFIGURATION_OWNER_TYPE,
    DISTRIBUTION_MESSAGES,
    ENTERPRISE_POLICY_CREATION_LEVEL,
    ENTERPRISE_POLICY_LEVEL_FILTERS,
    PROPERTY_POLICY_CREATION_LEVEL,
    STATUS_LIST
} from '../core/rules-config.constant';
import { DEFAULT_DATED_POLICY_TYPE, RULE_PRIORITY } from '../core/rules.constant';
import { PolicyMgmtSearchPayloadService } from '../core/search-payload.service';
import { SharedDataService } from '../core/shared.data.service';
import { TranslationMap } from '../core/translation.constant';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { PolicyMgmtCreateTemplateService } from '../create/template/policy-mgmt-create-template.service';
import { PolicyMgmtListParsingService } from './list/policy-mgmt-list-parsing.service';
import { PolicyMgmtSearchPolicyService } from './policy-mgmt-search-policies.service';
import {
    IEnterpriseDepositConfigurationCsvModel,
    IEnterprisePolicyTemplateCancellationCsvModel,
    IEnterprisePolicyTemplateDepositCsvModel,
    IEnterprisePolicyTemplateGuaranteeCsvModel,
    IPolicyCsvModel,
    IPropertyDepositConfigurationCsvModel,
    IPropertyPolicyTemplateCancellationCsvModel,
    IPropertyPolicyTemplateDepositCsvModel,
    IPropertyPolicyTemplateGuaranteeCsvModel
} from './policy-mgmt-search.model';
import { PolicyMgmtSearchService } from './policy-mgmt-search.service';

@Injectable()
export class PolicyMgmtSearchExportService {
  /**
   * Holds Transltation Map
   */
  translationMap: any;

  constructor(
    private sharedDataService: SharedDataService,
    private contextService: ContextService,
    private translate: TcTranslateService,
    private searchPayloadService: PolicyMgmtSearchPayloadService,
    private utilityService: PolicyMgmtUtilityService,
    private policyMgmtSearchService: PolicyMgmtSearchService,
    private policyMgmtCreateTemplateService: PolicyMgmtCreateTemplateService,
    private policyMgmtListParsingService: PolicyMgmtListParsingService,
    private searchPolicyService: PolicyMgmtSearchPolicyService,
  ) {
    this.translationMap = TranslationMap;
  }

  /**
   * Search and export the result to CSV file
   * @param searchParams 
   */
  searchAndExport(searchParams) {
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      switch (this.contextService.configTypeName) {
        case CONFIG_TYPE.DEPOSIT_CONFIGURATION:
          this.searchAndExportEnterpriseDepositConfigurations(searchParams);
          break;
        case CONFIG_TYPE.TEMPLATE:
          this.searchAndExportEnterprisePolicyTemplates(searchParams);
          break;
        case CONFIG_TYPE.POLICY:
          this.searchAndExportEnterprisePolicies(searchParams);
          break;
      }
    } else {
      switch (this.contextService.configTypeName) {
        case CONFIG_TYPE.DEPOSIT_CONFIGURATION:
          this.searchAndExportPropertyDepositConfigurations(searchParams);
          break;
        case CONFIG_TYPE.TEMPLATE:
          this.searchAndExportPropertyPolicyTemplates(searchParams);
          break;
        case CONFIG_TYPE.POLICY:
          this.searchAndExportPropertyPolicies(searchParams);
          break;
      }
    }
  }

  /**
   * Search and export the enterprise deposit configurations
   * @param searchParams 
   */
  searchAndExportEnterpriseDepositConfigurations(searchParams) {
    // set search payload
    const searchPayload = {
      ...searchParams,
      pageIndex: 1,
      pageSize: MAX_PAGE_SIZE,
    };
    this.searchPayloadService.setSearchPayload(searchPayload);

    this.policyMgmtSearchService.searchDepositConfiguration().subscribe(res => {
      const csvDataArray = [];

      for (const configuration of res.emPaymentDepositRules) {
        let percentOnEnhancements = 0;
        let percentageAmout = '';
        let arrivalDay = '';
        let flatAmount = '';

        const percentageCharge = configuration.paymentDepositRule.rules
          .find(r => r.chargeType === DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE);
        if (percentageCharge) {
          percentageAmout = `${Number(percentageCharge.chargePercentage).toFixed(2)}%`;
          percentOnEnhancements += percentageCharge.percentOnEnhancement;
        }

        const arrivalDayCharge = configuration.paymentDepositRule.rules
          .find(r => r.chargeType === DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY);
        if (arrivalDayCharge) {
          arrivalDay = this.getTranslation(this.translationMap.YES);
          percentOnEnhancements += arrivalDayCharge.percentOnEnhancement;
        } else {
          arrivalDay = this.getTranslation(this.translationMap.NO);
        }

        const flatCharge = configuration.paymentDepositRule.rules
          .find(r => r.chargeType === DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT);
        if (flatCharge) {
          const amounts = [];
          for (const chargeAmount of flatCharge.chargeAmounts) {
            amounts.push(`${Number(chargeAmount.chargeAmount).toFixed(2)} ${chargeAmount.currency[0].toUpperCase()}`);
          }
          flatAmount = amounts.join(';');
          percentOnEnhancements += flatCharge.percentOnEnhancement;
        }

        const csvData: IEnterpriseDepositConfigurationCsvModel = {
          DEPOSIT_CONFIGURATION_NAME: configuration.emPaymentDepositRuleTemplateName ? configuration.emPaymentDepositRuleTemplateName : '',
          CHARGE_DATE: this.getTranslation(this.translationMap.TIME_OF_BOOKING),
          PERCENTAGE_AMOUNT: percentageAmout,
          ARRIVAL_DAY: arrivalDay,
          FLAT_AMOUNT: flatAmount,
          PERCENT_ON_ENHANCEMENTS: `${Number(percentOnEnhancements).toFixed(2)}%`
        };
        csvDataArray.push(csvData);
      }

      this.exportCsvData(csvDataArray);
    });
  }

  /**
   * Search and export the property deposit configurations
   * @param searchParams 
   */
  searchAndExportPropertyDepositConfigurations(searchParams) {
    // set search payload
    const searchPayload = {
      ...searchParams,
      pageIndex: 1,
      pageSize: MAX_PAGE_SIZE,
    };
    this.searchPayloadService.setSearchPayload(searchPayload);

    this.policyMgmtSearchService.searchDepositConfiguration().subscribe(res => {
      const csvDataArray = [];
      const currecyCode = this.sharedDataService.getHotelInfo().currencies.find(c => c.isDefault).currencyCode;

      for (const configuration of res.paymentDepositRules) {
        let ownerType = '';
        if (configuration.ownerType === DEPOSIT_CONFIGURATION_OWNER_TYPE.ENTERPRISE) {
          ownerType = this.getTranslation(this.translationMap.ENTERPRISE);
        } else if (configuration.ownerType === DEPOSIT_CONFIGURATION_OWNER_TYPE.PROPERTY) {
          ownerType = this.getTranslation(this.translationMap.PROPERTY);
        }

        let percentOnEnhancement = 0;

        const percentageAmount = configuration.ruleInfo
          .find(r => r.chargeType === '1' && Number(r.chargePercentage) > 0);
        percentOnEnhancement += Number(percentageAmount?.percentOnEnhancement) ? Number(percentageAmount.percentOnEnhancement) : 0;

        const flatAmount = configuration.ruleInfo
          .find(r => r.chargeType === '1' && Number(r.chargeAmount) > 0);
        percentOnEnhancement += Number(flatAmount?.percentOnEnhancement) ? Number(flatAmount.percentOnEnhancement) : 0;

        const arrivalDay = configuration.ruleInfo
          .find(r => r.chargeType === '3');
        percentOnEnhancement += Number(arrivalDay?.percentOnEnhancement) ? Number(arrivalDay.percentOnEnhancement) : 0;

        const csvData: IPropertyDepositConfigurationCsvModel = {
          DEPOSIT_CONFIGURATION_NAME: configuration.name ? configuration.name : '',
          OWNER_TYPE: ownerType,
          OWNER_CODE: configuration.ownerId ? configuration.ownerId : '',
          PERCENT_ON_ENHANCEMENTS: `${Number(percentOnEnhancement).toFixed(2)}%`,
          PERCENTAGE_AMOUNT: percentageAmount ? `${Number(percentageAmount.chargePercentage).toFixed(2)}%` : '',
          FLAT_AMOUNT: flatAmount ? `${Number(flatAmount.chargeAmount).toFixed(2)} ${currecyCode}` : '',
          ARRIVAL_DAY: arrivalDay ? this.getTranslation(this.translationMap.YES) : this.getTranslation(this.translationMap.NO),
        };

        csvDataArray.push(csvData);
      }

      this.exportCsvData(csvDataArray);
    });
  }

  /**
   * Search and export the enterprise templates
   * @param searchParams 
   */
  searchAndExportEnterprisePolicyTemplates(searchParams) {
    // set search payload
    const searchPayload = {
      ...searchParams,
      offSet: 1,
      maxEntries: MAX_PAGE_SIZE,
    };
    this.searchPayloadService.setSearchEMPayload(searchPayload);

    this.policyMgmtSearchService.searchPolicies().subscribe(async res => {
      const csvDataArray = [];
      const templates = res.emPolicyTemplates;
      switch (this.contextService.policyType) {
        case POLICY_TYPE.CANCELLATION:
          const cancellationCsvDataArray = this.getEnterpriseTemplateCancellationCsvDataList(templates);
          csvDataArray.push(...cancellationCsvDataArray);
          break;
        case POLICY_TYPE.DEPOSIT:
          const depositCsvDataArray = await this.getEnterpriseTemplateDepositCsvDataList(templates);
          csvDataArray.push(...depositCsvDataArray);
          break;
        case POLICY_TYPE.GUARANTEE:
          const guaranteeCsvDataArray = this.getEnterpriseTemplateGuaranteeCsvDataList(templates);
          csvDataArray.push(...guaranteeCsvDataArray);
          break;
      }

      this.exportCsvData(csvDataArray);
    });
  }

  /**
   * Search and export the property templates
   * @param searchParams 
   */
  searchAndExportPropertyPolicyTemplates(searchParams) {
    // set search payload
    const searchPayload = {
      ...searchParams,
      offSet: 1,
      maxEntries: MAX_PAGE_SIZE,
    };
    this.searchPayloadService.setSearchPayload(searchPayload);

    this.policyMgmtSearchService.searchPolicies().subscribe(res => {
      const csvDataArray = [];
      const templates = res.policyTemplates;
      switch (this.contextService.policyType) {
        case POLICY_TYPE.CANCELLATION:
          const cancellationCsvDataArray = this.getPropertyTemplateCancellationCsvDataList(templates);
          csvDataArray.push(...cancellationCsvDataArray);
          break;
        case POLICY_TYPE.DEPOSIT:
          const depositCsvDataArray = this.getPropertyTemplateDepositCsvDataList(templates);
          csvDataArray.push(...depositCsvDataArray);
          break;
        case POLICY_TYPE.GUARANTEE:
          const guaranteeCsvDataArray = this.getPropertyTemplateGuaranteeCsvDataList(templates);
          csvDataArray.push(...guaranteeCsvDataArray);
          break;
      }

      this.exportCsvData(csvDataArray);
    });
  }

  /**
   * Search and export the enterprise policies
   * @param searchParams 
   */
  searchAndExportEnterprisePolicies(searchParams) {
    // set search payload
    const searchPayload =
    {
      ...searchParams,
      pageIndex: 1,
      pageSize: MAX_PAGE_SIZE,
    };
    this.searchPayloadService.setSearchPayload(searchPayload);

    this.policyMgmtSearchService.searchPolicies().subscribe(res => {
      const parsedPolicyList = this.policyMgmtListParsingService.parseEMPolicyListData(res.policies);
      const csvDataArray: IPolicyCsvModel[] = [];
      for (const policy of res.policies) {
        const parsedPolicy = parsedPolicyList.find(p => p.name === policy.groupName);
        const csvData = this.parsePolicyCsvData(policy, parsedPolicy);
        csvDataArray.push(...csvData);
      }

      this.exportCsvData(csvDataArray);
    });
  }

  /**
   * Search and export the property policies
   * @param searchParams
   */
  searchAndExportPropertyPolicies(searchParams) {
    // set search payload
    const searchPayload =
    {
      ...searchParams,
      pageIndex: 1,
      pageSize: MAX_PAGE_SIZE,
    };
    this.searchPayloadService.setSearchPayload(searchPayload);

    this.policyMgmtSearchService.searchPolicies().subscribe(res => {
      this.searchPolicyService.setPolicySearchData(res.policies);
      // Get Policiy search payload
      const searchPayload = this.searchPayloadService.getSearchPayload();
      // Filtering Policy list based on search payload
      const policies = this.searchPolicyService.getFilteredSearchData(searchPayload);
      const parsedPolicyList = this.policyMgmtListParsingService.parsePropertyPolicyListData(policies);

      const csvDataArray: IPolicyCsvModel[] = [];
      for (const policy of policies) {
        const parsedPolicy = parsedPolicyList.find(p => p.name === policy.uxGroupName);
        const csvData = this.parsePolicyCsvData(policy, parsedPolicy);
        csvDataArray.push(...csvData);
      }

      this.exportCsvData(csvDataArray);
    });
  }

  /**
   * Parse the common data of enterprise template in CSV exportable data structure
   * @param template 
   * @returns 
   */
  parseEnterprisePolicyTemplateCommonCsvData(template) {
    const languages = this.sharedDataService.getLanguages().languages;

    const textList = [];
    const onlineCCMessageTexts = template.textList.find(t => t.textType === DISTRIBUTION_MESSAGES.onlineCCMessage)?.languageTexts;
    if (onlineCCMessageTexts && onlineCCMessageTexts.length) {
      for (const languageText of onlineCCMessageTexts) {
        const languageCode = languages.find(l => l.id === languageText.languageId).languageCode;
        textList.push(`${languageCode}: "${languageText.text}"`);
      }
    }
    const callCenterMessage = textList.join(';');

    const gdsMessageLine1 = template.textList
      .find(t => t.textType === DISTRIBUTION_MESSAGES.gdsLine1)?.languageTexts[0]?.text;
    const gdsMessageLine2 = template.textList
      .find(t => t.textType === DISTRIBUTION_MESSAGES.gdsLine2)?.languageTexts[0]?.text;
    const gdsMessage = `${gdsMessageLine1 ? gdsMessageLine1 : ''} ${gdsMessageLine2 ? gdsMessageLine2 : ''}`;

    return {
      POLICY_TEMPLATE_NAME: template.name ? template.name : '',
      POLICY_TEMPLATE_STATUS: this.getStatusText(template.status),
      POLICY_TEMPLATE_CODE: template.policyCode,
      ONLINE_CC_MESSAGE: callCenterMessage,
      GDS_MESSAGE: gdsMessage,
    };
  }

  /**
   * Parse the common data of property template in CSV exportable data structure
   * @param template 
   * @returns 
   */
  parsePropertyPolicyTemplateCommonCsvData(template) {
    const ownerType = template.isEnterpriseLevel
      ? this.getTranslation(this.translationMap.ENTERPRISE)
      : this.getTranslation(this.translationMap.PROPERTY);

    return {
      POLICY_TEMPLATE_NAME: template.name ? template.name : '',
      POLICY_TEMPLATE_STATUS: this.getStatusText(template.status),
      OWNER_TYPE: ownerType,
      OWNER_CODE: template.ownerId ? template.ownerId : '',
    };
  }

  /**
   * Parse cancellation type template specific data in CSV exportable data structure
   * @param template 
   * @returns 
   */
  parseTemplateCancellationPartCsvData(template) {
    const cancellationRule = template.policySetting.cancellationRule;
    let cancellationNotice = '';
    let cancellationNoticeValue = '';
    switch (cancellationRule.chargeType) {
      case CANCELLATION_OPTIONS.SAME_DAY:
        cancellationNotice = this.getTranslation(this.translationMap.SAME_DAY);
        cancellationNoticeValue = `${cancellationRule.priorHours}:00`;
        break;
      case CANCELLATION_OPTIONS.ADVANCE_NOTICE:
        cancellationNotice = this.getTranslation(this.translationMap.ADVANCE_NOTICE);
        cancellationNoticeValue =
          `${cancellationRule.priorDays} ${this.getTranslation(this.translationMap.DAYS)}`
          + `+${cancellationRule.priorHours} ${this.getTranslation(this.translationMap.HOURS)}`;
        break;
      case CANCELLATION_OPTIONS.NON_REFUNDABLE:
        cancellationNotice = this.getTranslation(this.translationMap.NON_REFUNDABLE);
        cancellationNoticeValue = '';
        break;
    }

    const freeCancellation = template.policySetting.isFreeCancellation
      ? this.getTranslation(this.translationMap.YES)
      : this.getTranslation(this.translationMap.NO);

    return {
      CANCELLATION_NOTICE: cancellationNotice,
      CANCELLATION_NOTICE_VALUE: cancellationNoticeValue,
      FREE_CANCELLATION: freeCancellation
    };
  }

  /**
   * Get CSV exportable data list for enterprise cancellation templates
   * @param templates 
   * @returns 
   */
  getEnterpriseTemplateCancellationCsvDataList(templates): IEnterprisePolicyTemplateCancellationCsvModel[] {
    const csvDataArray: IEnterprisePolicyTemplateCancellationCsvModel[] = [];

    for (const template of templates) {
      csvDataArray.push({
        ...this.parseEnterprisePolicyTemplateCommonCsvData(template),
        ...this.parseTemplateCancellationPartCsvData(template)
      });
    }

    return csvDataArray;
  }

  /**
   * Get CSV exportable data list for property cancellation templates
   * @param templates 
   * @returns 
   */
  getPropertyTemplateCancellationCsvDataList(templates): IPropertyPolicyTemplateCancellationCsvModel[] {
    const csvDataArray: IPropertyPolicyTemplateCancellationCsvModel[] = [];
    for (const template of templates) {
      csvDataArray.push({
        ...this.parsePropertyPolicyTemplateCommonCsvData(template),
        ...this.parseTemplateCancellationPartCsvData(template)
      });
    }

    return csvDataArray;
  }

  /**
   * Parse Guarantee type template specific data in CSV exportable data structure
   * @param template 
   * @returns 
   */
  parseTemplateGuaranteePartCsvData(template) {
    const acceptTender = this.getTranslation(`acceptedTenderGuaranteeId.${template.policySetting.acceptedTender}`);

    const lateArrival = template.policySetting.holdTime
      ? `${this.getTranslation(this.translationMap.HOLD_UNTIL)} ${template.policySetting.holdTime}`
      + `${this.getTranslation(this.translationMap.WITHOUT_PAYMENT)}`
      : '';

    return {
      ACCEPTED_TENDER: acceptTender,
      LATE_ARRIVAL: lateArrival
    };
  }

  /**
   * Get CSV exportable data list for enterprise guarantee templates
   * @param templates 
   * @returns 
   */
  getEnterpriseTemplateGuaranteeCsvDataList(templates): IEnterprisePolicyTemplateGuaranteeCsvModel[] {
    const csvDataArray = [];
    for (const template of templates) {
      csvDataArray.push({
        ...this.parseEnterprisePolicyTemplateCommonCsvData(template),
        ...this.parseTemplateGuaranteePartCsvData(template)
      });
    }

    return csvDataArray;
  }

  /**
   * Get CSV exportable data list for property guarantee templates
   * @param templates 
   * @returns 
   */
  getPropertyTemplateGuaranteeCsvDataList(templates): IPropertyPolicyTemplateGuaranteeCsvModel[] {
    const csvDataArray: IPropertyPolicyTemplateGuaranteeCsvModel[] = [];
    for (const template of templates) {
      csvDataArray.push({
        ...this.parsePropertyPolicyTemplateCommonCsvData(template),
        ...this.parseTemplateGuaranteePartCsvData(template)
      });
    }

    return csvDataArray;
  }

  /**
   * Parse deposit type template specific data in CSV exportable data structure
   * @param template 
   * @returns 
   */
  parseTemplateDepositPartCsvData(template) {
    const acceptTender = this.getTranslation(`acceptedTenderDepositId.${template.policySetting.acceptedTender}`);

    let depositRule = '';
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      depositRule = template.policySetting.depositRuleId
        ? this.sharedDataService.getDepositRulesList().find(item => item.id === template.policySetting.depositRuleId)?.name
        : '';
    } else {
      depositRule = template.policySetting.depositRuleName;
    }

    const enabledInstallments = template.policySetting.isInstallmentEnabled
      ? this.getTranslation(this.translationMap.YES)
      : this.getTranslation(this.translationMap.NO);

    return {
      ACCEPTED_TENDER: acceptTender,
      DEPOSIT_CONFIGURATION_LABEL: depositRule ? depositRule : '',
      ENABLED_INSTALLMENTS: enabledInstallments
    };
  }

  /**
   * Get CSV exportable data list for enterprise deposit templates
   * @param templates 
   * @returns 
   */
  async getEnterpriseTemplateDepositCsvDataList(templates): Promise<IEnterprisePolicyTemplateDepositCsvModel[]> {
    const csvDataArray: IEnterprisePolicyTemplateDepositCsvModel[] = [];

    // load deposit rule list info
    await this.policyMgmtCreateTemplateService.loadDepositRuleListInfo();

    for (const template of templates) {
      csvDataArray.push({
        ...this.parseEnterprisePolicyTemplateCommonCsvData(template),
        ...this.parseTemplateDepositPartCsvData(template)
      });
    }

    return csvDataArray;
  }

  /**
   * Get CSV exportable data list for property deposit templates
   * @param templates 
   * @returns 
   */
  getPropertyTemplateDepositCsvDataList(templates): IPropertyPolicyTemplateDepositCsvModel[] {
    const csvDataArray: IPropertyPolicyTemplateDepositCsvModel[] = [];

    for (const template of templates) {
      csvDataArray.push({
        ...this.parsePropertyPolicyTemplateCommonCsvData(template),
        ...this.parseTemplateDepositPartCsvData(template)
      });
    }

    return csvDataArray;
  }

  /**
   * Parse the policy data in CSV exportable data structure
   * @param rawPolicy 
   * @param parsedPolicy 
   * @returns 
   */
  parsePolicyCsvData(rawPolicy, parsedPolicy): IPolicyCsvModel[] {
    const policiesCsvData: IPolicyCsvModel[] = [];
    const isEnterpriseLevel = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;

    const policyName = parsedPolicy.name ? parsedPolicy.name : '';
    const policyStatus = this.getStatusText(parsedPolicy.status);
    const policyTemplateName = parsedPolicy.templateName ? parsedPolicy.templateName : '';

    let policyDistribution = '';
    const policyDistributionDetails = parsedPolicy.linkedMetaDataList && parsedPolicy.linkedMetaDataList.length
      ? parsedPolicy.linkedMetaDataList.join(',')
      : '';
    switch (parsedPolicy.level) {
      case PROPERTY_POLICY_CREATION_LEVEL.PROPERTY:
        policyDistribution = this.getTranslation(this.translationMap.PROPERTY);
        break;
      case PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY:
        policyDistribution = this.getTranslation(this.translationMap.RATECATEGORY);
        break;
      case PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN:
        policyDistribution = this.getTranslation(this.translationMap.RATEPLAN);
        break;
      case ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE:
        policyDistribution = this.getTranslation(this.translationMap.CHAIN_CATEGORIES);
        break;
      case ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN:
        policyDistribution = this.getTranslation(this.translationMap.CHAIN);
        break;
      case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG:
        policyDistribution = this.getTranslation(this.translationMap.RATE_PLANS);
        break;
      case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY:
        policyDistribution = this.getTranslation(this.translationMap.RATE_CATEGORIES);
        break;
    }

    const rawPolicyType = isEnterpriseLevel ? rawPolicy.policyType : rawPolicy.uxPolicyType;
    const policyType = rawPolicyType === DEFAULT_DATED_POLICY_TYPE.default
      ? this.getTranslation(this.translationMap.DEFAULT)
      : this.getTranslation(this.translationMap.DATED);

    const dow = isEnterpriseLevel ? rawPolicy.dow : rawPolicy.uxDOW;
    const dayOfWeek = dow
      ? dow.split(',').map(day => this.getTranslation(this.translationMap[DAY_OF_WEEK[day]])).join(',')
      : '';

    const rulePriority = rawPolicy.rules[0]?.rulePriority;
    const overrideOthers = Number(rulePriority) === RULE_PRIORITY.overridePolicy
      ? this.getTranslation(this.translationMap.YES)
      : this.getTranslation(this.translationMap.NO);

    const dateRange = isEnterpriseLevel ? rawPolicy.policyDateRange : rawPolicy.uxPolicyDateRange;
    if (!dateRange) {
      const csvData: IPolicyCsvModel = {
        POLICY_NAME: policyName,
        POLICY_STATUS: policyStatus,
        POLICY_DISTRIBUTION: policyDistribution,
        POLICY_DISTRIBUTION_DETAILS: policyDistributionDetails,
        POLICY_TEMPLATE_NAME: policyTemplateName,
        POLICY_TYPE: policyType,
        START_DATE: '',
        END_DATE: '',
        DAY_OF_WEEK: dayOfWeek,
        OVERRIDE_OTHER_POLICIES: overrideOthers,
      };
      policiesCsvData.push(csvData);
    } else {
      // for each data range of a policy, one entry is created for exporting
      dateRange.split(',').forEach(dateRange => {
        const startDate = moment(dateRange.split('/')[0]).format('YYYY-MM-DD');
        const endDate = dateRange.split('/')[1]
          ? moment(dateRange.split('/')[1]).format('YYYY-MM-DD')
          : '';

        const csvData: IPolicyCsvModel = {
          POLICY_NAME: policyName,
          POLICY_STATUS: policyStatus,
          POLICY_DISTRIBUTION: policyDistribution,
          POLICY_DISTRIBUTION_DETAILS: policyDistributionDetails,
          POLICY_TEMPLATE_NAME: policyTemplateName,
          POLICY_TYPE: policyType,
          START_DATE: startDate,
          END_DATE: endDate,
          DAY_OF_WEEK: dayOfWeek,
          OVERRIDE_OTHER_POLICIES: overrideOthers,
        };
        policiesCsvData.push(csvData);
      });
    }

    return policiesCsvData;
  }

  /**
   * Get translated status text
   * @param status 
   * @returns 
   */
  getStatusText(status: STATUS_LIST): string {
    switch (status) {
      case STATUS_LIST.ACTIVE:
        return this.getTranslation(this.translationMap.ACTIVE);
      case STATUS_LIST.INACTIVE:
        return this.getTranslation(this.translationMap.INACTIVE);
      case STATUS_LIST.EXPIRED:
        return this.getTranslation(this.translationMap.EXPIRED);
      default:
        return '';
    }
  }

  /**
   * Export the CSV data
   * @param csvDataArray 
   */
  exportCsvData(csvDataArray) {
    const fileName = `${this.getTranslation(this.translationMap.EXPORT)}.csv`;
    this.utilityService.exportToCSV(csvDataArray, fileName, true);

    // reset the search payload
    this.searchPayloadService.resetSearchPayload();
  }

  /**
   * Get the translation by the key
   * @param key 
   * @returns 
   */
  getTranslation(key: string): string {
    return this.translate.translateService.instant(key);
  }

}