import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SharedDataService } from './core/shared.data.service';
import { HTTPService } from './core/http.service';
import { POLICY_LEVEL, DEFAULT_VALUES, POLICY_TYPE, CONFIG_TYPE, API_CONTEXT_PATH} from './core/constants';
import { IHttpErrorResponse, IHTTPResponse, IHotelInfo, IMetadata } from './core/common.model';
import { Observable, of } from 'rxjs';
import { PolicyMgmtService } from './policy-mgmt.service';
import { ContextService } from './core/context.service';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateService, TranslateLoader, TranslateStore } from '@ngx-translate/core';
import { APP_CONSTANT } from '../app/app.constant';
import { GUARANTEE_ACCEPTED_TENDER_LIST } from './create/template/policy-mgmt-create-template.constant';
import { RulesMataDataService } from './core/rules-meta-data.service';
import { IPolicyMetaDataTypes } from './core/rules-metadata.model';
import { PolicyMgmtUtilityService } from './core/utility.service';

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
 * Mock SharedDataService
 */
const hotelInfo = require('../assets-policy-mgmt/data/hotel-info.json');
const chainInfo = require('../assets-policy-mgmt/data/chain-info.json');
const languages = require('../assets-policy-mgmt/data/languages.json');
const metaDataJson = require('../assets-policy-mgmt/data/meta-data.json');
const rulesMetaDataJson = require('../assets-policy-mgmt/data/rules-meta-data.json');
const rateCategoryJson = require('../assets-policy-mgmt/data/ratecategory-by-owner-reference-dropdown.json');
const ratePlanCategoryJson = require('../assets-policy-mgmt/data/rateplancategory-dropdown.json');
const policyTemplateJson = require('../assets-policy-mgmt/data/policy-template-dropdown.json');
const enterpriseRateCategoryJson = require('../assets-policy-mgmt/data/enterprise-rate-categories-dropdown.json');
const enterpriseRateCatalogJson = require('../assets-policy-mgmt/data/enterprise-rate-catalogs-dropdown.json');
const enterprisePolicyTemplateJson = require('../assets-policy-mgmt/data/enterprise-policy-templates-dropdown.json');
const hotel_setting306 = require('../assets-policy-mgmt/data/hotel-settings.json');
const errorObject: IHttpErrorResponse = {
    status: 404,
    statusText: 'OK',
    error: 'Error'
};
let useHttp;

class MockSharedDataService {
    private policyMetadata: IPolicyMetaDataTypes;
    constructor() {
        this.policyMetadata = {};
    }
    getHotelInfo() {
        return useHttp === false ? hotelInfo : null;
    }

    getChainInfo() {
        return useHttp === false ? chainInfo : null;
    }

    getLanguages() {
        return useHttp === false ? languages : null;
    }

    setLanguages() {

    }

    getMetaData() {
        return useHttp === false ? metaDataJson : null;
    }
    setMetaData() {

    }

    setHotelInfo() {

    }

    setChainInfo() {

    }

    setRulesMetaData() {

    }

    getRulesMetaData() {
        return useHttp === false ? rulesMetaDataJson : null;
    }

    setPolicyMetadata(type, data) {
        this.policyMetadata[type] = data;
    }

    getPolicyMetadata(type) {
        return this.policyMetadata[type];
    }
}

class MockHttpService {
    response: IHTTPResponse;
    get(urlPath) {
        if (urlPath === 'hotels/1206/info?include=roomtypes') {
            this.response = {
                status: 200,
                body: hotelInfo
            };
        } else if (urlPath === 'chains/AAM?includes=categoryGroups') {
            this.response = {
                status: 200,
                body: chainInfo
            };
        } else if (urlPath === 'common/languages') {
            this.response = {
                status: 200,
                body: languages
            };
        } else if (urlPath === 'chains/') {
            this.response = {
                status: 200,
                body: chainInfo
            };
        } else if (urlPath === 'metadata') {
            this.response = {
                status: 200,
                body: metaDataJson
            };
        } else if (urlPath === 'metaData') { // For Rules MetaData
            this.response = {
                status: 200,
                body: rulesMetaDataJson
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
    post(urlPath: string, payload: any) {
        if (urlPath === 'dropDowns') {
            if (payload.type === 'RatePlanCategory') {
                this.response = {
                    status: 200,
                    body: ratePlanCategoryJson
                };
            } else if (payload.type === 'RateCategoryByOwnerReference') {
                this.response = {
                    status: 200,
                    body: rateCategoryJson
                };
            } else if (payload.type === 'RateTypeCatalogs') {
                this.response = {
                    status: 200,
                    body: enterpriseRateCatalogJson
                };
            } else if (payload.type === 'RateCategory') {
                this.response = {
                    status: 200,
                    body: enterpriseRateCategoryJson
                };
            } else if (payload.type === 'EnterprisePolicyTemplate') {
                this.response = {
                    status: 200,
                    body: enterprisePolicyTemplateJson
                };
            } else {
                this.response = {
                    status: 200,
                    body: policyTemplateJson
                };
            }
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
}

//const spySharedDataService = jasmine.createSpyObj('SharedDataService', ['setMetaData', 'setHotelInfo']);
describe('Policy-Mgmt Service initialized', () => {
    let policyMgmtService: PolicyMgmtService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let contextService: ContextService;
    let sharedDataService: SharedDataService;
    let httpService: HTTPService;
    window['CONFIG'] = {
        tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
        apiUrl: APP_CONSTANT.config.apiUrl
    };
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
                {
                    provide: HTTPService,
                    useClass: MockHttpService
                },
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                ContextService,
                PolicyMgmtService,
                RulesMataDataService,
                PolicyMgmtUtilityService
            ]
        });
        policyMgmtService = TestBed.inject(PolicyMgmtService);
        tcTranslateService = TestBed.inject(TcTranslateService);
        translateService = TestBed.inject(TranslateService);
        tcTranslateService.initTranslation(translateService);
        contextService = TestBed.inject(ContextService);
        sharedDataService = TestBed.inject(SharedDataService);
        httpService = TestBed.inject(HTTPService);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    }));

    it('Should Create Mock PolicyMgmtCreateTemplateService ', () => {
        expect(policyMgmtService).toBeTruthy();
    });

    it('Enterprise Templates - Should call loadGlobalData method with SharedDataService', async () => {
        // Arrange
        useHttp = false;
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);

        // Act
        const result = await policyMgmtService.loadGlobalData();

        // Assert
        expect(result.hotelInfoObservable).toEqual(undefined);
        expect(result.chainInfoObservable).toEqual(chainInfo);
        expect(result.languageObservable).toEqual(languages);
        expect(result.metaDataObservable).toEqual(metaDataJson);

    });

    it('Templates - Should call loadGlobalData method with SharedDataService', async () => {
        useHttp = false;
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        const result = await policyMgmtService.loadGlobalData();
        expect(result.hotelInfoObservable).toEqual(hotelInfo);
        expect(result.metaDataObservable).toEqual(metaDataJson);
    });

    it('Property Templates - Should call loadGlobalData method with httpCall', async () => {
        useHttp = true;
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        const result = await policyMgmtService.loadGlobalData();
        expect(result.hotelInfoObservable).toEqual(false);
        expect(result.metaDataObservable).toEqual(metaDataJson);
    });

    it('Property Policies - Should call loadGlobalData method with SharedDataService', async () => {
        useHttp = false;
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        const result = await policyMgmtService.loadGlobalData();
        expect(result.hotelInfoObservable).toEqual(hotelInfo);
        expect(result.metaDataObservable).toEqual(metaDataJson);
        expect(result.rulesMetadataObservable).toEqual(rulesMetaDataJson);
    });

    it('Property Policies - Should call loadGlobalData method with httpCall', async () => {
        useHttp = true;
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        const result = await policyMgmtService.loadGlobalData();
        expect(result.hotelInfoObservable).toEqual(false);
        expect(result.metaDataObservable).toEqual(metaDataJson);
        expect(result.rulesMetadataObservable).toEqual(rulesMetaDataJson);
    });

    it('Enterprise Policies - Should call loadGlobalData method with httpCall', async () => {
        // arrange
        useHttp = true;
        contextService.setChainCode('AAM');
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);

        // act
        const result = await policyMgmtService.loadGlobalData();

        // assert
        expect(result.chainInfoObservable).toEqual(chainInfo);
        expect(result.metaDataObservable).toEqual(metaDataJson);
        expect(result.rulesMetadataObservable).toEqual(rulesMetaDataJson);
        expect(sharedDataService.getPolicyMetadata('ChainCategories')).toBeDefined();
        expect(sharedDataService.getPolicyMetadata('ChainCategories').length).not.toEqual(0);
    });

    it('Should call makePolicyMetadataAPICalls for property', async () => {
        useHttp = false;
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        await policyMgmtService.makePolicyMetadataAPICalls();
        expect(sharedDataService.getPolicyMetadata('RatePlanCategory').length).not.toEqual(0);
        expect(sharedDataService.getPolicyMetadata('RateCategoryByOwnerReference').length).not.toEqual(0);
        expect(sharedDataService.getPolicyMetadata('PolicyTemplate').length).not.toEqual(0);
    });

    it('Should call makePolicyMetadataAPICalls for enterprise', async () => {
        // arrange
        useHttp = false;
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        // act
        await policyMgmtService.makePolicyMetadataAPICalls();

        // assert
        expect(sharedDataService.getPolicyMetadata('RateTypeCatalogs').length).not.toEqual(0);
        expect(sharedDataService.getPolicyMetadata('RateCategory').length).not.toEqual(0);
        expect(sharedDataService.getPolicyMetadata('EnterprisePolicyTemplate').length).not.toEqual(0);
    });

    it('Should format RateCategory id metadata from enterprise', async () => {
        // arrange
        useHttp = false;
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        // act
        await policyMgmtService.makePolicyMetadataAPICalls();

        // assert
        const rateCategories = sharedDataService.getPolicyMetadata('RateCategory');
        expect(rateCategories[0].id).toBe('56002');
        expect(rateCategories[1].id).toBe('56006');
        expect(rateCategories[2].id).toBe('56001');
    });

    it('Should call parseAndUpdateLanguageList method, Add English(US) if not present in the list', () => {
        const messageLangList = [
            {
                languageId: 11,
                languageCode: 'EN_UK',
                languageName: 'English (UK)',
                nativeLanguageName: 'English (UK)',
                isDefault: false
            },
            {
                languageId: 30,
                languageCode: 'ET_ET',
                languageName: 'Estonian',
                nativeLanguageName: 'Eesti',
                isDefault: false
            },
            {
                languageId: 3,
                languageCode: 'FR_FR',
                languageName: 'French',
                nativeLanguageName: 'Français',
                isDefault: false
            },
            {
                languageId: 7,
                languageCode: 'DE_DE',
                languageName: 'German',
                nativeLanguageName: 'Deutsch',
                isDefault: false
            }
        ];

        const dataList = policyMgmtService.parseAndUpdateLanguageList(messageLangList);
        expect(DEFAULT_VALUES.messageLangDropdown.defaultLangId).toEqual(dataList[1].id);
    });

    it('Should Not Add English(US) if it is already present in the list', () => {
        const messageLangList = [
            {
                languageId: 11,
                languageCode: 'EN_UK',
                languageName: 'English (UK)',
                nativeLanguageName: 'English (UK)',
                isDefault: false
            },
            {
                languageId: 1,
                languageCode: 'EN_US',
                languageName: 'English (US)',
                nativeLanguageName: 'English (US)',
                isDefault: true
            },
            {
                languageId: 30,
                languageCode: 'ET_ET',
                languageName: 'Estonian',
                nativeLanguageName: 'Eesti',
                isDefault: false
            },
            {
                languageId: 3,
                languageCode: 'FR_FR',
                languageName: 'French',
                nativeLanguageName: 'Français',
                isDefault: false
            },
            {
                languageId: 7,
                languageCode: 'DE_DE',
                languageName: 'German',
                nativeLanguageName: 'Deutsch',
                isDefault: false
            }
        ];

        const dataList = policyMgmtService.parseAndUpdateLanguageList(messageLangList);
        expect(DEFAULT_VALUES.messageLangDropdown.defaultLangId).toEqual(dataList[1].id);
    });

    it('Should call arrangeAcceptedTenderOrder method - For Guarantee type', () => {
        const acceptedTenderGuaranteeData = [
            { id: 9, name: 'IATA' },
            { id: 14, name: 'Corporate Id' },
            { id: 16, name: 'Credit Card' },
            { id: 17, name: 'Accept All' },
            { id: 18, name: 'Rate Access Code' },
            { id: 20, name: 'Hotel Billing' }
        ];
        const acceptedTenderdata = [
            { id: 17, name: 'Accept All' },
            { id: 14, name: 'Corporate ID' },
            { id: 16, name: 'Credit Card' },
            { id: 20, name: 'Hotel Billing (Call Center Only)' },
            { id: 9, name: 'IATA' },
            { id: 18, name: 'Rate Access Code' }
        ];
        const aceptedTenderGuarantee = policyMgmtService.arrangeAcceptedTenderOrder(acceptedTenderGuaranteeData,
            GUARANTEE_ACCEPTED_TENDER_LIST, POLICY_TYPE.GUARANTEE);
        expect(aceptedTenderGuarantee).toEqual(acceptedTenderdata);
    });

    it('Should call get http service with hotelId and hottelSetting specified', () => {
      // Arrange
      const hotelCode = '1098';
      const settingId = '306';

      spyOn(httpService, 'get').and.returnValue(of(hotel_setting306));

      // Act
      policyMgmtService.getHotelSettingToggle(hotelCode, settingId);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith('hotel/1098/hotel-settings/306', API_CONTEXT_PATH.PROPERTY_INFO);
    });
});
