/* Angular-Module Imports */
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterEvent } from '@angular/router';


/* Third Party Module Imports */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, from, of } from 'rxjs';


/* TC-module Imports */
import { DropdownModule, StepperModule } from 'tc-angular-components';
import { TcTranslateService } from 'tc-angular-services';
import { CONFIG_TYPE, POLICY_FLOW, POLICY_LEVEL } from '../../core/constants';
import { ContextService } from '../../core/context.service';
import { HTTPService } from '../../core/http.service';
import { RouteStateService } from '../../core/route.state.service';
import { TranslationMap } from '../../core/translation.constant';
import { PolicyMgmtService } from '../../policy-mgmt.service';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { IErrorApiRes } from '../../core/common.model';
import { PaymentDepositConfigurationRulesPreviewComponent } from './deposit-rules-preview/deposit-rules-preview.component';
import { PaymentDepositConfigurationCreateComponent } from './payment-deposit-configuration-create.component';
import { PaymentDepositConfigurationCreateService } from './payment-deposit-configuration-create.service';
import { PaymentDepositConfigurationStepperDataService } from './payment-deposit-configuration-stepper-data.service';
import { PolicyMgmtConfirmationModalComponent } from '../../common/confirmation-modal/confirmation-modal.component';
import { IPropertyPaymentDepositRulesResponseModel } from './payment-deposit-configuration-create.model';

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

class MockPolicyMgmtErrorService {
    setErrorMessage(errors: IErrorApiRes[]) {
        const errorMessage = require('../../../assets-policy-mgmt/data/payment-deposit-rule/edit/CreateUpdateError.json');
        return of(errorMessage);
    }
}

class MockPaymentDepositConfigurationCreateService {
    getPaymentDepositConfigurationData(id: number) {
        const response = require('../../../assets-policy-mgmt/data/payment-deposit-rule/edit/PaymentDepositRulesResponse.json');
        return of(response);
    }

    getPropertyPaymentDepositConfigurationData(id: number) {
        const response: IPropertyPaymentDepositRulesResponseModel =
            require('../../../assets-policy-mgmt/data/property-payment-deposit-rule/retrieve/payment-deposit-rule-response.json');
        return of(response);
    }

    createUpdatePropertyPaymentDepositConfiguration(data: IPropertyPaymentDepositRulesResponseModel): Observable<any> {
        const response =
            require('../../../assets-policy-mgmt/data/property-payment-deposit-rule/create/payment-deposit-rule-response-model.json');
        return of(response);
    }
}

const spyStepperDataService = jasmine.createSpyObj('PaymentDepositConfigurationStepperDataService', [
    'setResponseModel', 'getResponseModel', 'getPropertyResponseModel', 'getDepositConfigurationDetailData',
    'getDepositConfigurationRulesData'
]);

const eventSubject = new ReplaySubject<RouterEvent>();
const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: '/policy-mgmt/enterprise/cyb/search/payment-deposit-configuration/'
};

describe('Create Payment Deposit Configuration Component', () => {
    let fixture: ComponentFixture<PaymentDepositConfigurationCreateComponent>;
    let instance: PaymentDepositConfigurationCreateComponent;
    let createDepositConfigurationService: PaymentDepositConfigurationCreateService;
    let stepperDataService: PaymentDepositConfigurationStepperDataService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let contextService: ContextService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [
                PaymentDepositConfigurationCreateComponent,
                PaymentDepositConfigurationRulesPreviewComponent,
                PolicyMgmtConfirmationModalComponent
            ],
            imports: [
                CommonModule,
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
                ContextService,
                RouteStateService,
                HTTPService,
                {
                    provide: PaymentDepositConfigurationStepperDataService,
                    useValue: spyStepperDataService
                },
                {
                    provide: PolicyMgmtService,
                    useClass: MockPolicyMgmtService
                },
                {
                    provide: PolicyMgmtErrorService,
                    UseClass: MockPolicyMgmtErrorService
                },
                {
                    provide: PaymentDepositConfigurationCreateService,
                    useClass: MockPaymentDepositConfigurationCreateService
                },
                {
                    provide: Router,
                    useValue: mockRouter
                },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: from([{ id: 123456 }]) }
                }
            ]
        });

        translateService = TestBed.inject(TranslateService);
        tcTranslateService = TestBed.inject(TcTranslateService);
        tcTranslateService.initTranslation(translateService);
        contextService = TestBed.inject(ContextService);
        stepperDataService = TestBed.inject(PaymentDepositConfigurationStepperDataService);
        createDepositConfigurationService = TestBed.inject(PaymentDepositConfigurationCreateService);

        fixture = TestBed.createComponent(PaymentDepositConfigurationCreateComponent);
        instance = fixture.componentInstance;

        contextService.setPolicyFlow(POLICY_FLOW.EDIT);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);

        fixture.detectChanges();
    });

    it('Should initialize the component', () => {
        // Assert
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
        });
    });

    it('Should set payment deposit configuration data', () => {
        // Assert
        expect(spyStepperDataService.setResponseModel).toBeTruthy();
    });

    it('Property level - should call createPropertyPaymentDepositConfiguration with response model', () => {
        // Arrange
        instance.isEnterpriseLevel = false;
        spyOn(createDepositConfigurationService, 'createUpdatePropertyPaymentDepositConfiguration').and.callThrough();

        // Act
        instance.createUpdatePaymentDepositConfiguration();

        // Assert
        expect(stepperDataService.getPropertyResponseModel).toHaveBeenCalled();
        expect(createDepositConfigurationService.createUpdatePropertyPaymentDepositConfiguration).toHaveBeenCalled();
    });
});
