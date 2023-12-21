import { Component, Injector, OnInit } from '@angular/core';
import { ContextService } from '../core/context.service';
import { POLICY_FLOW, CONFIG_TYPE, POLICY_LEVEL } from '../core/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteStateService } from '../core/route.state.service';
import { Subject } from 'rxjs';
import { IStepContinueEvent } from './template/policy-mgmt-create-template.model';
import { IDepositConfigurationStepContinueEvent } from './payment-deposit-configuration/payment-deposit-configuration-create.model';
import { IErrorMessage } from '../core/common.model';

export class PolicyMgmtCreateComponent {
  // flags that are to be passed to stepper
  active: boolean;
  activeStepIndex: number;
  cancelled: boolean;
  completed: boolean;
  editMode: boolean;
  editing: boolean;
  disableContinueButton: boolean;

  /**
   * Flag describes whether user has edit permission or not
   */
  hasEditAccess: boolean;

  // array containing data for stepper
  steps: Array<{
    active: boolean,
    completed: boolean,
    header: string,
    stepNumber: number
  }>;

  // Object having labels for buttons
  messages: object = {
    cancel: 'Cancel',
    continue: 'Continue',
    done: 'Done',
    edit: 'Edit'
  };

  /**
   * Subject for continue to next step
   */
  continueStepSubject: Subject<any>;

  /**
   * Reference of Services Injected in base class
   */
  contextService: ContextService;
  router: Router;
  routeStateService: RouteStateService;
  activatedRoute: ActivatedRoute;

  /**
   * Error Toaster related fields
   */
  showToastFlag: boolean;
  apiErrorMessageDetails: IErrorMessage;

  constructor(injector: Injector) {
    this.contextService = injector.get(ContextService);
    this.router = injector.get(Router);
    this.routeStateService = injector.get(RouteStateService);
    this.activatedRoute = injector.get(ActivatedRoute);

    this.continueStepSubject = new Subject<any>();

    // initialize stepper variables
    this.activeStepIndex = 0;
    this.cancelled = false;
    this.editMode = false;
    this.editing = false;
    this.disableContinueButton = false;

    // set default values to error toaster
    this.showToastFlag = false;
    this.apiErrorMessageDetails = {
      show: true,
      message: {}
    };

    this.hasEditAccess = this.contextService.hasEditAccess();
  }

  /**
   * Cancel change event handler
   * @param evt: handle the cancel click of steps
   */
  onCancel(evt: any) {
  }

  keepLastStepActive() {
    if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
      // take stepper in edit mode
      this.editMode = true;
      this.editing = false;
      this.steps.forEach(element => {
        element.active = false;
        element.completed = true;
      });
    }
  }

  /* validate full data on stepper - in stepper_shared_service */
  onStepsValidated(event: IStepContinueEvent) {
    this.continueStepSubject.next(event);
  }

  /* validate full data on stepper - in stepper_shared_service */
  onDepositConfigurationStepsValidated(event: IDepositConfigurationStepContinueEvent) {
    this.continueStepSubject.next(event);
  }

  /**
   * Used to set create-edit component page heading
   */
  setPolicyTemplateFlowHeading(): string {
    const flowHeading = this.contextService.policyFlow.toUpperCase() + '_'
      + this.contextService.policyLevel.toUpperCase() + '_'
      + this.contextService.configType.toUpperCase() + '_'
      + this.contextService.policyType.toUpperCase();

    return flowHeading;
  }

  /**
   * Disables the save button depending on stepper state
   */
  disableSaveButton() {
    let flag = false;
    this.steps.forEach(step => {
      if (step.active) {
        flag = true;
      }
    });
    if (this.contextService.policyFlow === POLICY_FLOW.CREATE && this.steps[this.steps.length - 1].active) {
      flag = false;
    }
    return flag;
  }

  /**
   * On confirmation modal CANCEL click
   * @param evt: confirmation modal type
   */
  onModalCancel(evt?: any) {
  }

  /**
   * On confirmation modal OK click
   * @param evt: confirmation modal type
   */
  onModalOk(evt: any) {
    if (evt.type === 'CONFIRMATION_ON_CANCEL') {
      this.goToSpecificRoute(POLICY_FLOW.SEARCH);
    }
  }

  /**
   * Redirects to specified path
   * @param path: path
   * @param id: template/policy id
   */
  goToSpecificRoute(path: string, id?: number) {
    let routeUrl = path + '/' + this.contextService.configType;
    routeUrl = this.routeStateService.getNavigateRouteUrl(routeUrl);
    if (id) { // To pass id as queryParam in Edit Flow
      this.router.navigate([routeUrl], { queryParams: { id }, relativeTo: this.activatedRoute });
    } else {
      this.router.navigate([routeUrl], { relativeTo: this.activatedRoute });
    }
  }

  /**
   * function to set toast variables
   * @param flag: boolean
   */
  showErrorToast(flag: boolean) {
    this.showToastFlag = flag;
  }

  /**
   * function to check if Template is created at enterprise level
   */
  isPropertyTemplateCreatedAtEnterpriseLevel(): boolean {
    return (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY && this.contextService.policyFlow === POLICY_FLOW.EDIT)
      ? this.routeStateService.getSelectedPolicyTemplateParams().isTemplateAtEnterpriseLevel
      : false;
  }

  /**
   * function display save buttons
   */
  displaySaveButtons(): boolean {
    return this.isPropertyTemplateCreatedAtEnterpriseLevel() ? false : this.hasEditAccess;
  }

}
