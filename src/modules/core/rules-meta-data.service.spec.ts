import { TestBed, async } from '@angular/core/testing';
import { SharedDataService } from './shared.data.service';
import { POLICY_LEVEL, POLICY_TYPE } from './constants';
import { IPolicyMetaDataTypes } from './rules-metadata.model';
import { RulesMataDataService } from './rules-meta-data.service';
import { RULE_DECISION_TYPE_MODIFIER, RULE_CRITERIA_MEMBER_NAMES } from './rules.constant';
import { PROPERTY_POLICY_CREATION_LEVEL } from './rules-config.constant';
import { ContextService } from './context.service';


/* Rules MetaData and policy Metadata (rateplan, ratecategory, template) */

const rulesMetaDataJson = require('../../assets-policy-mgmt/data/rulesData/rules-metadata-test-case.json');
const ratePlanMetadata = [];
const rateCategoryMetadata = [];
const templateMetadata = [
    {
        id: 12345,
        name: 'Test Cancel Policy'
    }
];

class MockSharedDataService {
    policyMetadata: IPolicyMetaDataTypes = {
        RatePlanCategory: ratePlanMetadata,
        RateCategoryByOwnerReference: rateCategoryMetadata,
        PolicyTemplate: templateMetadata,
        EnterprisePolicyTemplate: templateMetadata
    };

    getRulesMetaData() {
        return rulesMetaDataJson;
    }

    getPolicyMetadata(type: string) {
        return this.policyMetadata[type];
    }
}

describe('Rules MetaData Service', () => {
    let sharedDataService: SharedDataService;
    let instance: RulesMataDataService;
    let contextService: ContextService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
            ],
            providers: [
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                RulesMataDataService,
                ContextService
            ]
        });
        instance = TestBed.inject(RulesMataDataService);
        sharedDataService = TestBed.inject(SharedDataService);
        contextService = TestBed.inject(ContextService);
        instance.rule = {
            decisionModifierNames: {},
            ruleCriteriaData: {},
            ruleCriteriaNames: {},
            ruleDecisionTypeModifier: {},
            ruleTypeIds: {},
            uniqueTypeIds: {}
        };
    }));

    it('should initialize the service', () => {
        expect(instance).toBeTruthy();
    });

    it('should return RuleTypeId for given RuleTypeDisplay name', () => {
        const result = instance.getRuleTypeIdByRuleTypeDisplay(POLICY_TYPE.CANCELLATION);
        expect(result).toEqual(14);

        // should return data from service variable, as data already present
        const storedResult = instance.getRuleTypeIdByRuleTypeDisplay(POLICY_TYPE.CANCELLATION);
        expect(storedResult).toEqual(14);
    });

    it('should return UniqueTypeId for given PolicyLevel', () => {
        const result = instance.getUniqueTypeIdByPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
        expect(result).toEqual(1);

        // should return data from service variable, as data already present
        const storedResult = instance.getUniqueTypeIdByPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
        expect(storedResult).toEqual(1);
    });

    it('should return RuleDecisionTypeId for given RuleTypeId', () => {
        const result = instance.getRuleDecisionTypeIdByRuleTypeId(14);
        expect(result).toEqual(1024);
    });

    it('should return CategoryId for given RuleDecisionTypeId', () => {
        const result = instance.getCategoryIdByRuleDecisionTypeId(1024);
        expect(result).toEqual(1025);
    });

    it('should return RuleDecisionTypeModifier info for given CategoryId', () => {
        const result = instance.getRuleDecisionTypeModifierDataByCategoryId(1025);
        result.forEach(data => {
            if (data.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.isDefaultPolicy) {
                expect(data.ruleDecisionTypeModifierID).toEqual(1091);
            }
            if (data.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.propertyOREnterprise) {
                expect(data.ruleDecisionTypeModifierID).toEqual(1089);
            }
        });
    });

    it('should return RuleDecisionTypeModifier info for given RuleTypeId', () => {
        const result = instance.getRuleDecisionTypeModifierDataByRuleTypeId(14);
        result.forEach(data => {
            if (data.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.isDefaultPolicy) {
                expect(data.ruleDecisionTypeModifierID).toEqual(1091);
            }
            if (data.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.propertyOREnterprise) {
                expect(data.ruleDecisionTypeModifierID).toEqual(1089);
            }
        });

        // should return data from service variable, as data already present
        const storedResult = instance.getRuleDecisionTypeModifierDataByRuleTypeId(14);
        storedResult.forEach(data => {
            if (data.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.isDefaultPolicy) {
                expect(data.ruleDecisionTypeModifierID).toEqual(1091);
            }
            if (data.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.propertyOREnterprise) {
                expect(data.ruleDecisionTypeModifierID).toEqual(1089);
            }
        });
    });

    it('should return RuleCriteriaMember info for given RuleTypeId', () => {
        const result = instance.getRuleCriteriaMemberDataByRuleTypeId(14);
        result.forEach(data => {
            if (data.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dayOfWeek) {
                expect(data.ruleCriteriaMemberID).toEqual(1020);
            }
            if (data.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dateRange) {
                expect(data.ruleCriteriaMemberID).toEqual(1002);
            }
        });

        // should return data from service variable, as data already present
        const storedResult = instance.getRuleCriteriaMemberDataByRuleTypeId(14);
        storedResult.forEach(data => {
            if (data.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dayOfWeek) {
                expect(data.ruleCriteriaMemberID).toEqual(1020);
            }
            if (data.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dateRange) {
                expect(data.ruleCriteriaMemberID).toEqual(1002);
            }
        });
    });

    it('should return RuleDecisionModifierName for given RuleDecisionModifierId', () => {
        const result = instance.getRuleDecisionModifierNameById(1089);
        expect(result).toEqual(RULE_DECISION_TYPE_MODIFIER.propertyOREnterprise);

        // should return data from service variable, as data already present
        const storedResult = instance.getRuleDecisionModifierNameById(1089);
        expect(storedResult).toEqual(RULE_DECISION_TYPE_MODIFIER.propertyOREnterprise);
    });

    it('should return RuleCriteriaName for given CriteriaId', () => {
        const result = instance.getRuleCriteriaNameByCriteriaId(1020);
        expect(result).toEqual(RULE_CRITERIA_MEMBER_NAMES.dayOfWeek);

        // should return data from service variable, as data already present
        const storedResult = instance.getRuleCriteriaNameByCriteriaId(1020);
        expect(storedResult).toEqual(RULE_CRITERIA_MEMBER_NAMES.dayOfWeek);
    });

    it('should return TemplateName for given TemplateId when policy level is PROPERTY', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        const result = instance.getTemplateNameById(12345);
        expect(result).toEqual('Test Cancel Policy');
    });

    it('should return TemplateName for given TemplateId when policy level is ENTERPRISE', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        const result = instance.getTemplateNameById(12345);
        expect(result).toEqual('Test Cancel Policy');
    });
});
