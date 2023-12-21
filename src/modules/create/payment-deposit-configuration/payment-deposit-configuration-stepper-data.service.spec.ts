/* Angular-Module Imports */
import { TestBed } from '@angular/core/testing';

/* TC-module Imports */
import { IEmPaymentDepositRulesResponseModel } from '../../search/policy-mgmt-search.model';
import {
    CHARGE_TYPES,
    IPaymentDepositConfigurationDetailData,
    IPaymentDepositConfigurationRulesData,
    IPropertyPaymentDepositConfigurationRulesData,
    IPropertyPaymentDepositRulesResponseModel
} from './payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationStepperDataService } from './payment-deposit-configuration-stepper-data.service';
import { SharedDataService } from '../../core/shared.data.service';
import { ContextService } from 'src/modules/core/context.service';
import { POLICY_LEVEL } from 'src/modules/core/constants';
import { IHotelInfo } from 'src/modules/core/common.model';

const paymentDepositConfigurationResponse: IEmPaymentDepositRulesResponseModel
    = require('../../../assets-policy-mgmt/data/payment-deposit-rule/edit/PaymentDepositRulesResponse.json');

const propertyPaymentDepositConfigurationResponse: IPropertyPaymentDepositRulesResponseModel
    = require('../../../assets-policy-mgmt/data/property-payment-deposit-rule/create/payment-deposit-rule-response-model.json');

const hotelInfo: IHotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');

export class MockSharedDataService {
    getChainInfo() {
        return {
            chainCode: 'AAM',
            chainHotels: [{
                hotelCode: 1000,
                hotelName: 'Test hotel',
                status: 'add'
            }]
        };
    }

    getHotelInfo() {
        return hotelInfo;
    }
}

describe('Payment Deposit Configuration Create Stepper Data Service', () => {
    let service: PaymentDepositConfigurationStepperDataService;

    let contextService: ContextService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                PaymentDepositConfigurationStepperDataService,
                ContextService,
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                }
            ]
        });
        service = TestBed.inject(PaymentDepositConfigurationStepperDataService);
        contextService = TestBed.inject(ContextService);
    });

    it('Should be created', () => {
        // Assert
        expect(service).toBeTruthy();
        expect(service).toBeDefined();
    });

    it('Should set and get payment deposit configuration response model', () => {
        // Act
        service.setResponseModel(paymentDepositConfigurationResponse);

        // Assert
        expect(service.getResponseModel()).toEqual(paymentDepositConfigurationResponse);
    });

    it('Should get deposit configuration detail data correctly', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        const configurationDetailData: IPaymentDepositConfigurationDetailData = {
            paymentDepositConfigurationName: paymentDepositConfigurationResponse.emPaymentDepositRuleTemplateName,
        };

        // Act
        service.setResponseModel(paymentDepositConfigurationResponse);

        // Assert
        expect(service.getDepositConfigurationDetailData()).toEqual(configurationDetailData);
    });

    it('Should get deposit configuration rules data correctly', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        const rulesData: IPaymentDepositConfigurationRulesData = {
            rules: [{
                chargeType: 'FLAT',
                chargeAmounts: [{
                    amount: 100,
                    currency: 'EUR'
                }, {
                    amount: 200,
                    currency: 'USD'
                }],
                chargePercentage: 0,
                percentOnEnhancement: 10
            }, {
                chargeType: 'PERCENTAGE',
                chargeAmounts: [],
                chargePercentage: 10,
                percentOnEnhancement: 11
            }, {
                chargeType: 'ARRIVAL_DAY_CHARGE',
                chargeAmounts: [],
                chargePercentage: 0,
                percentOnEnhancement: 0
            }],
            data: {
                chargeType: [
                    CHARGE_TYPES.ARRIVAL_DAY_CHARGE,
                    CHARGE_TYPES.FLAT,
                    CHARGE_TYPES.PERCENTAGE
                ]
            }
        };

        // Act
        service.setResponseModel(paymentDepositConfigurationResponse);

        // Assert
        expect(service.getDepositConfigurationRulesData()).toEqual(rulesData);
    });

    it('Property Level - Should set and get payment deposit configuration response model', () => {
        // Act
        service.setPropertyResponseModel(propertyPaymentDepositConfigurationResponse);

        // Assert
        expect(service.getPropertyResponseModel()).toEqual(propertyPaymentDepositConfigurationResponse);
    });

    it('Property Level - Should get deposit configuration detail data correctly', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        const configurationDetailData: IPaymentDepositConfigurationDetailData = {
            paymentDepositConfigurationName: propertyPaymentDepositConfigurationResponse.paymentDepositRuleName,
        };

        // Act
        service.setPropertyResponseModel(propertyPaymentDepositConfigurationResponse);

        // Assert
        expect(service.getDepositConfigurationDetailData()).toEqual(configurationDetailData);
    });

    it('Property Level - Should get deposit configuration rules data correctly', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        const rulesData: IPropertyPaymentDepositConfigurationRulesData = {
            rules: [{
                chargeDate: 999,
                chargeType: 'FLAT',
                chargeAmount: 25,
                chargePercentage: 0,
                percentOnEnhancement: 14
            }, {
                chargeDate: 999,
                chargeType: 'PERCENTAGE',
                chargeAmount: 0,
                chargePercentage: 35,
                percentOnEnhancement: 31
            }, {
                chargeDate: 999,
                chargeType: 'ARRIVAL_DAY_CHARGE',
                chargeAmount: 0,
                chargePercentage: 0,
                percentOnEnhancement: 15
            }],
            data: {
                chargeType: [
                    CHARGE_TYPES.ARRIVAL_DAY_CHARGE,
                    CHARGE_TYPES.FLAT,
                    CHARGE_TYPES.PERCENTAGE
                ]
            }
        };

        // Act
        service.setPropertyResponseModel(propertyPaymentDepositConfigurationResponse);

        // Assert
        expect(service.getPropertyDepositConfigurationRulesData()).toEqual(rulesData);
    });

    it('Property Level - should return the default currency code', () => {
        // Act
        const result = service.getPropertyDepositConfigurationDefaultCurrency(hotelInfo);

        // Assert
        expect(result).toBe('EUR');
    });

    it('Property Level - should set correctly Default Data For Create Property Deposit Configuration Model', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

        const rulesData: IPropertyPaymentDepositConfigurationRulesData = {
            rules: [{
                chargeDate: 999,
                chargeType: 'FLAT',
                chargeAmount: 25,
                chargePercentage: 0,
                percentOnEnhancement: 14
            }, {
                chargeDate: 999,
                chargeType: 'PERCENTAGE',
                chargeAmount: 0,
                chargePercentage: 35,
                percentOnEnhancement: 31
            }, {
                chargeDate: 999,
                chargeType: 'ARRIVAL_DAY_CHARGE',
                chargeAmount: 0,
                chargePercentage: 0,
                percentOnEnhancement: 15
            }],
            data: {
                chargeType: [
                    CHARGE_TYPES.ARRIVAL_DAY_CHARGE,
                    CHARGE_TYPES.FLAT,
                    CHARGE_TYPES.PERCENTAGE
                ]
            }
        };

        // Act
        service.InitializeResponseModel();
        service.setPropertyDepositConfigurationRulesData(rulesData);

        // Assert
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[0].chargeDate).toBe(999);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[0].chargeType).toBe('Flat');
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[0].chargeAmount).toBe(25);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[0].chargePercentage).toBe(0);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[0].percentOnEnhancement).toBe(14);

        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[1].chargeDate).toBe(999);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[1].chargeType).toBe('Percentage');
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[1].chargeAmount).toBe(0);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[1].chargePercentage).toBe(35);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[1].percentOnEnhancement).toBe(31);

        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[2].chargeDate).toBe(999);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[2].chargeType).toBe('ArrivalDay');
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[2].chargeAmount).toBe(0);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[2].chargePercentage).toBe(0);
        expect(service.propertyPaymentDepositConfigurationResponseModel.rules[2].percentOnEnhancement).toBe(15);
    });
});
