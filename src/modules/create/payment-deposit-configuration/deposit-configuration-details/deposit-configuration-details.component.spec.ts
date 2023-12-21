/* Angular-Module Imports */
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Third Party Module Imports */
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

/* TC-module Imports */
import { StepperModule } from 'tc-angular-components';
import { TranslationMap } from '../../../core/translation.constant';
import { PaymentDepositConfigurationDetailsComponent } from './deposit-configuration-details.component';
import { ErrorMessage, IChainInfo, IDropDownItem } from '../../../core/common.model';
import {
    CHARGE_TYPES,
    DEPOSIT_CONFIGURATION_STEPS,
    IPaymentDepositConfigurationRulesData,
    IPaymentDepositConfigurationRulesErrorModel
  } from '../payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationDetailsService } from './deposit-configuration-details.service';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { TcTranslateService } from 'tc-angular-services';
import { ContextService } from '../../../core/context.service';

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

export class MockSharedDataService {
  getChainInfo() {
    return {
      chainCode: 'AAM',
      chainHotels: [{
        hotelCode: 1000,
        hotelName: 'Test hotel',
        status: 'add'
      }]
    };
  }
}

const spyDepositConfigurationDetailsService = jasmine.createSpyObj('PaymentDepositConfigurationStepperDataService', [
    'getChargeTypeMapping', 'getSelectedCurrencyIds', 'getDepositConfigurationDetailData', 'getDefaultSelection'
]);

const spyStepperDataService = jasmine.createSpyObj('PaymentDepositConfigurationStepperDataService', [
    'getDepositConfigurationRulesData', 'getDepositConfigurationRequestDefaultCurrenciesSelection'
]);

const paymentDepositConfigurationData: IPaymentDepositConfigurationRulesData
    = require('../../../../assets-policy-mgmt/data/payment-deposit-rule/edit/PaymentDepositConfigurationDetails.json');

describe('Payment Deposit Configuration Details Component', () => {
    let fixture: ComponentFixture<PaymentDepositConfigurationDetailsComponent>;
    let instance: PaymentDepositConfigurationDetailsComponent;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;

    beforeEach((done) => {
        TestBed.configureTestingModule({
            declarations: [
                PaymentDepositConfigurationDetailsComponent
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
                TcTranslateService,
                TranslateService,
                ContextService,
                {
                    provide: PaymentDepositConfigurationStepperDataService,
                    useValue: spyStepperDataService,
                    useClass: MockSharedDataService
                },
                {
                    provide: PaymentDepositConfigurationDetailsService,
                    useClass: spyDepositConfigurationDetailsService
                }
            ]
        }).compileComponents()
          .then(() => {
              tcTranslateService = TestBed.inject(TcTranslateService);
              translateService = TestBed.inject(TranslateService);
              tcTranslateService.initTranslation(translateService);
              fixture = TestBed.createComponent(PaymentDepositConfigurationDetailsComponent);
              instance = fixture.componentInstance;
              instance.continueFromStepper = new Subject<any>();
              instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
              done();
            });
    });

    describe('Payment Deposit Configuration Details flow', () => {
        beforeEach(() => {
            spyStepperDataService.getDepositConfigurationRulesData.and
              .returnValue(paymentDepositConfigurationData);
            spyDepositConfigurationDetailsService.getChargeTypeMapping.and
              .returnValue([[false, false, false],[false, true, false],[false, true, false]]);
            spyStepperDataService.getDepositConfigurationRequestDefaultCurrenciesSelection.and
              .returnValue([{id: 1, name: 'EUR'},{id: 2, name: 'USD'}]);
            spyDepositConfigurationDetailsService.getSelectedCurrencyIds.and
              .returnValue([1,2]);
            fixture.detectChanges();
        });

        it('Payment Deposit Configuration Details component instance to be defined', () => {
            expect(instance).toBeDefined();
            expect(instance).toBeTruthy();
        });

        it('Should initialize component', () => {
            fixture.detectChanges();
            expect(instance.translationMap).toBeDefined();
            expect(instance.errorObj).toBeDefined();
        });
    });
});
