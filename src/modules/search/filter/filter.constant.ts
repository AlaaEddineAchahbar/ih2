import { IFilterRulesData } from './filter.model';
import {
  STATUS_LIST, COMMON_OPTIONS, CANCELLATION_OPTIONS, ENTERPRISE_POLICY_LEVEL_FILTERS,
  ACCEPTED_TENDER_OPTIONS, PROPERTY_POLICY_CREATION_LEVEL, POLICY_OWNER, INSTALLMENTS_LIST
} from '../../core/rules-config.constant';
import { DEFAULT_VALUES } from '../../core/constants';

const FILTER_COMMON_DATA_FEILDS = {
  propertyLevel: [
    ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN,
    PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
    PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY,
    PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN
  ],
  enterpriseLevel: [
    ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN,
    ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES,
    ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS,
    ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES
  ],
  statusListTemplate: [
    STATUS_LIST.ACTIVE,
    STATUS_LIST.INACTIVE,
    STATUS_LIST.ALL_STATUS
  ],
  statusListPolicy: [
    STATUS_LIST.ACTIVE,
    STATUS_LIST.INACTIVE,
    STATUS_LIST.EXPIRED
  ],
  acceptedTender: [
    ACCEPTED_TENDER_OPTIONS.ACCEPT_ALL,
    ACCEPTED_TENDER_OPTIONS.CREDIT_CARD,
    ACCEPTED_TENDER_OPTIONS.CORPORATE_ID,
    ACCEPTED_TENDER_OPTIONS.HOTEL_BILLING,
    COMMON_OPTIONS.ALL
  ],
  cancellationNotice: [
    CANCELLATION_OPTIONS.SAME_DAY,
    CANCELLATION_OPTIONS.ADVANCE_NOTICE,
    CANCELLATION_OPTIONS.NON_REFUNDABLE,
    COMMON_OPTIONS.ALL
  ],
  installmentsList: [
    INSTALLMENTS_LIST.ACTIVE,
    INSTALLMENTS_LIST.INACTIVE,
    INSTALLMENTS_LIST.BOTH
  ]
};

export const FILTER_PROPERTY_TEMPLATE_CANCELLATION: IFilterRulesData = {
  fields: {
    policyTemplateName: '',
    owner: POLICY_OWNER.BOTH,
    status: STATUS_LIST.ALL_STATUS,
    cancellationNotice: COMMON_OPTIONS.ALL,
    isFreeCancellation: 2
  },
  data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListTemplate],
    cancellationNotice: [...FILTER_COMMON_DATA_FEILDS.cancellationNotice]
  }
};

export const FILTER_ENTERPRISE_TEMPLATE_CANCELLATION: IFilterRulesData = {
  fields: {
    policyTemplateName: '',
    owner: POLICY_OWNER.ENTERPRISE,
    status: STATUS_LIST.ALL_STATUS,
    cancellationNotice: COMMON_OPTIONS.ALL,
  },
  data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListTemplate],
    cancellationNotice: [...FILTER_COMMON_DATA_FEILDS.cancellationNotice]
  }
};

export const FILTER_PROPERTY_TEMPLATE_GUARANTEE: IFilterRulesData = {
  fields: {
    policyTemplateName: '',
    owner: POLICY_OWNER.BOTH,
    status: STATUS_LIST.ALL_STATUS,
    acceptedTender: DEFAULT_VALUES.searchScreen.acceptedTenderRadioDefaultValue
  },
  data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListTemplate],
    acceptedTender: []
  }
};

export const FILTER_ENTERPRISE_TEMPLATE_GUARANTEE: IFilterRulesData = {
  fields: {
    policyTemplateName: '',
    owner: POLICY_OWNER.ENTERPRISE,
    status: STATUS_LIST.ALL_STATUS,
    acceptedTender: DEFAULT_VALUES.searchScreen.acceptedTenderRadioDefaultValue
  },
  data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListTemplate],
    acceptedTender: []
  }
};

export const FILTER_PROPERTY_TEMPLATE_DEPOSIT: IFilterRulesData = {
  fields: {
    policyTemplateName: '',
    owner: POLICY_OWNER.BOTH,
    status: STATUS_LIST.ALL_STATUS,
    installments: INSTALLMENTS_LIST.BOTH,
    acceptedTender: DEFAULT_VALUES.searchScreen.acceptedTenderRadioDefaultValue
  },
  data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListTemplate],
    installmentsList: [...FILTER_COMMON_DATA_FEILDS.installmentsList],
    acceptedTender: []
  }
};

export const FILTER_ENTERPRISE_TEMPLATE_DEPOSIT: IFilterRulesData = {
  fields: {
    policyTemplateName: '',
    owner: POLICY_OWNER.ENTERPRISE,
    status: STATUS_LIST.ALL_STATUS,
    installments: INSTALLMENTS_LIST.BOTH,
    acceptedTender: DEFAULT_VALUES.searchScreen.acceptedTenderRadioDefaultValue
  },
  data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListTemplate],
    installmentsList: [...FILTER_COMMON_DATA_FEILDS.installmentsList],
    acceptedTender: []
  }
};

export const FILTER_PROPERTY_POLICY: IFilterRulesData = {
  fields: {
    policyName: '',
    ratePlan: [],
    rateCategory: [],
    policyLevel: {},
    owner: POLICY_OWNER.PROPERTY,
    status: STATUS_LIST.ACTIVE,
    policyTemplateId: '',
    dateRange: { startDate: '', endDate: '' }
  }, data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListPolicy],
    policyAssignmentLevel: [...FILTER_COMMON_DATA_FEILDS.propertyLevel],
    policyTemplateList: [],
    ratePlans: [],
    rateCategories: []
  }
};

export const FILTER_PAYMENT_DEPOSIT_RULE: IFilterRulesData = {
  fields: {
    depositConfigurationName: '',
    owner: POLICY_OWNER.ENTERPRISE
  }
};

export const FILTER_PAYMENT_DEPOSIT_RULE_PROPERTY: IFilterRulesData = {
  fields: {
    depositConfigurationName: '',
    owner: POLICY_OWNER.PROPERTY
  }
};

export const FILTER_ENTERPRISE_POLICY: IFilterRulesData = {
  fields: {
    policyName: '',
    ratePlan: [],
    rateCategory: [],
    chainCategory: [],
    enterprisePolicyLevel: {
      CHAIN: true,
      CHAIN_CATEGORIES: false,
      RATE_CATEGORIES: false,
      RATE_PLANS: false
    },
    policyLevel: {},
    owner: POLICY_OWNER.ENTERPRISE,
    status: STATUS_LIST.ACTIVE,
    policyTemplateId: '',
    dateRange: { startDate: '', endDate: '' }
  }, data: {
    statusList: [...FILTER_COMMON_DATA_FEILDS.statusListPolicy],
    policyAssignmentLevel: [...FILTER_COMMON_DATA_FEILDS.enterpriseLevel],
    policyTemplateList: [],
    ratePlans: [],
    rateCategories: [],
    chainCategories: []
  }
};

export const FILTER_CONFIG = {
  property: {
    template: {
      cancellation: FILTER_PROPERTY_TEMPLATE_CANCELLATION,
      guarantee: FILTER_PROPERTY_TEMPLATE_GUARANTEE,
      deposit: FILTER_PROPERTY_TEMPLATE_DEPOSIT
    },
    policy: FILTER_PROPERTY_POLICY,
    'payment-deposit-rule': FILTER_PAYMENT_DEPOSIT_RULE_PROPERTY

  },
  enterprise: {
    template: {
      cancellation: FILTER_ENTERPRISE_TEMPLATE_CANCELLATION,
      guarantee: FILTER_ENTERPRISE_TEMPLATE_GUARANTEE,
      deposit: FILTER_ENTERPRISE_TEMPLATE_DEPOSIT
    },
    policy: FILTER_ENTERPRISE_POLICY,
    'payment-deposit-rule': FILTER_PAYMENT_DEPOSIT_RULE
  }
};
