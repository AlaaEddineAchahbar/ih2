import {
    CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS
} from '../../core/rules-config.constant';
import { ITemplateDetailsRulesData, ILanguageList } from './policy-mgmt-create-template.model';
import { IDistributionMsgRulesData } from './policy-mgmt-create-template.model';
import { IDropDownItem } from '../../core/common.model';

export enum CREATE_TEMPLATE_STEPS {
    TEMPLATE_DETAILS = 'template_details',
    DISTRIBUTION_MESSAGE = 'distribution_message'
}

const CANCELLATION_NOTICE_LIST = [
    CANCELLATION_OPTIONS.SAME_DAY,
    CANCELLATION_OPTIONS.ADVANCE_NOTICE,
    CANCELLATION_OPTIONS.NON_REFUNDABLE
];

const OTA_CANCELLATION_CHARGE_LIST = [
    OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX,
    OTA_CANCELLATION_CHARGE_OPTIONS.FLAT,
    OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE
];

export const GUARANTEE_ACCEPTED_TENDER_LIST: Array<number> = [17, 14, 16, 20, 9, 18];

export const DEPOSIT_ACCEPTED_TENDER_LIST: Array<number> = [8, 1];

export const DEFAULT_ADVANCE_NOTICE = {
    PRIOR_DAYS: 0,
    PRIOR_HOURS: 0
};

const LATE_ARRIVAL_TIME: Array<IDropDownItem> = [
    {
        id: 13,
        name: '13'
    },
    {
        id: 14,
        name: '14'
    },
    {
        id: 15,
        name: '15'
    },
    {
        id: 16,
        name: '16'
    },
    {
        id: 17,
        name: '17'
    },
    {
        id: 18,
        name: '18'
    },
    {
        id: 19,
        name: '19'
    },
    {
        id: 20,
        name: '20'
    },
    {
        id: 21,
        name: '21'
    }
];

const MESSAGE_LANG_LIST: Array<ILanguageList> = [
    {
        id: 1,
        name: 'English',
        code: 'EN_US',
    },
    {
        id: 2,
        name: 'Français',
        code: 'FR_FR'
    },
    {
        id: 8,
        name: 'Italiano',
        code: 'IT_IT',
    },
    {
        id: 4,
        name: 'Português',
        code: 'PT_PT',
    },
    {
        id: 38,
        name: 'Bulgarian',
        code: 'BG_BG',
    }
];

const DEPOSIT_RULE: Array<IDropDownItem> = [
    {
        id: 1,
        name: '100% Deposit Rule'
    },
    {
        id: 2,
        name: 'Deposit Rule A'
    },
    {
        id: 3,
        name: 'Deposit Rule B'
    },
];

// Property level templates

export const CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS: ITemplateDetailsRulesData = {
    fields: {
        policyTemplateName: '',
        policyTemplateCode: '',
        cancellationNotice: '',
        sameDayNoticeTime: null,
        advanceNotice: { days: DEFAULT_ADVANCE_NOTICE.PRIOR_DAYS, hours: DEFAULT_ADVANCE_NOTICE.PRIOR_HOURS },
        isFreeCancellation: false,
        otaCancellationChargeNotification: '',
        otaNightRoomNTaxAmt: null,
        otaFlatAmt: null,
        otaPercentageAmt: null
    },
    data: {
        cancellationNotice: [...CANCELLATION_NOTICE_LIST],
        sameDayNoticeList: [],
        otaCancellationChargeNotification: [...OTA_CANCELLATION_CHARGE_LIST]
    }

};

export const CREATE_TEMPLATE_PROPERTY_GUARANTEE_TEMPLATE_DETAILS: ITemplateDetailsRulesData = {
    fields: {
        policyTemplateName: '',
        policyTemplateCode: '',
        acceptedTender: null,
        lateArrivalTime: null,
    },
    data: {
        acceptedTender: [],
        lateArrivalTime: [...LATE_ARRIVAL_TIME]
    }
};

export const CREATE_TEMPLATE_PROPERTY_DEPOSIT_TEMPLATE_DETAILS: ITemplateDetailsRulesData = {
    fields: {
        policyTemplateName: '',
        policyTemplateCode: '',
        acceptedTender: null,
        depositRule: null,
        viewDepositRule: false,
        isInstallmentEnabled: false
    },
    data: {
        acceptedTender: [],
        depositRule: [...DEPOSIT_RULE]
    }

};

export const CREATE_TEMPLATE_PROPERTY_CANCELLATION_DISTRIBUTION_MSG: IDistributionMsgRulesData = {
    fields: {
        messageLanguage: null,
        textList: {
            onlineCCMessage: {},
            gdsMessage: {
                gdsLine1: {},
                gdsLine2: {}
            },
        }
    },
    data: {
        messageLanguage: [...MESSAGE_LANG_LIST]
    }
};

export const CREATE_TEMPLATE_PROPERTY_GUARANTEE_DISTRIBUTION_MSG: IDistributionMsgRulesData = {
    fields: {
        messageLanguage: null,
        textList: {
            onlineCCMessage: {},
            gdsMessage: {
                gdsLine1: {},
                gdsLine2: {}
            },
        }
    },
    data: {
        messageLanguage: [...MESSAGE_LANG_LIST]
    }
};

export const CREATE_TEMPLATE_PROPERTY_DEPOSIT_DISTRIBUTION_MSG: IDistributionMsgRulesData = {
    fields: {
        messageLanguage: null,
        textList: {
            onlineCCMessage: {},
            gdsMessage: {
                gdsLine1: {},
                gdsLine2: {}
            },
        },
        gdsRateNotification: false,
    },
    data: {
        messageLanguage: [...MESSAGE_LANG_LIST]
    }
};

// Enterprise level templates

export const CREATE_TEMPLATE_ENTERPRISE_CANCELLATION_TEMPLATE_DETAILS: ITemplateDetailsRulesData
= {...CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS};

export const CREATE_TEMPLATE_ENTERPRISE_GUARANTEE_TEMPLATE_DETAILS: ITemplateDetailsRulesData
= {...CREATE_TEMPLATE_PROPERTY_GUARANTEE_TEMPLATE_DETAILS};

export const CREATE_TEMPLATE_ENTERPRISE_DEPOSIT_TEMPLATE_DETAILS: ITemplateDetailsRulesData
= {...CREATE_TEMPLATE_PROPERTY_DEPOSIT_TEMPLATE_DETAILS};

export const CREATE_TEMPLATE_ENTERPRISE_CANCELLATION_DISTRIBUTION_MSG: IDistributionMsgRulesData
= {...CREATE_TEMPLATE_PROPERTY_CANCELLATION_DISTRIBUTION_MSG};

export const CREATE_TEMPLATE_ENTERPRISE_GUARANTEE_DISTRIBUTION_MSG: IDistributionMsgRulesData
= {...CREATE_TEMPLATE_PROPERTY_GUARANTEE_DISTRIBUTION_MSG};

export const CREATE_TEMPLATE_ENTERPRISE_DEPOSIT_DISTRIBUTION_MSG: IDistributionMsgRulesData
= {...CREATE_TEMPLATE_PROPERTY_DEPOSIT_DISTRIBUTION_MSG};

const CREATE_TEMPLATE_ENTEPRISE_CANCELLATION_TEMPLATE_DETAILS = {...CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS};
const CREATE_TEMPLATE_ENTEPRISE_CANCELLATION_DISTRIBUTION_MSG = {...CREATE_TEMPLATE_PROPERTY_CANCELLATION_DISTRIBUTION_MSG};

const CREATE_TEMPLATE_ENTEPRISE_GUARANTEE_TEMPLATE_DETAILS = {...CREATE_TEMPLATE_PROPERTY_GUARANTEE_TEMPLATE_DETAILS};
const CREATE_TEMPLATE_ENTEPRISE_GUARANTEE_DISTRIBUTION_MSG = {...CREATE_TEMPLATE_PROPERTY_GUARANTEE_DISTRIBUTION_MSG};

const CREATE_TEMPLATE_ENTEPRISE_DEPOSIT_TEMPLATE_DETAILS = {...CREATE_TEMPLATE_PROPERTY_DEPOSIT_TEMPLATE_DETAILS};
const CREATE_TEMPLATE_ENTEPRISE_DEPOSIT_DISTRIBUTION_MSG = {...CREATE_TEMPLATE_PROPERTY_DEPOSIT_DISTRIBUTION_MSG};

export const TEMPLATE_CONFIG = {
    property: {
        cancellation: {
            template_details: CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS,
            distribution_message: CREATE_TEMPLATE_PROPERTY_CANCELLATION_DISTRIBUTION_MSG
        },
        guarantee: {
            template_details: CREATE_TEMPLATE_PROPERTY_GUARANTEE_TEMPLATE_DETAILS,
            distribution_message: CREATE_TEMPLATE_PROPERTY_GUARANTEE_DISTRIBUTION_MSG
        },
        deposit: {
            template_details: CREATE_TEMPLATE_PROPERTY_DEPOSIT_TEMPLATE_DETAILS,
            distribution_message: CREATE_TEMPLATE_PROPERTY_DEPOSIT_DISTRIBUTION_MSG
        }
    },
    enterprise: {
        cancellation: {
            template_details: CREATE_TEMPLATE_ENTERPRISE_CANCELLATION_TEMPLATE_DETAILS,
            distribution_message: CREATE_TEMPLATE_ENTERPRISE_CANCELLATION_DISTRIBUTION_MSG
        },
        guarantee: {
            template_details: CREATE_TEMPLATE_ENTERPRISE_GUARANTEE_TEMPLATE_DETAILS,
            distribution_message: CREATE_TEMPLATE_ENTERPRISE_GUARANTEE_DISTRIBUTION_MSG
        },
        deposit: {
            template_details: CREATE_TEMPLATE_ENTERPRISE_DEPOSIT_TEMPLATE_DETAILS,
            distribution_message: CREATE_TEMPLATE_ENTERPRISE_DEPOSIT_DISTRIBUTION_MSG
        }
    }
};

export const DEPOSIT_CONFIGURATION_CONSTANTS = {
    CHARGE_DATE: 'TIME_OF_BOOKING',
    CHARGE_ACTION: 'CHARGE',
    ARRIVAL_DAY_CHARGE: 'ARRIVAL_DAY_CHARGE',
};

