/* Angular-Module Imports */
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* Third Party Module Imports */
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

/* TC-module Imports */
import { TcTranslateService } from 'tc-angular-services';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { SharedDataService } from '../../../core/shared.data.service';
import { PaymentDepositConfigurationRulesPreviewComponent } from './deposit-rules-preview.component';
import { ContextService } from 'src/modules/core/context.service';
import { IHotelInfo } from 'src/modules/core/common.model';
import {
  CHARGE_TYPES,
  IPaymentDepositConfigurationRulesData,
  IPropertyPaymentDepositConfigurationRulesData
} from '../payment-deposit-configuration-create.model';

const hotelInfo: IHotelInfo = require('../../../../assets-policy-mgmt/data/hotel-info.json');

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
  getHotelInfo() {
    return hotelInfo;
  }
}

export class MockStepperDataService {
  getDepositConfigurationRulesData() {
    const rulesData: IPaymentDepositConfigurationRulesData = {
      rules: [{
        chargeType: 'FLAT',
        chargeAmounts: [{
          amount: 100,
          currency: 'EUR'
        }, {
          amount: 200,
          currency: 'USD'
        }],
        chargePercentage: 0,
        percentOnEnhancement: 10
      }, {
        chargeType: 'PERCENTAGE',
        chargeAmounts: [],
        chargePercentage: 10,
        percentOnEnhancement: 11
      }, {
        chargeType: 'ARRIVAL_DAY_CHARGE',
        chargeAmounts: [],
        chargePercentage: 0,
        percentOnEnhancement: 0
      }],
      data: {
        chargeType: [
          CHARGE_TYPES.ARRIVAL_DAY_CHARGE,
          CHARGE_TYPES.FLAT,
          CHARGE_TYPES.PERCENTAGE
        ]
      }
    };
    return rulesData;
  }

  getPropertyDepositConfigurationRulesData() {
    const propertyPaymentDepositConfigurationRulesData: IPropertyPaymentDepositConfigurationRulesData = {
      rules: [
        {
          chargeType: 'ARRIVAL_DAY_CHARGE',
          chargeDate: 999,
          chargeAmount: 0,
          chargePercentage: 0,
          percentOnEnhancement: 0,
        },
      ],
      data: {
        chargeType: [
          'ARRIVAL_DAY_CHARGE',
          'FLAT',
          'PERCENTAGE',
        ]
      }
    };
    return propertyPaymentDepositConfigurationRulesData;
  }

  getPropertyDepositConfigurationDefaultCurrency(hotelInfo: IHotelInfo) {
    return 'EUR';
  }
}

describe('PaymentDepositConfigurationRulesPreviewComponent', () => {
  let component: PaymentDepositConfigurationRulesPreviewComponent;
  let fixture: ComponentFixture<PaymentDepositConfigurationRulesPreviewComponent>;
  let stepperDataService: PaymentDepositConfigurationStepperDataService;
  let sharedDataService: SharedDataService;
  let context: ContextService;

  beforeEach(async (done) => {
    await TestBed.configureTestingModule({
      declarations: [
        PaymentDepositConfigurationRulesPreviewComponent
      ],
      imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          },
        })
      ],
      providers: [
        {
          provide: PaymentDepositConfigurationStepperDataService,
          useClass: MockStepperDataService
        },
        ContextService,
        TranslateService,
        TcTranslateService,
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        }
      ]
    })
      .compileComponents()
      .then(() => {
        context = TestBed.inject(ContextService);
        sharedDataService = TestBed.inject(SharedDataService);
        stepperDataService = TestBed.inject(PaymentDepositConfigurationStepperDataService);
        done();
      });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDepositConfigurationRulesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Enterprise Level - Rules Preview instance to be defined', () => {
    // Arrange
    component.isEnterpriseLevel = true;

    // Assert
    expect(component).toBeDefined();
  });

  it('Property Level - Rules Preview instance to be defined', () => {
    // Arrange
    component.isEnterpriseLevel = false;

    // Assert
    expect(component).toBeDefined();
  });
});
