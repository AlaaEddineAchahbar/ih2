import { TestBed, ComponentFixture, inject, waitForAsync } from '@angular/core/testing';
import { PolicyMgmtStepTemplateDetailsComponent } from './policy-mgmt-step-template-details.component';
import { RulesConfigurationService } from '../../../core/rules-config.service';
import { ContextService } from '../../../core/context.service';
import { PolicyMgmtTemplateStepperDataService } from '../policy-mgmt-template-stepper-data.service';
import { PolicyMgmtStepTemplateDetailsService } from './policy-mgmt-step-template-details.service';
import { SharedDataService } from '../../../core/shared.data.service';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateService, TranslateStore, TranslateLoader } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'tc-angular-components';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../common/shared.module';
import { CommonModule } from '@angular/common';
import { Subject, throwError, of } from 'rxjs';
import { TEMPLATE_CONFIG } from '../policy-mgmt-create-template.constant';
import { POLICY_LEVEL, POLICY_TYPE, GLOBAL_CONFIG } from '../../../core/constants';
import { By } from '@angular/platform-browser';
import { ErrorMessage, IHttpErrorResponse } from '../../../core/common.model';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { APP_CONSTANT } from '../../../../app/app.constant';
import { PolicyMgmtCreateTemplateService } from '../policy-mgmt-create-template.service';
import { HTTPService } from '../../../core/http.service';
import { PolicyMgmtErrorService } from '../../../core/error.service';
import { IErrorMessage } from '../../../core/common.model';
import { PolicyMgmtDepositRuleDetailsModalComponent } from './deposit-rule-details-modal/deposit-rule-details-modal';
import { CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS } from '../../../core/rules-config.constant';
import { TranslationMap } from 'src/modules/core/translation.constant';

/**
 * mock shared data service
 */
const spySharedDataService = jasmine.createSpyObj('SharedDataService', ['getHotelInfo', 'getChainInfo']);
class MockSharedDataService {
  getHotelInfo() {
    const hotelInfo = require('../../../../assets-policy-mgmt/data/hotel-info.json');
    return hotelInfo;
  }

  getChainInfo() {
    const chainInfo = require('../../../../assets-policy-mgmt/data/chain-info.json');
    return chainInfo;
  }
}

/**
 * mock PolicyMgmtCreateTemplateService
 */
const depositRuleDetailInfo = require('../../../../assets-policy-mgmt/data/policy-template/getDepositRules/deposit-rule-details.json');
const depoRuleInfoEmpty = require('../../../../assets-policy-mgmt/data/policy-template/getDepositRules/deposit-ruleinfo-empty.json');
class MockPolicyMgmtCreateTemplateService {
  getDepositRuleDetails(ruleId: number) {
    if (ruleId === 1) {
      return of(depositRuleDetailInfo);
    } else if (ruleId === 2) {
      return of(depoRuleInfoEmpty);
    } else {
      const errorObject: IHttpErrorResponse = {
        status: 404,
        statusText: 'OK',
        error: {
          errors: [
            {
              message: 'No Deposit rule found for this property'
            }
          ]
        }
      };
      return throwError(() => errorObject);
    }
  }
}


/**
 * spy stepper data service
 */
const spyStepperDataService = jasmine.createSpyObj('PolicyMgmtTemplateStepperDataService',
  ['getTemplateDetailData', 'setTemplateDetailData']);

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

describe('Step template component', () => {
  let fixture: ComponentFixture<PolicyMgmtStepTemplateDetailsComponent>;
  let instance: PolicyMgmtStepTemplateDetailsComponent;
  let tcTranslateService: TcTranslateService;
  let translateService: TranslateService;
  window['CONFIG'] = {
    tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
    apiUrl: APP_CONSTANT.config.apiUrl
  };
  beforeEach((done) => {
    TestBed.configureTestingModule({
      declarations: [
        PolicyMgmtStepTemplateDetailsComponent,
        PolicyMgmtDepositRuleDetailsModalComponent
      ],
      imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        DropdownModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        NgbModule
      ],
      providers: [
        TcTranslateService, TranslateService,
        RulesConfigurationService,
        ContextService,
        {
          provide: PolicyMgmtTemplateStepperDataService,
          useValue: spyStepperDataService
        },
        PolicyMgmtStepTemplateDetailsService,
        /* {
            provide: PolicyMgmtStepTemplateDetailsService,
            useValue: spyTemplateDetailsService
        }, */
        {
          provide: SharedDataService,
          useValue: spySharedDataService,
          useClass: MockSharedDataService
        },
        {
          provide: PolicyMgmtCreateTemplateService,
          useClass: MockPolicyMgmtCreateTemplateService
        },
        HTTPService,
        PolicyMgmtErrorService
      ]
    }).compileComponents()
      .then(() => {
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
        fixture = TestBed.createComponent(PolicyMgmtStepTemplateDetailsComponent);
        instance = fixture.componentInstance;
        instance.continueFromStepper = new Subject<any>();
        instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
        done();
      });
  });
  it('expect template details to be Defined', () => {
    expect(instance).toBeTruthy();
  });
  it('expect hotelinfo to be defined', () => {
    expect(instance.hotelInfo).toBeDefined();
  });

  it('expect component initialized - PROPERTY-TEMPLATE-GUARANTEE', () => {
    spyStepperDataService.getTemplateDetailData.and.
      returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.GUARANTEE].template_details });
    const spycontextService: ContextService = TestBed.get(ContextService);
    spyOnProperty(spycontextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.GUARANTEE);
    fixture.detectChanges();
    expect(instance.rulesData.fields.acceptedTender).toBeDefined();
    expect(instance.acceptedTenderDefaultIndex).toBeDefined();
  });


  /**
   * Child Test Suite for Template Guarantee
   */
  describe('template flow for PROPERTY-TEMPLATE-GUARANTEE', () => {
    beforeEach((done) => {
      spyStepperDataService.getTemplateDetailData.and.
        returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.GUARANTEE].template_details });
      spyOn(instance.validate, 'emit');
      const spycontextService: ContextService = TestBed.get(ContextService);
      spyOnProperty(spycontextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.GUARANTEE);
      fixture.detectChanges();
      const resetData = {
        selectedIndex: -1,
        selectedObject: {
          id: null,
          name: 'Test'
        }
      };
      instance.onAcceptedTenderChange(resetData);
      instance.onLateArrivalChange(resetData);
      instance.setDefaultIndex();
      fixture.detectChanges();
      done();
    });
    it('expect component initialized - PROPERTY-TEMPLATE-GURANTEE', () => {
      expect(instance.rulesData.fields.acceptedTender).toBeDefined();
      expect(instance.acceptedTenderDefaultIndex).toBeDefined();
    });
    it('should check visibility for each field', () => {
      expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
      expect(instance.checkVisibility('lateArrivalTime')).toBeFalsy();
    });
    it('expect no error in validate step', () => {
      const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elTempName.nativeElement.value = 'Sample Template1';
      elTempName.nativeElement.dispatchEvent(new Event('input'));
      const elTempCode = fixture.debugElement.query(By.css('#policyTemplateCode'));
      elTempCode.nativeElement.value = 'PTest1';
      elTempCode.nativeElement.dispatchEvent(new Event('input'));
      const accecptTenderData = {
        selectedIndex: 0,
        selectedObject: {
          id: 17,
          name: 'Accept All'
        }
      };
      instance.onAcceptedTenderChange(accecptTenderData);

      const lateArrivalValue = {
        selectedIndex: 1,
        selectedObject: {
          id: 14,
          name: '14'
        }
      };
      instance.onLateArrivalChange(lateArrivalValue);
      instance.validateStep();
      expect(instance.validate.emit).toHaveBeenCalled();
    });
    it('expect Late Arrival Error in validate step', () => {
      const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elTempName.nativeElement.value = 'Sample Template';
      elTempName.nativeElement.dispatchEvent(new Event('input'));

      const elTempCode = fixture.debugElement.query(By.css('#policyTemplateCode'));
      elTempCode.nativeElement.value = 'PTest1';
      elTempCode.nativeElement.dispatchEvent(new Event('input'));

      const eventData = {
        selectedIndex: 0,
        selectedObject: {
          id: 17,
          name: 'Accept All'
        }
      };
      const errorMsg = {
        show: true,
        message: 'ERROR.LATE_ARRIVAL_TIME_MUST_BE_CHOSEN'
      };
      instance.onAcceptedTenderChange(eventData);
      fixture.detectChanges();
      instance.validateStep();
      expect(instance.errorObj.lateArrivalErrorMessage).toEqual(errorMsg);
      expect(instance.validate.emit).not.toHaveBeenCalled();
    });

    it('Should hide Late Arrival Error when Accept Tender Dropdown is changed', () => {
      const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elTempName.nativeElement.value = 'Sample Template';
      elTempName.nativeElement.dispatchEvent(new Event('input'));

      const elTempCode = fixture.debugElement.query(By.css('#policyTemplateCode'));
      elTempCode.nativeElement.value = 'PTest1';
      elTempCode.nativeElement.dispatchEvent(new Event('input'));

      const eventData = {
        selectedIndex: 0,
        selectedObject: {
          id: 17,
          name: 'Accept All'
        }
      };
      instance.onAcceptedTenderChange(eventData);
      fixture.detectChanges();
      instance.validateStep();
      fixture.detectChanges();
      const acceptTenderData = {
        selectedIndex: 0,
        selectedObject: {
          id: 14,
          name: 'Credit Card'
        }
      };
      instance.onAcceptedTenderChange(acceptTenderData);
      fixture.detectChanges();
      instance.validateStep();
      fixture.detectChanges();
      expect(instance.errorObj.lateArrivalErrorMessage.show).toBeFalsy();
    });

    it('should set default indexes for all dropdowns', () => {
      instance.setDefaultIndex();
      fixture.detectChanges();
      expect(instance.acceptedTenderDefaultIndex).toEqual(-1);
      expect(instance.lateArrivalDefaultIndex).toEqual(-1);

      instance.rulesData.fields.acceptedTender = 17;
      instance.rulesData.fields.lateArrivalTime = 20;
      instance.rulesData.data.acceptedTender = [{
        id: 17,
        name: 'Accept All'
      }];
      instance.setDefaultIndex();
      fixture.detectChanges();
      expect(instance.acceptedTenderDefaultIndex).toBeGreaterThanOrEqual(0);
      expect(instance.lateArrivalDefaultIndex).toBeGreaterThanOrEqual(0);
    });

  });


  /**
   * child test suite for template cancellation
   */
  describe('template flow for PROPERTY-TEMPLATE-CANCELLATION', () => {
    beforeEach((done) => {
      spyStepperDataService.getTemplateDetailData.and.
        returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.CANCELLATION].template_details });
      spyOn(instance.validate, 'emit');
      const spycontextService: ContextService = TestBed.get(ContextService);
      spyOnProperty(spycontextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
      fixture.detectChanges();

      instance.rulesData.fields.cancellationNotice = CANCELLATION_OPTIONS.SAME_DAY;
      instance.rulesData.fields.sameDayNoticeTime = 10;
      instance.rulesData.fields.otaCancellationChargeNotification = OTA_CANCELLATION_CHARGE_OPTIONS.FLAT;
      instance.rulesData.fields.otaFlatAmt = 10;
      done();
    });
    it('expect component initialized - PROPERTY-TEMPLATE-CANCELLATION', () => {
      expect(instance.rulesData.fields.otaCancellationChargeNotification).toBeDefined();
    });
    it('expect no error in validate step', () => {
      const elName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elName.nativeElement.value = 'some name';
      /* spyTemplateDetailsService.validateStepData.and.returnValue({
          templateNameErrorMessage: new ErrorMessage(),
          lateArrivalErrorMessage: new ErrorMessage()
      }); */
      elName.nativeElement.dispatchEvent(new Event('input'));
      instance.validateStep();
      expect(instance.validate.emit).toHaveBeenCalled();
    });
    it('expect error in validate step', () => {
      const elName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elName.nativeElement.value = '';
      elName.nativeElement.dispatchEvent(new Event('input'));
      instance.validateStep();
      expect(instance.validate.emit).not.toHaveBeenCalled();
    });
    it('should check visibility for each field', () => {
      expect(instance.checkVisibility('cancellationNotice')).toBeTruthy();
      expect(instance.checkVisibility('otaCancellationChargeNotification')).toBeTruthy();
    });

    it('should set default indexes for same day dropdown', () => {
      instance.setDefaultIndex();
      expect(instance.hoursDefaultIndex).toBeDefined();
    });

    it('should set value of cancellation notice on radio button change', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll(By.css('.cancellation-notice-options input[type="radio"]'));
      radioOptions.findIndex(item => {
        item.triggerEventHandler('change', { target: item.nativeElement });
        fixture.detectChanges();
        instance.setCancellationNotice(item.nativeElement.value);
        expect(instance.rulesData.fields.cancellationNotice).toEqual(item.nativeElement.id);
      });
    });

    it('should set value of Ota cancellation notice on radio button change', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll(By.css('.ota-cancellation-options input[type="radio"]'));
      radioOptions.findIndex(item => {
        item.triggerEventHandler('change', { target: item.nativeElement });
        fixture.detectChanges();
        instance.setOtaCancellationNotice(item.nativeElement.value);
        expect(instance.rulesData.fields.otaCancellationChargeNotification).toEqual(item.nativeElement.id);
      });
    });

    it('should set same day hours on hours selected from dropdown', () => {
      let sameDayHourSelected = {
        selectedIndex: 3,
        selectedObject: {
          id: 3,
          name: '3'
        }
      };

      instance.onSameDayHoursChange(sameDayHourSelected);
      expect(instance.rulesData.fields.sameDayNoticeTime).toEqual(3);

      sameDayHourSelected = {
        selectedIndex: -1,
        selectedObject: {
          id: null,
          name: ''
        }
      };
      instance.onSameDayHoursChange(sameDayHourSelected);
      expect(instance.rulesData.fields.sameDayNoticeTime).toBeNull();
    });
  });


  /**
   * Child Test Suite For Template Deposit
   */
  describe('template flow for PROPERTY-TEMPLATE-DEPOSIT', () => {
    beforeEach((done) => {
      spyStepperDataService.getTemplateDetailData.and.
        returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.DEPOSIT].template_details });
      spyOn(instance.validate, 'emit');
      const spycontextService: ContextService = TestBed.get(ContextService);
      spyOnProperty(spycontextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.DEPOSIT);
      fixture.detectChanges();
      const depositRuleSelected = {
        selectedIndex: -1,
        selectedObject: {
          id: null,
          name: 'Test'
        }
      };
      instance.onDepositRuleSelectionChange(depositRuleSelected);
      instance.setDefaultIndex();
      fixture.detectChanges();
      done();
    });

    it('should check visibility for each field', () => {
      expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
      expect(instance.checkVisibility('depositRule')).toBeTruthy();
    });

    it('Should View Deposit Rule link be disabled if Deposit Rule is not selected', () => {
      instance.depositRuleDefaultIndex = -1;
      const btn = fixture.debugElement.nativeElement.querySelector('.deposit-rule > button');
      expect(btn.disabled).toBeTruthy();
    });

    it('Should Select Deposit Rule and View Deposit Rule link must be enabled', () => {
      instance.setDefaultIndex();
      fixture.detectChanges();
      const selectedDR = {
        selectedIndex: 0,
        selectedObject: { id: 1, name: '100% Deposit Rule' }
      };
      instance.onDepositRuleSelectionChange(selectedDR);
      fixture.detectChanges();
      const btn = fixture.debugElement.nativeElement.querySelector('.deposit-rule > button');
      expect(btn.disabled).toBeFalsy();
    });

    it('Should open Deposit Rule Details Modal when clicked on View Deposit Rule', () => {
      const selectedDR = {
        selectedIndex: 0,
        selectedObject: { id: 1, name: '100% Deposit Rule' }
      };
      instance.onDepositRuleSelectionChange(selectedDR);
      fixture.detectChanges();
      instance.showDepositRuleDetails();
      fixture.detectChanges();
      expect(instance.depositRuleDetailsModal.depositRuleDetails.name).toEqual('Sample Rule');
      instance.depositRuleDetailsModal.close();
      fixture.detectChanges();
    });

    it('Should open Deposit Rule Details Modal with Error For Empty Rule Info', () => {
      const selectedDR = {
        selectedIndex: 1,
        selectedObject: { id: 2, name: '100% Deposit Rule' }
      };
      instance.onDepositRuleSelectionChange(selectedDR);
      fixture.detectChanges();
      instance.showDepositRuleDetails();
      fixture.detectChanges();
      expect(instance.depositRuleDetailsModal.depositRuleDetails.name).toEqual('Sample Rule');
      instance.depositRuleDetailsModal.close();
      fixture.detectChanges();
    });

    it('Should open Toast Mesage if Deposit RuleId is invalid', () => {
      const selectedDR = {
        selectedIndex: 2,
        selectedObject: { id: 3, name: 'Error Rule' }
      };
      instance.onDepositRuleSelectionChange(selectedDR);
      fixture.detectChanges();
      instance.showDepositRuleDetails();
      fixture.detectChanges();
      const depositAPIErrorMsg: IErrorMessage = {
        show: true,
        message: {
          bodyText: ['No Deposit rule found for this property'],
          titleText: ''
        }
      };
      expect(instance.apiDepositRuleDetailsErrorMessage).toEqual(depositAPIErrorMsg);
    });

    it('should set default indexes for all dropdowns', () => {
      instance.setDefaultIndex();
      fixture.detectChanges();
      expect(instance.acceptedTenderDefaultIndex).toEqual(-1);
      expect(instance.depositRuleDefaultIndex).toEqual(-1);

      instance.rulesData.fields.acceptedTender = 17;
      instance.rulesData.fields.depositRule = 2;
      instance.rulesData.data.acceptedTender = [{
        id: 17,
        name: 'Accept All'
      }];
      instance.setDefaultIndex();
      fixture.detectChanges();
      expect(instance.acceptedTenderDefaultIndex).toBeDefined();
      expect(instance.depositRuleDefaultIndex).toBeDefined();
    });

    it('should set deposit rule is selected', () => {
      let depositRuleSelected = {
        selectedIndex: 0,
        selectedObject: {
          id: 5611,
          name: 'Test'
        }
      };
      instance.onDepositRuleSelectionChange(depositRuleSelected);
      expect(instance.rulesData.fields.depositRule).toEqual(5611);

      depositRuleSelected = {
        selectedIndex: -1,
        selectedObject: {
          id: null,
          name: 'Test'
        }
      };
      instance.onDepositRuleSelectionChange(depositRuleSelected);
      expect(instance.rulesData.fields.depositRule).toBeNull();
    });

  });

  describe('Get text depending on policy level', () => {
    let translationMap = TranslationMap;
    let spycontextService: ContextService;

    beforeEach((done) => {
      spyStepperDataService.getTemplateDetailData.and.
        returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.CANCELLATION].template_details });
      spycontextService = TestBed.get(ContextService);
      done();
    });

    it('PROPERTY - Get Enable Installment Tooltip Text', () => {
      // Arrange
      spyOnProperty(spycontextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.PROPERTY);
      fixture.detectChanges();

      // Act & Assert
      expect(instance.getEnableInstallmentTooltipText()).toEqual(translationMap.ENABLED_INSTALLMENTS_ISACTIVE);
    });

    it('ENTERPRISE - Get Enable Installment Tooltip Text', () => {
      // Arrange
      spyOnProperty(spycontextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.ENTERPRISE);
      fixture.detectChanges();

      // Act & Assert
      expect(instance.getEnableInstallmentTooltipText()).toEqual(translationMap.ENABLED_INSTALLMENTS);
    });
  });
});
