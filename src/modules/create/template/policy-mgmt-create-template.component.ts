import { Component, OnInit, Injector, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { PolicyMgmtService } from '../../policy-mgmt.service';
import { PolicyMgmtCreateComponent } from '../policy-mgmt-create.component';
import { Subject, SubscriptionLike, filter } from 'rxjs';
import { POLICY_FLOW, POLICY_TYPE, CONFIG_TYPE, API_RESPONSE_CODE, PAYMENT_PROCESSING_STATUS, POLICY_LEVEL } from '../../core/constants';
import { PolicyMgmtConfirmationModalComponent } from '../../common/confirmation-modal/confirmation-modal.component';
import { PolicyMgmtCreateTemplateService } from './policy-mgmt-create-template.service';
import { PolicyMgmtTemplateStepperDataService } from './policy-mgmt-template-stepper-data.service';
import {
  ITemplateResponseModel, IStepContinueEvent,
  TEMPLATE_STEPS, IPolicyTemplateRouteParams
} from './policy-mgmt-create-template.model';
import { TranslationMap } from '../../core/translation.constant';
import { TcTranslateService } from 'tc-angular-services';
import { IHttpErrorResponse, IPostApiResponse, IHotelInfo, IChainInfo } from '../../core/common.model';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { SharedDataService } from '../../core/shared.data.service';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'policy-mgmt-create-template',
  templateUrl: 'policy-mgmt-create-template.component.html',
  styleUrls: ['./policy-mgmt-create-template.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyMgmtCreateTemplateComponent extends PolicyMgmtCreateComponent implements OnInit {

  /**
   * parent to child subject events to let child component know CONTINUE is clicked
   */
  continueTemplateDetails: Subject<any>;
  continueDistributionMessages: Subject<any>;

  /**
   * Flag to check if component's required global data is laoded or not
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
   * Holds template id for template edit flow
   */
  templateId: number;

  /**
   * Holds Template Name in case of Edit flow
   */
  templateNameHeader: string;

  /**
   * Flag describes whether user has edit permission or not
   */
  hasEditAccess: boolean;

  /**
   * Holds route changes subscribe reference
   */
  policyRouteSubscriberRef: SubscriptionLike;

  /**
  * Holds template params for template edit flow
  */
  policyTemplateRouteParams: IPolicyTemplateRouteParams;

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
    private policyMgmtCreateTemplateService: PolicyMgmtCreateTemplateService,
    private stepperDataService: PolicyMgmtTemplateStepperDataService,
    private translate: TcTranslateService,
    private errorService: PolicyMgmtErrorService,
    private sharedDataService: SharedDataService
  ) {
    super(injector);
    this.continueTemplateDetails = new Subject<any>();
    this.continueDistributionMessages = new Subject<any>();
    this.componentInitialized = false;
    this.translationMap = TranslationMap;

    this.activatedRoute.queryParams.subscribe(params => {
      this.templateId = params.id ? Number(params.id) : null;
    });
    this.contextService.setPolicyFlow(POLICY_FLOW.CREATE);
  }

  ngOnInit() {
    this.translate.translateService.get(this.translationMap['CANCELLATION']).subscribe(() => {
      this.messages = {
        cancel: this.translate.translateService.instant(this.translationMap.CANCEL),
        continue: this.translate.translateService.instant(this.translationMap.CONTINUE),
        done: this.translate.translateService.instant(this.translationMap.DONE),
        edit: this.translate.translateService.instant(this.translationMap.EDIT),
      };
      this.steps = [
        {
          active: true,
          completed: false,
          header: this.translate.translateService.instant(this.translationMap.POLICY_TEMPLATE_DETAILS),
          stepNumber: 1
        },
        {
          active: false,
          completed: false,
          header: this.translate.translateService.instant(this.translationMap.DISTRIBUTION_MESSAGES),
          stepNumber: 2
        }
      ];
      this.flowHeading = this.translate.translateService.instant(this.translationMap[
        this.setPolicyTemplateFlowHeading()
      ]);
      this.keepLastStepActive();
      this.hasEditAccess = this.contextService.hasEditAccess();
    });

    this.policyRouteSubscriberRef = this.router.events.pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const policyTemplateRouteParams: IPolicyTemplateRouteParams = this.routeStateService.getSelectedPolicyTemplateParams();
        if (policyTemplateRouteParams) {
          this.policyTemplateRouteParams = policyTemplateRouteParams;
        }
      });

    // initialize the global data
    this.initializeGlobalData();

  }

  async initializeGlobalData() {
    await this.policyMgmtService.loadGlobalData();

    await this.getDepositConfigurationTemplate();

    // initialize base data
    this.stepperDataService.createTemplateResponseModel();

    // if its edit flow publish data with api response
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT && this.policyMgmtCreateTemplateService.templatePopUp === true) {
      this.contextService.setPolicyFlow(POLICY_FLOW.CREATE);
      this.componentInitialized = true;
    } else if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      this.policyMgmtCreateTemplateService.getTemplateResponseData(this.templateId)
        .subscribe((res: ITemplateResponseModel) => {
          this.templateNameHeader = res.name;
          this.stepperDataService.setTemplateResponseModel(res);
          this.componentInitialized = true;
        });
    } else {
      this.componentInitialized = true;
    }
  }

  async getDepositConfigurationTemplate() {
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      // Populate Hotel info only after loadGlobalData call
      const hotelInfo: IHotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;

      // Call deposit rules API, if policy type is deposit and ProcessingMode is not Disabled
      if (this.contextService.policyType === POLICY_TYPE.DEPOSIT && hotelInfo
        && (hotelInfo.paymentInfo.processingMode !== PAYMENT_PROCESSING_STATUS.DISABLED
          || hotelInfo.hotelSettings.isGdsEnabled)) {
        await this.policyMgmtCreateTemplateService.loadDepositRuleListInfo().catch((err: IHttpErrorResponse) => {
          if (err.status === API_RESPONSE_CODE.NOT_FOUND_404) {
            this.sharedDataService.setDepositRulesList([]);
          }
        });
      }
    } else {
      const chainInfo: IChainInfo = this.sharedDataService.getChainInfo() ?? null;
      if (this.contextService.policyType === POLICY_TYPE.DEPOSIT && chainInfo) {
        await this.policyMgmtCreateTemplateService.loadDepositRuleListInfo().catch((err: IHttpErrorResponse) => {
          if (err.status === API_RESPONSE_CODE.NOT_FOUND_404) {
            this.sharedDataService.setDepositRulesList([]);
          }
        });
      }
    }

  }

  // Continue click event handler
  onContinue(stepNumber, eventType: string = null) {
    const evt: IStepContinueEvent = {
      stepNumber,
      eventType
    };
    switch (stepNumber) {
      case TEMPLATE_STEPS.TEMPLATE_DETAILS:
        this.continueTemplateDetails.next(evt);
        break;
      case TEMPLATE_STEPS.DISTRIBUTION_MESSAGE:
        this.continueDistributionMessages.next(evt);
        break;
    }
  }

  onSave(type: string) {
    if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
      this.onContinue(TEMPLATE_STEPS.DISTRIBUTION_MESSAGE, type);
    } else {
      this.onStepsValidated({
        stepNumber: null,
        eventType: type
      });
    }
    this.resetPolicFlowOnSave();
  }

  /**
   * Resetting policy flow based on routing url
   */
  resetPolicFlowOnSave() {
    if (this.policyMgmtCreateTemplateService.templatePopUp === true && this.contextService.policyFlowValue === POLICY_FLOW.EDIT) {
      this.contextService.setPolicyFlow(POLICY_FLOW.EDIT);
    }
    this.policyMgmtCreateTemplateService.templatePopUp = false;
  }

  onCancel(evt: any) {
    // This check is to handle the cancel click of steps except of stepper
    if (evt.hasOwnProperty('stepIndex')) {
      // Except current and next stpes, Marking previous steps to be completed.
      for (let i = 0; i < evt.stepIndex; i++) {
        this.steps[i].active = false;
        this.steps[i].completed = true;
      }
      // marking current step to be active on click of cancel
      this.steps[evt.stepIndex].active = true;
    }

    if (this.contextService.policyFlow === POLICY_FLOW.EDIT && (!this.hasEditAccess || this.isPropertyTemplateCreatedAtEnterpriseLevel())) {
      this.goToSpecificRoute(POLICY_FLOW.SEARCH);
    } else {
      const modalContent = this.contextService.policyFlow === POLICY_FLOW.CREATE
        ? 'CONFIRMATION_ON_CANCEL_CREATE_TEMPLATE_FLOW'
        : 'CONFIRMATION_ON_CANCEL_EDIT_TEMPLATE_FLOW';
      this.confirmationModal.open(modalContent, 'WARNING', { type: 'CONFIRMATION_ON_CANCEL' });
      super.onCancel(evt);
    }

  }

  /**
   * Stepper Edit click handler
   * @param evt: step index
   */
  onEdit(stepIndex: any) {
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      this.confirmationModal.open('CONFIRMATION_ON_EDIT', 'WARNING', { stepIndex });
    }
  }

  /**
   * On confirmation modal Ok click
   * @param evt: Event
   */
  onModalOk(evt: Event) {
    if (this.policyMgmtCreateTemplateService.templatePopUp === true && this.contextService.configType === CONFIG_TYPE.POLICY) {
      this.closePopUp.emit();
      if (this.contextService.policyFlowValue === POLICY_FLOW.EDIT) {
        this.contextService.setPolicyFlow(POLICY_FLOW.EDIT);
      } else {
        this.contextService.setPolicyFlow(POLICY_FLOW.CREATE);
      }
      this.policyMgmtCreateTemplateService.templatePopUp = false;
    } else {
      super.onModalOk(evt);
    }
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

  onStepsValidated(evt: IStepContinueEvent) {
    switch (evt.eventType) {
      case 'ACTIVE':
        this.createUpdatePolicyTemplate(evt.eventType);
        break;
      case 'INACTIVE':
        this.createUpdatePolicyTemplate(evt.eventType);
        break;
      default:
        // if event type is null
        super.onStepsValidated(evt);
        break;

    }
  }

  /**
   * brings data required for create post call, makes call and handles response
   * @param policyStatus: status: Active/Inactive
   */
  createUpdatePolicyTemplate(policyStatus: string) {
    const templateData = this.stepperDataService.getTemplateResponseModel();
    templateData.status = policyStatus;
    this.policyMgmtCreateTemplateService.createUpdatePolicyTemplate(templateData, this.templateId)
      .subscribe((res: IPostApiResponse) => {
        if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
          this.goToSpecificRoute(POLICY_FLOW.SEARCH);
        } else if (this.contextService.configType === CONFIG_TYPE.POLICY) {
          this.closePopUp.emit({ res, policyStatus });
        }
      }, (error: IHttpErrorResponse) => {
        this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
        this.showErrorToast(true);
      });

  }
}
