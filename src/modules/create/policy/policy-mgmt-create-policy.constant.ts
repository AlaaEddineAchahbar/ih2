
import { IPolicyLevelRulesData, IPolicyDetailsRulesData, DaysOfWeek } from './policy-mgmt-create-policy.model';
import { ENTERPRISE_POLICY_LEVEL_FILTERS, PROPERTY_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';
import { IDropDownItem } from '../../core/common.model';
import { DEFAULT_DATED_POLICY_TYPE } from '../../core/rules.constant';

export enum CREATE_POLICY_STEPS {
    POLICY_LEVEL = 'policy_level',
    POLICY_DETAILS = 'policy_details'
}

const POLICY_LEVEL_OPTIONS = [
    PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
    PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY,
    PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN
];

const ENTERPRISE_POLICY_LEVEL_OPTIONS = [
    ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN,
    ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES,
    ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS,
    ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES
];

const DAY_OF_WEEK: Array<IDropDownItem> = [
    {
        id: 1,
        name: 'Mon'
    },
    {
        id: 2,
        name: 'Tue'
    },
    {
        id: 3,
        name: 'Wed'
    },
    {
        id: 4,
        name: 'Thu'
    },
    {
        id: 5,
        name: 'Fri'
    },
    {
        id: 6,
        name: 'Sat'
    },
    {
        id: 7,
        name: 'Sun'
    }
];

const POLICY_TYPE_OPTIONS = [
    DEFAULT_DATED_POLICY_TYPE.default,
    DEFAULT_DATED_POLICY_TYPE.dated
];

export const CREATE_POLICY_PROPERTY_POLICY_LEVEL: IPolicyLevelRulesData = {
    fields: {
        policyLevel: '',
        rateCategories: [],
        ratePlans: [],
        chainCategories: []
    },
    data: {
        policyLevelList: [...POLICY_LEVEL_OPTIONS],
        rateCategoryList: [],
        ratePlanList: [],
        chainCategoryList: []
    }

};

export const CREATE_POLICY_PROPERTY_POLICY_DETAILS: IPolicyDetailsRulesData = {
    fields: {
        policyName: '',
        policyTemplate: '',
        policyType: DEFAULT_DATED_POLICY_TYPE.dated,
        dateRange: [{ startDate: '', endDate: '' }],
        ruleStartDate: '',
        dayOfWeek: new DaysOfWeek(),
        overridePolicies: false,
        auxId: null,
        auxType: ''
    },
    data: {
        policyTemplateList: [],
        dayofWeek: [...DAY_OF_WEEK],
        policyType: [...POLICY_TYPE_OPTIONS]
    }

};

export const CREATE_POLICY_ENTERPRISE_POLICY_LEVEL: IPolicyLevelRulesData = {
  fields: {
      policyLevel: '',
      rateCategories: [],
      ratePlans: [],
      chainCategories: []
  },
  data: {
      policyLevelList: [...ENTERPRISE_POLICY_LEVEL_OPTIONS],
      rateCategoryList: [],
      ratePlanList: [],
      chainCategoryList: []
  }

};

export const CREATE_POLICY_ENTERPRISE_POLICY_DETAILS: IPolicyDetailsRulesData = {
  fields: {
      policyName: '',
      policyTemplate: '',
      policyType: DEFAULT_DATED_POLICY_TYPE.dated,
      dateRange: [{ startDate: '', endDate: '' }],
      ruleStartDate: '',
      dayOfWeek: new DaysOfWeek(),
      overridePolicies: false,
      auxId: null,
      auxType: ''
  },
  data: {
      policyTemplateList: [],
      dayofWeek: [...DAY_OF_WEEK],
      policyType: [...POLICY_TYPE_OPTIONS]
  }

};

export const POLICY_CONFIG = {
    property: {
        policy_level: CREATE_POLICY_PROPERTY_POLICY_LEVEL,
        policy_details: CREATE_POLICY_PROPERTY_POLICY_DETAILS
    },
    enterprise: {
      policy_level: CREATE_POLICY_ENTERPRISE_POLICY_LEVEL,
      policy_details: CREATE_POLICY_ENTERPRISE_POLICY_DETAILS
    }
};

