import { Component, Input, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { SubscriptionLike } from 'rxjs';
import {
    IPolicyStepContinueEvent, POLICY_STEPS, IPolicyDetailsRulesData,
    IPolicyDetailsErrorModel, IDateSelector, IDateRange, DaysOfWeek, ITemplateListItemModel
} from '../policy-mgmt-create-policy.model';
import { PolicyMgmtCreateTemplateModalComponent } from './create-template-modal/policy-mgmt-create-template-modal.component';
import { PolicyMgmtPolicyStepperDataService } from '../policy-mgmt-policy-stepper-data.service';
import { TranslationMap } from '../../../core/translation.constant';
import { SharedDataService } from '../../../core/shared.data.service';
import { PolicyMgmtStepPolicyDetailsService } from './policy-mgmt-step-policy-details.service';
import { POLICY_FLOW, POLICY_LEVEL, POLICY_TYPE } from '../../../core/constants';
import { ContextService } from '../../../core/context.service';
import { ErrorMessage } from '../../../core/common.model';
import * as moment from 'moment';
import { DEFAULT_DATED_POLICY_TYPE } from '../.././../core/rules.constant';
import { PolicyMgmtCreateTemplateService } from '../../template/policy-mgmt-create-template.service';
import { PolicyMgmtUtilityService } from '../../../core/utility.service';
import { assetURL }  from '../../../constants/constants';

@Component({
    selector: 'policy-mgmt-step-policy-details',
    templateUrl: './policy-mgmt-step-policy-details.component.html',
    styleUrls: ['./policy-mgmt-step-policy-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PolicyMgmtStepPolicyDetailsComponent implements OnInit, OnDestroy {
    /**
     * Input parameters from parent component
     */
    @Input() continueFromStepper: Subject<any>;
    /**
     * Output from component to parent
     */
    @Output() validate: EventEmitter<IPolicyStepContinueEvent> = new EventEmitter();

    continueSubscriberRef: SubscriptionLike;

    /**
     * View child reference
     */
    @ViewChild(PolicyMgmtCreateTemplateModalComponent, { static: false }) createTemplateModal: PolicyMgmtCreateTemplateModalComponent;

    /**
     * create policy step2: policy details - rules data
     */
    rulesData: IPolicyDetailsRulesData;

    /**
     * Translation Map
     */
    translationMap: any;

    /**
     * Holds Todays/current date as per property timezone
     */
    currentDate: Date;

    /**
     * Policy Template dropdown default index
     */
    policyTemplateDefaultIndex: number;

    /**
     *  Holds Policy type Info Msg
     */
    policyTypeInfoMsg: string;

    /**
     * ErrorObject holder for step2
     */
    errorObj: IPolicyDetailsErrorModel;

    /**
     * Holds Default/Dated policy type const
     */
    defaultDatedPolicyType: any;

    /**
     * Holds template list items
     */
    templateItemList: Array<ITemplateListItemModel>;

    /**
     * Object contains DateRange and DayOfWeek selection
     * Passed as input to DateSelector component
     */
    dateSelector: IDateSelector;
    publicPath: string;

    constructor(
        private stepperDataService: PolicyMgmtPolicyStepperDataService,
        private sharedDataService: SharedDataService,
        private policyDetailsService: PolicyMgmtStepPolicyDetailsService,
        private contextService: ContextService,
        private createTemplateService: PolicyMgmtCreateTemplateService,
        private policyMgmtUtilityService: PolicyMgmtUtilityService
    ) {
        this.translationMap = TranslationMap;
        this.defaultDatedPolicyType = DEFAULT_DATED_POLICY_TYPE;
        this.policyTypeInfoMsg = this.contextService.policyType === POLICY_TYPE.CANCELLATION
            ? 'INFO_MSG_CXL'
            : 'INFO_MSG_GTD_DEP';

        this.errorObj = {
            policyNameErrorMessage: new ErrorMessage(),
            policyTemplateErrorMessage: new ErrorMessage(),
            startDateErrorMessage: new ErrorMessage(),
            endDateErrorMessage: new ErrorMessage(),
            dowErrorMessage: new ErrorMessage(),
            dateRangeErrorMessage: new ErrorMessage()
        };
        this.publicPath = assetURL;
    }

    ngOnInit() {
        this.continueSubscriberRef = this.continueFromStepper.subscribe((evt: IPolicyStepContinueEvent) => {
            this.validateStep(evt);
        });
        this.rulesData = this.stepperDataService.getPolicyDetailsData();

        // Set Default index of policy template dropdown
        this.policyTemplateDefaultIndex = this.rulesData.data.policyTemplateList.findIndex(template => {
            return template.id === this.rulesData.fields.policyTemplate;
        });
        if (this.policyTemplateDefaultIndex === -1) {
            this.updateTemplateListItemInPreviewEdit();
        }

        if (this.rulesData.fields.policyType === DEFAULT_DATED_POLICY_TYPE.dated) {
            this.setDateRangeAndDow();
        }
    }

    /**
     * Set dateRange and dayOfWeek if in edit mode, else set to default
     */
    setDateRangeAndDow() {
        if(this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          const timezone = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo().timezone : null;
          this.currentDate = this.policyDetailsService.getStartDate(timezone);
        } else {
          this.currentDate = new Date(new Date().setHours(0, 0, 0, 0));
        }
        this.rulesData.fields.ruleStartDate = this.currentDate;

        if (!this.rulesData.fields.dateRange[0].startDate) {
            this.rulesData.fields.dateRange[0].startDate = this.currentDate;
        }
        const maxSelectableDate = moment(this.currentDate).add(6, 'year').toDate();
        const dateRanges: Array<IDateRange> = [];
        const dateRangeLength = this.rulesData.fields.dateRange.length;
        this.rulesData.fields.dateRange.forEach((dateRange, index) => {
            dateRanges.push({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate ? dateRange.endDate : '',
                minSelectableDate: this.currentDate,
                maxSelectableDate,
                noEndDateCheckedFlag: dateRangeLength === 1 && index === 0 && !dateRange.endDate
            });
        });
        this.dateSelector = {
            dateRanges,
            dows: this.rulesData.fields.dayOfWeek
        };
    }

    validateStep(evt: IPolicyStepContinueEvent) {
        this.errorObj = this.policyDetailsService.validateStepsData(this.rulesData.fields);
        let isValidData = true;
        for (const error in this.errorObj) {
            if (this.errorObj[error].show) {
                isValidData = false;
                break;
            }
        }
        if (isValidData) {
            this.stepperDataService.setPolicyDetailsData(this.rulesData.fields);
            this.validate.emit({
                stepNumber: POLICY_STEPS.POLICY_DETAILS,
                eventType: evt.eventType
            });
        }
    }

    /**
     * Used to open Cereate Template Popup
     */
    onCreateTemplate() {
        this.createTemplateModal.open();
        this.createTemplateService.templatePopUp = true;
    }

    ngOnDestroy() {
        this.continueSubscriberRef.unsubscribe();
    }

    /**
     * This function is called onChange Event when any changes are made to Policy Name Input
     * @param event: event
     */
    policyNameChange(event: any) {
        if (event !== '') {
            this.errorObj.policyNameErrorMessage.show = false;
        }
    }

    onPolicyTemplateSelectionChange(event: any) {
        this.rulesData.fields.policyTemplate = event.selectedObject.id;
        this.policyTemplateDefaultIndex = event.selectedIndex;
        this.errorObj.policyTemplateErrorMessage.show = false;
    }

    setPolicyType(policyTypeSelected: string) {
        this.rulesData.fields.policyType = policyTypeSelected;
        // Reset DateRange to Default Values
        if (policyTypeSelected === DEFAULT_DATED_POLICY_TYPE.dated) {
            this.rulesData.fields.dateRange = [{ startDate: '', endDate: '' }];
            this.rulesData.fields.dayOfWeek = new DaysOfWeek();
            this.setDateRangeAndDow();
        }
    }

    onOverridePoliciesChange() {
        this.rulesData.fields.overridePolicies = !this.rulesData.fields.overridePolicies;
    }

    /**
     * listens to any any change to dateSelector date/dow
     * @param event: dateSelector emitted data
     */
    onDateChanged(event) {
        this.rulesData.fields.dayOfWeek = event.dows;
        this.rulesData.fields.dateRange = event.dateRanges;
        const ruleFields = this.rulesData.fields;

        if (ruleFields.dateRange) {
            const dateRangeFlag = this.policyDetailsService.validateStartEndDate(ruleFields.dateRange);
            if (!dateRangeFlag.startDateFlag) {
                this.errorObj.startDateErrorMessage.show = false;
            }
            if (!dateRangeFlag.endDateFlag) {
                this.errorObj.endDateErrorMessage.show = false;
            }
            if (this.policyDetailsService.validateDistinctDateRange(ruleFields.dateRange)) {
                this.errorObj.dateRangeErrorMessage.show = true;
            } else {
                this.errorObj.dateRangeErrorMessage.show = false;
            }
        }

        if (ruleFields.dayOfWeek) {
            if (this.policyDetailsService.validateDow(ruleFields.dayOfWeek)) {
                this.errorObj.dowErrorMessage.show = true;
            } else {
                this.errorObj.dowErrorMessage.show = false;
            }
        }
    }

    /**
     * Adding newly created template into TemplateList array
     */
    updateTemplateList() {
        const templateItemDropdwonList = this.rulesData.data.policyTemplateList;
        const templateItem = this.policyDetailsService.getTemplateListItem();
        this.templateItemList = [];
        if (templateItem) {
            templateItemDropdwonList.push(templateItem);
            this.templateItemList = this.policyMgmtUtilityService.customSort(1, 'name', templateItemDropdwonList);
            this.rulesData.data.policyTemplateList = this.templateItemList;
        }
        // this.setTemplateAsSelectd();
    }

    /**
     * Setting newly created template as selected in TemplateList dropdown
     */
    setTemplateAsSelectd() {
        const templateItem = this.policyDetailsService.getTemplateListItem();
        if (templateItem) {
            const index = this.rulesData.data.policyTemplateList.findIndex(template => {
                return template.id === templateItem.id;
            });
            this.rulesData.fields.policyTemplate = templateItem.id;
            this.policyTemplateDefaultIndex = index;
            this.errorObj.policyTemplateErrorMessage.show = false;
        }
    }

    /**
     * Updating temlate list items in preview section of policy details
     */
    updateTemplateListItemInPreviewEdit() {
        if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
            this.updateTemplateList();
            this.setTemplateAsSelectd();
        }
    }
}
