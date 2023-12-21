import { PolicyMgmtTemplateStepperDataService } from '../../policy-mgmt-template-stepper-data.service';
import { ITemplateResponseModel } from '../../policy-mgmt-create-template.model';
import { ContextService } from '../../../../core/context.service';
import { PolicyMgmtStepTemplateDetailsService } from '../policy-mgmt-step-template-details.service';
import { CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS } from '../../../../core/rules-config.constant';
import { POLICY_LEVEL, POLICY_TYPE, CONFIG_TYPE } from '../../../../core/constants';
import { TcTranslateService } from 'tc-angular-services';
import { SharedDataService } from '../../../../core/shared.data.service';
import { IDropDownItem, IHotelInfo } from '../../../../core/common.model';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { PolicyMgmtTemplateDetailsPreviewComponent } from './policy-mgmt-template-details-preview.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { RulesConfigurationService } from '../../../../core/rules-config.service';
import {
  CREATE_TEMPLATE_PROPERTY_GUARANTEE_TEMPLATE_DETAILS, CREATE_TEMPLATE_PROPERTY_DEPOSIT_TEMPLATE_DETAILS,
  CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS
} from '../../../../create/template/policy-mgmt-create-template.constant';

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

class MockPolicyMgmtStepTemplateDetailsService {
  getFieldNameById(list: IDropDownItem[], id: number | string): string {
    return list.find(item => item.id === id).name;
  }
}

const MetaData = {
  acceptedTender: {
    deposit: [
      { id: 8, name: 'Credit Card, Alternate Payments' },
      { id: 1, name: 'IATA' }
    ],
    guarantee: [
      { id: 17, name: 'Accept All' },
      { id: 14, name: 'Corporate ID' },
      { id: 16, name: 'Credit Card' },
      { id: 20, name: 'Hotel Billing (Call Center Only)' },
      { id: 9, name: 'IATA' },
      { id: 18, name: 'Rate Access Code' }
    ]
  }
};
const hotelInfoJson: IHotelInfo = require('../../../../../assets-policy-mgmt/data/hotel-info.json');
const depositRuleList = [
  {
    id: 5611,
    name: 'Test'
  },
  {
    id: 33312,
    name: 'Arrival'
  },
  {
    id: 50871,
    name: 'prod dep rule'
  }
];
class MockSharedDataService {
  getHotelInfo() {
    hotelInfoJson.hotelSettings = {
      ...hotelInfoJson.hotelSettings, ...{ isGdsEnabled: true }
    };
    return hotelInfoJson;
  }
  getMetaData() {
    return MetaData;
  }
  getDepositRulesList() {
    return depositRuleList;
  }
}




describe('Step template component', () => {
  let fixture: ComponentFixture<PolicyMgmtTemplateDetailsPreviewComponent>;
  let instance: PolicyMgmtTemplateDetailsPreviewComponent;
  const spyRulesConfigService = jasmine.createSpyObj('RulesConfigurationService', ['getTemplateDetailsConfigData']);
  let contextService: ContextService;
  let stepperDataService: PolicyMgmtTemplateStepperDataService;
  let tcTranslateService: TcTranslateService;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PolicyMgmtTemplateDetailsPreviewComponent
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
      ],
      providers: [
        TcTranslateService, TranslateService,
        PolicyMgmtTemplateStepperDataService,
        RulesConfigurationService,
        {
          provide: PolicyMgmtStepTemplateDetailsService,
          useClass: MockPolicyMgmtStepTemplateDetailsService
        },
        {
          provide: RulesConfigurationService,
          useValue: spyRulesConfigService
        },
        PolicyMgmtTemplateStepperDataService,
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        },
        ContextService
      ]
    }).compileComponents()
      .then(() => {
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
        fixture = TestBed.createComponent(PolicyMgmtTemplateDetailsPreviewComponent);
        instance = fixture.componentInstance;
        contextService = TestBed.get(ContextService);
        stepperDataService = TestBed.get(PolicyMgmtTemplateStepperDataService);
      });

  }));

  it('template details preview component instance to be defined', () => {
    expect(instance).toBeDefined();
  });

  describe('Template Details preview data for Guarantee Template', () => {
    const acceptedTenderName = 'Accept All';
    const rulesData = CREATE_TEMPLATE_PROPERTY_GUARANTEE_TEMPLATE_DETAILS;
    const guaranteeResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test policy template',
      policyCode: '123',
      policySetting: {
        acceptedTender: 17,
        holdTime: 12
      },
      status: 'ACTIVE',
      textList: [],
      type: 'GUARANTEE'
    };

    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
      spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(guaranteeResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Guarantee', () => {
      expect(instance.previewStepData.fields.acceptedTender).toBeDefined();
      expect(instance.previewStepData.fields.acceptedTender).toEqual(acceptedTenderName);
      expect(instance.previewStepData.fields.lateArrivalTime).toBeDefined();
      expect(instance.previewStepData.fields.lateArrivalTime).toEqual(12);
    });
    it('Should checkVisibility of Fields', () => {
      expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
    });
  });

  describe('Template Details preview data for Cancellation Notice as Same Day', () => {
    const rulesData = CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS;
    const cancellationResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {
        cancellationRule: {
          chargeType: CANCELLATION_OPTIONS.SAME_DAY,
          priorHours: 10
        },
        otaSetting: {
          otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX,
          otaChargeNights: 10
        }
      },
      textList: [],
      status: 'ACTIVE',
      type: 'CANCELLATION'
    };

    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(cancellationResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Cancellation', () => {
      expect(instance.previewStepData.fields.cancellationNotice).toBeDefined();
      expect(instance.previewStepData.fields.cancellationNotice).toEqual(CANCELLATION_OPTIONS.SAME_DAY);
      expect(instance.previewStepData.fields.sameDayNoticeTime).toBeDefined();
      expect(instance.previewStepData.fields.sameDayNoticeTime).toEqual(10);
    });

    it('Should checkVisibility of Fields', () => {
      expect(instance.checkVisibility('cancellationNotice')).toBeTruthy();
    });
  });

  describe('Template Details preview data for Cancellation Notice as Advance Notice', () => {
    const rulesData = CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS;
    const cancellationResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {
        cancellationRule: {
          chargeType: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
          priorHours: 10,
          priorDays: 10
        },
        otaSetting: {
          otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.FLAT,
          otaChargeAmount: 100
        }
      },
      textList: [],
      status: 'ACTIVE',
      type: 'CANCELLATION'
    };

    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(cancellationResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Cancellation as Advance Notice', () => {
      expect(instance.previewStepData.fields.cancellationNotice).toBeDefined();
      expect(instance.previewStepData.fields.cancellationNotice).toEqual(CANCELLATION_OPTIONS.ADVANCE_NOTICE);
      expect(instance.previewStepData.fields.advanceNotice.days).toBe(10);
      expect(instance.previewStepData.fields.advanceNotice.hours).toBe(10);
      expect(instance.previewStepData.fields.otaCancellationChargeNotification).toEqual(OTA_CANCELLATION_CHARGE_OPTIONS.FLAT);
      expect(instance.previewStepData.fields.otaFlatAmt).toBe(100);
    });

    it('Should checkVisibility of Fields', () => {
      expect(instance.checkVisibility('cancellationNotice')).toBeTruthy();
    });
  });
  describe('Template Details preview data for Cancellation Notice as Non Refundable', () => {
    const rulesData = CREATE_TEMPLATE_PROPERTY_CANCELLATION_TEMPLATE_DETAILS;
    const cancellationResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {
        cancellationRule: {
          chargeType: CANCELLATION_OPTIONS.NON_REFUNDABLE,
          priorHours: 0,
          priorDays: 0
        },
        otaSetting: {
          otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE,
          otaChargePercentage: 10
        }
      },
      textList: [],
      status: 'ACTIVE',
      type: 'CANCELLATION'
    };

    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(cancellationResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Cancellation as Non Refundable', () => {
      expect(instance.previewStepData.fields.cancellationNotice).toBeDefined();
      expect(instance.previewStepData.fields.cancellationNotice).toEqual(CANCELLATION_OPTIONS.NON_REFUNDABLE);
      expect(instance.previewStepData.fields.otaCancellationChargeNotification).toEqual(OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE);
      expect(instance.previewStepData.fields.otaPercentageAmt).toBe(10);
    });

    it('Should checkVisibility of Fields', () => {
      expect(instance.checkVisibility('cancellationNotice')).toBeTruthy();
    });
  });

  describe('Template details preview data for Deposit Template', () => {
    const acceptedTenderName = 'Credit Card, Alternate Payments';
    const rulesData = CREATE_TEMPLATE_PROPERTY_DEPOSIT_TEMPLATE_DETAILS;
    const depositResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {
        acceptedTender: 8,
        depositRuleId: 33312
      },
      status: 'ACTIVE',
      textList: [],
      type: 'DEPOSIT'
    };
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
      spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(depositResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Deposit', () => {
      expect(instance.previewStepData.fields.acceptedTender).toBeDefined();
      expect(instance.previewStepData.fields.acceptedTender).toEqual(acceptedTenderName);
      expect(instance.previewStepData.fields.depositRule).toBeDefined();
      expect(instance.previewStepData.fields.depositRule).toEqual('Arrival');
    });

    it('Should checkVisibility of Fields', () => {
      expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
      expect(instance.checkVisibility('depositRule')).toBeTruthy();
    });
  });
});
