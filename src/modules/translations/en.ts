/**
 * class used to store translations for missing keys
 */
export class En {
    /**
     * variable to store translated keys
     */
    translations: any;

    /**
     * used to initialize values
     */
    constructor() {
        this.translations = {
            'global_PolicyTemplates-LblPolicyTemplates': 'Policy Templates',
            'page_EnterpisePolicyTemplate-LblEnterprisePolicyTemplate': 'Enterprise Policy Templates',
            'global_Policies-LblPolicies': 'Policies',
            'global_EnterprisePolicies-LblPolicies': 'Enterprise Policies',
            'BUTTON_CREATE.NEW.POLICYTEMPLATE': 'Create New Policy Template',
            'BUTTON_CREATE.NEW.POLICY': 'Create New Policy',
            'page_CreateNewPolicyTemplateGuarantee-LblCreateNewPolicyTemplateGuarantee': 'Create New Policy Template -- Guarantee',
            'global_PolicyTemplateDetails-LblPolicyTemplateDetails': 'Policy Template Details',
            'global_PolicyTemplateName-LblPolicyTemplateName': 'Policy Template Name',
            'global_PolicyTemplateCode-LblPolicyTemplateCode': 'Policy Template Code',
            'ERROR.ENTER_A_POLICY_TEMPLATE_NAME': 'Enter a Policy Template Name',
            'ERROR.POLICY_TEMPLATE_NAME_MUST_BE_UNIQUE': 'Policy Template Name must be unique',
            'global_AcceptedTender-LblAcceptedTender': 'Accepted Tender',
            'global_AcceptAll-LblAcceptAll': 'Accept All',
            'global_CorporateID-LblCorporateID': 'Corporate ID',
            'global_CreditCard-LblCreditCard': 'Credit Card',
            'global_HotelBillingCallCenterOnly-LblHotelBillingCallCenterOnly': 'Hotel Billing (Call Center Only)',
            'global_Iata-LblIata': 'IATA',
            'global_RateAccessCode-LblRateAccessCode': 'Rate Access Code',
            'global_LateArrival-LblLateArrival': 'Late Arrival',
            'global_FieldUsedByGDSODDOnly-LblFieldUsedByGDSODDOnly': 'This field is used by the GDS/ODD only.',
            'global_HoldUtil-LblHoldUtil': 'Hold Until',
            'global_00WithoutPayment-Lbl00WithoutPayment': ':00 without payment',
            'LABEL_TEXT.HOUR': 'HH',
            // tslint:disable-next-line:object-literal-key-quotes
            global_distributionmessages_LblDistributionMessages: 'Distribution Messages',
            // tslint:disable-next-line:object-literal-key-quotes
            global_MessageLanguage_LblMessageLanguage: 'Message Language',
            'BUTTON_TEXT.CONTINUE': 'Continue',
            'global_Cancel-LblButton': 'Cancel',
            'global_OnlineCallCenterMessage-LblOnelineCallCenterMessage': 'Online/Call Center Message',
            'global_GDSMessageEnglishOnly-LblGDSMessageEnglishOnly': 'GDS Message (English only)',
            'global_OnlineCallCenterPenaltyMessage-LblOnlineCallCenterPenaltyMessage': 'Online/Call Center Penalty Message',
            'global_GDSPenaltyMessageEnglishOnly-LblGDSPenaltyMessageEnglishOnly': 'GDS Penalty Message (English only)',
            'global_GdsFullyPrepaidRateNotification-LblGdsFullyPrepaidRateNotification': 'GDS Fully Prepaid Rate Notification',
            'global_RateRequires100Deposit-LblRateRequires100Deposit': 'Rate requires 100% deposit',
            'BUTTON_TEXT.SAVE_ACTIVE': 'Save and Activate',
            'global_SaveAsInactive-LblSaveAsInactive': 'Save as Inactive',
            'BUTTON_TEXT.EDIT': 'Edit',
            'BUTTON_TEXT.VIEW': 'View',
            'global_YouAreAboutToCancelTheCreationOfYourNewPolicyTemplate-LblYouAreAboutToCancelTheCreationOfYourNewPolicyTemplate':
                'You are about to cancel the creation of your new Policy Template. Click OK to cancel this Policy Template creation.',
            'page_CreateNewPolicyTemplateCancellation-LblCreateNewPolicyTemplateCancellation':
                'Create New Policy Template -- Cancellation',
            'global_CreateNewPolicyTemplateDeposit-LblCreateNewPolicyTemplateDeposit': 'Create New Policy Template -- Deposit',
            'BUTTON_TEXT.OK': 'OK',
            'guestEngagement.warning': 'Warning',
            'page_EditEnterprisePolicyGuarantee-LblEditEnterprisePolicyGuarantee': 'Edit Enterprise Policy - Guarantee',
            'page_EditEnterprisePolicyCancellation-LblEditEnterprisePolicyCancellation': 'Edit Enterprise Policy - Cancellation',
            'page_EditEnterprisePolicyDeposit-LblEditEnterprisePolicyDeposit': 'Edit Enterprise Policy - Deposit',
            'ERROR.MISSING_OR_INVALID_INPUT_VALUE': 'Missing or Invalid Entry Value',
            'acceptedTenderGuaranteeId.9': 'IATA',
            'acceptedTenderGuaranteeId.14': 'Corporate ID',
            'acceptedTenderGuaranteeId.17': 'Accept All',
            'acceptedTenderGuaranteeId.16': 'Credit Card',
            'acceptedTenderGuaranteeId.18': 'Rate Access Code',
            'acceptedTenderGuaranteeId.20': 'Hotel Billing (Call Center Only)',
            'COMPONENTS.DROPDOWN.SELECT': 'Select',
            'global_required-LblRequired': 'Required',
            'acceptedTenderDepositId.8': 'Credit Card, Alternate Payments',
            'acceptedTenderDepositId.1': 'IATA',
            'page_SelectDepositRule-LblSelectDepositRule': 'Select Deposit Rule',
            'page_ViewDepositRule-LblViewDepositRule': 'View Deposit Rule',
            'page_ViewDepositConfiguration-LblViewDepositConfiguration': 'View Deposit Configuration',
            'ERROR.LATE_ARRIVAL_TIME_MUST_BE_CHOSEN': 'Late Arrival time must be selected.',
            'ERROR.SELECT_VALID_SAMEDAY_HOUR': 'Select a valid Same Day',
            'ERROR.SELECT_CXLNOTICE': 'Select a Cancellation Notice',
            'page_DepositRuleDetails-LblDepositRuleDetails': 'Deposit Rule Details',
            'page_DepositConfigurationDetails-LblDepositConfigurationDetails': 'Deposit Configuration Details',
            'global_RuleName-LblRuleName': 'Rule Name',
            'global_ChargeDate-LblChargeDate': 'Charge Date',
            'page_TimeOfBooking-LblTimeOfBooking': 'Time of Booking',
            'global_Action-LblAction': 'Action',
            'global_Charge-LblCharge': 'Charge',
            'global_Type-LblType': 'Type',
            'page_ArrivalDayCharge-LblArrivalDayCharge': 'Arrival Day Charge',
            'global_Flat-LblFlat': 'Flat',
            'global_Percentage-LblPercentage': 'Percentage',
            'global_Amount-LblAmount': 'Amount',
            'page_EnhancementAndOptionCharges-LblEnhancementOptionCharges': 'Enhancement and Option Charges',
            'ERROR.PAYMENT_DEPOSIT_RULE_DETAIL_NOT_CREATED': 'Payment Deposit Rule Details have not been created.',
            // tslint:disable-next-line:object-literal-key-quotes
            DEPOSIT_RULE_INFO_NOT_FOUND: 'No Deposit rule found for this property',
            'global_Active-LblActive': 'Active',
            'global_Inactive-LblInactive': 'Inactive',
            'page_{{#}}Night(s)-Lbl{{#}}Nights': '{{#}} Night(s)',
            'page_{{#}}Flat-Lbl{{#}}Flat': '{{#}} Flat',
            'page_{{#}}Percent-Lbl{{#}}Percent': '{{#}} Percent',
            'page_CancellationNotice-LblCancellationNotice': 'Cancellation Notice',
            'global_OTACancellationChargeNotification-LblOTACancellationChargeNotification': 'OTA Cancellation Charge Notification',
            'page_FreeCancellation-LblFreeCancellation': 'Free Cancellation',
            'global_NightsRoomTax-LblNightsRoomTax': 'Night(s) Room & Tax',
            'global_AdvanceNotice-LblAdvanceNotice': 'Advance Notice',
            'global_Enterprise-LblEnterprise': 'Enterprise',
            'global_Actions-LblActions': 'Actions',
            'global_MakeInactive-LblMakeInactive': 'Make Inactive',
            'global_MakeActive-LblMakeActive': 'Make Active',
            'global_ManageCancellationPolicy-LblManageCancellationPolicy': 'Manage Cancellation Policy',
            'global_ManageDepositPolicy-LblManageDepositPolicy': 'Manage Deposit Policy',
            'global_ManageGuaranteePolicy-LblManageGuranteePolicy': 'Manage Guarantee Policy',
            'global_ViewVersionHistory-LblViewVersionHistory': 'View Version History',
            'page_100%DepositRequired-Lbl100%DepositRequired': '100% Deposit Required',
            'global_ShowFilters-LblShowFilters': 'Show Filters',
            'global_hidefilters-LblHideFilters': 'Hide Filters',
            'global_All-LblAll': 'All',
            'global_Both-LblBoth': 'Both',
            'global_PolicyTemplateStatus-LblPolicyTemplateStatus': 'Policy Template Status',
            // tslint:disable-next-line:object-literal-key-quotes
            global_PolicyStatus_LblPolicyStatus: 'Policy Status',
            'global_NoRecordsFound-LblNoRecordsFound': 'No records found',
            // tslint:disable-next-line:object-literal-key-quotes
            global_Search_LblSearch: 'Search',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 300 }]*/
            'global_ChangesToPolicyTemplatesAffectAllPoliciesCreatedWithTheTemplate-LblChangesToPolicyTemplatesAffectAllPoliciesCreatedWithTheTemplate': 'Changes to Policy Templates affect all policies created with the template. Click OK to edit this Policy Template.',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 250 }]*/
            'global_YouAreAboutToCancelTheEditsToYourPolicyTemplate-LblYouAreAboutToCancelTheEditsToYourPolicyTemplate': 'You are about to cancel the edits to your Policy Template. Click OK to cancel editing this Policy Template.',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 250 }]*/
            'global_YouAreAboutToCancelTheCreationOfYourNewPolicy-LblYouAreAboutToCancelTheCreationOfYourNewPolicy': 'You are about to cancel the creation of your new Policy. Click OK to cancel creation of this Policy.',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            'global_PleaseEnterAdvanceNoticeDaysOrHours-MsgPleaseEnterAdvanceNoticeDaysOrHours': 'Please enter advance notice days or hours',
            'BUTTON_TEXT.DONE': 'Done',
            'global_HoldUntil-LblHoldUntil': 'Hold until',
            'page_CreateNewPolicyCancellation-LblCreateNewPolicyCancellation': 'Create New Policy -- Cancellation',
            'page_CreateNewPolicyDeposit-LblCreateNewPolicyDeposit': 'Create New Policy -- Deposit',
            'page_CreateNewPolicyGuarantee-LblCreateNewPolicyGuarantee': 'Create New Policy -- Guarantee',
            // tslint:disable-next-line: max-line-length
            /*eslint max-len: ["error", { "code": 250 }]*/
            'page_ShowingStartIndex-EndIndexofTotalCountPolicyTemplates-LblShowingStartIndex-EndIndexofTotalCountPolicyTemplates': 'Showing {{startIndex}} - {{endIndex}} of {{totalCount}} Policy Templates',
            // tslint:disable-next-line: object-literal-key-quotes
            global_show_records: 'Showing {{start}} - {{end}} of {{totalCount}}',
            // tslint:disable-next-line:object-literal-key-quotes
            // tslint:disable-next-line: max-line-length
            /*eslint max-len: ["error", { "code": 200 }]*/
            'page_ShowingStartIndex-EndIndexofTotalCountPolicies-LblShowingStartIndex-EndIndexofTotalCountPolicies': 'Showing {{startIndex}} - {{endIndex}} of {{totalCount}} Policies',
            'ERROR.DEPOSITRULE_NO_LONGER_EXISTS': 'Deposit Rule no longer exists',
            'global_PolicyLvlAssignment-LblPolicyLvlAssignment': 'Policy Level Assignment',
            'global_PolicyDetails-LblPolicyDetails': 'Policy Details',
            'PLACEHOLDER_TEXT.FILTERS': 'Filters',
            'global_main-filterLbl': 'Filter',
            // tslint:disable-next-line:object-literal-key-quotes
            global_ClearAll_LblClearAll: 'Clear All',
            // tslint:disable-next-line:object-literal-key-quotes
            global_Property_LblProperty: 'Property',
            'global_ChainCategory(s)-LblChainCategory(s)': 'Chain Category(s)',
            // tslint:disable-next-line:object-literal-key-quotes
            global_RateCategory_LblRateCategory: 'Rate Category',
            'global_RateCategory(s)-LblRateCategory(s)': 'Rate Category(s)',
            'global_RateCategories-RateCategoriesLbl': 'Rate Categories',
            // tslint:disable-next-line:object-literal-key-quotes
            global_RatePlan_LblRatePlan: 'Rate Plan',
            global_RateCatalog_LblRateCatalog: 'Rate Catalog',
            global_EmRateCategory_LblEmRateCategory: 'Enterprise Rate Category',
            'global_RatePlans-LblRatePlans': 'Rate Plan(s)',
            'global_RatePlans-LblRatePlansNoBracket': 'Rate Plans',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            'page_RatePlanLevelPoliciesRatePlanMax-LblRatePlanLevelPoliciesRatePlanMax': 'Rate Plan Level Policies allow a maximum of 20 Rate Plans.',
            'ERROR.RATEPLAN_MAX_REACHED': 'Policy allows a maximum of 20 Rate Plans. Reduce the number of selected Rate Plans.',
            'ERROR.LEVEL_MUST_BE_ASSIGNED_TO_POLICY': 'A level must be assigned to the policy',
            'global_ExpandAll-LblExpandAll': 'Exapnd All',
            // tslint:disable-next-line:object-literal-key-quotes
            global_PolicyName_LblPolicyName: 'Policy Name',
            // tslint:disable-next-line:object-literal-key-quotes
            global_PolicyDetails_LblPolicyDetails: 'Policy Details',
            // tslint:disable-next-line:object-literal-key-quotes
            page_PolicyNameIsRequired_MsgPolicyNameIsRequired: 'Policy Name is required',
            'ERROR.POLICY_NAME_MUST_BE_UNIQUE': 'Policy Name must be unique',
            'page_PolicyTemplate-LblPolicyTemplate': 'Policy Template',
            'ERROR.POLICY_TEMPLATE_MUST_BE_SELECTED': 'Policy Template is required to be selected.',
            'global_PolicyType-LblPolicyType': 'Policy Type',
            'page_DefaultDatedInfoMsgGtdDep-LblDefaultDatedInfoMsgGtdDep':
                // tslint:disable-next-line:max-line-length
                /*eslint max-len: ["error", { "code": 250 }]*/
                'Policy Type Default: Makes the Guarantee/Deposit Policy the default Guarantee/Deposit policy for the property.  ↵↵Dated: Defines the effective date range for the policy. If the Policy has no end date, check the No End Date box.',
            'page_DefaultDatedInfoMsgCxl-LblDefaultDatedInfoMsgCxl':
                // tslint:disable-next-line:max-line-length
                /*eslint max-len: ["error", { "code": 250 }]*/
                'Policy Type Default: Makes the Cancellation Policy the default Cancellation policy for the property.  ↵↵Dated: Defines the effective date range for the policy. If the Policy has no end date, check the No End Date box.',
            'global_Default-LblDefault': 'Default',
            // tslint:disable-next-line:object-literal-key-quotes
            global_dated_LblDated: 'Dated',
            // tslint:disable-next-line:object-literal-key-quotes
            global_DateRange_LblDate: 'Date Range',
            'global_DateRange(s)-LblDateRange(s)': 'Date Ranges(s)',
            'COMPONENTS.DATEPICKER.NO_END_DATE': 'No End Date',
            'global_AddAnotherDateRange-LblAddAnotherDateRange': 'Add another date range',
            'page_OverrideOtherPolicies-LblOverrideOtherPolicies': 'Override Other Policies',
            'page_OverrideOtherPolciesInfoMsg-MsgOverrideOtherPolciesInfoMsg':
                'If selected, this policy displays to guests and overrides all policies set for this time period.',
            'PLACEHOLDER_TEXT.FILTER': 'Filter',
            // tslint:disable-next-line:object-literal-key-quotes
            global_enable_Installments_lbl: 'Enable Installments',
            // tslint:disable-next-line:object-literal-key-quotes
            page_Enableinstallments_isonlyactive_whenthe_DepositRule_issetto100Room_andPackage:
                'Enable installments is active when the Deposit Rule is set to 100% Room and Package Charge.',
            // tslint:disable-next-line:object-literal-key-quotes
            Charge_Theinstallments_optionisonly_available_forAmadeus_paymentcustomers_whosigned_upforinstallment_services_msg:
                'The installments option is available for Amadeus payment customers with installment services enabled.',
            page_EnableInstallmentsInfo_MsgEnableInstallmentsInfo: 'Enable installments is active when the Deposit Configuration is set to 100% Room and Package Charge.',
            'daysshort.sun': 'Sun',
            'daysshort.mon': 'Mon',
            'daysshort.tue': 'Tue',
            'daysshort.wed': 'Wed',
            'daysshort.thu': 'Thu',
            'daysshort.fri': 'Fri',
            'daysshort.sat': 'Sat',
            'global_Level-LdlLevel': 'Level',
            'page-AllRateCategoriesSelected_LblAllRateCategoriesSelected': 'All Rate Categories Selected',
            'page-RateCategory(s)Selected_LblRateCategory(s)Selected': '{{count}} Rate Category(s) Selected',
            'page-SelectRateCategories_LblSelectRateCategories': 'Select Rate Categories',
            'page-CollapseAll_LblCollapseAll': 'Collapse All',
            'page-AllRatePlansSelected_LblAllRatePlansSelected': 'All Rate Plans Selected',
            'page-RatePlan(s)Selected_LblRatePlan(s)Selected': '{{count}} Rate Plan(s) Selected',
            'page-SelectRatePlans_LblSelectRatePlans': 'Select Rate Plans',
            'page-ChainCategoriesSelected_LblChainCategoriesSelected': '{{count}} Chain Categories Selected',
            'page-AllChainCategoriesSelected_LblAllChainCategoriesSelected': 'All Chain Categories Selected',
            'page-SelectChainCategories_LblSelectChainCategories': 'Select Chain Categories',
            'page-SelectAll_LblSelectAll': 'Select all',
            // tslint:disable-next-line: max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            'page_DefaultCancellationInfoMsg-MsgDefaultCancellationInfoMsg': 'Makes the Cancellation Policy the default Cancellation policy for the property.',
            // tslint:disable-next-line: max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            'page_DatedInfoMsg-MsgDatedInfoMsg': 'Defines the effective date range for the policy. If the Policy has no end date, check the No End Date box.',
            // tslint:disable-next-line: max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            'page_DefaultGuaranteeDepositInfoMsg-MsgDefaultGuaranteeDepositInfoMsg': 'Makes the Guarantee/Deposit Policy the default Guarantee/Deposit policy for the property.',
            'BUTTON_TEXT.CLEAR_DATES': 'Clear Dates',
            'ERROR.ENTER_VALID_STARTDATE': 'Enter a valid start date.',
            'ERROR.ENTER_VALID_ENDDATE': 'Enter a valid end date.',
            'ERROR.DATE_RANGE_MUST_BE_UNIQUE': 'Date range(s) must be unique.',
            'global_Remove-LblRemove': 'Remove',
            'ERROR.ONE_DAYOFWEEK_MUST_BE_SELECTED': 'At least one day of the week must be selected.',
            'ERROR.END_DATE_MUST_NOT_EXCEED_LASTCALENDERDATE': 'End date must not exceed {{lastcalendardate}}',
            'global_ViewDates-LblViewDates': 'View Dates',
            'global_ViewRateCategories-LblViewRateCategories': 'View Rate Categories',
            'global_ViewRatePlans-LblViewRatePlans': 'View Rate Plans',
            'global_ViewChainCategories-LblViewChainCategories': 'View Chain Categories',
            'page_PolicyActiveDates-LblPolicyActiveDates': 'Policy Active Dates',
            'global_PolicyEndsIn-LblPolicyEndsIn': 'Policy Ends in',
            'page_PolicyAssignmentLevel-LblPolicyAssignmentLevel': 'Policy Assignment Level',
            'page_lastModifiedSort-txtLastModifiedSort': 'Sort by last modified date',
            global_sort_by_last_modified_date_ascending_lbl: 'Sort by Last Modified Date Ascending',
            global_sort_by_last_modified_date_descending_lbl: 'Sort by Last Modified Date Descending',
            'page_A-ZNameSort-txtA-ZNameSort': 'Sort by name (A-Z)',
            'page_EarliestModifiedSort-txtEarliestModifiedSort': 'Sort by oldest modified date',
            'page_Z-ANameSort-txtZ-ANameSort': 'Sort by name (Z-A)',
            // tslint:disable-next-line: max-line-length
            'page_PleaseEnterValidStartDate&EndDatetoMakePolicyActive-LblPleaseEnterValidStartDate&EndDatetoMakePolicyActive':
                'Please enter valid start date and end date to make policy active.',
            'global_Selectionisrequired-LblSelectionisrequired': 'Selection is required',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            'page_MerchandisedRefundablePolicyAsFreeCancellation-LblMerchandisedRefundablePolicyAsFreeCancellation': 'Merchandise Refundable Policy as Free Cancellation',
            // tslint:disable-next-line:max-line-length
            /*eslint max-len: ["error", { "code": 350 }]*/
            'page_FreeCancellationInfoMsg-MsgFreeCancellationInfoMsg': 'By selecting Free Cancellation your guests booking on the Booking Engine, or through select Metasites, will be informed that the Rate Plans associated with this Cancellation Policy will not be charged a Cancellation fee as long they cancel outside of the Cancellation window.',
            'version-history-label': 'Version History',
            'page_backtogroups-Lblbacktogroups': 'Back to Groups',
            'global_installments_lbl-LblInstallments': 'Installments',
            'global_active_lbl-LblActive': 'Active',
            'global_inactive_lbl-LblInactive': 'Inactive',
            'global_both_lbl-LblBoth': 'Both',
            'global_DepositRules-LblPaymentDepositRules': 'Deposit Configuration',
            'BUTTON_CREATE.NEW.PAYMENT_DEPOSIT_RULE': 'Create New Deposit Configuration',
            'global_PolicyTemplates-LblViewPolicyTemplates': 'View Policy Templates',
            'global_PolicyTemplates-LblViewPolicies': 'View Policies',
            global_ViewDepositConfigurations_LblViewDepositConfigurations: 'View Deposit Configurations',
            'page_ShowingStartIndex-EndIndexofTotalCountPolicyTemplates-LblShowingStartIndex-EndIndexofTotalCountPaymentDepositRules': 'Showing {{startIndex}} - {{endIndex}} of {{totalCount}} Deposit Configurations',
            'global_DepositConfiguration-LblDepositConfigurationName': 'Deposit Configuration Name',
            'ERROR.ENTER_A_DEPOSIT_CONFIGURATION_NAME': 'Enter a Deposit Configuration Name',
            'ERROR.ENTER_CHARGE_AMOUNT': 'Enter the amount value(s)',
            'ERROR.ENTER_AMOUNT': 'Enter the amount',
            'ERROR.ENTER_PERCENTAGE': 'Enter the percentage',
            'ERROR.ENTER_PERCENT_ON_ENHANCEMENT': 'Enter the Percentage on Enhancements',
            'ERROR.SELECT_CURRENCY': 'Select a currency',
            'ERROR.SELECT_ALL_CURRENCIES': 'Please enter an amount for every currency available',
            'page_CreateNewEnterpriseDepositConfiguration-LblCreateNewEnterpriseDepositConfiguration': 'Create New Enterprise Deposit Configuration',
            'page_CreateNewPropertyDepositConfiguration-LblCreateNewPropertyDepositConfiguration': 'Create New Property Deposit Configuration',
            'global_DepositConfiguration-LblNumberOfDepositConfigurations': '# of deposit configurations in this grouping',
            'global_DepositConfiguration-LblConfiguration': 'Configuration',
            'global_DepositConfiguration-LblPercentageAmount': 'Percentage Amount',
            'global_DepositConfiguration-LblFlatAmount': 'Flat Amount',
            'global_DepositConfiguration-LblArrivalDay': 'Arrival Day Charge',
            'global_Chain-ChainLbl': 'Chain',
            'global_chainCategories_lbl-LblChainCategories': 'Chain Categories',
            'global_AllStatus-LblAllStatus': 'All',
            'page_SelectDepositConfiguration-LblSelectDepositConfiguration': 'Select Deposit Configuration',
            'BUTTON_TEXT.SAVE': 'Save',
            'page_EditEnterprisePaymentDepositConfiguration-LblEditEnterprisePaymentDepositConfiguration': 'Edit Enterprise Deposit Configuration',
            'page_EditPropertyDepositConfiguration-LblEditPropertyDepositConfiguration': 'Edit Property Deposit Configuration',
            'global_DepositConfiguration-LblDepositConfigurationDetails': 'Deposit Configuration Details',
            'global_DepositConfiguration-LblDepositConfigurationRules': 'Deposit Configuration Rules',
            // tslint:disable-next-line:max-line-length
            // eslint-disable-next-line max-len
            'global_YouAreAboutToCancelTheCreationOfYourNewDepositConfiguration-LblYouAreAboutToCancelTheCreationOfYourNewDepositConfiguration': 'You are about to cancel the creation of your new Deposit Configuration. Click OK to cancel creation of this Deposit Configuration.',
            // tslint:disable-next-line:max-line-length
            // eslint-disable-next-line max-len
            'global_YouAreAboutToCancelTheEditsToYourDepositConfiguration-LblYouAreAboutToCancelTheEditsToYourDepositConfiguration': 'You are about to cancel the changes to your Deposit Configuration. Click OK to cancel editing this Deposit Configuration.',
            'global_DepositConfiguration-LblChargeType': 'Room and Package Charge Type',
            'global_DepositConfiguration-LblChargeAmountAndCurrency': 'Room and Package Charge Amount and Currency',
            'global_DepositConfiguration-LblChargePercentage': 'Room and Package Charge Percentage',
            'global_DepositConfiguration-LblChargeEnhancementAndOption': 'Enhancement and Option Charges',
            'page_EnhancementAndOptionChargesWebOnly-LblEnhancementOptionCharges': 'Enhancement and Option Charges (Web Only)',
            'page_PercentOnEnhancements-LblPercentOnEnhancements': 'Percent on Enhancements',
            'page_RoomAndPackageCharges-LblRoomAndPackageCharges': 'Room and Package Charges',
            'page_AddAmount-LblAddAmount': 'Add amount',
            'global_DepositConfiguration-LblAddAnotherDepositConfiguration': 'Add another configuration',
            'global_DepositConfiguration-LblRemoveDepositConfiguration': 'Remove configuration',
            'page_currency-LblCurrency': 'Currency',
            // tslint:disable-next-line:max-line-length
            // eslint-disable-next-line max-len
            'global_ChangesToDepositConfigurationsAffectsAllPolicyTemplatesCreatedWithTheSelectedConfiguration-LblChangesToDepositConfigurationsAffectsAllPolicyTemplatesCreatedWithTheSelectedConfiguration': 'Changes to the Deposit Configuration affects all policy templates created with the configuration. Click OK to edit this Deposit Configuration.',
            'page_CreateNewEnterprisePolicyCancellation-LblCreateNewEnterprisePolicyCancellation': 'Create New Enterprise Policy - Cancellation',
            'page_CreateNewEnterprisePolicyDeposit-LblCreateNewEnterprisePolicyDeposit': 'Create New Enterprise Policy - Deposit',
            'page_CreateNewEnterprisePolicyGuarantee-LblCreateNewEnterprisePolicyGuarantee': 'Create New Enterprise Policy - Guarantee',
            'ERROR.AT_LEAST_ONE_CHAINCATEGORY_MUST_BE_ASSIGNED': 'At least one Chain Category must be assigned to the Policy.',
            page_FailedCountOfTotalCountPropertiesFailed_LblFailedCountOfTotalCountPropertiesFailed: '{{failedCount}} of {{totalCount}} Properties Failed',
            'page_createprocessissues-LblCreateProcessIssues': 'Create Process - Issues',
            'global_Property-LblProperty': 'Property',
            'page_View Errors-LblViewErrors': 'View Errors',
            'page_Resolution-LblResolution': 'Resolution',
            'global_Export-LblExport': 'Export',
            // tslint:disable-next-line:max-line-length
            // eslint-disable-next-line max-len
            page_FollowingPolicyTemplatesAreLinkedToDepositConfigurationToDelete_MsgToContinuePleaseUpdatePolicyTemplatesWithDifferentDepositConfigurationBeforeDeleting: 'The following policy templates are linked to the deposit configuration you would like to delete.\n In order to continue, please update these policy templates with a different deposit configuration before deleting the requested deposit configuration.',
            global_LinkedPolicyTemplates_LblLinkedPolicyTemplates: 'Linked Policy Templates',
            'page_DepositPolicyTemplateName-LblDepositPolicyTemplateName': 'Deposit Policy Template Name',
            'page_HotelName-LblHotelName': 'Hotel Name',
            'page_HotelCode-LblHotelCode': 'Hotel Code',
            'page_Context-LblContext': 'Context',
            'page_CancellationNoticeValue-LblCancellationNoticeValue': 'Cancellation Notice Value',
            'page_PolicyDistributionDetails-LblPolicyDistributionDetails': 'Policy Distribution Details',
            'global_OwnerType-LblOwnerType': 'Owner Type',
            'global_OwnerCode-LblOwnerCode': 'Owner Code',
            'global_Id-LblId': 'ID',
            'page_FollowingPoliciesContainDatesThatOverlapWithSelectedDefaultPolicy-MsgUpdateThesePoliciesInOrderToSetTheCurrentPolicyToTheDefaultPolicy': 'The following policies contain dated that overlap with the selected default policy. Update these policies in order to set the current policy to the default policy.',
            global_PolicyOverlap_LblPolicyOverlap: 'Overlap Policy',
            'global_GDSMessageLine1-LblGDSMessageLine1': 'GDS Message (English only) Line 1',
            'global_GDSMessageLine2-LblGDSMessageLine2': 'GDS Message (English only) Line 2',
            'page_issue-LblIssue': 'Issue',
        };
    }
}
