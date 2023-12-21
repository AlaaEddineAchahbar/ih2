import { TestBed, async } from '@angular/core/testing';
import { PolicyMgmtStepTemplateDetailsService } from './policy-mgmt-step-template-details.service';
import { TcTranslateService } from 'tc-angular-services';
import { SharedDataService } from '../../../core/shared.data.service';
import { ITemplateDetailsParams, IPolicyTemplateErrorModel } from '../policy-mgmt-create-template.model';
import { ErrorMessage } from '../../../core/common.model';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_CONSTANT } from '../../../../app/app.constant';
import { CANCELLATION_OPTIONS } from '../../../core/rules-config.constant';
import { IDropDownItem } from '../../../core/common.model';
import { ContextService } from 'src/modules/core/context.service';

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

/**
 * Mock SharedDataService
 */
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

describe('Template Details Service initialized', () => {
    let templateDetailsService: PolicyMgmtStepTemplateDetailsService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let sharedDataService: SharedDataService;

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
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                PolicyMgmtStepTemplateDetailsService,
                ContextService
            ]
        });
        templateDetailsService = TestBed.get(PolicyMgmtStepTemplateDetailsService);
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        sharedDataService = TestBed.get(SharedDataService);
        tcTranslateService.initTranslation(translateService);
    }));
    it('Should Create Mock Service', () => {
        expect(templateDetailsService).toBeTruthy();
    });
    it('Should Validate Data with No Error Encountered', () => {
        const data: ITemplateDetailsParams = {
            policyTemplateName: 'Sample Template',
            policyTemplateCode: 'Test',
            acceptedTender: 17,
            lateArrivalTime: 13
        };
        const errorObj: IPolicyTemplateErrorModel = {
            templateNameErrorMessage: new ErrorMessage(),
            lateArrivalErrorMessage: new ErrorMessage(),
            cancellationNoticeErrorMessage: new ErrorMessage()
        };

        const flag = templateDetailsService.validateStepData(data);
        expect(flag).toEqual(errorObj);
    });
    it('Should Validate Data and Return Error Message for Empty Policy Name', () => {
        const data: ITemplateDetailsParams = {
            policyTemplateName: '',
            policyTemplateCode: 'Test',
            acceptedTender: 17,
            lateArrivalTime: 13
        };
        const errorObj: IPolicyTemplateErrorModel = {
            templateNameErrorMessage: { show: true, message: 'Policy Template Name is required.' },
            lateArrivalErrorMessage: new ErrorMessage(),
            cancellationNoticeErrorMessage: new ErrorMessage()
        };
        const flag = templateDetailsService.validateStepData(data);
        expect(flag).toEqual(errorObj);
    });


    it('Should Validate Data and Return Error Message for Late Arrival (isGDSEnabled: true) ', () => {
        const data: ITemplateDetailsParams = {
            policyTemplateName: 'Sample Template',
            policyTemplateCode: 'Test',
            acceptedTender: 17,
            lateArrivalTime: null
        };

        sharedDataService.getHotelInfo();

        const errorObj: IPolicyTemplateErrorModel = {
            templateNameErrorMessage: new ErrorMessage(),
            lateArrivalErrorMessage: { show: true, message: 'Late Arrival time must be selected.' },
            cancellationNoticeErrorMessage: new ErrorMessage()
        };

        const flag = templateDetailsService.validateStepData(data);
        expect(flag).toEqual(errorObj);
    });

    it('should validate data and return error message for not selecting any cancellation notice option', () => {
        const data: ITemplateDetailsParams = {
            policyTemplateName: 'Sample Template',
            policyTemplateCode: 'Test',
            cancellationNotice: '',
            sameDayNoticeTime: null,
            advanceNotice: { days: 0, hours: 0 },
            otaCancellationChargeNotification: '',
            otaFlatAmt: null,
            otaPercentageAmt: null,
            otaNightRoomNTaxAmt: null
        };

        const flag = templateDetailsService.validateStepData(data);
        expect(flag.cancellationNoticeErrorMessage.show).toBeTruthy();
        expect(flag.cancellationNoticeErrorMessage.message).not.toBeNull();
    });

    it('should validate data and return error message for not selecting any option from SAME-DAY list', () => {
        const data: ITemplateDetailsParams = {
            policyTemplateName: 'Sample Template',
            policyTemplateCode: 'Test',
            cancellationNotice: CANCELLATION_OPTIONS.SAME_DAY,
            sameDayNoticeTime: null,
            advanceNotice: { days: null, hours: null },
            otaCancellationChargeNotification: '',
            otaFlatAmt: null,
            otaPercentageAmt: null,
            otaNightRoomNTaxAmt: null
        };

        const flag = templateDetailsService.validateStepData(data);
        expect(flag.cancellationNoticeErrorMessage.show).toBeTruthy();
        expect(flag.cancellationNoticeErrorMessage.message).not.toBeNull();
    });

    it('should validate data and return error message if advance notice days and hours set to blank', () => {
        const data: ITemplateDetailsParams = {
            policyTemplateName: 'Sample Template',
            policyTemplateCode: 'Test',
            cancellationNotice: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
            sameDayNoticeTime: null,
            advanceNotice: { days: null, hours: null },
            otaCancellationChargeNotification: '',
            otaFlatAmt: null,
            otaPercentageAmt: null,
            otaNightRoomNTaxAmt: null
        };

        const flag = templateDetailsService.validateStepData(data);
        expect(flag.cancellationNoticeErrorMessage.show).toBeTruthy();
        expect(flag.cancellationNoticeErrorMessage.message).not.toBeNull();
    });

    it('should return name for given id from list', () => {
        const acceptedTenderList: IDropDownItem[] = [
            {
                id: 1,
                name: 'IATA'
            },
            {
                id: 8,
                name: 'Credit Card, Alternate Payments'
            }
        ];
        const acceptedTenderId = 8;
        const acceptedTenderName = templateDetailsService.getFieldNameById(acceptedTenderList, acceptedTenderId);
        expect(acceptedTenderName).toEqual(acceptedTenderList[1].name);
    });

});

