import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PolicyMgmtService } from '../../policy-mgmt.service';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { ContextService } from '../../core/context.service';
import { RouteStateService } from '../../core/route.state.service';
import { StepperModule, DropdownModule, DatePickerModule, MultilevelDropdownModule } from 'tc-angular-components';
import { HTTPService } from '../../core/http.service';
import { Router, RouterEvent, ActivatedRoute } from '@angular/router';
import { ReplaySubject, from, Subject, of, throwError } from 'rxjs';
import { TranslationMap } from '../../core/translation.constant';
import { POLICY_LEVEL, POLICY_FLOW, CONFIG_TYPE, POLICY_TYPE } from '../../core/constants';
import { IStepContinueEvent } from '../../create/template/policy-mgmt-create-template.model';
import { IHttpErrorResponse, IHTTPResponse } from '../../core/common.model';
import { NgbModule, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { PolicyMgmtCreatePolicyComponent } from './policy-mgmt-create-policy.component';
import { PolicyMgmtCreatePolicyService } from './policy-mgmt-create-policy.service';
import { PolicyMgmtStepPolicyLevelComponent } from './policy-level/policy-mgmt-step-policy-level.component';
import {
    PolicyMgmtStepPolicyLevelPreviewComponent
} from './policy-level/policy-level-preview/policy-mgmt-step-policy-level-preview.component';
import { PolicyMgmtStepPolicyDetailsComponent } from './policy-details/policy-mgmt-step-policy-details.component';
import {
    PolicyMgmtStepPolicyDetailsPreviewComponent
} from './policy-details/policy-details-preview/policy-mgmt-step-policy-details-preview.component';
import { PolicyMgmtPolicyStepperDataService } from './policy-mgmt-policy-stepper-data.service';
import { PolicyMgmtDateSelectorComponent } from './policy-details/date-selector/policy-mgmt-date-selector.component';
import { IPolicyResponseModel, IPolicyCreateResponseModel } from './policy-mgmt-create-policy.model';
import { RULE_STATUS, OPERATION_TYPES } from '../../core/rules.constant';
import { PROPERTY_POLICY_CREATION_LEVEL, ENTERPRISE_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';

import { PolicyMgmtCreateTemplateModalComponent } from './policy-details/create-template-modal/policy-mgmt-create-template-modal.component';
import { PolicyMgmtCreateTemplateComponent } from '../template/policy-mgmt-create-template.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PolicyOverlapService } from './policy-overlap/policy-overlap.service';
import { RulesMataDataService } from 'src/modules/core/rules-meta-data.service';
import { SharedDataService } from 'src/modules/core/shared.data.service';
import { PolicyMgmtSearchPayloadService } from 'src/modules/core/search-payload.service';
import { PolicyMgmtUtilityService } from 'src/modules/core/utility.service';
import { PolicyOverlapComponent } from './policy-overlap/policy-overlap.component';
/**
 *  AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient) {
    /**
     * Update i18nUrl and set it for loading translations
     */

    let langApiUrl;
    langApiUrl = window['CONFIG']['apiUrl']
        .replace('{{api_module_context_path}}', 'i18n/v1')
        + 'apps/ent-policy-ui/locales/';
    return new TcTranslateService().loadTranslation(http, langApiUrl);
}

class MockPolicyMgmtService {
    loadGlobalData() {
        return Promise.resolve({});
    }
    makePolicyMetadataAPICalls() {
        return Promise.resolve({});
    }
}

const errorObject: IHttpErrorResponse = {
    status: 404,
    statusText: 'OK',
    error: {
        errors: [
            {
                message: 'Error'
            }
        ]
    }
};
class MockPolicyMgmtCreatePolicyService {
    responseData: IHTTPResponse;

    getPolicyResponseData(id: number) {
        const response = require('../../../assets-policy-mgmt/data/policy/getPolicy/cancellation.json');
        return of(response);
    }

    createUpdatePolicy(data: IPolicyResponseModel, policyId: number) {
        if (data && data.groupname) {
            const responseData: IPolicyCreateResponseModel = {
                savedRules: [{
                    ruleID: '12345',
                    ruleName: 'Test Policy',
                    version: '1'
                }],
                success: true,
                errors: []
            };
            return of(responseData);
        } else {
            return throwError(() => errorObject);
        }
    }
}

class MockPolicyMgmtCreateTemplateComponent {

}
const overlapPolicicesInfo = [
    {
        policyName: '4 Dec 2023 Policy',
        ruleStartDate: '2023-12-04',
        ruleEndDate: '2023-12-05',
        id: '560',
        name: 'AAM779',
        policyDateRange: '2023/12/04 - 2023/12/05',
        policyLevel: 'CHAIN',
        issue: 'Overlapping dates with active dated policy'
    },
    {
        policyName: 'Cancellation Sept',
        ruleStartDate: '2023-11-28',
        ruleEndDate: '2024-09-14',
        id: '560',
        name: 'AAM779',
        policyDateRange: '2024/09/01 - 2024/09/14',
        policyLevel: 'CHAIN',
        issue: 'Overlapping dates with active dated policy'
    }
];

class MockPolicyOverlapService {
    searchOverlapPolicies(policyData) {
        if (policyData.rules.length > 0) {
            return of(overlapPolicicesInfo);
        }
        return of([]);
    }
}


const eventSubject = new ReplaySubject<RouterEvent>();
const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: '/policy-mgmt/property/search/policy'
};

const spyStepperDataService = jasmine.createSpyObj('PolicyMgmtPolicyStepperDataService',
    ['setPolicyResponseModel', 'getPolicyResponseModel', 'createPolicyResponseModel']);

describe('Create Policy Component', () => {
    let fixture: ComponentFixture<PolicyMgmtCreatePolicyComponent>;
    let instance: PolicyMgmtCreatePolicyComponent;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let contextService: ContextService;
    let policyMgmtService: PolicyMgmtService;
    let createTemplateService: PolicyMgmtCreatePolicyService;
    let policyOverlapService: PolicyOverlapService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicyMgmtCreatePolicyComponent,
                PolicyMgmtStepPolicyLevelComponent,
                PolicyMgmtStepPolicyLevelPreviewComponent,
                PolicyMgmtStepPolicyDetailsComponent,
                PolicyMgmtStepPolicyDetailsPreviewComponent,
                PolicyMgmtDateSelectorComponent,
                PolicyMgmtCreateTemplateModalComponent,
                PolicyOverlapComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                CommonModule,
                SharedModule,
                DropdownModule,
                FormsModule,
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient]
                    }
                }),
                StepperModule,
                NgbModule,
                NgbTooltipModule,
                NgbDropdownModule,
                MultilevelDropdownModule,
                DatePickerModule
            ],
            providers: [
                TranslateService,
                TcTranslateService,
                {
                    provide: PolicyMgmtService,
                    useClass: MockPolicyMgmtService
                },
                {
                    provide: PolicyMgmtCreatePolicyService,
                    useClass: MockPolicyMgmtCreatePolicyService
                },
                {
                    provide: PolicyMgmtPolicyStepperDataService,
                    useValue: spyStepperDataService
                },
                {
                    provide: PolicyMgmtCreateTemplateComponent,
                    useClass: MockPolicyMgmtCreateTemplateComponent
                },
                PolicyMgmtErrorService,
                {
                    provide: PolicyOverlapService,
                    useClass: MockPolicyOverlapService
                },
                RulesMataDataService,
                SharedDataService,
                PolicyMgmtSearchPayloadService,
                PolicyMgmtUtilityService,
                ContextService,
                RouteStateService,
                HTTPService,
                {
                    provide: Router,
                    useValue: mockRouter
                },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: from([{ id: 12345 }]) }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        translateService = TestBed.get(TranslateService);
        tcTranslateService = TestBed.get(TcTranslateService);
        tcTranslateService.initTranslation(translateService);

        contextService = TestBed.get(ContextService);
        policyMgmtService = TestBed.get(PolicyMgmtService);
        createTemplateService = TestBed.get(PolicyMgmtCreatePolicyService);
        policyOverlapService = TestBed.inject(PolicyOverlapService);

        fixture = TestBed.createComponent(PolicyMgmtCreatePolicyComponent);
        instance = fixture.componentInstance;

        instance.continuePolicyLevel = new Subject<any>();
        instance.continuePolicyDetails = new Subject<any>();
        instance.componentInitialized = false;
        instance.translationMap = TranslationMap;

        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        fixture.detectChanges();
    });

    it('should initialize Component', (done) => {
        expect(instance).toBeDefined();
        expect(instance).toBeTruthy();
        translateService.get(TranslationMap['CANCELLATION']).subscribe((res) => {
            expect(res).toBeDefined();
            expect(instance.messages).toBeDefined();
            expect(instance.messages['cancel']).toBeDefined();
            expect(instance.steps).toBeTruthy();
            expect(instance.flowHeading).toBeTruthy();
            done();
        });
    });

    describe('Should set global data - hotelInfo, metadata, rulesMetadata, policy metadata(API dropdwon calls)', () => {
        beforeEach(() => {
            instance.initializeGlobalData();
        });

        it('should have global data set', () => {
            expect(policyMgmtService.loadGlobalData()).toBeTruthy();
        });
    });

    describe('Stepper event handlers', () => {
        beforeEach(() => {
            instance.steps = [
                {
                    active: true,
                    completed: false,
                    header: tcTranslateService.translateService.instant(TranslationMap.POLICY_TEMPLATE_DETAILS),
                    stepNumber: 1
                },
                {
                    active: false,
                    completed: false,
                    header: tcTranslateService.translateService.instant(TranslationMap.DISTRIBUTION_MESSAGES),
                    stepNumber: 2
                }
            ];
            fixture.detectChanges();
        });

        it('should expect Step1 continue handler (Template Details) to be emitted', () => {
            instance.continuePolicyLevel.subscribe(data => {
                expect(data).toEqual({ stepNumber: 1, eventType: null });
            });
            instance.onContinue(1);
        });

        it('should expect Step2 continue handler (Distribution Messages) to be emitted', () => {
            instance.continuePolicyDetails.subscribe(data => {
                expect(data).toBeTruthy();
                expect(data.stepNumber).toEqual(2);
                expect(data.eventType).toEqual('active');
            });
            instance.onContinue(2, 'active');
        });

        it('should expect onSave -> onContinue to be called: In Create Flow', () => {
            contextService.setPolicyFlow(POLICY_FLOW.CREATE);
            instance.continuePolicyDetails.subscribe(data => {
                expect(data).toBeTruthy();
                expect(data.stepNumber).toEqual(2);
                expect(data.eventType).toEqual('active');
            });
            instance.onSave('active');
        });

        it('should expect onSave -> onStepsValidated to be called: In Edit Flow', () => {
            contextService.setPolicyFlow(POLICY_FLOW.EDIT);
            const status = 'active';
            instance.onSave('active');
            expect(status).toEqual('active');
        });

        it('should expect confimation modal cancel operation are performed', () => {
            const evt = {
                stepIndex: 1
            };
            const cancelEvent = { type: 'CONFIRMATION_ON_CANCEL' };
            instance.onCancel(evt);

            expect(instance.steps[0].active).toEqual(false);
            expect(instance.steps[0].completed).toEqual(true);
            expect(instance.steps[1].active).toEqual(true);
            expect(instance.steps[1].completed).toEqual(false);
            expect(instance.confirmationModal.modalTitle).toEqual('WARNING');
            instance.confirmationModal.clickCancel();
            instance.onModalCancel(cancelEvent);
        });

        it('should expect create-update policy flow to work: Active Policy', () => {
            const evt = {
                eventType: 'ACTIVE',
                stepNumber: null
            };
            const responseModel: IPolicyResponseModel = {
                groupname: 'Test Policy',
                level: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
                operation: OPERATION_TYPES.create,
                policyTemplateName: 'Policy test template',
                rules: [{
                    activeStatus: RULE_STATUS.ACTIVE,
                    ruleCriteriaParameters: [],
                    ruleDecisions: [],
                    ruleEndDate: '',
                    ruleLogic: 'ALL',
                    ruleStartDate: '',
                    uniqueTypeID: 1,
                    ruleName: 'Test Policy',
                    rulePriority: 1,
                    ruleTypeID: 12345,
                    uniqueID: 1010,
                    auxId: 1234,
                    auxType: ''
                }]
            };
            spyStepperDataService.getPolicyResponseModel.and.returnValue(responseModel);
            spyStepperDataService.setPolicyResponseModel(responseModel);
            instance.onStepsValidated(evt);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should expect create-update policy flow to work: Inactive Policy', () => {
            const evt = {
                eventType: 'INACTIVE',
                stepNumber: null
            };
            const responseModel: IPolicyResponseModel = {
                groupname: 'Test Policy',
                level: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
                operation: OPERATION_TYPES.create,
                policyTemplateName: 'Policy test template',
                rules: [{
                    activeStatus: RULE_STATUS.INACTIVE,
                    ruleCriteriaParameters: [],
                    ruleDecisions: [],
                    ruleEndDate: '',
                    ruleLogic: 'ALL',
                    ruleStartDate: '',
                    uniqueTypeID: 1,
                    ruleName: 'Test Policy',
                    rulePriority: 1,
                    ruleTypeID: 12345,
                    uniqueID: 1010,
                    auxId: 1234,
                    auxType: ''
                }]
            };
            spyStepperDataService.getPolicyResponseModel.and.returnValue(responseModel);
            spyStepperDataService.setPolicyResponseModel(responseModel);
            instance.onStepsValidated(evt);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('Should Call onStepsValidated when user clicks on Continue button of step1', () => {
            const evt: IStepContinueEvent = {
                eventType: null,
                stepNumber: 1
            };
            const responseModel: IPolicyResponseModel = {
                groupname: 'Test Policy',
                level: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
                operation: OPERATION_TYPES.create,
                policyTemplateName: 'Policy test template',
                rules: []
            };
            spyStepperDataService.getPolicyResponseModel.and.returnValue(responseModel);
            spyStepperDataService.setPolicyResponseModel(responseModel);
            instance.continueStepSubject = new Subject<any>();
            instance.continueStepSubject.subscribe(data => {
                expect(data).toBeDefined();
            });
            instance.onStepsValidated(evt);
        });

        it('Should return ErrorObject in case of Create Flow', () => {
            const evt = {
                eventType: 'INACTIVE',
                stepNumber: null
            };
            const policyRequest = {
                rules: []
            };
            spyStepperDataService.getPolicyResponseModel.and.returnValue(policyRequest);
            spyStepperDataService.setPolicyResponseModel(policyRequest);
            instance.onStepsValidated(evt);
            expect(instance.showToastFlag).toBeTruthy();
        });
    });

    it('should return true when the policy come from enterprise and the context policy level is property', () => {
        // Arrange
        instance.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
        instance.contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

        // Act
        const result = instance.levelOfPolicyIsHigherOfCurrentContextPolicyLevel();

        // Assert
        expect(result).toBeTrue();
    });

    it('should return false when the level of policy and the context of policy are same', () => {
        // Arrange
        instance.policyLevel = POLICY_LEVEL.PROPERTY;
        instance.contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

        // Act
        const result = instance.levelOfPolicyIsHigherOfCurrentContextPolicyLevel();

        // Assert
        expect(result).toBeFalse();
    });

    it('should call openPolicyOverlapModal when overlap policies list is not empty', () => {
        // Arrange
        instance.policyLevel = POLICY_LEVEL.ENTERPRISE;
        instance.contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        const spyOpenPolicyOverlapModal = spyOn(instance, 'openPolicyOverlapModal');
        const responseModel: IPolicyResponseModel = {
            groupname: 'testname',
            level: 'ENTERPRISE',
            operation: 'CREATE',
            policyTemplateName: 'policy template name',
            rules: [
                {
                    activeStatus: 'Active',
                    ruleLogic: 'ALL',
                    rulePriority: 99,
                    uniqueTypeID: 3,
                    ruleTypeID: 14,
                    ruleName: 'testname',
                    uniqueID: 560,
                    ruleStartDate: '2023-12-04',
                    ruleEndDate: '',
                    ruleDecisions: [],
                    ruleCriteriaParameters: [],
                    auxId: null,
                    auxType: ''
                }
            ],
            chainCategoryIds: []
        };
        spyStepperDataService.getPolicyResponseModel.and.returnValue(responseModel);

        // Act
        instance.createUpdateEnterprisePolicy('ACTIVE');

        // Assert
        expect(spyOpenPolicyOverlapModal).toHaveBeenCalledWith('ACTIVE', overlapPolicicesInfo);
    });

    it('should call createUpdatePolicy when no overlap policies found', () => {
        // Arrange
        instance.policyLevel = POLICY_LEVEL.ENTERPRISE;
        instance.contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        const spyCreateUpdatePolicy = spyOn(instance, 'createUpdatePolicy');
        const responseModel: IPolicyResponseModel = {
            groupname: 'testname',
            level: 'ENTERPRISE',
            operation: 'CREATE',
            policyTemplateName: 'policy template name',
            rules: [],
            chainCategoryIds: []
        };
        spyStepperDataService.getPolicyResponseModel.and.returnValue(responseModel);

        // Act
        instance.createUpdateEnterprisePolicy('ACTIVE');

        // Assert
        expect(spyCreateUpdatePolicy).toHaveBeenCalledWith('ACTIVE');
    });

});
