/* Angular-Module Imports */
import { Component, Injector, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';

/* Third Party Module Imports */
import { Subject } from 'rxjs';

/* TC-module Imports */
import { TcTranslateService } from 'tc-angular-services';
import { PolicyMgmtConfirmationModalComponent } from '../../common/confirmation-modal/confirmation-modal.component';
import { POLICY_FLOW, CONFIG_TYPE, POLICY_LEVEL } from '../../core/constants';
import { TranslationMap } from '../../core/translation.constant';
import { PolicyMgmtService } from '../../policy-mgmt.service';
import { IEmPaymentDepositRulesResponseModel } from '../../search/policy-mgmt-search.model';
import { PolicyMgmtCreateComponent } from '../policy-mgmt-create.component';
import {
  IDepositConfigurationStepContinueEvent,
  DEPOSIT_CONFIGURATION_STEPS,
  IPropertyPaymentDepositRulesResponseModel
} from './payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationCreateService } from './payment-deposit-configuration-create.service';
import { PaymentDepositConfigurationStepperDataService } from './payment-deposit-configuration-stepper-data.service';
import { IHttpErrorResponse, IPostApiResponse } from '../../core/common.model';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { DEPOSIT_CONFIGURATION_OWNER_TYPE } from 'src/modules/core/rules-config.constant';

@Component({
  selector: 'payment-deposit-configuration-create',
  templateUrl: './payment-deposit-configuration-create.component.html',
  styleUrls: ['./payment-deposit-configuration-create.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaymentDepositConfigurationCreateComponent extends PolicyMgmtCreateComponent implements OnInit {

  /**
   * Parent to child subject events to let child component know CONTINUE is clicked
   */
  continueDepositConfigurationName: Subject<any>;
  continueDepositConfigurationDetails: Subject<any>;
  continuePropertyDepositConfigurationDetails: Subject<any>;

  /**
   * Flag to check if component's required global data is loaded or not
   */
  componentInitialized: boolean;

  /**
   * Holds translation Map
   */
  translationMap: any;

  /**
   * Holds header for Create/Edit flow
   */
  flowHeading: string;

  /**
   * Holds deposit configuration id for the template Edit flow
   */
  depositConfigurationId: number;

  /**
   * Holds deposit configuration name for teh template Edit flow
   */
  depositConfigurationNameHeader: string;

  /**
   * Flag describes whether user has edit permission or not
   */
  hasEditAccess: boolean;

  /**
   * Indicates if enterprise level
   */
  isEnterpriseLevel: boolean;

  /**
   * Indicates if deposit configuration created at enterprise level
   */
  isDepositConfigurationCreatedAtEnterprise: boolean;

  /**
   * View child reference
   */
  @ViewChild(PolicyMgmtConfirmationModalComponent, { static: false }) confirmationModal: PolicyMgmtConfirmationModalComponent;

  /**
     * Event emitter for create template modal close functionality
     */
  @Output() closePopUp: EventEmitter<any> = new EventEmitter();

  constructor(
    injector: Injector,
    private policyMgmtService: PolicyMgmtService,
    private paymentDepositConfigurationCreateService: PaymentDepositConfigurationCreateService,
    private stepperDataService: PaymentDepositConfigurationStepperDataService,
    private errorService: PolicyMgmtErrorService,
    private translate: TcTranslateService,
  ) {
    super(injector);
    this.continueDepositConfigurationName = new Subject<any>();
    this.continueDepositConfigurationDetails = new Subject<any>();
    this.continuePropertyDepositConfigurationDetails = new Subject<any>();
    this.componentInitialized = false;
    this.translationMap = TranslationMap;

    this.activatedRoute.queryParams.subscribe(params => {
      this.depositConfigurationId = params.id ? Number(params.id) : null;
    });
    this.contextService.setPolicyFlow(POLICY_FLOW.CREATE);
    this.isEnterpriseLevel = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;
  }

  ngOnInit(): void {
    this.translate.translateService.get(this.translationMap['CANCELLATION']).subscribe(() => {
      this.messages = {
        cancel: this.translate.translateService.instant(this.translationMap.CANCEL),
        continue: this.translate.translateService.instant(this.translationMap.CONTINUE),
        done: this.translate.translateService.instant(this.translationMap.DONE),
        edit: this.translate.translateService.instant(this.translationMap.EDIT),
      };
      this.steps = [{
        active: true,
        completed: false,
        header: this.translate.translateService.instant(this.translationMap.DEPOSIT_CONFIGURATION_NAME),
        stepNumber: 1
      }, {
        active: false,
        completed: false,
        header: this.translate.translateService.instant(this.translationMap.DEPOSIT_CONFIGURATION_DETAILS),
        stepNumber: 2
      }];
      this.flowHeading = this.translate.translateService.instant(this.translationMap[
        this.setDepositConfigurationFlowHeading()
      ]);
      this.keepLastStepActive();
      this.hasEditAccess = this.contextService.hasEditAccess();
    });
    this.isEnterpriseLevel = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;
    this.initializeGlobalData();
  }

  setDepositConfigurationFlowHeading(): string {
    const flowHeading = this.contextService.policyFlow.toUpperCase() + '_'
      + this.contextService.policyLevel.toUpperCase() + '_'
      + 'PAYMENT_DEPOSIT_CONFIGURATION';
    return flowHeading;
  }

  async initializeGlobalData() {
    await this.policyMgmtService.loadGlobalData();

    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      if (this.isEnterpriseLevel) {
        this.paymentDepositConfigurationCreateService.getPaymentDepositConfigurationData(this.depositConfigurationId)
          .subscribe((res: IEmPaymentDepositRulesResponseModel) => {
            this.depositConfigurationNameHeader = res.emPaymentDepositRuleTemplateName;
            this.stepperDataService.setResponseModel(res);
            this.componentInitialized = true;
          });
      } else {
        this.paymentDepositConfigurationCreateService.getPropertyPaymentDepositConfigurationData(this.depositConfigurationId)
          .subscribe((res: IPropertyPaymentDepositRulesResponseModel) => {
            this.depositConfigurationNameHeader = res.paymentDepositRuleName;
            this.stepperDataService.setPropertyResponseModel(res);
            this.componentInitialized = true;
            this.isDepositConfigurationCreatedAtEnterprise = res.ownerType === DEPOSIT_CONFIGURATION_OWNER_TYPE.ENTERPRISE;
          });
      }
    } else {
      this.stepperDataService.InitializeResponseModel();
      this.componentInitialized = true;
    }
  }

  onDepositConfigurationStepsValidated(evt: IDepositConfigurationStepContinueEvent) {
    if (evt.eventType === 'SAVE') {
      this.createUpdatePaymentDepositConfiguration();
    } else {
      super.onDepositConfigurationStepsValidated(evt);
    }
  }

  /**
   * Brings data required for Create/Update POST/PUT call, makes call and handles response
   */
  createUpdatePaymentDepositConfiguration() {
    if (this.isEnterpriseLevel) {
      const paymentDepositConfigurationData = this.stepperDataService.getResponseModel();
      this.paymentDepositConfigurationCreateService
        .createUpdatePaymentDepositConfiguration(paymentDepositConfigurationData)
        .subscribe({
          next: (res: IPostApiResponse) => {
            if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
              this.goToSpecificRoute(POLICY_FLOW.SEARCH);
            }
          }, error: (error: IHttpErrorResponse) => {
            this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
            this.showErrorToast(true);
          }
        });
    } else {
      const paymentDepositConfigurationData = this.stepperDataService.getPropertyResponseModel();
      this.paymentDepositConfigurationCreateService
        .createUpdatePropertyPaymentDepositConfiguration(paymentDepositConfigurationData)
        .subscribe({
          next: () => {
            if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
              this.goToSpecificRoute(POLICY_FLOW.SEARCH);
            }
          }, error: (error: IHttpErrorResponse) => {
            this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
            this.showErrorToast(true);
          }
        });
    }
  }

  /**
   * Continue click event handler
   * @param stepNumber
   * @param eventType
   */
  onContinue(stepNumber: number, eventType: string = null) {
    const evt: IDepositConfigurationStepContinueEvent = {
      stepNumber,
      eventType
    };
    switch (stepNumber) {
      case DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_NAME:
        this.continueDepositConfigurationName.next(evt);
        break;
      case DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_DETAILS:
        this.isEnterpriseLevel ?
          this.continueDepositConfigurationDetails.next(evt) :
          this.continuePropertyDepositConfigurationDetails.next(evt);
        break;
    }
  }

  /**
   * Save click event handler
   */
  onSave(type: string) {
    if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
      this.onContinue(DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_DETAILS, type);
    } else {
      this.onDepositConfigurationStepsValidated({
        stepNumber: null,
        eventType: type
      });
    }
  }

  /**
   * Cancel click event handler
   * @param evt : step index
   */
  onCancel(evt: any) {
    if ((this.contextService.policyFlow === POLICY_FLOW.EDIT
      && (!this.hasEditAccess || this.isDepositConfigurationCreatedAtEnterpriseLevel()))) {
      this.goToSpecificRoute(POLICY_FLOW.SEARCH);
    } else {
      const modalContent = this.contextService.policyFlow === POLICY_FLOW.CREATE
        ? 'CONFIRMATION_ON_CANCEL_CREATE_DEPOSIT_CONFIGURATION_FLOW'
        : 'CONFIRMATION_ON_CANCEL_EDIT_DEPOSIT_CONFIGURATION_FLOW';

      this.confirmationModal.open(modalContent, 'WARNING', { type: 'CONFIRMATION_ON_CANCEL' });
      super.onCancel(evt);
    }
  }

  /**
   * Stepper Edit click handler
   * @param stepIndex: step index
   */
  onEdit(stepIndex: any) {
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      this.confirmationModal.open('CONFIRMATION_ON_EDIT_DEPOSIT_CONFIGURATION_FLOW', 'WARNING', { stepIndex });
    }
  }

  /**
   * On confirmation modal Ok click
   * @param evt: Event
   */
  onModalOk(evt: Event) {
    super.onModalOk(evt);
  }

  /**
   * On confirmation modal cancel click
   * @param evt: modal type
   */
  onModalCancel(evt: any) {
    if (evt.hasOwnProperty('stepIndex')) {
      this.onContinue(evt.stepIndex);
    }
    super.onModalCancel(evt);
  }

  /**
   * function to check if deposit configuration is created at enterprise level
   */
  isDepositConfigurationCreatedAtEnterpriseLevel(): boolean {
    return (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY && this.contextService.policyFlow === POLICY_FLOW.EDIT)
      ? this.isDepositConfigurationCreatedAtEnterprise
      : false;
  }

  /**
   * function display save buttons
   */
  displaySaveButton(): boolean {
    return this.isDepositConfigurationCreatedAtEnterpriseLevel() ? false : this.hasEditAccess;
  }
}
