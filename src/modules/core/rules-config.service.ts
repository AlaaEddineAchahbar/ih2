import { Injectable } from '@angular/core';
import { FILTER_CONFIG } from '../search/filter/filter.constant';
import { IFilterRulesData } from '../search/filter/filter.model';
import { SharedDataService } from './shared.data.service';
import { ContextService } from './context.service';
import { POLICY_LEVEL, POLICY_TYPE, CONFIG_TYPE } from './constants';
import { TEMPLATE_CONFIG } from '../create/template/policy-mgmt-create-template.constant';
import { ITemplateDetailsRulesData, IDistributionMsgRulesData } from '../create/template/policy-mgmt-create-template.model';
import { IDropDownItem } from './common.model';
import { LIST_CONFIG } from '../search/list/policy-mgmt-list.constant';
import { COMMON_OPTIONS } from './rules-config.constant';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from './translation.constant';
import { POLICY_CONFIG } from '../create/policy/policy-mgmt-create-policy.constant';
import { IPolicyLevelRulesData, IPolicyDetailsRulesData } from '../create/policy/policy-mgmt-create-policy.model';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_METADATA_TYPE } from './rules.constant';

@Injectable()
export class RulesConfigurationService {

  constructor(
    private sharedDataService: SharedDataService,
    private contextService: ContextService,
    private translate: TcTranslateService
  ) { }

  getFilterConfigData(policyLevel: string, configType: string, policyType: string): IFilterRulesData {
    let ruleData: IFilterRulesData;
    const metaData = this.sharedDataService.getMetaData();

    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        ruleData = { ...FILTER_CONFIG[policyLevel][configType][policyType] };
      } else if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
        ruleData = { ...FILTER_CONFIG[policyLevel][configType] };
      } else if (this.contextService.configType === CONFIG_TYPE.POLICY) {
        ruleData = { ...FILTER_CONFIG[policyLevel][configType] };
        // Set default Policy Assignment Level
        ruleData.fields.policyLevel = {
          PROPERTY: true,
          RATECATEGORY: false,
          RATEPLAN: false
        };
      }
    } else if (this.contextService.configType !== CONFIG_TYPE.TEMPLATE) {
      ruleData = { ...FILTER_CONFIG[policyLevel][configType] };
    } else {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        ruleData = { ...FILTER_CONFIG[policyLevel][configType][policyType] };
      } else {
        // Rules Config Data for Policy
        ruleData = { ...FILTER_CONFIG[policyLevel][configType] };
        // Set default Policy Assignment Level
        ruleData.fields.policyLevel = {
          PROPERTY: true,
          RATECATEGORY: false,
          RATEPLAN: false
        };
      }
    }

    if (policyType === POLICY_TYPE.GUARANTEE || policyType === POLICY_TYPE.DEPOSIT) {
      const extraOption = this.translate.translateService.instant(TranslationMap[COMMON_OPTIONS.ALL]);
      ruleData.data.acceptedTender = [
        ...metaData.acceptedTender[policyType], ...[{ id: 0, name: extraOption }]
      ];
    }

    return JSON.parse(JSON.stringify(ruleData));
  }

  getTemplateDetailsConfigData(policyLevel: string, policyType: string, stepName: string): ITemplateDetailsRulesData {
    let ruleData: ITemplateDetailsRulesData;
    ruleData = { ...TEMPLATE_CONFIG[policyLevel][policyType][stepName] };

    // common data can be published before PROPERTY/ENTERPRISE validation
    const metaData = this.sharedDataService.getMetaData();

    // property and enterprise details to be published here
    if (policyType === POLICY_TYPE.GUARANTEE) {
      ruleData.data.acceptedTender = metaData.acceptedTender[POLICY_TYPE.GUARANTEE];
    }
    if (policyType === POLICY_TYPE.DEPOSIT) {
      ruleData.data.acceptedTender = metaData.acceptedTender[POLICY_TYPE.DEPOSIT];
      ruleData.data.depositRule = this.sharedDataService.getDepositRulesList();
    }
    if (policyType === POLICY_TYPE.CANCELLATION) {
      ruleData.data.sameDayNoticeList = this.getSameDayHoursList();
    }

    return JSON.parse(JSON.stringify(ruleData));
  }

  getDistributionMsgConfigData(policyLevel: string, policyType: string, stepName: string): IDistributionMsgRulesData {
    let ruleData: IDistributionMsgRulesData;
    ruleData = { ...TEMPLATE_CONFIG[policyLevel][policyType][stepName] };
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      // property specific details to be published here
      ruleData.data.messageLanguage = this.sharedDataService.getHotelInfo().languageList;
    } else {
      // Enterprise specific details to be published here
      const chainSupportedLanguages = this.sharedDataService.getChainInfo().chainHotels.flatMap(x => x.supportedLanguages);
      //Filter languages list from api, with chainHotels supported languages
      ruleData.data.messageLanguage = this.sharedDataService.getLanguages().languages
        .filter(x => chainSupportedLanguages.includes(x.id));
    }
    return JSON.parse(JSON.stringify(ruleData));
  }

  /**
   * Returns Search List config data
   * @param policyLevel: policy level
   * @param configType: config type
   * @param policyType: policy type
   */
  getSearchListConfigData(policyLevel: string, configType: string, policyType: string) {
    let ruleData: any;
    if (configType === CONFIG_TYPE.TEMPLATE) {
      ruleData = { ...LIST_CONFIG[policyLevel][configType][policyType] };
    } else {
      ruleData = { ...LIST_CONFIG[policyLevel][configType] };
    }

    return JSON.parse(JSON.stringify(ruleData));
  }

  /**
   *  Returns Cancellation Same Day hours list
   */
  getSameDayHoursList() {
    const hoursLimit = 23;
    const sameDayHours: Array<IDropDownItem> = [];

    for (let index = 0; index <= hoursLimit; index++) {
      sameDayHours.push({
        id: index,
        name: index.toString()

      });
    }
    return sameDayHours;
  }

  getPolicyLevelConfigData(policyLevel: string, stepName: string): IPolicyLevelRulesData {
    let ruleData: IPolicyLevelRulesData;
    ruleData = { ...POLICY_CONFIG[policyLevel][stepName] };
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      // property specific details to be published here
      ruleData.data.ratePlanList = this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.ratePlan);
      ruleData.data.rateCategoryList = this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.rateCategory);
    } else {
      // Enterprise specific details to be published here
      ruleData.data.ratePlanList = this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs);
      ruleData.data.rateCategoryList = this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCategories);
      ruleData.data.chainCategoryList = this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.chainCategories);
    }
    return JSON.parse(JSON.stringify(ruleData));
  }

  getPolicyDetailsConfigData(policyLevel: string, stepName: string): IPolicyDetailsRulesData {
    let ruleData: IPolicyDetailsRulesData;
    ruleData = { ...POLICY_CONFIG[policyLevel][stepName] };
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      ruleData.data.policyTemplateList = this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.template);
    } else {
      ruleData.data.policyTemplateList = this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.templates);
    }
    return JSON.parse(JSON.stringify(ruleData));
  }
}
