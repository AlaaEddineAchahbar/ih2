import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyPaymentDepositConfigurationDetailsComponent } from './property-deposit-configuration-details.component';
import { Subject } from 'rxjs';
import { IErrorMessage, IHotelInfo } from 'src/modules/core/common.model';
import { TcTranslateService } from 'tc-angular-services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StepperModule } from 'tc-angular-components';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentDepositConfigurationDetailsService } from '../deposit-configuration-details/deposit-configuration-details.service';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { SharedDataService } from 'src/modules/core/shared.data.service';
import {
    CHARGE_TYPES,
    IDepositConfigurationStepContinueEvent,
    IPropertyPaymentDepositConfigurationRulesData
} from '../payment-deposit-configuration-create.model';

const hotelInfo: IHotelInfo = require('../../../../assets-policy-mgmt/data/hotel-info.json');

export function HttpLoaderFactory(http: HttpClient) {
    const langApiUrl = window['CONFIG']['apiUrl']
        .replace('{{api_module_context_path}}', 'i18n/v1')
        + 'apps/ent-policy-ui/locales/';
    return new TcTranslateService().loadTranslation(http, langApiUrl);
}

export class MockSharedDataService {
    getHotelInfo() {
        return hotelInfo;
    }
}

const spyDepositConfigurationDetailsService = jasmine.createSpyObj('PaymentDepositConfigurationDetailsService', [
    'getChargeTypeMapping',
    'getNextAvailableChargeType'
]);

const spyStepperDataService = jasmine.createSpyObj('PaymentDepositConfigurationStepperDataService', [
    'getPropertyDepositConfigurationRulesData',
    'getPropertyDepositConfigurationDefaultCurrency',
    'setPropertyDepositConfigurationRulesData'
]);

const spySharedDataService = jasmine.createSpyObj('SharedDataService', ['getHotelInfo']);

describe('Property Payment Deposit Configuration Details Component', () => {
    let fixture: ComponentFixture<PropertyPaymentDepositConfigurationDetailsComponent>;
    let instance: PropertyPaymentDepositConfigurationDetailsComponent;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;

    beforeEach((done) => {
        TestBed.configureTestingModule({
            declarations: [
                PropertyPaymentDepositConfigurationDetailsComponent
            ],
            imports: [
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient]
                    }
                }),
                StepperModule
            ],
            providers: [
                TcTranslateService,
                TranslateService,
                {
                    provide: SharedDataService,
                    useValue: spySharedDataService
                },
                {
                    provide: PaymentDepositConfigurationDetailsService,
                    useValue: spyDepositConfigurationDetailsService
                },
                {
                    provide: PaymentDepositConfigurationStepperDataService,
                    useValue: spyStepperDataService
                }
            ]
        }).compileComponents()
            .then(() => {
                tcTranslateService = TestBed.inject(TcTranslateService);
                translateService = TestBed.inject(TranslateService);
                tcTranslateService.initTranslation(translateService);
                fixture = TestBed.createComponent(PropertyPaymentDepositConfigurationDetailsComponent);
                instance = fixture.componentInstance;
                instance.continueFromStepper = new Subject<any>();
                instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
                done();
            });
    });

    it('Property Payment Deposit Configuration Details component instance to be defined', () => {
        // Assert
        expect(instance).toBeDefined();
        expect(instance).toBeTruthy();
    });

    describe('Propert Payment Deposit Configuration Details flow', () => {
        const propertyPaymentDepositConfigurationRulesData: IPropertyPaymentDepositConfigurationRulesData = {
            rules: [
                {
                    chargeType: 'ARRIVAL_DAY_CHARGE',
                    chargeDate: 999,
                    chargeAmount: 0,
                    chargePercentage: 0,
                    percentOnEnhancement: 0,
                },
            ],
            data: {
                chargeType: [
                    'ARRIVAL_DAY_CHARGE',
                    'FLAT',
                    'PERCENTAGE',
                ]
            }
        };
        beforeEach(() => {
            spySharedDataService.getHotelInfo.and.returnValue(hotelInfo);
            spyStepperDataService.getPropertyDepositConfigurationRulesData.and
                .returnValue(propertyPaymentDepositConfigurationRulesData);
            spyDepositConfigurationDetailsService.getChargeTypeMapping.and
                .returnValue([[false, false, false], [true, false, false], [false, true, false]]);
            fixture.detectChanges();
        });

        it('Property Should initialize component', () => {
            // Act
            fixture.detectChanges();

            // Assert
            expect(instance.translationMap).toBeDefined();
            expect(instance.errorObj).toBeDefined();
        });

        it('should update chargeType and reset chargePercentage', () => {
            // Arrange
            const index = 0;
            const item = CHARGE_TYPES.PERCENTAGE;

            // Act
            instance.onChargeTypeChange(index, item);

            // Assert
            expect(instance.depositConfigurationRulesData.rules[index].chargeType).toBe(item);
            expect(instance.depositConfigurationRulesData.rules[index].chargePercentage).toBe(0);
            expect(instance.depositConfigurationRulesData.rules[index].chargeAmount).toBe(0);
        });

        it('should hide emptyChargeAmountErrorMessage if previous chargeType is FLAT', () => {
            // Arrange
            const index = 0;
            const item = CHARGE_TYPES.PERCENTAGE;

            // Act
            instance.onChargeTypeChange(index, item);

            // Assert
            expect(instance.errorObj.emptyChargeAmountErrorMessage.show).toBe(false);
        });

        it('should hide emptyChargePercentageErrorMessage if previous chargeType is PERCENTAGE', () => {
            // Arrange
            const index = 0;
            const item = CHARGE_TYPES.FLAT;

            // Act
            instance.onChargeTypeChange(index, item);

            // Assert
            expect(instance.errorObj.emptyChargePercentageErrorMessage.show).toBe(false);
        });


        it('should set chargeAmountErrorFlags and emptyChargeAmountErrorMessage.show when event is empty', () => {
            // Arrange
            const event = '';
            const index = 0;
            const expectedErrorMessage = {
                show: true,
                message: 'Enter Amount',
            };
            spyOn(translateService, 'instant').and.returnValue('Enter Amount');

            // Act
            instance.onChargeAmountChange(event, index);

            // Assert
            expect(instance.chargeAmountErrorFlags[index]).toEqual(true);
            expect(instance.errorObj.emptyChargeAmountErrorMessage).toEqual(expectedErrorMessage);
        });

        it('should set chargeAmountErrorFlags to false and hide emptyChargeAmountErrorMessage.show', () => {
            // Arrange
            const event = 'some value';
            const index = 0;
            instance.chargeAmountErrorFlags = [];
            spyOn(instance.chargeAmountErrorFlags, 'findIndex').and.returnValue(-1);

            // Act
            instance.onChargeAmountChange(event, index);

            // Assert
            expect(instance.chargeAmountErrorFlags[index]).toEqual(false);
            expect(instance.errorObj.emptyChargeAmountErrorMessage.show).toEqual(false);
            expect(instance.errorObj.emptyChargeAmountErrorMessage.message).toEqual('');
        });

        it('should set chargePercentErrorFlags and emptyChargePercentageErrorMessage.show when event is empty', () => {
            // Arrange
            const event = '';
            const index = 0;
            const expectedErrorMessage = {
                show: true,
                message: 'Enter the percentage',
            };
            spyOn(translateService, 'instant').and.returnValue('Enter the percentage');

            // Act
            instance.onChargePercentageChange(event, index);

            // Assert
            expect(instance.chargePercentErrorFlags[index]).toEqual(true);
            expect(instance.errorObj.emptyChargePercentageErrorMessage).toEqual(expectedErrorMessage);
        });

        it('should set chargePercentErrorFlags to false and hide emptyChargePercentageErrorMessage.show', () => {
            // Arrange
            const event = 'some value';
            const index = 0;
            instance.chargePercentErrorFlags = [];
            spyOn(instance.chargePercentErrorFlags, 'findIndex').and.returnValue(-1);

            // Act
            instance.onChargePercentageChange(event, index);

            // Assert
            expect(instance.chargePercentErrorFlags[index]).toEqual(false);
            expect(instance.errorObj.emptyChargePercentageErrorMessage.show).toEqual(false);
            expect(instance.errorObj.emptyChargePercentageErrorMessage.message).toEqual('');
        });

        it('should set percentOnEnhancementErrorFlags and emptyPercentOnEnhancementErrorMessage.show when event is empty', () => {
            // Arrange
            const event = '';
            const index = 0;
            const expectedErrorMessage = {
                show: true,
                message: 'Enter the Percentage on Enhancements',
            };
            spyOn(translateService, 'instant').and.returnValue('Enter the Percentage on Enhancements');

            // Act
            instance.onPercentOnEnhancementChange(event, index);

            // Assert
            expect(instance.percentOnEnhancementErrorFlags[index]).toEqual(true);
            expect(instance.errorObj.emptyPercentOnEnhancementErrorMessage).toEqual(expectedErrorMessage);
        });

        it('should set percentOnEnhancementErrorFlags to false and hide emptyPercentOnEnhancementErrorMessage.show', () => {
            // Arrange
            const event = 'some value';
            const index = 0;
            instance.chargePercentErrorFlags = [];
            spyOn(instance.percentOnEnhancementErrorFlags, 'findIndex').and.returnValue(-1);

            // Act
            instance.onPercentOnEnhancementChange(event, index);

            // Assert
            expect(instance.percentOnEnhancementErrorFlags[index]).toEqual(false);
            expect(instance.errorObj.emptyPercentOnEnhancementErrorMessage.show).toEqual(false);
            expect(instance.errorObj.emptyPercentOnEnhancementErrorMessage.message).toEqual('');
        });

        it('should remove deposit rule details at the given index', () => {
            // Arrange
            const index = 1;
            const expectedChargeAmountErrorMessage: IErrorMessage = { show: true, message: '' };
            const expectedChargePercentageErrorMessage: IErrorMessage = { show: true, message: '' };
            const expectedPercentOnEnhancementErrorMessage: IErrorMessage = { show: true, message: '' };
            instance.depositConfigurationRulesData = {
                rules: [
                    { chargeType: CHARGE_TYPES.FLAT },
                    { chargeType: CHARGE_TYPES.PERCENTAGE },
                ],
            };
            instance.chargeAmountErrorFlags = [true, false];
            instance.chargePercentErrorFlags = [false, true];
            instance.percentOnEnhancementErrorFlags = [false, true];
            instance.errorObj = {
                emptyChargeAmountErrorMessage: expectedChargeAmountErrorMessage,
                emptyChargePercentageErrorMessage: expectedChargePercentageErrorMessage,
                emptyPercentOnEnhancementErrorMessage: expectedPercentOnEnhancementErrorMessage
            };

            // Act
            instance.removeDepositRuleDetails(index);

            // Assert
            expect(instance.depositConfigurationRulesData.rules.length).toEqual(1);
            expect(instance.depositConfigurationRulesData.rules).toEqual([{ chargeType: CHARGE_TYPES.FLAT }]);

            expect(instance.chargeAmountErrorFlags.length).toEqual(2);
            expect(instance.chargeAmountErrorFlags).toEqual([true, false,]);

            expect(instance.chargePercentErrorFlags.length).toEqual(2);
            expect(instance.chargePercentErrorFlags).toEqual([false, false]);

            expect(instance.percentOnEnhancementErrorFlags.length).toEqual(2);
            expect(instance.percentOnEnhancementErrorFlags).toEqual([false, false]);

            expect(instance.errorObj.emptyChargeAmountErrorMessage.show).toBe(true);
            expect(instance.errorObj.emptyChargePercentageErrorMessage.show).toBe(false);
            expect(instance.errorObj.emptyPercentOnEnhancementErrorMessage.show).toBe(false);
        });

        it('should return true if any error message is shown', () => {
            // Arrange
            instance.errorObj.emptyChargePercentageErrorMessage.show = true;
            instance.errorObj.emptyChargeAmountErrorMessage.show = true;
            instance.errorObj.emptyPercentOnEnhancementErrorMessage.show = true;

            // Act
            const result = instance.validateDepositRulesDetails();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false if no error message is shown', () => {
            // Arrange
            instance.errorObj.emptyChargePercentageErrorMessage.show = false;
            instance.errorObj.emptyChargeAmountErrorMessage.show = false;
            instance.errorObj.emptyPercentOnEnhancementErrorMessage.show = false;

            // Act
            const result = instance.validateDepositRulesDetails();

            // Assert
            expect(result).toBe(false);
        });

        it('should emit validate event on invalid deposit rules details', () => {
            // Arrange
            spyOn(instance.validate, 'emit');
            const evt: IDepositConfigurationStepContinueEvent = {
                eventType: 'someEventType',
                stepNumber: 2
            };

            // Act
            instance.validateStep(evt);

            // Assert
            expect(instance.validate.emit).toHaveBeenCalledWith({
                stepNumber: 2,
                eventType: evt.eventType
            });
        });

    });
});
