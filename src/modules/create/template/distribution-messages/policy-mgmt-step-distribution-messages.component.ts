import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { Subject } from 'rxjs';
import {
    TEMPLATE_STEPS, IStepContinueEvent, IDistributionMsgRulesData
} from '../policy-mgmt-create-template.model';
import { PolicyMgmtTemplateStepperDataService } from '../policy-mgmt-template-stepper-data.service';
import { TranslationMap } from '../../../core/translation.constant';
import { DEFAULT_VALUES } from '../../../core/constants';

@Component({
    templateUrl: 'policy-mgmt-step-distribution-messages.component.html',
    selector: 'policy-mgmt-step-distribution-messages',
    styleUrls: ['./policy-mgmt-step-distribution-messages.component.scss']
})
export class PolicyMgmtStepDistributionMessagesComponent implements OnInit, OnDestroy {
    /**
     * Input parameters from parent component
     */
    @Input() continueFromStepper: Subject<IStepContinueEvent>;
    /**
     * Output from component to parent
     */
    @Output() validate: EventEmitter<IStepContinueEvent> = new EventEmitter();

    continueSubscriberRef: SubscriptionLike;
    rulesData: IDistributionMsgRulesData;
    selectedLangId: number;
    languageDefaultIndex: number;
    translationMap: any;

    constructor(
        private stepperDataService: PolicyMgmtTemplateStepperDataService
    ) {
        this.translationMap = TranslationMap;
    }
    ngOnInit() {
        this.continueSubscriberRef = this.continueFromStepper.subscribe((evt: IStepContinueEvent) => {
            this.validateStep(evt);
        });
        this.rulesData = this.stepperDataService.getDistributionMsgData();
        this.setDefaultIndex();
    }

    /**
     * Sets default index for dropdown
     */
    setDefaultIndex() {
        this.selectedLangId = DEFAULT_VALUES.messageLangDropdown.defaultLangId;
        this.languageDefaultIndex = this.rulesData.data.messageLanguage.findIndex(item => {
                return item.id === DEFAULT_VALUES.messageLangDropdown.defaultLangId;
        });
    }

    ngOnDestroy() {
        this.continueSubscriberRef.unsubscribe();
    }

    validateStep(evt: IStepContinueEvent) {
        this.stepperDataService.setDistributionMsgData(this.rulesData.fields);

        this.validate.emit({
            stepNumber: TEMPLATE_STEPS.DISTRIBUTION_MESSAGE,
            eventType: evt.eventType
        });
    }

    checkVisibility(key: string, params?: string) {
        let rulesData = this.rulesData.fields;
        if (params) {
            const paramsDelimiterArr = params.split('/');
            paramsDelimiterArr.forEach(item => {
                rulesData = rulesData[item];
            });
        }
        if (rulesData.hasOwnProperty(key)) {
            return true;
        } else {
            return false;
        }
    }

    onLanguageChange(selectionObject) {
        this.selectedLangId = Number(selectionObject.selectedObject.id);
        this.languageDefaultIndex = selectionObject.selectedIndex;
        this.rulesData.fields.messageLanguage = selectionObject.selectedObject.id;
    }

}
