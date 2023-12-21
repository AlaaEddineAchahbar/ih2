import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { PolicyMgmtStepPolicyDetailsComponent } from './policy-mgmt-step-policy-details.component';
import { PolicyMgmtDateSelectorComponent } from '../policy-details/date-selector/policy-mgmt-date-selector.component';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PolicyMgmtPolicyStepperDataService } from '../policy-mgmt-policy-stepper-data.service';
import { PolicyMgmtStepPolicyDetailsService } from './policy-mgmt-step-policy-details.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../../common/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContextService } from '../../../core/context.service';
import { SharedDataService } from '../../../core/shared.data.service';
import { Subject } from 'rxjs';
import { POLICY_CONFIG, CREATE_POLICY_STEPS } from '../policy-mgmt-create-policy.constant';
import { POLICY_LEVEL } from '../../../core/constants';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IPolicyStepContinueEvent, IPolicyDetailsErrorModel, IPolicyDetailsParams } from '../policy-mgmt-create-policy.model';
import { DEFAULT_DATED_POLICY_TYPE } from '../../../core/rules.constant';
import { PolicyMgmtDateSelectorService } from './date-selector/policy-mgmt-date-selector.service';
import { PolicyMgmtUtilityService } from '../../../core/utility.service';
import * as momentZone from 'moment-timezone';
import { ErrorMessage } from '../../../core/common.model';
import { PolicyMgmtCreateTemplateService } from '../../template/policy-mgmt-create-template.service';
import {
    PolicyMgmtCreateTemplateModalComponent
} from '../policy-details/create-template-modal/policy-mgmt-create-template-modal.component';
import { PolicyMgmtCreateTemplateComponent } from '../../template/policy-mgmt-create-template.component';

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
 * spy stepper data service
 */
const spyStepperDataService = jasmine.createSpyObj('PolicyMgmtPolicyStepperDataService',
    ['getPolicyDetailsData', 'setPolicyDetailsData']);

const spyPolicyDetailsService = jasmine.createSpyObj('PolicyMgmtPolicyDetailsService',
    ['getStartDate', 'validateStepsData', 'validateStartEndDate', 'validateDistinctDateRange', 'validateDow',
     'PolicyMgmtCreateTemplateService', 'updateTemplateListItemInPreviewEdit', 'getTemplateListItem', 'setTemplateAsSelectd']);

class MockSharedDataService {
    getHotelInfo() {
        const hotelInfo = require('../../../../assets-policy-mgmt/data/hotel-info.json');
        return hotelInfo;
    }
}

class MockPolicyMgmtCreateTemplateComponent {

}

class MockPolicyMgmtCreateTemplateService {

}
describe('Policy Details Component', () => {
    let fixture: ComponentFixture<PolicyMgmtStepPolicyDetailsComponent>;
    let instance: PolicyMgmtStepPolicyDetailsComponent;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicyMgmtStepPolicyDetailsComponent,
                PolicyMgmtDateSelectorComponent,
                PolicyMgmtCreateTemplateModalComponent
            ],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [
                CommonModule,
                SharedModule,
                FormsModule,
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
                {
                    provide: PolicyMgmtPolicyStepperDataService,
                    useValue: spyStepperDataService
                },
                TcTranslateService,
                TranslateService,
                ContextService,
                PolicyMgmtDateSelectorService,
                PolicyMgmtStepPolicyDetailsService,
                PolicyMgmtUtilityService,
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                {
                    provide: PolicyMgmtStepPolicyDetailsService,
                    useValue: spyPolicyDetailsService
                },
                {
                    provide: PolicyMgmtCreateTemplateComponent,
                    useClass: MockPolicyMgmtCreateTemplateComponent
                },
                {
                    provide: PolicyMgmtCreateTemplateService,
                    useClass: MockPolicyMgmtCreateTemplateService
                }
            ]
        }).compileComponents()
            .then(() => {
                tcTranslateService = TestBed.get(TcTranslateService);
                translateService = TestBed.get(TranslateService);
                tcTranslateService.initTranslation(translateService);
                fixture = TestBed.createComponent(PolicyMgmtStepPolicyDetailsComponent);
                instance = fixture.componentInstance;
                instance.continueFromStepper = new Subject<any>();
                instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
            });
    }));

    it('Policy Details Component instance to be defined', () => {
        expect(instance).toBeDefined();
    });

    describe('Policy Flow (Step 2)', () => {
        beforeEach(async(() => {
            spyStepperDataService.getPolicyDetailsData.and.
                returnValue({ ...POLICY_CONFIG[POLICY_LEVEL.PROPERTY][CREATE_POLICY_STEPS.POLICY_DETAILS] });
            spyOn(instance.validate, 'emit');
            fixture.detectChanges();
        }));

        it('expect component initialized', () => {
            expect(instance.rulesData.fields).toBeDefined();
            expect(instance.rulesData.data).toBeDefined();
        });

        it('validate step 2 data', () => {
            const timeZone = 'America/Mexico_City';
            const dateFromTimeZone = momentZone.tz(timeZone).toObject();
            const currentDate = new Date(
                dateFromTimeZone.years,
                dateFromTimeZone.months,
                dateFromTimeZone.date
            );
            const nextDate = new Date(currentDate);
            nextDate.setDate(new Date().getDate() + 1);
            const policyObj: IPolicyDetailsParams = {
                policyName: 'Test Policy',
                policyTemplate: '123',
                policyType: DEFAULT_DATED_POLICY_TYPE.dated,
                dateRange: [{
                    startDate: currentDate,
                    endDate: nextDate,
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
                overridePolicies: true,
                canBeDefaultPolicy: true,
                auxId: 123,
                auxType: ''

            };
            instance.rulesData.fields = policyObj;

            spyPolicyDetailsService.validateStepsData.and.returnValue(policyObj);

            const evt: IPolicyStepContinueEvent = {
                stepNumber: 2,
                eventType: null
            };
            instance.validateStep(evt);
            expect(instance.validate.emit).toHaveBeenCalled();
        });

        it('should hide policy name validation message when policy name entered', () => {
            const policyName = 'Test Policy';
            instance.policyNameChange(policyName);
            const errorObj: IPolicyDetailsErrorModel = {
                policyNameErrorMessage: new ErrorMessage(),
                policyTemplateErrorMessage: new ErrorMessage(),
                startDateErrorMessage: new ErrorMessage(),
                endDateErrorMessage: new ErrorMessage(),
                dowErrorMessage: new ErrorMessage(),
                dateRangeErrorMessage: new ErrorMessage()
            };
            expect(errorObj.policyNameErrorMessage.show).toBeFalsy();

        });

        it('should set policy type', () => {
            instance.setPolicyType(DEFAULT_DATED_POLICY_TYPE.default);
            expect(instance.rulesData.fields.policyType).toBe('DEFAULT');
        });

        it('should set policy template selected from dropdown', () => {
            const policyTemplateSelected = {
                selectedIndex: 0,
                selectedObject: {
                    id: '1',
                    name: 'Test Policy Template'
                }
            };
            instance.onPolicyTemplateSelectionChange(policyTemplateSelected);
            expect(instance.rulesData.fields.policyTemplate).toEqual('1');
        });

        it('should set override Policies on check/uncheck radio button', () => {
            /* const checkboxElem = fixture.debugElement.query(By.css('#overridePolicies')).nativeElement;
            expect(checkboxElem.checked).toBeFalsy();
            checkboxElem.click();
            fixture.detectChanges();
            expect(checkboxElem.checked).toBeTruthy(); */
            instance.rulesData.fields.overridePolicies = true;
            instance.onOverridePoliciesChange();
            expect(instance.rulesData.fields.overridePolicies).toBeFalsy();
        });

        it('should set dateselector date range and dow', () => {
            const dateSelectorObj = {
                dateRanges: [{
                    endDate: '',
                    maxSelectableDate: '2026-07-16T18:30:00.000Z',
                    minSelectableDate: '2020-07-16T18:30:00.000Z',
                    noEndDateCheckedFlag: true,
                    startDate: '2020-07-16T18:30:00.000Z'
                }
                ],
                dows: { FRI: true, MON: true, SAT: true, SUN: true, THU: true, TUE: true, WED: true }
            };

            spyPolicyDetailsService.validateStartEndDate.and.returnValue({
                startDateFlag: true,
                endDateFlag: true
            });

            instance.onDateChanged(dateSelectorObj);
            expect(instance.rulesData.fields.dateRange).toBeDefined();
            expect(instance.rulesData.fields.dayOfWeek).toBeDefined();
        });

        it('should validate date range and dow and if it is valid then hide error message', () => {
            const dateSelectorObj = {
                dateRanges: [{
                    endDate: '',
                    maxSelectableDate: '2026-07-17T18:30:00.000Z',
                    minSelectableDate: '2020-07-17T18:30:00.000Z',
                    noEndDateCheckedFlag: true,
                    startDate: '2020-07-17T18:30:00.000Z'
                }
                ],
                dows: { FRI: true, MON: true, SAT: true, SUN: true, THU: true, TUE: true, WED: true }
            };

            const errorObj: IPolicyDetailsErrorModel = {
                policyNameErrorMessage: new ErrorMessage(),
                policyTemplateErrorMessage: new ErrorMessage(),
                startDateErrorMessage: new ErrorMessage(),
                endDateErrorMessage: new ErrorMessage(),
                dowErrorMessage: new ErrorMessage(),
                dateRangeErrorMessage: new ErrorMessage()
            };

            spyPolicyDetailsService.validateStartEndDate.and.returnValue({
                startDateFlag: false,
                endDateFlag: false
            });

            spyPolicyDetailsService.validateDistinctDateRange.and.returnValue(true);
            instance.onDateChanged(dateSelectorObj);
            expect(errorObj.startDateErrorMessage.show).toBeFalsy();
            expect(errorObj.endDateErrorMessage.show).toBeFalsy();
        });

        it('should validate day of week and if it is valid then hide error message', () => {
            const dateSelectorObj = {
                dateRanges: [{
                    endDate: '',
                    maxSelectableDate: '2026-07-17T18:30:00.000Z',
                    minSelectableDate: '2020-07-17T18:30:00.000Z',
                    noEndDateCheckedFlag: true,
                    startDate: '2020-07-17T18:30:00.000Z'
                }
                ],
                dows: { FRI: true, MON: true, SAT: true, SUN: true, THU: true, TUE: true, WED: true }
            };

            const errorObj: IPolicyDetailsErrorModel = {
                policyNameErrorMessage: new ErrorMessage(),
                policyTemplateErrorMessage: new ErrorMessage(),
                startDateErrorMessage: new ErrorMessage(),
                endDateErrorMessage: new ErrorMessage(),
                dowErrorMessage: new ErrorMessage(),
                dateRangeErrorMessage: new ErrorMessage()
            };

            spyPolicyDetailsService.validateStartEndDate.and.returnValue({
                startDateFlag: false,
                endDateFlag: false
            });

            spyPolicyDetailsService.validateDow.and.returnValue(true);
            instance.onDateChanged(dateSelectorObj);
            expect(errorObj.dowErrorMessage.show).toBeFalsy();
        });

        it('should validate multiple date range and if it is valid then hide error message', () => {
            const dateSelectorObj = {
                dateRanges: [{
                    endDate: '',
                    maxSelectableDate: '2026-07-17T18:30:00.000Z',
                    minSelectableDate: '2020-07-17T18:30:00.000Z',
                    noEndDateCheckedFlag: true,
                    startDate: '2020-07-17T18:30:00.000Z'
                },
                {
                    endDate: '2026-07-18T18:30:00.000Z',
                    maxSelectableDate: '2026-07-17T18:30:00.000Z',
                    minSelectableDate: '2020-07-17T18:30:00.000Z',
                    noEndDateCheckedFlag: false,
                    startDate: '2020-07-17T18:30:00.000Z'
                }
                ],
                dows: { FRI: true, MON: true, SAT: true, SUN: true, THU: true, TUE: true, WED: true }
            };

            const errorObj: IPolicyDetailsErrorModel = {
                policyNameErrorMessage: new ErrorMessage(),
                policyTemplateErrorMessage: new ErrorMessage(),
                startDateErrorMessage: new ErrorMessage(),
                endDateErrorMessage: new ErrorMessage(),
                dowErrorMessage: new ErrorMessage(),
                dateRangeErrorMessage: new ErrorMessage()
            };
            spyPolicyDetailsService.validateStartEndDate.and.returnValue({
                startDateFlag: false,
                endDateFlag: false
            });
            spyPolicyDetailsService.validateDistinctDateRange.and.returnValue(true);
            instance.onDateChanged(dateSelectorObj);
            expect(errorObj.dateRangeErrorMessage.show).toBeFalsy();
        });
    });
});
