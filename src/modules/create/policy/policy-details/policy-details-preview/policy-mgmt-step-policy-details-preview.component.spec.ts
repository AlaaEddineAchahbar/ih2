/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PolicyMgmtStepPolicyDetailsPreviewComponent } from './policy-mgmt-step-policy-details-preview.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PolicyMgmtPolicyStepperDataService } from '../../policy-mgmt-policy-stepper-data.service';

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
/* describe('PolicyMgmtStepPolicyDetailsPreviewComponent', () => {
  let component: PolicyMgmtStepPolicyDetailsPreviewComponent;
  let fixture: ComponentFixture<PolicyMgmtStepPolicyDetailsPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyMgmtStepPolicyDetailsPreviewComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        PolicyMgmtPolicyStepperDataService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyMgmtStepPolicyDetailsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); */
