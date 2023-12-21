/* Angular-Module Imports */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

/* Third Party Module Imports */
import { of } from 'rxjs';

/* TC-module Imports */
import { HTTPService } from 'src/modules/core/http.service';
import { IHTTPResponse, IHotelInfo } from '../../core/common.model';
import { CONFIG_TYPE, POLICY_FLOW, POLICY_LEVEL } from '../../core/constants';
import { ContextService } from '../../core/context.service';
import { IEmPaymentDepositRulesResponseModel } from '../../search/policy-mgmt-search.model';
import { PaymentDepositConfigurationCreateService } from './payment-deposit-configuration-create.service';
import { SharedDataService } from 'src/modules/core/shared.data.service';
import { IPropertyPaymentDepositRulesResponseModel } from './payment-deposit-configuration-create.model';

const depositConfigurationId = 123456;
const chainCode = 'AAA';
const propertyDepositConfigurationId = 84180;
const hotelCode = 1098;
const hotelInfo: IHotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');

const paymentDepositConfigurationResponse: IEmPaymentDepositRulesResponseModel
    = require('../../../assets-policy-mgmt/data/payment-deposit-rule/edit/PaymentDepositConfigurationResponse.json');
const createPropertyPaymentDepositConfigurationResponse: IEmPaymentDepositRulesResponseModel
    = require('../../../assets-policy-mgmt/data/property-payment-deposit-rule/create/payment-deposit-rule-response.json');
const createPropertyPaymentDepositConfigurationResponseModel: IPropertyPaymentDepositRulesResponseModel
    = require('../../../assets-policy-mgmt/data/property-payment-deposit-rule/create/payment-deposit-rule-response-model.json');

const getPropertyPaymentDepositConfigurationResponse
    = require('../../../assets-policy-mgmt/data/property-payment-deposit-rule/retrieve/get-payment-deposit-rule-response.json');

class MockHttpService {
    response: IHTTPResponse;
    get(url: string) {
        if (url === `enterprise/${chainCode}/payment-deposit-rule/${depositConfigurationId}`) {
            this.response = {
                body: paymentDepositConfigurationResponse,
                status: 200
            };
        } else if (url === `hotels/${hotelCode}/payment-deposit-rule/${propertyDepositConfigurationId}`) {
            this.response = {
                body: getPropertyPaymentDepositConfigurationResponse,
                status: 200
            };
        } else {
            this.response = {
                body: null,
                status: 404
            };
        }
        return of(this.response);
    }

    post(url: string) {
        if (url === `hotels/${hotelInfo.hotelCode}/payment-deposit-rule`) {
            this.response = {
                body: createPropertyPaymentDepositConfigurationResponse,
                status: 200
            };
        }
        return of(this.response);
    }

    put(url: string) {
        if (url === `hotels/${hotelInfo.hotelCode}/payment-deposit-rule/${propertyDepositConfigurationId}`) {
            this.response = {
                body: createPropertyPaymentDepositConfigurationResponse,
                status: 200
            };
        }
        return of(this.response);
    }
}

export class MockSharedDataService {
    getHotelInfo() {
        return hotelInfo;
    }
}

describe('Payment Deposit Configuration Create Service', () => {
    let contextService: ContextService;
    let service: PaymentDepositConfigurationCreateService;
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
                PaymentDepositConfigurationCreateService,
                ContextService,
                {
                    provide: HTTPService,
                    useClass: MockHttpService
                },
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                }
            ]
        });
        service = TestBed.inject(PaymentDepositConfigurationCreateService);
        contextService = TestBed.inject(ContextService);
        contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setChainCode(chainCode);
    });

    it('Should create mock PaymentDepositConfigurationCreateService', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    it('Should return Deposit Configuration data for a valid id', () => {
        // Assert
        service.getPaymentDepositConfigurationData(depositConfigurationId).subscribe((res: IEmPaymentDepositRulesResponseModel) => {
            expect(res.emPaymentDepositRuleTemplateId).toEqual(paymentDepositConfigurationResponse.emPaymentDepositRuleTemplateId);
            expect(res.emPaymentDepositRuleTemplateName).toEqual(paymentDepositConfigurationResponse.emPaymentDepositRuleTemplateName);
            expect(res.chainInfo).toEqual(paymentDepositConfigurationResponse.chainInfo);
            expect(res.paymentDepositRule).toEqual(paymentDepositConfigurationResponse.paymentDepositRule);
        });
    });

    it('Should return Error for invalid id', () => {
        // Assert
        service.getPaymentDepositConfigurationData(-1).subscribe((res: IEmPaymentDepositRulesResponseModel) => {
            expect(res).toEqual(null);
        });
    });

    it('Property level - Should create payment deposit configuration', () => {
        // Arrange
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);

        // Assert
        service.createUpdatePropertyPaymentDepositConfiguration(createPropertyPaymentDepositConfigurationResponseModel)
            .subscribe((res: any) => {
                expect(res.paymentDepositRuleId).toEqual(83076);
                expect(res.paymentDepositRuleName).toEqual('new DC with arrivalDay');
            });
    });

    it('Property level - should return null if response status is not GET_SUCCESS', () => {
        // Arrange
        const response: IHTTPResponse = {
            status: 404,
            body: getPropertyPaymentDepositConfigurationResponse
        };

        // Act && Assert
        expect(service.mapPropertyPaymentDepositRule(response)).toBeNull();
    });

    it('Property level - should return the correctly mapped deposit rule data', () => {
        // Arrange
        const expected: IPropertyPaymentDepositRulesResponseModel = {
            paymentDepositRuleName: 'nov new DC test UI 001',
            paymentDepositRuleId: 84180,
            active: 1,
            hotelId: 1098,
            ownerType: 'P',
            status: 'update',
            rules: [
                {
                    chargeType: 'ArrivalDay',
                    chargeDate: 999,
                    percentOnEnhancement: 23,
                    chargeAmount: 0,
                    chargePercentage: 0,
                },
                {
                    chargeType: 'Percentage',
                    chargeDate: 999,
                    percentOnEnhancement: 45,
                    chargeAmount: 0,
                    chargePercentage: 15,
                },
                {
                    chargeType: 'Flat',
                    chargeDate: 999,
                    percentOnEnhancement: 11,
                    chargeAmount: 22,
                    chargePercentage: 0,
                }
            ]
        };

        const response: IHTTPResponse = {
            status: 200,
            body: getPropertyPaymentDepositConfigurationResponse
        };

        // Act
        const actual = service.mapPropertyPaymentDepositRule(response);

        // Assert
        expect(actual).toEqual(expected);
    });

    it('Property level - Should get payment deposit configuration', () => {
        // Assert
        service.getPropertyPaymentDepositConfigurationData(propertyDepositConfigurationId)
            .subscribe((res: any) => {
                expect(res.paymentDepositRuleId).toEqual(propertyDepositConfigurationId);
                expect(res.paymentDepositRuleName).toEqual('nov new DC test UI 001');
                expect(res.hotelId).toEqual(hotelCode);

                expect(res.rules[0].chargeType).toEqual('ArrivalDay');
                expect(res.rules[0].percentOnEnhancement).toEqual(23);

                expect(res.rules[1].chargeType).toEqual('Percentage');
                expect(res.rules[1].chargePercentage).toEqual(15);
                expect(res.rules[1].percentOnEnhancement).toEqual(45);

                expect(res.rules[2].chargeType).toEqual('Flat');
                expect(res.rules[2].chargeAmount).toEqual(22);
                expect(res.rules[2].percentOnEnhancement).toEqual(11);
            });
    });
});
