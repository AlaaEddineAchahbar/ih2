import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { PolicyMgmtCreateTemplateComponent } from './policy-mgmt-create-template.component';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PolicyMgmtService } from '../../policy-mgmt.service';
import { PolicyMgmtCreateTemplateService } from './policy-mgmt-create-template.service';
import { PolicyMgmtTemplateStepperDataService } from './policy-mgmt-template-stepper-data.service';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { SharedDataService } from '../../core/shared.data.service';
import { ContextService } from '../../core/context.service';
import { RouteStateService } from '../../core/route.state.service';
import { StepperModule, DropdownModule } from 'tc-angular-components';
import { HTTPService } from '../../core/http.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { Router, RouterEvent, ActivatedRoute } from '@angular/router';
import { ReplaySubject, from, Subject, of, throwError } from 'rxjs';
import { TranslationMap } from '../../core/translation.constant';
import { POLICY_LEVEL, POLICY_FLOW, CONFIG_TYPE, POLICY_TYPE } from '../../core/constants';
import { ITemplateResponseModel, IStepContinueEvent } from '../../create/template/policy-mgmt-create-template.model';
import { CANCELLATION_OPTIONS } from '../../core/rules-config.constant';
import { IHttpErrorResponse, IHTTPResponse } from '../../core/common.model';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PolicyMgmtStepTemplateDetailsComponent } from './template-details/policy-mgmt-step-template-details.component';
import {
    PolicyMgmtDistributionMessagesPreviewComponent
} from './distribution-messages/distribution-messages-preview/policy-mgmt-distribution-messages-preview.component';
import { PolicyMgmtStepDistributionMessagesComponent } from './distribution-messages/policy-mgmt-step-distribution-messages.component';
import {
    PolicyMgmtTemplateDetailsPreviewComponent
} from './template-details/template-details-preview/policy-mgmt-template-details-preview.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PolicyMgmtDepositRuleDetailsModalComponent } from './template-details/deposit-rule-details-modal/deposit-rule-details-modal';
import { SharedModule } from '../../common/shared.module';

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
}

class MockSharedDataService {
    getHotelInfo() {
        const hotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');
        return hotelInfo;
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
class MockPolicyMgmtCreateTemplateService {
    responseData: IHTTPResponse;
    loadDepositRuleListInfo() {
        return Promise.resolve({});
    }

    getTemplateResponseData(id: number) {
        const response = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/cancellation.json');
        return of(response);
    }

    createUpdatePolicyTemplate(data: ITemplateResponseModel, templateId: number) {
        const result = {
            id: 12345,
            name: 'Test Template'
        };
        if (data && data.name) {
            this.responseData = {
                status: 200,
                body: result
            };
            return of(this.responseData);
        } else {
            return throwError(() => errorObject);
        }
    }
}

const eventSubject = new ReplaySubject<RouterEvent>();
const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: '/policy-mgmt/property/search/policy'
};

const spyStepperDataService = jasmine.createSpyObj('PolicyMgmtTemplateStepperDataService',
    ['getTemplateResponseModel', 'setTemplateResponseModel', 'createTemplateResponseModel']);

describe('Create Template Component', () => {

    let fixture: ComponentFixture<PolicyMgmtCreateTemplateComponent>;
    let instance: PolicyMgmtCreateTemplateComponent;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let contextService: ContextService;
    let policyMgmtService: PolicyMgmtService;
    let shareDataService: SharedDataService;
    let createTemplateService: PolicyMgmtCreateTemplateService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicyMgmtCreateTemplateComponent,
                PolicyMgmtStepTemplateDetailsComponent,
                PolicyMgmtTemplateDetailsPreviewComponent,
                PolicyMgmtStepDistributionMessagesComponent,
                PolicyMgmtDistributionMessagesPreviewComponent,
                PolicyMgmtDepositRuleDetailsModalComponent
            ],
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
                NgbModule
            ],
            providers: [
                TranslateService,
                TcTranslateService,
                {
                    provide: PolicyMgmtService,
                    useClass: MockPolicyMgmtService
                },
                {
                    provide: PolicyMgmtCreateTemplateService,
                    useClass: MockPolicyMgmtCreateTemplateService
                },
                {
                    provide: PolicyMgmtTemplateStepperDataService,
                    useValue: spyStepperDataService
                },
                PolicyMgmtErrorService,
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                ContextService,
                RouteStateService,
                HTTPService,
                RulesConfigurationService,
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
        shareDataService = TestBed.get(SharedDataService);
        createTemplateService = TestBed.get(PolicyMgmtCreateTemplateService);

        fixture = TestBed.createComponent(PolicyMgmtCreateTemplateComponent);
        instance = fixture.componentInstance;

        instance.continueTemplateDetails = new Subject<any>();
        instance.continueDistributionMessages = new Subject<any>();
        instance.componentInitialized = false;
        instance.translationMap = TranslationMap;

        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        fixture.detectChanges();
    });

    it('should initialize Component', (done) => {
        instance.activatedRoute.queryParams.subscribe((params) => {
            expect(params).toBeTruthy();
        });
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

    describe('Should set global data - hotelInfo, metadata, template response model', () => {
        beforeEach(() => {
            instance.initializeGlobalData();
        });

        it('should have global data set', () => {
            expect(policyMgmtService.loadGlobalData()).toBeTruthy();
            expect(shareDataService.getHotelInfo()).toBeTruthy();
        });

        it('should load deposit rule list if payment processing enabled', () => {
            contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
            const hotelInfo = shareDataService.getHotelInfo();
            hotelInfo.paymentInfo['processingMode'] = 'Enabled';
            expect(createTemplateService.loadDepositRuleListInfo()).toBeTruthy();
        });

        it('should create and set template response data if Policy Flow is EDIT', () => {
            contextService.setPolicyFlow(POLICY_FLOW.EDIT);
            expect(createTemplateService.getTemplateResponseData).toBeTruthy();
            expect(spyStepperDataService.createTemplateResponseModel).toBeTruthy();
            // expect(spyStepperDataService.createTemplateResponseModel).toHaveBeenCalled();
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
            instance.continueTemplateDetails.subscribe(data => {
                expect(data).toBeTruthy();
                expect(data.stepNumber).toEqual(1);
            });
            instance.onContinue(1);
        });

        it('should expect Step2 continue handler (Distribution Messages) to be emitted', () => {
            instance.continueDistributionMessages.subscribe(data => {
                expect(data).toBeTruthy();
                expect(data.stepNumber).toEqual(2);
                expect(data.eventType).toEqual('active');
            });
            instance.onContinue(2, 'active');
        });

        it('should expect onSave -> onContinue to be called: In Create Flow', () => {
            contextService.setPolicyFlow(POLICY_FLOW.CREATE);
            instance.continueDistributionMessages.subscribe(data => {
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

        it('should call onEdit method -> In Edit Flow', () => {
            const cancelEvent = { type: 'CONFIRMATION_ON_CANCEL' };
            contextService.setPolicyFlow(POLICY_FLOW.EDIT);
            instance.onEdit(1);
            expect(instance.confirmationModal.modalTitle).toEqual('WARNING');
            instance.confirmationModal.clickCancel();
            instance.onModalCancel(cancelEvent);
        });


        it('should expect confimation modal cancel operation are performed', () => {
            const evt = {
                stepIndex: 1
            };
            // spyOn(instance.confirmationModal, 'open');
            const cancelEvent = { type: 'CONFIRMATION_ON_CANCEL' };
            instance.onCancel(evt);

            expect(instance.steps[0].active).toEqual(false);
            expect(instance.steps[0].completed).toEqual(true);
            expect(instance.steps[1].active).toEqual(true);
            expect(instance.steps[1].completed).toEqual(false);
            expect(instance.confirmationModal.modalTitle).toEqual('WARNING');
            instance.confirmationModal.clickCancel();
            instance.onModalCancel(cancelEvent);
            // expect(instance.confirmationModal.open).toHaveBeenCalled();
        });

        it('should expect cancel flow to work on click of cancel of EDIT confimation modal', () => {
            const evt = {
                stepIndex: 1
            };
            // checking whether subscribe is been called for specified step
            instance.continueTemplateDetails.subscribe(data => {
                expect(data).toBeTruthy();
                expect(data.stepNumber).toEqual(1);
            });
            instance.onModalCancel(evt);
        });

        it('should expect create-update policy template flow to work: Active Template', () => {
            const evt = {
                eventType: 'ACTIVE',
                stepNumber: null
            };
            const responseModel: ITemplateResponseModel = {
                name: 'Test Template',
                status: 'ACTIVE',
                policyCode: 'Test',
                policySetting: {
                    cancellationRule: {
                        chargeType: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
                        priorHours: 10,
                        priorDays: 10
                    }
                },
                textList: []
            };
            spyStepperDataService.getTemplateResponseModel.and.returnValue(responseModel);
            spyStepperDataService.setTemplateResponseModel(responseModel);
            instance.onStepsValidated(evt);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should expect create-update policy template flow to work: Inactive Template', () => {
            const evt = {
                eventType: 'INACTIVE',
                stepNumber: null
            };
            const responseModel: ITemplateResponseModel = {
                name: 'Test Template',
                status: 'INACTIVE',
                policyCode: 'Test',
                policySetting: {
                    cancellationRule: {
                        chargeType: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
                        priorHours: 10,
                        priorDays: 10
                    }
                },
                textList: []
            };
            spyStepperDataService.getTemplateResponseModel.and.returnValue(responseModel);
            spyStepperDataService.setTemplateResponseModel(responseModel);
            instance.onStepsValidated(evt);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('Should Call onStepsValidated when user clicks on Continue button of step1', () => {
            const evt: IStepContinueEvent = {
                eventType: null,
                stepNumber: 1
            };
            const responseModel: ITemplateResponseModel = {
                name: 'Test Template',
                status: 'ACTIVE',
                policyCode: 'Test',
                policySetting: {
                    cancellationRule: {
                        chargeType: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
                        priorHours: 10,
                        priorDays: 10
                    }
                },
                textList: []
            };
            spyStepperDataService.getTemplateResponseModel.and.returnValue(responseModel);
            spyStepperDataService.setTemplateResponseModel(responseModel);
            instance.continueStepSubject = new Subject<any>();
            instance.continueStepSubject.subscribe(data => {
                expect(data).toBeTruthy();
                expect(data.stepNumber).toEqual(1);
            });
            instance.onStepsValidated(evt);
        });

        it('Should return ErrorObject in case of Create Flow', () => {
            const evt = {
                eventType: 'INACTIVE',
                stepNumber: null
            };
            spyStepperDataService.getTemplateResponseModel.and.returnValue([]);
            spyStepperDataService.setTemplateResponseModel([]);
            instance.onStepsValidated(evt);
            expect(instance.showToastFlag).toBeTruthy();
        });
    });
});
