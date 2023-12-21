/* Angular-Module Imports */
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Third Party Module Imports */
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

/* TC-module Imports */
import { StepperModule } from 'tc-angular-components';
import { TranslationMap } from '../../../core/translation.constant';
import { PaymentDepositConfigurationNameComponent } from './deposit-configuration-name.component';
import { ErrorMessage } from '../../../core/common.model';
import {
    DEPOSIT_CONFIGURATION_STEPS,
    IPaymentDepositConfigurationDetailData,
    IPaymentDepositConfigurationNameErrorModel
  } from '../payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationNameService } from './deposit-configuration-name.service';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { TcTranslateService } from 'tc-angular-services';

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

class MockPaymentDepositConfigurationNameService {
    validateDepositConfigurationDetailStepData(data: IPaymentDepositConfigurationDetailData) {
      const errorObj: IPaymentDepositConfigurationNameErrorModel = {
        depositConfigurationNameErrorMessage: new ErrorMessage()
      };

      if (data.paymentDepositConfigurationName.length === 0) {
          errorObj.depositConfigurationNameErrorMessage = {
              show: true,
              message: new TcTranslateService().translateService.instant(TranslationMap.ENTER_A_DEPOSIT_CONFIGURATION_NAME),
          };
      }
      return errorObj;
    }
}

const spyStepperDataService = jasmine.createSpyObj('PaymentDepositConfigurationStepperDataService', [
    'setDepositConfigurationDetailName', 'getDepositConfigurationDetailData'
]);

describe('Payment Deposit Configuration Name Component', () => {
    let fixture: ComponentFixture<PaymentDepositConfigurationNameComponent>;
    let instance: PaymentDepositConfigurationNameComponent;
    let depositConfigurationNameService: PaymentDepositConfigurationNameService;

    beforeEach((done) => {
        TestBed.configureTestingModule({
            declarations: [
                PaymentDepositConfigurationNameComponent
            ],
            imports: [
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient]
                    }
                }),
                StepperModule
            ],
            providers: [
                {
                    provide: PaymentDepositConfigurationStepperDataService,
                    useValue: spyStepperDataService
                },
                {
                    provide: PaymentDepositConfigurationNameService,
                    useClass: MockPaymentDepositConfigurationNameService
                }
            ]
        }).compileComponents()
          .then(() => {
              depositConfigurationNameService = TestBed.inject(PaymentDepositConfigurationNameService);
              fixture = TestBed.createComponent(PaymentDepositConfigurationNameComponent);
              instance = fixture.componentInstance;
              instance.continueFromStepper = new Subject<any>();
              instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
              done();
            });
    });

    describe('Payment Deposit Configuration Name flow', () => {
        beforeEach(() => {
            spyStepperDataService.getDepositConfigurationDetailData.and
              .returnValue('Deposit Configuration T1');
            spyOn(instance.validate, 'emit');
            fixture.detectChanges();
        });

        it('Payment Deposit Configuration Name component instance to be defined', () => {
            expect(instance).toBeDefined();
            expect(instance).toBeTruthy();
        });

        it('Should initialize component', () => {
            fixture.detectChanges();
            expect(instance.translationMap).toBeDefined();
            expect(instance.errorObj).toBeDefined();
        });

        it('Should emit data when validateStep() gets called and validation is passed', () => {
            instance.depositConfigurationDetailData.paymentDepositConfigurationName = 'Deposit Configuration T2';
            instance.validateStep();
            expect(instance.validate.emit({
              stepNumber: DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_NAME,
              eventType: null
            })).toHaveBeenCalled();
        });

        it('Should not emit data when validateStep() gets called and validation is not passed', () => {
          instance.depositConfigurationDetailData.paymentDepositConfigurationName = '';
          instance.validateStep();
          expect(instance.validate.emit({
            stepNumber: DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_NAME,
            eventType: null
          })).toBeUndefined;
      });
    });
});
