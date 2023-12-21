/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyMgmtStepPolicyLevelPreviewComponent } from './policy-mgmt-step-policy-level-preview.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PolicyMgmtPolicyStepperDataService } from '../../policy-mgmt-policy-stepper-data.service';
import { ContextService } from 'src/modules/core/context.service';
import { RulesConfigurationService } from 'src/modules/core/rules-config.service';
import { SharedDataService } from 'src/modules/core/shared.data.service';
import { RulesMataDataService } from 'src/modules/core/rules-meta-data.service';
import { PolicyMgmtUtilityService } from 'src/modules/core/utility.service';
import { PolicyMgmtStepPolicyDetailsService } from '../../policy-details/policy-mgmt-step-policy-details.service';
import { PolicyMgmtDateSelectorService } from '../../policy-details/date-selector/policy-mgmt-date-selector.service';
import { IPolicyLevelRulesData } from '../../policy-mgmt-create-policy.model';
import { POLICY_CONFIG } from '../../policy-mgmt-create-policy.constant';

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

class MockContextService {
  get policyLevel(): string {
    return 'property';
  }
}

class MockPolicyMgmtPolicyStepperDataService{
  getPolicyLevelData(): IPolicyLevelRulesData {
    return { ...POLICY_CONFIG['property']['policy_level'] };
  }
}

describe('PolicyMgmtStepPolicyLevelPreviewComponent', () => {
  let component: PolicyMgmtStepPolicyLevelPreviewComponent;
  let fixture: ComponentFixture<PolicyMgmtStepPolicyLevelPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyMgmtStepPolicyLevelPreviewComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        PolicyMgmtDateSelectorService,
        PolicyMgmtStepPolicyDetailsService,
        PolicyMgmtUtilityService,
        RulesMataDataService,
        TcTranslateService,
        SharedDataService,
        {
          provide: PolicyMgmtPolicyStepperDataService,
          useClass: MockPolicyMgmtPolicyStepperDataService
        },
        {
          provide: ContextService,
          useClass: MockContextService
        },
        RulesConfigurationService
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PolicyMgmtStepPolicyLevelPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
