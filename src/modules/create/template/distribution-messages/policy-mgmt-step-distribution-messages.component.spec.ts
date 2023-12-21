import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { PolicyMgmtStepDistributionMessagesComponent } from './policy-mgmt-step-distribution-messages.component';
import { PolicyMgmtTemplateStepperDataService } from '../policy-mgmt-template-stepper-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { TcTranslateService } from 'tc-angular-services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { DropdownModule } from 'tc-angular-components';
import { InputRestrictDirective } from '../../../common/input.restrict.directive';
import { TEMPLATE_CONFIG } from '../policy-mgmt-create-template.constant';
import { POLICY_LEVEL, POLICY_TYPE, DEFAULT_VALUES } from '../../../core/constants';
import { By } from '@angular/platform-browser';

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

describe('Distribution Message Component', () => {
    let fixture: ComponentFixture<PolicyMgmtStepDistributionMessagesComponent>;
    let instance: PolicyMgmtStepDistributionMessagesComponent;

    const spyStepperDataService = jasmine.createSpyObj('PolicyMgmtTemplateStepperDataService',
        ['getDistributionMsgData', 'setDistributionMsgData']);

    beforeEach((done) => {

        TestBed.configureTestingModule({
            declarations: [
                PolicyMgmtStepDistributionMessagesComponent,
                InputRestrictDirective
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
                {
                    provide: PolicyMgmtTemplateStepperDataService,
                    useValue: spyStepperDataService
                }
            ]
        }).compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(PolicyMgmtStepDistributionMessagesComponent);
                instance = fixture.componentInstance;
                instance.continueFromStepper = new Subject<any>();
                instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
                done();
            });
    });

    describe('Distribution Message Flow for All policy types - GUARANTEE|DEPOSIT|CANCELLATION', () => {
        beforeEach(() => {
            spyStepperDataService.getDistributionMsgData.and.
                returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.GUARANTEE].distribution_message });
            spyOn(instance.validate, 'emit');
            fixture.detectChanges();
        });

        it('distribution Message component instance to be defined', () => {
            expect(instance).toBeDefined();
        });

        it('should initialize component', () => {
            fixture.detectChanges();
            expect(instance.translationMap).toBeDefined();
            expect(instance.rulesData.fields.messageLanguage).toBeDefined();
            expect(instance.rulesData.fields.textList).toBeDefined();
        });

        it('should emit data when validateStep() gets called - as no validation check present', () => {
            spyStepperDataService.setDistributionMsgData(
                { ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.GUARANTEE].distribution_message }.fields
            );
            instance.validateStep({
                eventType: 'ACTIVE',
                stepNumber: 2
            });
            expect(instance.validate.emit).toHaveBeenCalled();
        });

        it('should change language on language dropdown change', () => {
            const changeEvent = {
                selectedIndex: 1,
                selectedObject: {
                    code: 'FR_FR',
                    id: 3,
                    name: 'French'
                }
            };
            instance.onLanguageChange(changeEvent);
            expect(instance.selectedLangId).toEqual(Number(changeEvent.selectedObject.id));
            expect(instance.languageDefaultIndex).toEqual(changeEvent.selectedIndex);
            expect(instance.rulesData.fields.messageLanguage).toEqual(changeEvent.selectedObject.id);
        });

        it('should set default language index to English (US)', () => {
            instance.setDefaultIndex();
            fixture.detectChanges();
            expect(instance.selectedLangId).toEqual(DEFAULT_VALUES.messageLangDropdown.defaultLangId);
            expect(instance.languageDefaultIndex).toEqual(0);
        });

        it('should check visibility of element', () => {
            expect(instance.checkVisibility('messageLanguage')).toBeTruthy();
            expect(instance.checkVisibility('onlineCCMessage', 'textList')).toBeTruthy();
            expect(instance.checkVisibility('gdsRateNotification')).toBeFalsy();
        });
    });

    describe('Distribution Message flow for deposit policy type', () => {
        beforeEach(() => {
            spyStepperDataService.getDistributionMsgData.and.
                returnValue({ ...TEMPLATE_CONFIG[POLICY_LEVEL.PROPERTY][POLICY_TYPE.DEPOSIT].distribution_message });
            fixture.detectChanges();
        });

        xit('should check visibility of element', () => {
            expect(instance.checkVisibility('gdsRateNotification')).toBeTruthy();
        });
    });
});
