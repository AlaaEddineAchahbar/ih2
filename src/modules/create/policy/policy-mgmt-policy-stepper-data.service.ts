import { Injectable } from '@angular/core';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { CREATE_POLICY_STEPS } from './policy-mgmt-create-policy.constant';
import {
  IPolicyLevelRulesData, IPolicyDetailsRulesData, IPolicyLevelParams, IPolicyDetailsParams, IPolicyResponseModel,
  PolicyResponseModel, IRuleStepperModel, DaysOfWeek, ITemplateListItemModel
} from './policy-mgmt-create-policy.model';
import { PROPERTY_POLICY_CREATION_LEVEL, ENTERPRISE_POLICY_CREATION_LEVEL, STATUS_LIST } from '../../core/rules-config.constant';
import { POLICY_FLOW, dayOfweekEnum, DEFAULT_VALUES, POLICY_LEVEL } from '../../core/constants';
import { RulesMataDataService } from '../../core/rules-meta-data.service';
import { SharedDataService } from '../../core/shared.data.service';
import { IRules, IRuleDecision, IRuleCriteriaParam, IRuleDecisionModifier, IPolicyMetadata } from '../../core/rules-metadata.model';
import * as moment from 'moment';
import {
  DEFAULT_DATED_POLICY_TYPE, RULE_DECISION_TYPE_MODIFIER, RULE_CRITERIA_MEMBER_NAMES, RULE_PRIORITY, OPERATION_TYPES,
  RULE_LOGIC, RULE_STATUS, POLICY_METADATA_TYPE, ENTERPRISE_POLICY_METADATA_TYPE
} from '../../core/rules.constant';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { PolicyMgmtStepPolicyDetailsService } from './policy-details/policy-mgmt-step-policy-details.service';

@Injectable()
export class PolicyMgmtPolicyStepperDataService {

  /**
   * Policy's response model
   * In Create Flow: Holds request format for create
   * In Edit Flow: Holds Get response and Put Request
   */
  policyResponseModel: IPolicyResponseModel;

  /**
   * This list contains list of rules which to be sent as request.
   */
  rulesList: Array<IRuleStepperModel>;

  constructor(
    private contextService: ContextService,
    private rulesConfigService: RulesConfigurationService,
    private rulesMetadataService: RulesMataDataService,
    private sharedDataService: SharedDataService,
    private policyMgmtUtilityService: PolicyMgmtUtilityService,
    private policyMgmtStepPolicyDetailsService: PolicyMgmtStepPolicyDetailsService
  ) { }

  createPolicyResponseModel() {
    this.policyResponseModel = new PolicyResponseModel();
    this.rulesList = [];
  }

  /**
   * Set PolicyResponseModel API response only called in EDIT flow
   * If EDIT flow, then set isPresentInEdit as true for rules which are present in PolicyRules.
   */
  setPolicyResponseModel(data: IPolicyResponseModel) {
    this.policyResponseModel = data;
    this.rulesList = [];

    // In Edit flow, setting RulesList with no of rules present in ResponseModel.
    // isPresentInEdit: Flag indicates where rule is part of edit response.
    this.policyResponseModel.rules.forEach(rule => {
      this.rulesList.push({
        id: rule.uniqueID,
        ruleId: rule.ruleID,
        status: rule.activeStatus,
        isPresentInEdit: true
      });
    });
  }

  /**
   * Return PolicyResponseModel, API request format
   */
  getPolicyResponseModel(): IPolicyResponseModel {
    return this.policyResponseModel;
  }

  /**
   * GET policy level step data
   */
  getPolicyLevelData(): IPolicyLevelRulesData {
    const rulesData: IPolicyLevelRulesData = this.rulesConfigService.getPolicyLevelConfigData(
      this.contextService.policyLevel,
      CREATE_POLICY_STEPS.POLICY_LEVEL
    );
    rulesData.fields.ratePlans = rulesData.data.ratePlanList;
    rulesData.fields.rateCategories = rulesData.data.rateCategoryList;
    rulesData.fields.chainCategories = rulesData.data.chainCategoryList;

    if (this.policyResponseModel.level) {
      rulesData.fields.policyLevel = this.policyResponseModel.level;
    }
    if (this.policyResponseModel.level === PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN) {
      this.rulesList.forEach((rule: IRuleStepperModel) => {
        let flag = false;
        for (const category of rulesData.fields.ratePlans) {
          for (const rateplan of category.list) {
            if (Number(rateplan.id) === rule.id) {
              rateplan.selected = rule.status !== RULE_STATUS.DELETE;
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        }
      });
    }
    if (this.policyResponseModel.level === PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY) {
      this.rulesList.forEach((rule: IRuleStepperModel) => {
        for (const category of rulesData.fields.rateCategories) {
          if (Number(category.id) === rule.id) {
            category.visible = rule.status !== RULE_STATUS.DELETE;
            break;
          }
        }
      });
    }
    if (this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY
      && this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      this.policyResponseModel.emRateCategoryIds.forEach((id: string) => {
        for (const category of rulesData.fields.rateCategories) {
          if (category.id === id) {
            category.visible = true;
            break;
          }
        }
      });
    }

    if (this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY
      && this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      this.rulesList.forEach((rule: IRuleStepperModel) => {
        for (const category of rulesData.fields.rateCategories) {
          if (rule.id.toString().endsWith(category.id.substring(category.id.length - 2))) {
            category.visible = true;
            break;
          }
        }
      });
    }
    if (this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG
      && this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      this.policyResponseModel.rateCatalogIds.forEach((id: string) => {
        for (const category of rulesData.fields.ratePlans) {
          if (category.id === id) {
            category.visible = true;
            break;
          }
        }
      });
    }

    if (this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG
      && this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        rulesData.fields['rateCatalogsName'] = this.policyResponseModel['rateCatalogsName'];
    }

    if (this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE && this.policyResponseModel.chainCategoryIds) {
      this.policyResponseModel.chainCategoryIds.forEach((id: string) => {
        let flag = false;
        for (const chainCategory of rulesData.fields.chainCategories) {
          for (const category of chainCategory.list) {
            if (category.id === id) {
              category.selected = true;
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        }
      });
    }

    return rulesData;
  }

  /**
   * Set policy level step data
   */
  setPolicyLevelData(policyLevelData: IPolicyLevelParams, isChainCategories: boolean = false) {
    if (this.policyResponseModel.level) {
      if (this.policyResponseModel.level !== policyLevelData.policyLevel) {
        this.rulesList = [];
      }
    }

    this.policyResponseModel.level = policyLevelData.policyLevel;

    switch (policyLevelData.policyLevel) {
      case PROPERTY_POLICY_CREATION_LEVEL.PROPERTY:
        if (!this.rulesList.length) {
          this.rulesList = [{
            id: this.sharedDataService.getHotelInfo().hotelCode,
          }];
        };
        break;

      case ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE:
        this.policyResponseModel.chainCategoryIds = [];
        if (!this.rulesList.length) {
          this.rulesList = [{
            id: this.sharedDataService.getChainInfo().chainId,
          }];
        };
        if (isChainCategories) {
          policyLevelData.chainCategories.forEach(category => {
            category.list.forEach(group => {
              const ruleIndex = this.rulesList.findIndex(item => item.id === Number(group.id));
              if (group.selected && ruleIndex === -1) {
                this.policyResponseModel.chainCategoryIds.push(group.id);
              } else if (!group.selected && ruleIndex >= 0) {
                // If rule is part of POLICY(EDIT flow), then mark status as delete(Inactive).
                if (this.rulesList[ruleIndex].isPresentInEdit) {
                  this.rulesList[ruleIndex].status = RULE_STATUS.DELETE;
                } else {
                  this.rulesList.splice(ruleIndex, 1);
                }
              } else if (group.selected && ruleIndex >= 0) {
                this.rulesList[ruleIndex].status = RULE_STATUS.ACTIVE;
              }
            });
          });
        }
        break;

      case PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN:
        policyLevelData.ratePlans.forEach(category => {
          category.list.forEach(rateplan => {
            const ruleIndex = this.rulesList.findIndex(item => item.id === Number(rateplan.id));
            if (rateplan.selected && ruleIndex === -1) {
              this.rulesList.push({
                id: Number(rateplan.id)
              });
            } else if (!rateplan.selected && ruleIndex >= 0) {
              // If rule is part of POLICY(EDIT flow), then mark status as delete(Inactive).
              if (this.rulesList[ruleIndex].isPresentInEdit) {
                this.rulesList[ruleIndex].status = RULE_STATUS.DELETE;
              } else {
                this.rulesList.splice(ruleIndex, 1);
              }
            } else if (rateplan.selected && ruleIndex >= 0) {
              this.rulesList[ruleIndex].status = RULE_STATUS.ACTIVE;
            }
          });
        });
        break;

      case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG:
        this.policyResponseModel.rateCatalogIds = [];
        policyLevelData.ratePlans.forEach(rateplan => {
          const ruleIndex = this.rulesList.findIndex(item => item.id === Number(rateplan.id));
          if (rateplan.visible && ruleIndex === -1) {
            this.rulesList.push({
              id: Number(rateplan.id)
            });
            this.policyResponseModel.rateCatalogIds.push(rateplan.id);
          } else if (!rateplan.visible && ruleIndex >= 0) {
            // If rule is part of POLICY(EDIT flow), then mark status as delete(Inactive).
            if (this.rulesList[ruleIndex].isPresentInEdit) {
              this.rulesList[ruleIndex].status = RULE_STATUS.DELETE;
            } else {
              this.rulesList.splice(ruleIndex, 1);
            }
          } else if (rateplan.visible && ruleIndex >= 0) {
            this.rulesList[ruleIndex].status = RULE_STATUS.ACTIVE;
            this.policyResponseModel.rateCatalogIds.push(rateplan.id);
          }
        });
        break;

      case PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY:
        policyLevelData.rateCategories.forEach(category => {
          const ruleIndex = this.rulesList.findIndex(item => item.id === Number(category.id));
          if (category.visible && ruleIndex === -1) {
            this.rulesList.push({
              id: Number(category.id)
            });
          } else if (!category.visible && ruleIndex >= 0) {
            // If rule is part of POLICY(EDIT flow), then mark status as delete(Inactive)
            if (this.rulesList[ruleIndex].isPresentInEdit) {
              this.rulesList[ruleIndex].status = RULE_STATUS.DELETE;
            } else {
              this.rulesList.splice(ruleIndex, 1);
            }
          } else if (category.visible && ruleIndex >= 0) {
            this.rulesList[ruleIndex].status = RULE_STATUS.ACTIVE;
          }
        });
        break;

      case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY:
        this.policyResponseModel.emRateCategoryIds = [];
        policyLevelData.rateCategories.forEach(category => {
          const ruleIndex = this.rulesList.findIndex(item => item.id === Number(category.id));
          if (category.visible && ruleIndex === -1) {
            this.rulesList.push({
              id: Number(category.id)
            });
            this.policyResponseModel.emRateCategoryIds.push(category.id);
          } else if (!category.visible && ruleIndex >= 0) {
            // If rule is part of POLICY(EDIT flow), then mark status as delete(Inactive)
            if (this.rulesList[ruleIndex].isPresentInEdit) {
              this.rulesList[ruleIndex].status = RULE_STATUS.DELETE;
            } else {
              this.rulesList.splice(ruleIndex, 1);
            }
          } else if (category.visible && ruleIndex >= 0) {
            this.rulesList[ruleIndex].status = RULE_STATUS.ACTIVE;
            this.policyResponseModel.emRateCategoryIds.push(category.id);
          }
        });
        break;
    }

    // In EDIT Flow, user can directly save and activate from step1
    // so updating respose model. If new rule is there, then pushing in response model
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      this.rulesList.forEach(item => {
        const ruleIndex = this.policyResponseModel.rules.findIndex(rule => rule.uniqueID === item.id);
        if (ruleIndex < 0) {
          const rule = { ...this.policyResponseModel.rules[0] };
          rule.uniqueID = item.id;
          rule.activeStatus = RULE_STATUS.ACTIVE;
          // when creating new policy rule, ruleId should not be part of object
          // so deleting ruleId from new object to be created.
          if (rule.ruleID) {
            delete rule.ruleID;
          }
          this.policyResponseModel.rules.push(rule);
        } else {
          this.policyResponseModel.rules[ruleIndex].activeStatus = item.status;
        }
      });
      // policy response rules which are not part of rulesList, splicing those.
      for (let i = this.policyResponseModel.rules.length - 1; i >= 0; i--) {
        if (this.rulesList.findIndex(rule => rule.id === this.policyResponseModel.rules[i].uniqueID) === -1) {
          this.policyResponseModel.rules.splice(i, 1);
        }
      }
    }
  }

  /**
   * Get policy details step data
   */
  getPolicyDetailsData(): IPolicyDetailsRulesData {
    const rulesData = this.rulesConfigService.getPolicyDetailsConfigData(
      this.contextService.policyLevel,
      CREATE_POLICY_STEPS.POLICY_DETAILS
    );
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      // In case of Edit Flow, if any Inactive Policy Template is associated with Policy
      // then show that Inactive Policy Template along with Active Policy Templates.
      rulesData.data.policyTemplateList = this.setPolicyTemplateList(this.policyResponseModel.
        rules[0].ruleDecisions[0].ruleDecisionValue);
    } else {
      // In Create Flow, show only Active Policy Templates.
      rulesData.data.policyTemplateList = this.setPolicyTemplateList();
    }
    rulesData.fields.canBeDefaultPolicy = this.policyResponseModel.level === PROPERTY_POLICY_CREATION_LEVEL.PROPERTY
      || this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE
      && (this.policyResponseModel.chainCategoryIds === null || this.policyResponseModel.chainCategoryIds?.length <= 0);

    if (this.policyResponseModel.rules.length) {
      const rule = this.policyResponseModel.rules[0];

      // policy name
      rulesData.fields.policyName = rule.ruleName;

      // template name
      rulesData.fields.policyTemplate = rule.ruleDecisions[0].ruleDecisionValue.toString();
      rulesData.fields['policyTemplateName'] = this.policyResponseModel.policyTemplateName;

      // policyType: dafault/dated
      rule.ruleDecisions[0].ruleDecisionModifiers.forEach(decisionModifer => {
        // tslint:disable-next-line:max-line-length
        const modifierName = this.rulesMetadataService.getRuleDecisionModifierNameById(decisionModifer.ruleDecisionTypeModifierID);
        if (modifierName && modifierName === RULE_DECISION_TYPE_MODIFIER.isDefaultPolicy) {
          rulesData.fields.policyType = decisionModifer.modifierValue
            ? DEFAULT_DATED_POLICY_TYPE.default : DEFAULT_DATED_POLICY_TYPE.dated;
        }
      });

      if (rule.ruleCriteriaParameters && rule.ruleCriteriaParameters.length) {
        rule.ruleCriteriaParameters.forEach(criteria => {
          const criteriaMemberName = this.rulesMetadataService.getRuleCriteriaNameByCriteriaId(criteria.ruleCriteriaID);
          if (criteriaMemberName === RULE_CRITERIA_MEMBER_NAMES.dateRange) {
            const dateRanges = criteria.ruleCriteriaParameterValue.split(',');
            const dateRangesArr = [];
            dateRanges.forEach(dateRange => {
              dateRangesArr.push({
                startDate: moment(dateRange.split('/')[0]).toDate(),
                endDate: dateRange.split('/')[1] ? moment(dateRange.split('/')[1]).toDate() : null
              });
            });
            rulesData.fields.dateRange = dateRangesArr;
          }
          if (criteriaMemberName === RULE_CRITERIA_MEMBER_NAMES.dayOfWeek) {
            const dowResponse = criteria.ruleCriteriaParameterValue.split(',');
            const dayOfWeek = new DaysOfWeek();
            Object.keys(dayOfweekEnum).forEach(day => {
              const index = dowResponse.findIndex(dow => dow === dayOfweekEnum[day]);
              if (index < 0) {
                dayOfWeek[day] = false;
              }
            });
            rulesData.fields.dayOfWeek = dayOfWeek;
          }
        });
      }

      rulesData.fields.ruleStartDate = rule.ruleStartDate;
      rulesData.fields.overridePolicies = rule.rulePriority === RULE_PRIORITY.overridePolicy;
      rulesData.fields.auxId = rule.auxId;
      rulesData.fields.auxType = rule.auxType;
    }

    return rulesData;
  }

  /**
   * Set policy details step data
   */
  setPolicyDetailsData(policyDetailsData: IPolicyDetailsParams) {
    this.policyResponseModel.groupname = policyDetailsData.policyName;
    this.policyResponseModel.operation = this.contextService.policyFlow === POLICY_FLOW.CREATE
      ? OPERATION_TYPES.create : OPERATION_TYPES.update;

    const ruleTypeID = this.rulesMetadataService.getRuleTypeIdByRuleTypeDisplay(this.contextService.policyType);

    // setting template name
    let templateNameDetails: ITemplateListItemModel = {};
    templateNameDetails = this.policyMgmtStepPolicyDetailsService.getTemplateListItem();

    this.policyResponseModel.policyTemplateName = this.rulesMetadataService.getTemplateNameById(
      parseInt(policyDetailsData.policyTemplate, 10));
    if (this.policyResponseModel.policyTemplateName === null) {
      this.policyResponseModel.policyTemplateName = templateNameDetails.name;
    }
    // set RULE DECISION
    const ruleDecisionModifiersArr = this.rulesMetadataService.getRuleDecisionTypeModifierDataByRuleTypeId(ruleTypeID);
    const ruleDecisionModifiers: Array<IRuleDecisionModifier> = [];
    ruleDecisionModifiersArr.forEach(modifier => {
      if (modifier.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.propertyOREnterprise) {
        ruleDecisionModifiers.push({
          ruleDecisionTypeModifierID: modifier.ruleDecisionTypeModifierID,
          modifierValue: this.contextService.policyLevel.toUpperCase()
        });
      } else if (modifier.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.isDefaultPolicy) {
        ruleDecisionModifiers.push({
          ruleDecisionTypeModifierID: modifier.ruleDecisionTypeModifierID,
          modifierValue: policyDetailsData.policyType === DEFAULT_DATED_POLICY_TYPE.default
        });
      }
    });
    const ruleDecisions: Array<IRuleDecision> = [{
      ruleDecisionModifiers,
      ruleDecisionOrder: 1,
      ruleDecisionTypeID: this.rulesMetadataService.getRuleDecisionTypeIdByRuleTypeId(ruleTypeID),
      ruleDecisionValue: Number(policyDetailsData.policyTemplate)
    }];

    // Set RULE CRITERIA :
    // if policy type is Default, then no need to set ruleCriteria, else set it.
    const ruleCriteriaParameters: Array<IRuleCriteriaParam> = [];
    if (policyDetailsData.policyType !== DEFAULT_DATED_POLICY_TYPE.default) {

      // Set DAY OF WEEK
      const dayOfWeek = [];
      // tslint:disable-next-line:forin
      for (const key in policyDetailsData.dayOfWeek) {
        if (policyDetailsData.dayOfWeek[key]) {
          dayOfWeek.push(dayOfweekEnum[key]);
        }
      }

      // Set DATE RANGE
      const dateRangeArr = [];
      policyDetailsData.dateRange.forEach(range => {
        dateRangeArr.push(moment(range.startDate).format(DEFAULT_VALUES.datePickerAPIFormat) + '/' +
          (range.endDate ? moment(range.endDate).format(DEFAULT_VALUES.datePickerAPIFormat) : ''));
      });


      const ruleCriteriaMemberData = this.rulesMetadataService.getRuleCriteriaMemberDataByRuleTypeId(ruleTypeID);
      ruleCriteriaMemberData.forEach(item => {
        let ruleCriteriaParamValue: string;
        if (item.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.hotelIds
          || item.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.chainCategories) {
          //CHAIN
          if (item.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.hotelIds
            && (!this.policyResponseModel.chainCategoryIds || this.policyResponseModel.chainCategoryIds?.length <= 0)
            && this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
            ruleCriteriaParamValue = this.sharedDataService.getChainInfo().chainHotels.map(itm => itm.hotelCode).join(',');
          }
          //CHAIN CATEGORIES
          else if (item.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.chainCategories
            && this.policyResponseModel.chainCategoryIds?.length > 0
            && this.policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
            ruleCriteriaParamValue = this.policyResponseModel.chainCategoryIds.join(',');
          }
          else {
            return;
          }
        }
        else {
          ruleCriteriaParamValue = item.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dayOfWeek
            ? dayOfWeek.join() : dateRangeArr.join();
        }
        const criteriaParam: IRuleCriteriaParam = {
          operatorID: item.operatorID,
          ruleCriteriaID: item.ruleCriteriaID,
          ruleCriteriaMemberID: item.ruleCriteriaMemberID,
          ruleCriteriaParameterValue: ruleCriteriaParamValue
        };
        ruleCriteriaParameters.push(criteriaParam);
      });
    }

    // Set RULE STARTDATE and RULE ENDDATE
    const ruleStartDate = moment(policyDetailsData.ruleStartDate).format(DEFAULT_VALUES.datePickerAPIFormat);
    const endDate = policyDetailsData.dateRange[policyDetailsData.dateRange.length - 1].endDate;
    const ruleEndDate = endDate ? moment(endDate).format(DEFAULT_VALUES.datePickerAPIFormat) : '';

    // set rules data
    const rule: IRules = {
      activeStatus: '',
      ruleLogic: RULE_LOGIC.ALL,
      rulePriority: policyDetailsData.policyType === DEFAULT_DATED_POLICY_TYPE.default ? RULE_PRIORITY.defaultPolicy
        : policyDetailsData.policyType === DEFAULT_DATED_POLICY_TYPE.dated && policyDetailsData.overridePolicies
          ? RULE_PRIORITY.overridePolicy : RULE_PRIORITY.normalPolicy,
      uniqueTypeID: this.rulesMetadataService.getUniqueTypeIdByPolicyLevel(this.policyResponseModel.level),
      ruleTypeID,
      ruleName: policyDetailsData.policyName,
      uniqueID: null,
      ruleStartDate,
      ruleEndDate,
      ruleDecisions,
      ruleCriteriaParameters,
      auxId: policyDetailsData.auxId,
      auxType: policyDetailsData.auxType
    };

    const rulesList: Array<IRules> = [];
    this.rulesList.forEach(ruleItem => {
      const eachRule = { ...rule };
      eachRule.activeStatus = ruleItem.status;
      eachRule.uniqueID = ruleItem.id;
      if (ruleItem.ruleId) {
        eachRule.ruleID = ruleItem.ruleId;
      }
      rulesList.push(eachRule);
    });
    this.policyResponseModel.rules = rulesList;
  }

  /**
   * Sorts template list data
   * @param templateId: Template id which is selected for policy
   */
  setPolicyTemplateList(templateId?: number) {
    let policyTemplateList: IPolicyMetadata[];
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      policyTemplateList = this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.templates);
    } else {
      policyTemplateList = this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.template);
    }
    let sortedPolicyTemplateArray = [];

    if (policyTemplateList?.length) {
      const policyTemplateArray = [];
      if (templateId) {
        const templateData = policyTemplateList.find(template => Number(template.id) === templateId);
        if (templateData && templateData.status === STATUS_LIST.INACTIVE) {
          policyTemplateArray.push(templateData);
        }
      }
      // In case of Create Flow, show only Active Policy Templates
      policyTemplateList.forEach(listItem => {
        if (listItem.status === STATUS_LIST.ACTIVE) {
          policyTemplateArray.push(listItem);
        }
      });
      sortedPolicyTemplateArray = this.policyMgmtUtilityService.customSort(1, 'name', policyTemplateArray);
    }

    return sortedPolicyTemplateArray;
  }

}
