/**
 * Core angular modules
 */
import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TcTranslateService, TcHttpHandler } from 'tc-angular-services';

/**
 * Third party library modules - bootstrap, primeng etc
 */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Application level components
 */
import { PolicyMgmtComponent } from './policy-mgmt.component';
import { APP_CONSTANT } from '../app/app.constant';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextService } from './core/context.service';
import { RouteStateService } from './core/route.state.service';
import { RulesConfigurationService } from './core/rules-config.service';
import { PolicyMgmtService } from './policy-mgmt.service';
import { SharedDataService } from './core/shared.data.service';
import { PolicyMgmtErrorService } from './core/error.service';
import { HTTPService } from './core/http.service';
import { routes } from './policy-mgmt.routing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { from } from 'rxjs/internal/observable/from';


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

/**
 * SPY for TCTranslate service
 */
const spyTranslateService = jasmine.createSpyObj('TcTranslateService', ['initTranslation']);

describe('Policy Mgmt Component', () => {
  beforeEach(async(() => {
    window['CONFIG'] = {
      tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
      apiUrl: APP_CONSTANT.config.apiUrl
    };

    document.cookie = 'tc_pref={\"locale\":\"en\"}';
    TestBed.configureTestingModule({
      declarations: [
        PolicyMgmtComponent
      ],
      imports: [
        CommonModule,
        NgbModule,
        HttpClientModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        TranslateService,
        TcHttpHandler,
        {
          provide: TcTranslateService,
          useValue: spyTranslateService
        },
        HTTPService,
        ContextService,
        RouteStateService,
        RulesConfigurationService,
        PolicyMgmtService,
        SharedDataService,
        PolicyMgmtErrorService,
        {
          provide: ActivatedRoute,
          useValue: { queryParams: from([{ id: 12345 }]), snapshot: {paramMap: {get: () => 'AAM'}} }
        }
      ]
    }).compileComponents();
  }));

  /**
   * Test case to check wether app is rendering
   */
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(PolicyMgmtComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  /* it('call tctranalate service to fetch translations', () => {
    expect(spyTranslateService.initTranslation).toHaveBeenCalled();
  }); */

  it('should initialize token', () => {
    const fixture = TestBed.createComponent(PolicyMgmtComponent);
    const instance = fixture.componentInstance;
    expect(instance.tokenData).toBeDefined();
  });

  /*   it('expect to route to search', async(() => {
      const router = TestBed.get(Router);
      router.navigate(['policy-mgmt/property/search/policy']);
    })); */

});
