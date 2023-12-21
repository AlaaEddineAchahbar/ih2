import { Injectable } from '@angular/core';
import { SharedDataService } from './shared.data.service';
import { IRuleDecisionTypeModifier, IRuleCriteriaMember, IPolicyMetadata } from './rules-metadata.model';
import { RULE_TYPE_DISPLAY_NAME, POLICY_METADATA_TYPE, RULE_OPERATORS, UNIQUE_TYPE_ID, ENTERPRISE_POLICY_METADATA_TYPE } from './rules.constant';
import { ContextService } from './context.service';
import { POLICY_LEVEL } from './constants';

@Injectable()
export class RulesMataDataService {

    /**
     * Holds Rules Mapping info.
     */
    rule: {
        ruleDecisionTypeModifier?: any,
        ruleCriteriaData?: any;
        ruleTypeIds?: any;
        decisionModifierNames?: any;
        uniqueTypeIds?: any;
        ruleCriteriaNames?: any;
    };

    constructor(
        private sharedDataService: SharedDataService,
        private contextService: ContextService,
    ) {
        this.rule = {
            ruleDecisionTypeModifier: {},
            ruleCriteriaData: {},
            ruleTypeIds: {},
            decisionModifierNames: {},
            uniqueTypeIds: {},
            ruleCriteriaNames: {}
        };
    }

    /***************** Returns Rule Type Id ******************/
    /**
     * Returns RuleTypeId depending on policy type
     * ("ruleTypes" table from RulesMetaData)
     * ruleTypeDisplay          || ruleTypeID
     * 1. Cancellation Policy   || 14
     * 2. Deposit Policy        || 15
     * 3. Guarantee Policy      || 16
     * @param policyType: policyType
     */
    getRuleTypeIdByRuleTypeDisplay(policyType: string): number {
        if (this.rule.ruleTypeIds.hasOwnProperty(policyType)) {
            return this.rule.ruleTypeIds[policyType];
        }
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const ruleType = rulesMetaData.ruleTypes.find(type => type.ruleTypeDisplay === RULE_TYPE_DISPLAY_NAME[policyType]);
        this.rule.ruleTypeIds[policyType] = ruleType.ruleTypeID;
        return ruleType ? ruleType.ruleTypeID : null;
    }



    /*********** Returns UniqueTypeId :: Policy Level Selected (Property/RatePlan/RateCategory) ***************/
    /**
     * Returns UniqueTypeId by policy level
     * ("ruleIdTypes" table from RulesMetaData)
     * ruleTypeDisplay          || ruleTypeID
     * Hotel-based rules        || 1
     * Chain                    || 3
     * Rate Plan Id             || 5
     * Rate Catalog             || 6
     * Rate Plan Category Id    || 7
     * Chain Rate               || 9
     * @param policyLevel: policy level
     */
    getUniqueTypeIdByPolicyLevel(policyLevel: string): number {
        if (this.rule.uniqueTypeIds.hasOwnProperty(policyLevel)) {
            return this.rule.uniqueTypeIds[policyLevel];
        }
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        // tslint:disable-next-line:max-line-length
        /*eslint max-len: ["error", { "code": 180 }]*/
        const uniqueType = rulesMetaData.ruleIdTypes.find(ruleIdType => ruleIdType.identifierTypeDescription === UNIQUE_TYPE_ID[policyLevel]);
        this.rule.uniqueTypeIds[policyLevel] = uniqueType.identifierTypeID;
        return uniqueType ? uniqueType.identifierTypeID : null;
    }



    /*********** Returns Rule Decision Data ******************/
    /**
     * Returns RuleDecisionTypeId by RuleTypeId
     * ("ruleDecisionTypeRuleTypeMappings" table from RulesMetaData)
     * ruleTypeID || ruleDecisionTypeID
     * 1. 14      || 1024   (Rule Decision Type = 'POLICY TEMPLATE') (it may vary as per Env.)
     * 2. 15      || 1024
     * 3. 16      || 1024
     * @param ruleTypeId: ruleTypeId
     */
    getRuleDecisionTypeIdByRuleTypeId(ruleTypeId: number): number {
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const data = rulesMetaData.ruleDecisionTypeRuleTypeMappings.find(item => item.ruleTypeID === ruleTypeId);
        return data ? data.ruleDecisionTypeID : null;
    }

    /**
     * Returns CategoryId by RuleDecisionTypeId
     * ("ruleDecisionTypes" table from RulesMetaData)
     * ruleDecisionTypeID || categoryID
     * 1. 1024            || 1025 (Rule decision Category - "POLICY DECISION") (it may vary as per Env.)
     * @param ruleDecisionTypeId: ruleDecisionTypeId
     */
    getCategoryIdByRuleDecisionTypeId(ruleDecisionTypeId: number): number {
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const data = rulesMetaData.ruleDecisionTypes.find(item => item.ruleDecisionTypeID === ruleDecisionTypeId);
        return data ? data.categoryID : null;
    }

    /**
     * Returns RuleDecisionTypeModifierData by CategoryId
     * ("ruleDecisionTypeModifiers" table from RulesMetaData)
     * categoryID   || ruleDecisionTypeModifierID                   || operatorTypeID
     * 1. 1025      || 1089  (property/enterprise policy template)  || 1
     * 2. 1025      || 1091  (default/dated policy)                 || 5
     * @param categoryId: categoryId
     */
    getRuleDecisionTypeModifierDataByCategoryId(categoryId: number): Array<IRuleDecisionTypeModifier> {
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const data = rulesMetaData.ruleDecisionTypeModifiers.filter(item => item.categoryID === categoryId);
        return data && data.length ? data : null;
    }

    /**
     * Returns RuleDecisionTypeModifierData by RuleTypeId
     * ("ruleDecisionTypeModifiers" table from RulesMetaData)
     * ruleTypeID || ruleDecisionTypeID || categoryID   || ruleDecisionTypeModifierID || operatorTypeID
     * 1. 14/15/16|| 1024               || 1025         || 1089                       || 1
     * 2. 14/15/16|| 1024               || 1025         || 1091                       || 5
     * @param ruleTypeId: ruleTypeId
     */
    getRuleDecisionTypeModifierDataByRuleTypeId(ruleTypeId: number): Array<IRuleDecisionTypeModifier> {
        if (this.rule.ruleDecisionTypeModifier.hasOwnProperty(ruleTypeId)) {
            return this.rule.ruleDecisionTypeModifier[ruleTypeId];
        }
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const ruleDecisionTypeId = this.getRuleDecisionTypeIdByRuleTypeId(ruleTypeId);
        const categoryID = this.getCategoryIdByRuleDecisionTypeId(ruleDecisionTypeId);
        const ruleDecisionTypeModifierData = this.getRuleDecisionTypeModifierDataByCategoryId(categoryID);
        this.rule.ruleDecisionTypeModifier[ruleTypeId] = ruleDecisionTypeModifierData;
        return ruleDecisionTypeModifierData;
    }



    /*************** Returns Rule Criteria Data *********************/
    /**
     * Returns RuleCriteriaMember Data by RuleTypeId
     * ("ruleCriteriaMembers" table from rulesMetaData)
     * ruleTypeID || ruleCriteriaID || ruleCriteriaMemberID || operatorTypeID || operatorID
     * 1. 14/15/16|| 1020           || 1020                 || 7              || 12   (DOW criteria)
     * 2. 14/15/16|| 1002           || 1002                 || 1005           || 1004 (DateRange Criteria)
     * @param ruleTypeId: RuleTypeId
     */
    getRuleCriteriaMemberDataByRuleTypeId(ruleTypeId: number): Array<IRuleCriteriaMember> {
        if (this.rule.ruleCriteriaData.hasOwnProperty(ruleTypeId)) {
            return this.rule.ruleCriteriaData[ruleTypeId];
        }
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const ruleCriteriaRuleTypeMapping = rulesMetaData.ruleCriteriaRuleTypeMappings.filter(item => item.ruleTypeID === ruleTypeId);
        if (ruleCriteriaRuleTypeMapping && ruleCriteriaRuleTypeMapping.length) {
            const ruleCriteriaMembers = rulesMetaData.ruleCriteriaMembers.filter(item => ruleCriteriaRuleTypeMapping.some(field => {
                return item.ruleCriteriaID === field.ruleCriteriaID;
            }));
            ruleCriteriaMembers.forEach(criteriaMember => {
                criteriaMember.operatorID = this.getOperatorIdByOperatorTypeId(criteriaMember);
            });
            this.rule.ruleCriteriaData[ruleTypeId] = ruleCriteriaMembers;
            return ruleCriteriaMembers;
        }
        return null;
    }

    /**
     * finds and returns OperatorId from rulesOperation object,
     * If not present, then finds and returns it from ruleCriteriaMemberOperatorOverrides object
     * operatorTypeID || operatorID
     * 1. 7           || 12
     * 2. 1005        || 1004
     * @param criteriaMember: IRuleCriteriaMember
     */
    getOperatorIdByOperatorTypeId(criteriaMember: IRuleCriteriaMember): number {
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const ruleOperations = rulesMetaData.ruleOperations.filter(item => item.operatorTypeID === criteriaMember.operatorTypeID);
        if (ruleOperations.length) {
            const ruleOperation = ruleOperations.find(ruleOperationItem => {
                const data = rulesMetaData.ruleOperators.find(operator => operator.operatorID === ruleOperationItem.operatorID);
                return data.operatorName === RULE_OPERATORS.anyDayOfWeek ? data : null;
            });
            return ruleOperation ? ruleOperation.operatorID : null;
        } else {
            const criteriaMembers = rulesMetaData.ruleCriteriaMemberOperatorOverrides.filter(item => {
                return Number(item.ruleCriteriaMemberID) === criteriaMember.ruleCriteriaMemberID;
            });
            return criteriaMembers && criteriaMembers.length ? Number(criteriaMembers[0].operatorID) : null;
        }
    }



    /*********** Other : Getters **************/

    /**
     * Returns RuleDecisionModifer Name from DecisionModifierId
     * ("ruleDecisionTypeModifiers" table from RulesMetaData)
     * ruleDecisionTypeModifierID || ruleDecisionTypeModifierName
     * 1. 1089 || 'POLICYTEMPLATEIDTYPE' >> (property or enterprise > policy template decision)
     * 2. 1091 || 'ISDEFAULTPOLICY'      >> (default or dated > policy decision)
     * @param decisionModifierId: decisionModifierId
     */
    getRuleDecisionModifierNameById(decisionModifierId: number): string {
        if (this.rule.decisionModifierNames.hasOwnProperty(decisionModifierId)) {
            return this.rule.decisionModifierNames[decisionModifierId];
        }
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        // tslint:disable-next-line:max-line-length
        /*eslint max-len: ["error", { "code": 180 }]*/
        const decisionTypeMod = rulesMetaData.ruleDecisionTypeModifiers.find(modifier => modifier.ruleDecisionTypeModifierID === decisionModifierId);
        this.rule.decisionModifierNames[decisionModifierId] = decisionTypeMod.ruleDecisionTypeModifierName;
        return decisionTypeMod ? decisionTypeMod.ruleDecisionTypeModifierName : null;
    }

    /**
     * Returns RuleCriteriaName by CriteriaId
     * ("ruleCriteriaMembers" from RulesMetaData)
     * criteriaMemberNames || ruleCriteriaID
     * 1. NIGHT DOW        || 1020
     * 2. STAYDATESYYYYMMDD|| 1002
     * @param criteriaId: criteriaId
     */
    getRuleCriteriaNameByCriteriaId(criteriaId: number): string {
        if (this.rule.ruleCriteriaNames.hasOwnProperty(criteriaId)) {
            return this.rule.ruleCriteriaNames[criteriaId];
        }
        const rulesMetaData = this.sharedDataService.getRulesMetaData();
        if (!rulesMetaData) {
            return null;
        }
        const ruleCriteria = rulesMetaData.ruleCriteriaMembers.find(criteriadata => criteriadata.ruleCriteriaID === criteriaId);
        this.rule.ruleCriteriaNames[criteriaId] = ruleCriteria.criteriaMemberNames;
        return ruleCriteria ? ruleCriteria.criteriaMemberNames : null;
    }

    /**
     * Returns Template name from template id
     * ("template policy metadata" - template dropdown API call)
     * Ex: 1212120: Test Template
     * @param id: template id
     */
    getTemplateNameById(id: number): string {
      let templateMetadata: IPolicyMetadata[];
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          templateMetadata = this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.template);
      } else {
          templateMetadata = this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.templates);
      }
      const data = templateMetadata.find(template => Number(template.id) === id);
      return data ? data.name : null;
    }
}
