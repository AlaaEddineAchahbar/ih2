export const STYLE_ATTR = {
    BREAK_LINE: 'BREAK_LINE'
};

const LIST_CONFIG_PROPERTY_TEMPLATE_CANCEL = {
    fields: {
        itemList: [
            {
                type: 'text',
                text: 'CANCELLATION_NOTICE',
                key: 'cancellationRule',
                styleAttr: STYLE_ATTR.BREAK_LINE
            },
            {
                type: 'status',
                text: '',
                key: 'status'
            },
            {
                type: 'text',
                text: 'FREE_CANCELLATION',
                key: 'isFreeCancellation'
            },
            {
                type: 'text',
                text: 'OTA_CANCELLATION_CHARGE_NOTIFICATION',
                key: 'otaSetting'
            }
        ]
    }
};

const LIST_CONFIG_PROPERTY_TEMPLATE_GUARANTEE = {
    fields: {
        itemList: [
            {
                type: 'text',
                text: 'ACCEPTED_TENDER',
                key: 'acceptedTender',
                styleAttr: STYLE_ATTR.BREAK_LINE
            },
            {
                type: 'status',
                text: '',
                key: 'status'
            },
            {
                type: 'text',
                text: 'LATE_ARRIVAL',
                key: 'arrivalTime'
            }
        ]
    }
};

const LIST_CONFIG_PROPERTY_TEMPLATE_DEPOSIT = {
    fields: {
        itemList: [
            {
                type: 'text',
                text: 'ACCEPTED_TENDER',
                key: 'acceptedTender',
                styleAttr: STYLE_ATTR.BREAK_LINE
            },
            {
                type: 'status',
                text: '',
                key: 'status'
            },
            {
                type: 'text',
                text: 'DEPOSIT_RULE',
                key: 'depositeRule'
            },
            {
                type: 'installments',
                text: 'INSTALLMENTS_LABEL',
                key: 'isInstallmentEnabled'
            }
        ]
    }
};

const LIST_CONFIG_PROPERTY_POLICY = {
    fields: {
        itemList: [
            {
                type: 'text',
                text: '',
                key: 'templateName'
            },
            {
                type: 'link',
                text: '',
                key: 'date',
                styleAttr: STYLE_ATTR.BREAK_LINE,
                elemClasses: 'pipe-separator'
            },
            {
                type: 'status',
                text: '',
                key: 'status'
            },
            {
                type: 'text',
                text: 'DAY_OF_WEEK',
                key: 'dow'
            },
            {
                type: 'text',
                text: 'OVERRIDE_OTHER_POLICIES',
                key: 'rank'
            },
            {
                type: 'link',
                text: 'LEVEL',
                key: 'level'
            }
        ]
    }
};

const LIST_CONFIG_ENTERPRISE_PAYMENT_DEPOSIT_RULE = {
    fields: {
        itemList: [
            {
                type: 'text',
                text: '',
                key: 'chargeAmount',
                styleAttr: STYLE_ATTR.BREAK_LINE
            },
            /**{
                type: 'link',
                text: '',
                key: 'date',
                styleAttr: STYLE_ATTR.BREAK_LINE,
                elemClasses: 'pipe-separator'
            },*/
            {
                type: 'text',
                text: '',
                key: 'numberOfConfigurations'
            }
        ]
    }
};

const LIST_CONFIG_ENTERPRISE_TEMPLATE_CANCEL = { ...LIST_CONFIG_PROPERTY_TEMPLATE_CANCEL};
const LIST_CONFIG_ENTERPRISE_TEMPLATE_GUARANTEE = { ...LIST_CONFIG_PROPERTY_TEMPLATE_GUARANTEE };
const LIST_CONFIG_ENTERPRISE_TEMPLATE_DEPOSIT = { ...LIST_CONFIG_PROPERTY_TEMPLATE_DEPOSIT };

export const LIST_CONFIG = {
    property: {
        template: {
            cancellation: LIST_CONFIG_PROPERTY_TEMPLATE_CANCEL,
            guarantee: LIST_CONFIG_PROPERTY_TEMPLATE_GUARANTEE,
            deposit: LIST_CONFIG_PROPERTY_TEMPLATE_DEPOSIT
        },
        'payment-deposit-rule': LIST_CONFIG_ENTERPRISE_PAYMENT_DEPOSIT_RULE,
        policy: LIST_CONFIG_PROPERTY_POLICY
    },
    enterprise: {
        template: {
            cancellation: LIST_CONFIG_ENTERPRISE_TEMPLATE_CANCEL,
            guarantee: LIST_CONFIG_ENTERPRISE_TEMPLATE_GUARANTEE,
            deposit: LIST_CONFIG_ENTERPRISE_TEMPLATE_DEPOSIT
        },
        'payment-deposit-rule': LIST_CONFIG_ENTERPRISE_PAYMENT_DEPOSIT_RULE,
        policy: LIST_CONFIG_PROPERTY_POLICY
    }
};

