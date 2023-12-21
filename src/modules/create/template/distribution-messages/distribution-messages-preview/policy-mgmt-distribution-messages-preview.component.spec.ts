import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TcTranslateService } from 'tc-angular-services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { DropdownModule } from 'tc-angular-components';
import { PolicyMgmtDistributionMessagesPreviewComponent } from './policy-mgmt-distribution-messages-preview.component';
import { PolicyMgmtTemplateStepperDataService } from '../../policy-mgmt-template-stepper-data.service';
import { RulesConfigurationService } from '../../../../core/rules-config.service';
import { IDistributionMsgParams, ITemplateResponseModel } from '../../policy-mgmt-create-template.model';
import { SharedDataService } from '../../../../core/shared.data.service';
import { ContextService } from '../../../../core/context.service';
import { POLICY_LEVEL, CONFIG_TYPE, POLICY_TYPE } from '../../../../core/constants';
import { CREATE_TEMPLATE_PROPERTY_GUARANTEE_DISTRIBUTION_MSG,
  CREATE_TEMPLATE_PROPERTY_CANCELLATION_DISTRIBUTION_MSG,
  CREATE_TEMPLATE_PROPERTY_DEPOSIT_DISTRIBUTION_MSG } from '../../policy-mgmt-create-template.constant';

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

const spyRulesConfigService = jasmine.createSpyObj('RulesConfigurationService', ['getDistributionMsgConfigData']);

describe('Distribution Message Component', () => {
  let fixture: ComponentFixture<PolicyMgmtDistributionMessagesPreviewComponent>;
  let instance: PolicyMgmtDistributionMessagesPreviewComponent;
  let contextService: ContextService;
  let stepperDataService: PolicyMgmtTemplateStepperDataService;

  beforeEach((done) => {

    TestBed.configureTestingModule({
      declarations: [
        PolicyMgmtDistributionMessagesPreviewComponent
      ],
      imports: [
        CommonModule,
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
      ],
      providers: [
        TcTranslateService,
        TranslateService,
        PolicyMgmtTemplateStepperDataService,
        RulesConfigurationService,
        PolicyMgmtTemplateStepperDataService,
        {
          provide: RulesConfigurationService,
          useValue: spyRulesConfigService
        },
        SharedDataService,
        ContextService
      ]
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PolicyMgmtDistributionMessagesPreviewComponent);
        instance = fixture.componentInstance;
        contextService = TestBed.get(ContextService);
        stepperDataService = TestBed.get(PolicyMgmtTemplateStepperDataService);
        done();
      });
  });
  it('Distribution Message Preview Component instance to be defined', () => {
    expect(instance).toBeDefined();
  });

  describe('Distribution Messages for Guarantee Template', () => {
    const rulesData = CREATE_TEMPLATE_PROPERTY_GUARANTEE_DISTRIBUTION_MSG;
    const guaranteeResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {},
      status: 'ACTIVE',
      textList: [
        {
          textType: 'ONLINE_CALL_CENTER_MESSAGE',
          languageTexts: [
            {
              languageId: 1,
              text: 'Online CC message'
            }
          ]
        },
        {
          textType: 'POLICY_GDSLINE1_MSG',
          languageTexts: [
            {
              languageId: 1,
              text: 'GDS line1 message'
            }
          ]
        },
        {
          textType: 'POLICY_GDSLINE2_MSG',
          languageTexts: [
            {
              languageId: 1,
              text: 'GDS line2 message'
            }
          ]
        },
      ],
      type: 'GUARANTEE'
    };
    const guaranteeRulesData: IDistributionMsgParams = {
      messageLanguage: 1,
      textList: {
        gdsMessage: {
          gdsLine1: {
            1: 'GDS line1 message'
          },
          gdsLine2: {
            1: 'GDS line2 message'
          }
        },
        onlineCCMessage: {
          1: 'Online CC message'
        }
      }
    };
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
      spyRulesConfigService.getDistributionMsgConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(guaranteeResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Guarantee', () => {
      expect(instance.previewStepData.fields).toEqual(guaranteeRulesData);
    });
    it('Should checkVisibility of Fields', () => {
      expect(instance.checkVisibility('gdsRateNotification')).toBeFalsy();
    });
  });

  describe('Distribution Messages for Cancellation Template', () => {
    const rulesData = CREATE_TEMPLATE_PROPERTY_CANCELLATION_DISTRIBUTION_MSG;
    const cancellationResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {},
      status: 'ACTIVE',
      textList: [
        {
          textType: 'ONLINE_CALL_CENTER_MESSAGE',
          languageTexts: [
            {
              languageId: 1,
              text: 'Online CC message'
            }
          ]
        },
        {
          textType: 'POLICY_GDSLINE1_MSG',
          languageTexts: [
            {
              languageId: 1,
              text: 'GDS line1 message'
            }
          ]
        },
        {
          textType: 'POLICY_GDSLINE2_MSG',
          languageTexts: [
            {
              languageId: 1,
              text: 'GDS line2 message'
            }
          ]
        },
      ],
      type: 'CANCELLATION'
    };
    const cancellationRulesData: IDistributionMsgParams = {
      messageLanguage: 1,
      textList: {
        gdsMessage: {
          gdsLine1: {
            1: 'GDS line1 message'
          },
          gdsLine2: {
            1: 'GDS line2 message'
          }
        },
        onlineCCMessage: {
          1: 'Online CC message'
        }
      }
    };
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      spyRulesConfigService.getDistributionMsgConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(cancellationResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Cancellation', () => {
      expect(instance.previewStepData.fields).toEqual(cancellationRulesData);
    });
  });

  describe('Distribution Messages for Deposit Template', () => {
    const rulesData = CREATE_TEMPLATE_PROPERTY_DEPOSIT_DISTRIBUTION_MSG;
    const depositResponseData: ITemplateResponseModel = {
      hotelCode: 6098,
      name: 'Test Policy',
      policyCode: '123',
      policySetting: {
      },
      status: 'ACTIVE',
      textList: [
        {
          textType: 'ONLINE_CALL_CENTER_MESSAGE',
          languageTexts: [
            {
              languageId: 1,
              text: 'Online CC message'
            }
          ]
        },
        {
          textType: 'POLICY_GDSLINE1_MSG',
          languageTexts: [
            {
              languageId: 1,
              text: 'GDS line1 message'
            }
          ]
        },
        {
          textType: 'POLICY_GDSLINE2_MSG',
          languageTexts: [
            {
              languageId: 1,
              text: 'GDS line2 message'
            }
          ]
        },
      ],
      type: 'DEPOSIT'
    };
    const depositRulesData: IDistributionMsgParams = {
      gdsRateNotification: false,
      messageLanguage: 1,
      textList: {
        gdsMessage: {
          gdsLine1: {
            1: 'GDS line1 message'
          },
          gdsLine2: {
            1: 'GDS line2 message'
          }
        },
        onlineCCMessage: {
          1: 'Online CC message'
        }
      }
    };
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      spyRulesConfigService.getDistributionMsgConfigData.and.returnValue(rulesData);
      stepperDataService.setTemplateResponseModel(depositResponseData);
      fixture.detectChanges();
      done();
    });

    it('Should set previewStepData for Deposit', () => {
      expect(instance.previewStepData.fields).toEqual(depositRulesData);
    });

  });
});
