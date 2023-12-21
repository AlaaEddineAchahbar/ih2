
export const GLOBAL_CONFIG = {
  PRODUCTION: true,
  LOCAL_BACK_END: false
};

export const API_CONTEXT_PATH = {
  CHAIN_API: 'ihchain/v1',
  IHONBOARDING: 'ihonboarding/v1',
  POLICY_MGMT: 'policy-mgmt/v1',
  PROPERTY_INFO: 'propertyinfo/v1',
  PRICING_API: 'pricing-api',
  PRICING_API_V2: 'pricing-api-v2'
};

export const API_LOCAL_PATH = {
  IHONBOARDING: 'http://localhost:8060/',
  POLICY_MGMT: 'http://localhost:8070/'
};

/** Holds user permissions */
export enum USER_PERMISSIONS {
  NONE = '1',
  VIEW = '2',
  EDIT = '3'
}

export const HOTEL_SETTING_TYPE = {
  NEW_POLICIES: '306'
};

/** constant defining API response status */
export const API_RESPONSE_CODE = {
  GET_SUCCESS: 200,
  POST_SUCCESS: 201,
  PUT_SUCCESS: 204,
  PATCH_SUCCESS: 200,
  DELETE_SUCCESS: 200,
  NOT_FOUND_404: 404
};

export enum POLICY_LEVEL {
  PROPERTY = 'property',
  ENTERPRISE = 'enterprise'
}

export enum CONFIG_TYPE {
  POLICY = 'policy',
  TEMPLATE = 'template',
  DEPOSIT_CONFIGURATION = 'payment-deposit-rule'
}

export enum POLICY_TYPE {
  CANCELLATION = 'cancellation',
  GUARANTEE = 'guarantee',
  DEPOSIT = 'deposit'
}

/**
 * Used for sending policy-type in API request
 */
export enum POLICY_TYPE_FOR_API {
  cancellation = 'CANCEL',
  guarantee = 'GUARANTEE',
  deposit = 'DEPOSIT'
}

export enum POLICY_FLOW {
  SEARCH = 'search',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete'
}

export const POLICY_CONFIG = {
  DEFAULT_POLICY_TYPE: POLICY_TYPE.CANCELLATION
};

/**
 * Holds Default values
 * 1. acceptedTenderDropdown
 */
export const DEFAULT_VALUES = {
  acceptedTenderDropdown: {
    defaultGuaranteeId: 16,
    defaultDepositId: 8,
    acceptAllIdForLateArrival: 17
  },
  messageLangDropdown: {
    defaultLangCode: 'EN_US',
    defaultLangId: 1,
    defaultLangName: 'English (US)'
  },
  searchScreen: {
    pagination: {
      pageSize: 25,
      startPageIndex: 1,
      page: 1
    },
    acceptedTenderRadioDefaultValue: 0
  },
  datePickerUIFormat: 'DD-MMM-YYYY',
  datePickerAPIFormat: 'YYYY-MM-DD',
  datePickerMaxSelectableYears: 6,
  ratePlanSelectionLimit: 20
};

export const PAYMENT_PROCESSING_STATUS = {
  DEPOSIT: 'Deposit',
  DISABLED: 'Disabled'
};

export const PAYMENT_AUX_CONFIGS = {
  auxConfigValue: 'true',
  auxConfigTypeId: 17
};

export const ACCEPTED_TENDER_OBJECT = {
  id: 8,
  name: 'Credit Card, Alternate Payments'
};

export const DEPOSITE_RULE_PERCENTAGE = {
  percentage: '100'
};

export const ERROR_CODES = {
  POLICY_TEMPLATE_NAME_MUST_BE_UNIQUE: 'POLICY_TEMPLATE_NAME_MUST_BE_UNIQUE',
  'Policy name already exists': 'POLICY_NAME_MUST_BE_UNIQUE',
  DEPOSITRULE_NO_LONGER_EXISTS: 'DEPOSIT_RULE_INFO_NOT_FOUND',
  DEPOSIT_RULE_INFO_NOT_FOUND: 'DEPOSIT_RULE_INFO_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT'
};

export const RATE_CATEGORIES = ['Rack', 'Promotional', 'Discount', 'Package', 'Corporate', 'Negotiated', 'Consortia',
  'Group Block', 'Group/Convention', 'OTA Merchant', 'Channel Management', 'In House', 'Tour/WHSL-FREESL', 'TOUR/WHSL-ALLOT'];

export const Weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
/**
 * DayOfWeek Enum - Day to number mapping
 */
export enum dayOfweekEnum {
  SUN = '1',
  MON = '2',
  TUE = '3',
  WED = '4',
  THU = '5',
  FRI = '6',
  SAT = '7',
}

/**
 * Menu code in the UE action context
 * The values can be found in ALLHOTDB.ACTION_CONTEXT_UE table
 */
export const POST_MESSAGE = {
  template: 'POLICY_TEMPLATE',
  policies: 'NEW_POLICIES',
  GROUPS: 'GROUPS_1',
  depositConfiguration: 'DEPOSIT_CONFIGURATION'
};

export const POST_MESSAGE_ENT = {
  template: 'POLICY_TEMPLATE_ENT',
  policies: 'POLICY_ENT',
  GROUPS: 'GROUPS_1',
  depositConfiguration: 'DEPOSIT_RULES_ENT'
};

export const API_ENDPOINT = {
  PRICING: 'https://pricing{{apiEnv}}.travelclick.com/api/',
  PRICING_V2: 'https://pricing{{apiEnv}}.travelclick.com/rules-engine/v2/rules/'
};

export const API_CONTEXT_PLACEHOLDER = {
  MODULE_CONTEXT_PATH: '{{api_module_context_path}}',
  API_ENV: '{{apiEnv}}'
};

export enum FILTER_TYPE {
  EQUAL = 'EQUAL',
  INNERSET = 'INNERSET'
}

export enum SORT_DIRECTION {
  Ascending = 'A',
  Descending = 'D'
}

export const MODIFIED_DATE = 'MODIFIED_DATE';

export const DEPOSIT_RULE_CONFIGURATION_PATH_PATTERN = /^payment-deposit-rule(\?id=\d+)?$/;

export const BASE_ICON_PATH = 'assets-policy-mgmt/icons/TravelClick-Icons-V1-0.svg';

export const MAX_PAGE_SIZE = 10000;
