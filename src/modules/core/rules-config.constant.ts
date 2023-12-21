export enum CONFIG_RULES_FOR {
  FILTER = 'filter',
  LIST = 'list',
  CREATE_TEMPLATE = 'create-template',
  CREATE_POLICY = 'create-policy'
}

export enum STATUS_LIST {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  ALL_STATUS = 'ALL_STATUS'
}

export enum POLICY_OWNER {
  PROPERTY = 'PROPERTY',
  ENTERPRISE = 'ENTERPRISE',
  BOTH = 'BOTH'
}

export enum CANCELLATION_OPTIONS {
  SAME_DAY = 'SAME_DAY',
  ADVANCE_NOTICE = 'ADVANCE_NOTICE',
  NON_REFUNDABLE = 'NON_REFUNDABLE',
}

export enum ACCEPTED_TENDER_OPTIONS {
  ACCEPT_ALL = 'Accept All',
  CREDIT_CARD = 'Credit Card',
  CORPORATE_ID = 'Corporate Id',
  HOTEL_BILLING = 'Hotel Billing',
  CREDIT_CARD_ALTERNATE_PAYMENTS = 'Credit Card, Alternate Payments',
  IATA = 'IATA',
  RATE_ACCESS_CODE = 'Rate Access Code'
}

export enum PROPERTY_POLICY_CREATION_LEVEL {
  PROPERTY = 'PROPERTY',
  RATE_CATEGORY = 'RATECATEGORY',
  RATE_PLAN = 'RATEPLAN',
}

export enum ENTERPRISE_POLICY_CREATION_LEVEL {
  ENTERPRISE = 'ENTERPRISE',
  RATE_CATALOG = 'RATECATALOG',
  EM_RATE_CATEGORY = 'EMRATECATEGORY',
}

export enum ENTERPRISE_POLICY_LEVEL_FILTERS {
  CHAIN = 'CHAIN',
  CHAIN_CATEGORIES = 'CHAIN_CATEGORIES',
  RATE_PLANS = 'RATE_PLANS',
  RATE_CATEGORIES = 'RATE_CATEGORIES'
}

export enum COMMON_OPTIONS {
  ALL = 'ALL',
  BOTH = 'BOTH'
}

export enum PROPERTY_TEMPLATE_STEP_NAMES {
  POLICY_TEMPLATE_DETAILS = 'Policy Template Details',
  DISTRIBUTION_MESSAGES = 'Distribution Messages'
}

export enum OTA_CANCELLATION_CHARGE_OPTIONS {
  NIGHTS_ROOM_TAX = 'NIGHTS_ROOM_TAX',
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE'
}

/**
 * Used to transform distribution UI data to API format
 */
export enum DISTRIBUTION_MESSAGES {
  onlineCCMessage = 'ONLINE_CALL_CENTER_MESSAGE',
  onlineCCPenaltyMessage = 'online_call_center_penalty_message',
  gdsMessage = 'gds_message',
  gdsPenaltyMessage = 'policy_gds_penaltyline1_msg',
  gdsLine1 = 'POLICY_GDSLINE1_MSG',
  gdsLine2 = 'POLICY_GDSLINE2_MSG'
}

/**
 * Used to transform distribution API data to UI format
 */
export enum DISTRIBUTION_MESSAGES_GET {
  ONLINE_CALL_CENTER_MESSAGE = 'onlineCCMessage',
  online_call_center_penalty_message = 'onlineCCPenaltyMessage',
  gds_message = 'gdsMessage',
  policy_gds_penaltyline1_msg = 'gdsPenaltyMessage',
  POLICY_GDSLINE1_MSG = 'gdsLine1',
  POLICY_GDSLINE2_MSG = 'gdsLine2'
}

export enum INSTALLMENTS_LIST {
  ACTIVE = 'ACTIVE_TEXT',
  INACTIVE = 'INACTIVE_TEXT',
  BOTH = 'BOTH_TEXT',
}

export enum DEPOSIT_CONFIGURATION_CHARGE_TYPE {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
  ARRIVAL_DAY = 'arrivalDay'
}

export enum PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE {
  PERCENTAGE = 'Percentage',
  FLAT = 'Flat',
  ARRIVAL_DAY = 'ArrivalDay'
}

export enum PROPERTY_DEPOSIT_CONFIGURATION_STATUS {
  ADD = 'create',
  EDIT = 'update'
}

export enum DEPOSIT_CONFIGURATION_OWNER_TYPE {
  PROPERTY = 'P',
  ENTERPRISE = 'E'
}

export enum FILTER_TYPE_OPTIONS {
  LIKE = 'LIKE',
  EQUAL = 'Equal'
}

export enum POLICY_SETTING_OPTIONS {
  CANCELLATION_NOTICE = 'cancellationNotice',
  ACCEPTED_TENDER = 'acceptedTender',
  INSTALLMENTS = 'installments'
}
