/**
 * Core angular modules
 */
import { TestBed, async, inject } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TcTranslateService } from 'tc-angular-services';
import { ContextService } from '../core/context.service';
import { POLICY_TYPE, CONFIG_TYPE, POLICY_LEVEL, POLICY_FLOW } from '../core/constants';
import { RouteStateService } from '../core/route.state.service';
import { Router, RouterEvent, ActivatedRoute } from '@angular/router';
import { ReplaySubject, from, Subject } from 'rxjs';
import { PolicyMgmtCreateComponent } from './policy-mgmt-create.component';
import { Injector } from '@angular/core';
import { IPolicyTemplateRouteParams, IStepContinueEvent } from './template/policy-mgmt-create-template.model';

const eventSubject = new ReplaySubject<RouterEvent>();
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  events: eventSubject.asObservable(),
  url: '/policy-mgmt/property/search/policy'
};

describe('PolicyMgmtCreateComponent', () => {
  let instance: PolicyMgmtCreateComponent;
  let contextService: ContextService;
  let routeStateService: RouteStateService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        TcTranslateService,
        TranslateService,
        ContextService,
        RouteStateService,
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{ policyType: POLICY_TYPE.CANCELLATION }]),
            queryParams: from([{ ratePlanId: null }])
          }
        }
      ]
    });

    contextService = TestBed.get(ContextService);
    routeStateService = TestBed.get(RouteStateService);
  }));

  beforeEach(inject([Injector], (injector: Injector) => {
    instance = new PolicyMgmtCreateComponent(injector);
  }));

  it('expect PolicyMgmtCreateComponent Instance to be Defined', () => {
    expect(instance).toBeTruthy();
  });
  it('Should set showToastFlag to true', () => {
    instance.showErrorToast(true);
    expect(instance.showToastFlag).toBeTruthy();
  });
  it('Should set setPolicyTemplateFlowHeading', () => {
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
    contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
    contextService.setPolicyFlow(POLICY_FLOW.CREATE);
    const flowHeadding = instance.setPolicyTemplateFlowHeading();
    expect(flowHeadding).toEqual('CREATE_PROPERTY_TEMPLATE_CANCELLATION');
  });

  it('Should Call keepLastStepActive method in Edit Flow', () => {
    contextService.setPolicyFlow(POLICY_FLOW.EDIT);
    const steps = [
      {
        active: true,
        completed: false,
        header: 'Template Details',
        stepNumber: 1
      },
      {
        active: false,
        completed: false,
        header: 'Distribution Messaged',
        stepNumber: 2
      }
    ];
    instance.steps = steps;
    instance.keepLastStepActive();
    expect(instance.editMode).toBeTruthy();
  });

  it('Should Call disableSaveButton method in Create Flow when step1 is Active', () => {
    contextService.setPolicyFlow(POLICY_FLOW.CREATE);
    const steps = [
      {
        active: true,
        completed: false,
        header: 'Template Details',
        stepNumber: 1
      },
      {
        active: false,
        completed: false,
        header: 'Distribution Messaged',
        stepNumber: 2
      }
    ];
    instance.steps = steps;
    const flag = instance.disableSaveButton();
    expect(flag).toBeTruthy();
  });

  it('Should Call disableSaveButton method in Create Flow when step2 is Active', () => {
    contextService.setPolicyFlow(POLICY_FLOW.CREATE);
    const steps = [
      {
        active: false,
        completed: false,
        header: 'Template Details',
        stepNumber: 1
      },
      {
        active: true,
        completed: false,
        header: 'Distribution Messaged',
        stepNumber: 2
      }
    ];
    instance.steps = steps;
    const flag = instance.disableSaveButton();
    expect(flag).toBeFalsy();
  });

  it('Should Call onModalOk method on Click of Cancel button ', () => {
    const event = { type: 'CONFIRMATION_ON_CANCEL' };
    instance.onModalOk(event);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('Should Call onStepsValidated when user clicks on Continue button of step1', () => {
    contextService.setPolicyFlow(POLICY_FLOW.CREATE);
    const steps = [
      {
        active: true,
        completed: false,
        header: 'Template Details',
        stepNumber: 1
      },
      {
        active: false,
        completed: false,
        header: 'Distribution Messaged',
        stepNumber: 2
      }
    ];

    const evt: IStepContinueEvent = { stepNumber: 1, eventType: null };
    instance.continueStepSubject = new Subject<any>();
    instance.steps = steps;
    instance.continueStepSubject.subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.stepNumber).toEqual(1);
    });
    instance.onStepsValidated(evt);
  });

  it('should return false if policyLevel is PROPERTY and template is at enterprise level', () => {
    // Arrange
    contextService.setPolicyFlow(POLICY_FLOW.EDIT);
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    contextService.userPermission = '3';

    const params: IPolicyTemplateRouteParams = {
      isTemplateAtEnterpriseLevel: true
    };
    routeStateService.setSelectedPolicyTemplateParams(params);

    // Act
    const result = instance.displaySaveButtons();

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when the policy level is property and the template is at enterprise level', () => {
    // Arrange
    contextService.setPolicyFlow(POLICY_FLOW.EDIT);
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    const params: IPolicyTemplateRouteParams = {
      isTemplateAtEnterpriseLevel: true
    };
    routeStateService.setSelectedPolicyTemplateParams(params);

    // Act
    const isTemplateAtEnterpriseLevel = instance.isPropertyTemplateCreatedAtEnterpriseLevel();

    // Assert
    expect(isTemplateAtEnterpriseLevel).toBe(true);
  });

  it('should return false when the policy level is property and the template is not at enterprise level', () => {
    // Arrange
    contextService.setPolicyFlow(POLICY_FLOW.EDIT);
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    const params: IPolicyTemplateRouteParams = {
      isTemplateAtEnterpriseLevel: false
    };
    routeStateService.setSelectedPolicyTemplateParams(params);

    // Act
    const isTemplateAtEnterpriseLevel = instance.isPropertyTemplateCreatedAtEnterpriseLevel();

    // Assert
    expect(isTemplateAtEnterpriseLevel).toBe(false);
  });

});
