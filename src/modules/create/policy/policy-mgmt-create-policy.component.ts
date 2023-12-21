import { Component, OnInit, Injector, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { PolicyMgmtService } from '../../policy-mgmt.service';
import { PolicyMgmtCreateComponent } from '../policy-mgmt-create.component';
import { Subject, SubscriptionLike } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IStepContinueEvent } from '../template/policy-mgmt-create-template.model';
import {
  POLICY_STEPS, IPolicyStepContinueEvent, IPolicyResponseModel, IPolicyCreateResponseModel, IPolicyRouteParams
} from './policy-mgmt-create-policy.model';
import { TranslationMap } from '../../core/translation.constant';
import { TcTranslateService } from 'tc-angular-services';
import { POLICY_FLOW, POLICY_LEVEL } from '../../core/constants';
import { PolicyMgmtPolicyStepperDataService } from './policy-mgmt-policy-stepper-data.service';
import { PolicyMgmtCreatePolicyService } from './policy-mgmt-create-policy.service';
import { PolicyMgmtConfirmationModalComponent } from '../../common/confirmation-modal/confirmation-modal.component';
import { IHttpErrorResponse } from '../../core/common.model';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { RULE_STATUS } from '../../core/rules.constant';
import { NavigationEnd } from '@angular/router';
import { ENTERPRISE_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';
import { PolicyOverlapService } from './policy-overlap/policy-overlap.service';
import { IOverlapPolicyInfo } from './policy-overlap/policy-overlap.model';
import { PolicyOverlapComponent } from './policy-overlap/policy-overlap.component';

@Component({
  templateUrl: './policy-mgmt-create-policy.component.html',
  styleUrls: ['./policy-mgmt-create-policy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyMgmtCreatePolicyComponent extends PolicyMgmtCreateComponent implements OnInit, OnDestroy {

  /**
   * parent to child subject events to let child component know CONTINUE is clicked
   */
  continuePolicyDetails: Subject<any>;
  continuePolicyLevel: Subject<any>;

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
  policyRouteParams: IPolicyRouteParams;

  /**
   * Holds route changes subscribe reference
   */
  policyRouteSubscriberRef: SubscriptionLike;

  /**
   * Policy Name header
   */
  policyNameHeader: string;

  /**
   * Flag describes whether user has edit permission or not
   */
  hasEditAccess: boolean;

  /**
   * Policy Level
   */
  policyLevel: string;

  /**
   * View child reference
   */
  @ViewChild(PolicyMgmtConfirmationModalComponent, { static: false }) confirmationModal: PolicyMgmtConfirmationModalComponent;
  @ViewChild(PolicyOverlapComponent, { static: false }) policyOverlapModal: PolicyOverlapComponent;

  constructor(
    injector: Injector,
    private policyMgmtService: PolicyMgmtService,
    private translate: TcTranslateService,
    private stepperDataService: PolicyMgmtPolicyStepperDataService,
    private createPolicyService: PolicyMgmtCreatePolicyService,
    private errorService: PolicyMgmtErrorService,
    private policyOverlapService: PolicyOverlapService
  ) {
    super(injector);
    this.continuePolicyDetails = new Subject<any>();
    this.continuePolicyLevel = new Subject<any>();
    this.translationMap = TranslationMap;

    this.policyRouteSubscriberRef = this.router.events.pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const policyRouteParams: IPolicyRouteParams = this.routeStateService.getSelectedPolicyParams();
        if (policyRouteParams) {
          this.policyRouteParams = policyRouteParams;
        }
      });
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
          header: this.translate.translateService.instant(this.translationMap['POLICY_LEVEL_ASSIGNMENT']),
          stepNumber: 1
        },
        {
          active: false,
          completed: false,
          header: this.translate.translateService.instant(this.translationMap['POLICY_DETAILS']),
          stepNumber: 2
        }
      ];
      this.flowHeading = this.translate.translateService.instant(this.translationMap[
        this.setPolicyTemplateFlowHeading()
      ]);
      this.keepLastStepActive();
      this.hasEditAccess = this.contextService.hasEditAccess();
    });

    // initialize the global data
    this.initializeGlobalData();
  }

  async initializeGlobalData() {
    await this.policyMgmtService.loadGlobalData();
    await this.policyMgmtService.makePolicyMetadataAPICalls();

    this.stepperDataService.createPolicyResponseModel();

    // if its edit flow publish data with api response
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      this.createPolicyService.getPolicyResponseData(this.policyRouteParams)
        .subscribe((response: IPolicyResponseModel) => {
          if (response) {
            this.policyNameHeader = response.groupname;
            this.policyLevel = response.level;
            this.stepperDataService.setPolicyResponseModel(response);
            this.componentInitialized = true;
          }

        }, (error: IHttpErrorResponse) => {
          this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
          this.showErrorToast(true);
        });

    } else {
      this.componentInitialized = true;
    }
  }

  // Continue click event handler
  onContinue(stepNumber, eventType: string = null) {
    const evt: IPolicyStepContinueEvent = {
      stepNumber,
      eventType
    };
    switch (stepNumber) {
      case POLICY_STEPS.POLICY_LEVEL:
        this.continuePolicyLevel.next(evt);
        break;
      case POLICY_STEPS.POLICY_DETAILS:
        this.continuePolicyDetails.next(evt);
        break;
    }
  }

  onSave(type: string) {
    if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
      this.onContinue(POLICY_STEPS.POLICY_DETAILS, type);
    } else {
      this.onStepsValidated({
        stepNumber: null,
        eventType: type
      });
    }
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

    const modalContent = this.contextService.policyFlow === POLICY_FLOW.CREATE
      ? 'CONFIRMATION_ON_CANCEL_CREATE_POLICY_FLOW'
      : 'CONFIRMATION_ON_CANCEL_EDIT_POLICY_FLOW';

    this.confirmationModal.open(modalContent, 'WARNING', { type: 'CONFIRMATION_ON_CANCEL' });
    super.onCancel(evt);
  }

  onStepsValidated(evt: IStepContinueEvent) {
    switch (evt.eventType) {
      case 'ACTIVE':
      case 'INACTIVE':
        this.contextService.policyLevel === POLICY_LEVEL.PROPERTY ?
          this.createUpdatePolicy(evt.eventType) : this.createUpdateEnterprisePolicy(evt.eventType);
        break;
      default:
        // if event type is null
        super.onStepsValidated(evt);
        break;
    }
  }

  /**
   * Method to create or update enterprise policies
   * @param status
   */
  createUpdateEnterprisePolicy(status: string) {
    const policyData = this.stepperDataService.getPolicyResponseModel();
    policyData.rules.forEach(rule => {
      rule.activeStatus = rule.activeStatus === RULE_STATUS.DELETE ? rule.activeStatus : RULE_STATUS[status];
    });
    const currentPolicyName = policyData.groupname;
    this.policyOverlapService.searchOverlapPolicies(policyData).subscribe((response: Array<IOverlapPolicyInfo>) => {
      // Exclude the current policy from the list of overlapping policies in case of UPDATE
      if (policyData.operation === 'UPDATE') {
        if (response && response.length > 0) {
          response = response.filter((i) => i.policyName !== currentPolicyName);
        }
      }

      if (response && response.length > 0) {
        this.openPolicyOverlapModal(status, response);
      } else {
        this.createUpdatePolicy(status);
      }
    });
  }

  /**
   * Method to open policy overlap modal
   * @param status
   * @param overlapPolicies list of overlap policies
   */
  openPolicyOverlapModal(status: string, overlapPolicies: Array<IOverlapPolicyInfo>) {
    const modelRef = this.policyOverlapModal.openPolicyOverlapModal(overlapPolicies);
    modelRef.closed.subscribe(() => {
      if (this.policyOverlapModal.isOkClicked) {
        this.createUpdatePolicy(status);
      }
    });
  }

  createUpdatePolicy(status: string) {
    const policyData = this.stepperDataService.getPolicyResponseModel();
    policyData.rules.forEach(rule => {
      rule.activeStatus = rule.activeStatus === RULE_STATUS.DELETE ? rule.activeStatus : RULE_STATUS[status];
    });
    this.createPolicyService.createUpdatePolicy(policyData)
      .subscribe({
        next: (res: IPolicyCreateResponseModel) => {
          if (res.savedRules.length) {
            const policyRuleIds = [];
            res.savedRules.forEach(rule => {
              policyRuleIds.push(rule.ruleID);
            });
            const requestData: IPolicyRouteParams = {
              policyRuleIds,
              policyCreationLevel: policyData.level
            };
            this.routeStateService.setSelectedPolicyParams(requestData);
            this.goToSpecificRoute(POLICY_FLOW.SEARCH);
          }
        }, error: (error: IHttpErrorResponse) => {
          this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
          this.showErrorToast(true);
        }
      });
  }

  /**
   * unsubscribe events
   */
  ngOnDestroy(): void {
    if (this.policyRouteSubscriberRef) {
      this.policyRouteSubscriberRef.unsubscribe();
    }
  }


  /**
   * Check if the policy level is higer of the current context
   * @returns true if the policy level is higher of the current context else false
   */
  levelOfPolicyIsHigherOfCurrentContextPolicyLevel(): boolean {
    const enterpriseLevelValues: string[] = Object.values(ENTERPRISE_POLICY_CREATION_LEVEL);
    return this.contextService.policyLevel === POLICY_LEVEL.PROPERTY && enterpriseLevelValues.includes(this.policyLevel);
  }

}
