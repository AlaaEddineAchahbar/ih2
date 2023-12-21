import { TestBed, async } from '@angular/core/testing';
import * as momentZone from 'moment-timezone';
import { TcTranslateService } from 'tc-angular-services';
import { IPolicyDetailsErrorModel, IPolicyDetailsParams, IDateRange } from '../policy-mgmt-create-policy.model';
import { ErrorMessage } from '../../../core/common.model';
import { PolicyMgmtDateSelectorService } from './date-selector/policy-mgmt-date-selector.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PolicyMgmtStepPolicyDetailsService } from './policy-mgmt-step-policy-details.service';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { SharedDataService } from '../../../core/shared.data.service';
import { DEFAULT_DATED_POLICY_TYPE } from '../../../core/rules.constant';
import { PolicyMgmtUtilityService } from '../../../core/utility.service';

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
}

const timeZone = 'America/New_York';

describe('Policy Details Service initialized', () => {
    let policyDetailsService: PolicyMgmtStepPolicyDetailsService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let sharedDataService: SharedDataService;
    let currentDate: Date;
    let nextDate: Date;

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
                PolicyMgmtStepPolicyDetailsService,
                PolicyMgmtDateSelectorService,
                PolicyMgmtUtilityService
            ]
        });
        policyDetailsService = TestBed.get(PolicyMgmtStepPolicyDetailsService);
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        sharedDataService = TestBed.get(SharedDataService);
        tcTranslateService.initTranslation(translateService);

        const dateFromTimeZone = momentZone.tz(timeZone).toObject();
        currentDate = new Date(
            dateFromTimeZone.years,
            dateFromTimeZone.months,
            dateFromTimeZone.date
        );

        nextDate = new Date(currentDate);
        nextDate.setDate(new Date().getDate() + 1);
    }));
    it('Should Create Mock Service', () => {
        expect(policyDetailsService).toBeTruthy();
    });

    it('Should Validate Data with No Error Encountered', () => {
        const data: IPolicyDetailsParams = {
            policyName: 'Sample Policy',
            policyTemplate: '123',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [{
                startDate: currentDate,
                endDate: null,
                noEndDateCheckedFlag: true
            }],
            ruleStartDate: '',
            dayOfWeek: {
                MON: true,
                TUE: true,
                WED: true,
                THU: true,
                FRI: true,
                SAT: true,
                SUN: true
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };
        const errorObj: IPolicyDetailsErrorModel = {
            policyNameErrorMessage: new ErrorMessage(),
            policyTemplateErrorMessage: new ErrorMessage(),
            startDateErrorMessage: new ErrorMessage(),
            endDateErrorMessage: new ErrorMessage(),
            dowErrorMessage: new ErrorMessage(),
            dateRangeErrorMessage: new ErrorMessage()
        };

        const flag = policyDetailsService.validateStepsData(data);
        expect(flag).toEqual(errorObj);
    });

    it('Should Validate Data and Return Error Message for Empty Policy Name', () => {
        const data: IPolicyDetailsParams = {
            policyName: '',
            policyTemplate: '123',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [{
                startDate: currentDate,
                endDate: null,
                noEndDateCheckedFlag: true
            }],
            ruleStartDate: '',
            dayOfWeek: {
                MON: true,
                TUE: true,
                WED: true,
                THU: true,
                FRI: true,
                SAT: true,
                SUN: true
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };
        const errorObj: IPolicyDetailsErrorModel = {
            policyNameErrorMessage: { show: true, message: 'Policy Name is required' },
            policyTemplateErrorMessage: new ErrorMessage(),
            startDateErrorMessage: new ErrorMessage(),
            endDateErrorMessage: new ErrorMessage(),
            dowErrorMessage: new ErrorMessage(),
            dateRangeErrorMessage: new ErrorMessage()
        };
        const flag = policyDetailsService.validateStepsData(data);
        expect(flag).toEqual(errorObj);
    });

    it('Should Validate Data and Return Error Message for Policy Template if not selected from dropdown ', () => {
        const data: IPolicyDetailsParams = {
            policyName: 'Sample Policy',
            policyTemplate: '',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [{
                startDate: currentDate,
                endDate: null,
                noEndDateCheckedFlag: true
            }],
            ruleStartDate: '',
            dayOfWeek: {
                MON: true,
                TUE: true,
                WED: true,
                THU: true,
                FRI: true,
                SAT: true,
                SUN: true
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };

        sharedDataService.getHotelInfo();

        const errorObj: IPolicyDetailsErrorModel = {
            policyNameErrorMessage: new ErrorMessage(),
            policyTemplateErrorMessage: { show: true, message: 'Policy Template is required.' },
            startDateErrorMessage: new ErrorMessage(),
            endDateErrorMessage: new ErrorMessage(),
            dowErrorMessage: new ErrorMessage(),
            dateRangeErrorMessage: new ErrorMessage()
        };

        const flag = policyDetailsService.validateStepsData(data);
        expect(flag).toEqual(errorObj);
    });

    it('should validate data and return error message for not entering Start Date', () => {
        const data: IPolicyDetailsParams = {
            policyName: 'Sample Policy',
            policyTemplate: '123',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [{
                startDate: '',
                endDate: null,
                noEndDateCheckedFlag: true
            }],
            ruleStartDate: '',
            dayOfWeek: {
                MON: true,
                TUE: true,
                WED: true,
                THU: true,
                FRI: true,
                SAT: true,
                SUN: true
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };

        const flag = policyDetailsService.validateStepsData(data);
        expect(flag.startDateErrorMessage.show).toBeTruthy();
        expect(flag.startDateErrorMessage.message).not.toBeNull();
    });

    it('should validate data and return error message for not entering End date and no date check flag is false', () => {
        const data: IPolicyDetailsParams = {
            policyName: 'Sample Policy',
            policyTemplate: '123',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [{
                startDate: currentDate,
                endDate: '',
                noEndDateCheckedFlag: false
            }],
            ruleStartDate: '',
            dayOfWeek: {
                MON: true,
                TUE: true,
                WED: true,
                THU: true,
                FRI: true,
                SAT: true,
                SUN: true
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };

        const flag = policyDetailsService.validateStepsData(data);
        expect(flag.endDateErrorMessage.show).toBeTruthy();
        expect(flag.endDateErrorMessage.message).not.toBeNull();
    });

    it('should validate data and return error message if any of day of week is not selected', () => {
        const data: IPolicyDetailsParams = {
            policyName: 'Sample Policy',
            policyTemplate: '123',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [{
                startDate: currentDate,
                endDate: nextDate,
                noEndDateCheckedFlag: false
            }],
            ruleStartDate: '',
            dayOfWeek: {
                MON: false,
                TUE: false,
                WED: false,
                THU: false,
                FRI: false,
                SAT: false,
                SUN: false
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };

        const flag = policyDetailsService.validateStepsData(data);
        expect(flag.dowErrorMessage.show).toBeTruthy();
        expect(flag.dowErrorMessage.message).not.toBeNull();
    });

    it('should validate data and return error message date ranges are not unique', () => {
        const data: IPolicyDetailsParams = {
            policyName: 'Sample Policy',
            policyTemplate: '123',
            policyType: DEFAULT_DATED_POLICY_TYPE.dated,
            dateRange: [
                {
                    startDate: currentDate,
                    endDate: nextDate
                },
                {
                    startDate: currentDate,
                    endDate: nextDate,
                }
            ],
            ruleStartDate: '',
            dayOfWeek: {
                MON: true,
                TUE: true,
                WED: true,
                THU: true,
                FRI: true,
                SAT: true,
                SUN: true
            },
            overridePolicies: false,
            canBeDefaultPolicy: true,
            auxId: 123,
            auxType: ''
        };

        const flag = policyDetailsService.validateStepsData(data);
        expect(flag.dateRangeErrorMessage.show).toBeTruthy();
        expect(flag.dateRangeErrorMessage.message).not.toBeNull();
    });

    it('should return start date', () => {
        const startDate = policyDetailsService.getStartDate(timeZone);
        expect(startDate).toEqual(currentDate);
    });

});

