/**
 * Core angular modules
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Third party library modules - bootstrap, primeng etc
 */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

/**
 * Travelclick library tc-angular-components modules
 */
import { TcTranslateService } from 'tc-angular-services';

/**
 * Application level components
 */
import { PolicyMgmtRouting } from './policy-mgmt.routing';
import { PolicyMgmtComponent } from './policy-mgmt.component';
import { HTTPService } from './core/http.service';
import { ContextService } from './core/context.service';
import { RouteStateService } from './core/route.state.service';
import { RulesConfigurationService } from './core/rules-config.service';
import { PolicyMgmtService } from './policy-mgmt.service';
import { SharedDataService } from './core/shared.data.service';
import { PolicyMgmtErrorService } from './core/error.service';
import { GLOBAL_CONFIG } from './core/constants';
import { En } from './translations/en';
import { RulesMataDataService } from './core/rules-meta-data.service';
import { PolicyMgmtUtilityService } from './core/utility.service';
import { PolicyMgmtSearchPayloadService } from './core/search-payload.service';


/**
 *  AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient) {
    /**
     * Update i18nUrl and set it for loading translations
     */
    let langApiUrl;
    if (GLOBAL_CONFIG.PRODUCTION) {
        langApiUrl = window['CONFIG']['apiUrl']
            .replace('{{api_module_context_path}}', 'i18n/v1')
            + 'apps/ent-policy-ui/locales/';
    } else {
        langApiUrl = 'http://localhost:4200/#/assets-policy-mgmt/locales/';
    }

    const queryStringParams = '?include=ih_db';

    return new TcTranslateService().loadTranslation(http, langApiUrl, queryStringParams);
}

/**
 *  AoT requires an exported class for missing translations
 */
export class PolicyMgmtMissingTranslationHandler implements MissingTranslationHandler {
    /**
     * returns english keys from local JSON if API is unavailable
     * @param params: MissingTranslationHandlerParams
     */
    enRef: En;
    constructor() {
        this.enRef = new En();
    }
    handle(params: MissingTranslationHandlerParams): string {
        if (params.key && this.enRef.translations[params.key]) {
            if (params.interpolateParams) {
                let keyString = this.enRef.translations[params.key];
                const matchStringArr = (keyString.match(/{{[a-zA-Z\s\d#]+}}/g) || []);
                for (const item of matchStringArr) {
                    const key: string = item.substring(2, item.indexOf('}}'));
                    const evaluatedVal: string = (params.interpolateParams[key]) ? params.interpolateParams[key] : item;
                    keyString = keyString.replace(item, evaluatedVal);
                }
                return keyString;
            }
        }
        return this.enRef.translations[params.key];
    }
}

/**
 * The bootstrap module
 * This is actual child application module which will be loaded lazily in root application
 */
@NgModule({
    declarations: [
        PolicyMgmtComponent
    ],
    imports: [
        CommonModule,
        NgbModule,
        PolicyMgmtRouting,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            missingTranslationHandler: {
                provide: MissingTranslationHandler,
                useClass: PolicyMgmtMissingTranslationHandler,
                deps: [HttpClient]
            }
        })
    ],
    exports: [
        PolicyMgmtComponent
    ],
    providers: [
        TcTranslateService,
        HTTPService,
        ContextService,
        RouteStateService,
        RulesConfigurationService,
        PolicyMgmtService,
        SharedDataService,
        PolicyMgmtErrorService,
        RulesMataDataService,
        PolicyMgmtUtilityService,
        PolicyMgmtSearchPayloadService
    ],
    bootstrap: [PolicyMgmtComponent]
})
export class PolicyMgmtModule { }
