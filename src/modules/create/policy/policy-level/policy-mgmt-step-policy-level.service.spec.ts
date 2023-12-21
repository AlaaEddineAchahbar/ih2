import { PolicyMgmtStepPolicyLevelService } from './policy-mgmt-step-policy-level.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TcTranslateService } from 'tc-angular-services';
import { async, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { IPolicyLevelParams, IPolicyLevelErrorModel } from '../policy-mgmt-create-policy.model';
import { PROPERTY_POLICY_CREATION_LEVEL } from '../../../core/rules-config.constant';
import { ErrorMessage } from '../../../core/common.model';
import { IPolicyMetadata } from '../../../core/rules-metadata.model';

/**
 * AoT requires an exported function for factories
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

const ratePlanCategoryJson = require('../../../../assets-policy-mgmt/data/formatted-rateplan-dropdown.json');
describe('Policy Level Service Initialized', () => {
    let policyLevelService: PolicyMgmtStepPolicyLevelService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
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
                TcTranslateService,
                TranslateService,
                PolicyMgmtStepPolicyLevelService,
            ]
        });
        policyLevelService = TestBed.get(PolicyMgmtStepPolicyLevelService);
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
    }));
    it('Should Create Mock Service', () => {
        expect(policyLevelService).toBeTruthy();
    });
    it('Should Validate Data with No Error Encountered', () => {
        const data: IPolicyLevelParams = {
            policyLevel: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
            ratePlans: [],
            rateCategories: [],
            chainCategories: []
        };
        const errorObj: IPolicyLevelErrorModel = {
            policyLevelErrorMessage: new ErrorMessage()
        };

        const flag = policyLevelService.validateStepsData(data);
        expect(flag).toEqual(errorObj);
    });
    it('Should Validate Data with Error Encountered for Radio Button Not Selected', () => {
        const data: IPolicyLevelParams = {
            policyLevel: '',
            ratePlans: [],
            rateCategories: [],
            chainCategories: []
        };
        const flag = policyLevelService.validateStepsData(data);
        expect(flag.policyLevelErrorMessage.show).toBeTruthy();
    });
    it('RateCategory Radio Btn Selected but no values are selected from Dropdwon list', () => {
        const data: IPolicyLevelParams = {
            policyLevel: PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY,
            ratePlans: [],
            rateCategories: [],
            chainCategories: []
        };
        const flag = policyLevelService.validateStepsData(data);
        expect(flag.policyLevelErrorMessage.show).toBeTruthy();
    });
    it('RatePlan Radio btn Selected but no values are selected from Dropdwon list', () => {
        const data: IPolicyLevelParams = {
            policyLevel: PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN,
            ratePlans: [],
            rateCategories: [],
            chainCategories: []
        };
        const flag = policyLevelService.validateStepsData(data);
        expect(flag.policyLevelErrorMessage.show).toBeTruthy();
    });
    it('RatePlan Radio btn Selected but Exceeds Max-Limit(20) Selection from Dropdwon list', () => {
        const selectedObject: Array<IPolicyMetadata> = ratePlanCategoryJson;
        selectedObject[0].expanded = true;
        for (const i in selectedObject[0].list) {
            if (selectedObject[0].list[i]) {
                selectedObject[0].list[i].selected = true;
            }
        }
        const data: IPolicyLevelParams = {
            policyLevel: PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN,
            ratePlans: selectedObject,
            rateCategories: [],
            chainCategories: []
        };
        const flag = policyLevelService.validateStepsData(data);
        expect(flag.policyLevelErrorMessage.show).toBeTruthy();
    });
});
