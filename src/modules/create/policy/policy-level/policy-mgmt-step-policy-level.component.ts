import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { SubscriptionLike } from 'rxjs';
import { IPolicyStepContinueEvent, POLICY_STEPS, IPolicyLevelRulesData, IPolicyLevelErrorModel } from '../policy-mgmt-create-policy.model';
import { PolicyMgmtPolicyStepperDataService } from '../policy-mgmt-policy-stepper-data.service';
import { TranslationMap } from '../../../core/translation.constant';
import { ENTERPRISE_POLICY_CREATION_LEVEL, ENTERPRISE_POLICY_LEVEL_FILTERS, PROPERTY_POLICY_CREATION_LEVEL } from '../../../core/rules-config.constant';
import { TcTranslateService } from 'tc-angular-services';
import { ErrorMessage } from '../../../core/common.model';
import { PolicyMgmtStepPolicyLevelService } from './policy-mgmt-step-policy-level.service';
import { IPolicyMetadata } from '../../../core/rules-metadata.model';
import { SharedDataService } from '../../../core/shared.data.service';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_METADATA_TYPE } from '../../../core/rules.constant';
import { ContextService } from '../../../core/context.service';
import { POLICY_FLOW, POLICY_LEVEL } from '../../../core/constants';
import { assetURL }  from '../../../constants/constants';

@Component({
    selector: 'policy-mgmt-step-policy-level',
    templateUrl: './policy-mgmt-step-policy-level.component.html',
    styleUrls: ['./policy-mgmt-step-policy-level.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PolicyMgmtStepPolicyLevelComponent implements OnInit, OnDestroy {

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
     * create policy step1: policy level - rules data
     */
    rulesData: IPolicyLevelRulesData;

    /**
     * Translation Map
     */
    translationMap: any;

    /**
     * Enums for policy-level, enterprise-policy-level, policy-flow
     */
    policyLevelEnum: any;
    enterprisePolicyLevelEnum: any;
    policyFlowEnum: any;

    /**
     * Dropdown Input Values
     */
    dropdownLabels: any;

    /**
     * ErrorObject holder for step1
     */
    errorObj: IPolicyLevelErrorModel;

    /**
     * Holds dropdown metadata for ratePlan and rateCategory
     * Used for list reset purpose
     */
    dropdownList: {
        ratePlanList: Array<IPolicyMetadata>,
        rateCategoryList: Array<IPolicyMetadata>
    };

    /**
     * Holds dropdown metadata for ratePlan and rateCategory
     * Used for list reset purpose
     */
    emDropdownList: {
        chainCategoryList: Array<IPolicyMetadata>,
        rateCatalogList: Array<IPolicyMetadata>,
        emRateCategoryList: Array<IPolicyMetadata>
    };

    /**
     * Holds Policy Flow create/edit
     */
    policyFlow: string;
    publicPath: string;

    emSelectedLevel: string;

    constructor(
        private stepperDataService: PolicyMgmtPolicyStepperDataService,
        private policyLevelService: PolicyMgmtStepPolicyLevelService,
        private translate: TcTranslateService,
        private sharedDataService: SharedDataService,
        private contextService: ContextService
    ) {
        this.translationMap = TranslationMap;
        this.policyLevelEnum = PROPERTY_POLICY_CREATION_LEVEL;
        this.enterprisePolicyLevelEnum = ENTERPRISE_POLICY_LEVEL_FILTERS;
        this.policyFlowEnum = POLICY_FLOW;
        this.policyFlow = this.contextService.policyFlow;
        this.dropdownLabels = {};
        this.errorObj = {
            policyLevelErrorMessage: new ErrorMessage()
        };
        this.dropdownList = {
            ratePlanList: this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.ratePlan),
            rateCategoryList: this.sharedDataService.getPolicyMetadata(POLICY_METADATA_TYPE.rateCategory)
        };

        this.emDropdownList = {
            rateCatalogList: this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs),
            emRateCategoryList: this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCategories),
            chainCategoryList: this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.chainCategories)
        };
        this.publicPath = assetURL;
    }

    ngOnInit() {
        this.continueSubscriberRef = this.continueFromStepper.subscribe((evt: IPolicyStepContinueEvent) => {
            this.validateStep(evt);
        });

        this.setDropdownLabels();
        this.rulesData = this.stepperDataService.getPolicyLevelData();
        this.setEmPolicyLevel();
    }

    validateStep(evt: IPolicyStepContinueEvent) {
        this.errorObj = this.policyLevelService.validateStepsData(this.rulesData.fields, this.emSelectedLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES);
        this.stepperDataService.setPolicyLevelData(this.rulesData.fields, this.emSelectedLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES);

        let isValidData = true;
        for (const error in this.errorObj) {
            if (this.errorObj[error].show) {
                isValidData = false;
                break;
            }
        }
        if (isValidData) {
            this.validate.emit({
                stepNumber: POLICY_STEPS.POLICY_LEVEL,
                eventType: evt.eventType
            });
        }
    }

    ngOnDestroy() {
        this.continueSubscriberRef.unsubscribe();
    }

    setPolicyLevel(level: string) {
        this.errorObj.policyLevelErrorMessage.show = false;

        // tslint:disable-next-line:max-line-length
        /*eslint max-len: ["error", { "code": 180 }]*/

        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
            this.rulesData.fields.policyLevel = level;
            this.rulesData.data.rateCategoryList = this.rulesData.fields.rateCategories = JSON.parse(JSON.stringify(this.dropdownList.rateCategoryList));
            this.rulesData.data.ratePlanList = this.rulesData.fields.ratePlans = JSON.parse(JSON.stringify(this.dropdownList.ratePlanList));
        } else {
            this.emSelectedLevel = level;
            this.rulesData.data.chainCategoryList = this.rulesData.fields.chainCategories = JSON.parse(JSON.stringify(this.emDropdownList.chainCategoryList));
            this.rulesData.data.rateCategoryList = this.rulesData.fields.rateCategories = JSON.parse(JSON.stringify(this.emDropdownList.emRateCategoryList));
            this.rulesData.data.ratePlanList = this.rulesData.fields.ratePlans = JSON.parse(JSON.stringify(this.emDropdownList.rateCatalogList));
            switch(level){
              case ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN:
              case ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES:
                this.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
                break;
              case ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES :
                this.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY;
                break;
              case ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS :
                this.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG;
                break;
            }
        }


    }

    /**
     * On Dropdown selection change, hide the errorMessage if any
     * @param evt: selected data
     */
    onSelectionChange(evt: any) {
        this.errorObj.policyLevelErrorMessage.show = false;
    }

    setDropdownLabels() {
        this.translate.translateService.get('FILTERS').subscribe(data => {
            this.dropdownLabels.placeholderText = this.getTranslatedField('FILTERS');
            this.dropdownLabels.customLabels = {
                selectAll: this.getTranslatedField('SELECT_ALL'),
                clearAll: this.getTranslatedField('CLEAR_ALL'),
                expandAll: this.getTranslatedField('EXPAND_ALL'),
                collapseAll: this.getTranslatedField('COLLAPSE_ALL')
            };

            this.dropdownLabels.defaultRatePlanText = [
                { selectionText: this.getTranslatedField('NUMBER_OF_RATE_PLANS_SELECTED').replace('{{count}}', '') },
                { selectionText: this.getTranslatedField('ALL_RATEPLANS_SELECTED') },
                { selectionText: this.getTranslatedField('DEFAULT_RATE_SELECT') }
            ];

            this.dropdownLabels.defaultRateCategoryText = [
                { selectionText: this.getTranslatedField('NUMBER_OF_RATE_CATEGORIES_SELECTED').replace('{{count}}', '') },
                { selectionText: this.getTranslatedField('ALL_RATE_CATEGORIES_SELECTED') },
                { selectionText: this.getTranslatedField('DEFAULT_RATE_CATEGORY_SELECT') }
            ];

            this.dropdownLabels.defaultChainCategoryText = [
                { selectionText: this.getTranslatedField('NUMBER_OF_CHAIN_CATEGORIES_SELECTED').replace('{{count}}', '') },
                { selectionText: this.getTranslatedField('ALL_CHAIN_CATEGORIES_SELECTED') },
                { selectionText: this.getTranslatedField('DEFAULT_CHAIN_CATEGORY_SELECT') }
            ];
        });
    }

    /**
     * Return translated field
     * @param field: field to translate
     */
    getTranslatedField(field: string, variableField?: any): string {
        return this.translate.translateService.instant(TranslationMap[field], variableField);
    }

    isChecked(item: string) {
      if(this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        return this.rulesData.fields.policyLevel === item;
      } else {
        return this.emSelectedLevel === item;
      }
    }

    setEmPolicyLevel(){
      switch(this.rulesData.fields.policyLevel){
        case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG:
          this.emSelectedLevel = ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS;
          break;
        case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY:
          this.emSelectedLevel = ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES;
          break;
        case ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE:
          if(this.stepperDataService.policyResponseModel?.chainCategoryIds?.length > 0){
            this.emSelectedLevel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES;
          } else {
            this.emSelectedLevel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN;
          }
          break;
      }
    }
}
