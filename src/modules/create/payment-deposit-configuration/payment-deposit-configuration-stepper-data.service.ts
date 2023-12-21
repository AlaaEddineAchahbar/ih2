/* Angular-Module Imports */
import { Injectable } from '@angular/core';

/* TC-module Imports */
import { POLICY_FLOW, POLICY_LEVEL } from '../../core/constants';
import {
  DEPOSIT_CONFIGURATION_CHARGE_TYPE,
  DEPOSIT_CONFIGURATION_OWNER_TYPE,
  PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE,
  PROPERTY_DEPOSIT_CONFIGURATION_STATUS
} from '../../core/rules-config.constant';
import {
  IChargeAmount,
  IEmPaymentDepositRulesResponseModel,
  IEmPaymentDepositRule,
  IPaymentDepositRulesChainInfo,
  IPaymentDepositRulesChainHotel
} from '../../search/policy-mgmt-search.model';
import {
  CHARGE_TYPES,
  DEPOSIT_CONFIGURATION_STATUS,
  IDepositConfigurationDefaultPropertyCurrencies,
  IPaymentDepositConfigurationRuleChargeAmount,
  IPaymentDepositConfigurationDetailData,
  IPaymentDepositConfigurationRulesData,
  IPaymentDepositConfigurationRuleDetailParams,
  EmPaymentDepositRulesResponseModel,
  IPropertyPaymentDepositRulesResponseModel,
  PropertyPaymentDepositRulesResponseModel,
  IPropertyPaymentDepositConfigurationRulesData,
  IPropertyPaymentDepositConfigurationRuleDetailParams,
  IPropertyPaymentDepositRuleDetail
} from './payment-deposit-configuration-create.model';
import { SharedDataService } from './../../core/shared.data.service';
import { IChainInfo, IChainHotel, IDropDownItem, IHotelInfo } from '../../core/common.model';
import { ContextService } from 'src/modules/core/context.service';
import { RULE_PRIORITY } from 'src/modules/core/rules.constant';


@Injectable()
export class PaymentDepositConfigurationStepperDataService {

  paymentDepositConfigurationResponseModel: IEmPaymentDepositRulesResponseModel;
  propertyPaymentDepositConfigurationResponseModel: IPropertyPaymentDepositRulesResponseModel;
  chainInfo: IChainInfo;
  hotelInfo: IHotelInfo;

  constructor(
    private sharedDataService: SharedDataService,
    private contextService: ContextService
  ) { }

  InitializeResponseModel() {
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      this.paymentDepositConfigurationResponseModel = new EmPaymentDepositRulesResponseModel();
      this.setDefaultDataForCreateDepositConfigurationModel(this.paymentDepositConfigurationResponseModel);
    } else {
      this.propertyPaymentDepositConfigurationResponseModel = new PropertyPaymentDepositRulesResponseModel();
      this.setDefaultDataForCreatePropertyDepositConfigurationModel(this.propertyPaymentDepositConfigurationResponseModel);
    }
  }

  /**
   * Set the response model
   * @param responseModel
   */
  setResponseModel(responseModel: IEmPaymentDepositRulesResponseModel) {
    this.paymentDepositConfigurationResponseModel = responseModel;
  }

  /**
   * Get the response model
   * @returns response model
   */
  getResponseModel(): IEmPaymentDepositRulesResponseModel {
    return this.paymentDepositConfigurationResponseModel;
  }

  /**
   * Set the property response model
   * @param responseModel
   */
  setPropertyResponseModel(responseModel: IPropertyPaymentDepositRulesResponseModel) {
    this.propertyPaymentDepositConfigurationResponseModel = responseModel;
  }

  /**
   * Get the property response model
   * @returns response model
   */
  getPropertyResponseModel(): IPropertyPaymentDepositRulesResponseModel {
    return this.propertyPaymentDepositConfigurationResponseModel;
  }

  /**
   * Get the deposit configuration detail data
   * @returns deposit configuration detail data
   */
  getDepositConfigurationDetailData(): IPaymentDepositConfigurationDetailData {
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      return {
        paymentDepositConfigurationName: this.paymentDepositConfigurationResponseModel.emPaymentDepositRuleTemplateName
      };
    } else {
      return {
        paymentDepositConfigurationName: this.propertyPaymentDepositConfigurationResponseModel.paymentDepositRuleName
      };
    }
  }

  /**
   * Get the deposit configuration rules data
   * @returns deposit configuration rules data
   */
  getDepositConfigurationRulesData(): IPaymentDepositConfigurationRulesData {
    const rules: IPaymentDepositConfigurationRuleDetailParams[] = [];
    const data = {
      chargeType: [
        CHARGE_TYPES.ARRIVAL_DAY_CHARGE,
        CHARGE_TYPES.FLAT,
        CHARGE_TYPES.PERCENTAGE
      ]
    };

    this.paymentDepositConfigurationResponseModel.paymentDepositRule.rules.forEach((rule: IEmPaymentDepositRule) => {
      const chargeAmounts: IPaymentDepositConfigurationRuleChargeAmount[] = [];
      let chargePercentage = 0;
      let percentOnEnhancement = rule.percentOnEnhancement ? rule.percentOnEnhancement : 0;
      let chargeType: string;

      switch (rule.chargeType) {
        case DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT:
          rule.chargeAmounts.forEach((amountData: IChargeAmount) => {
            const chargeAmount: IPaymentDepositConfigurationRuleChargeAmount = {
              amount: amountData.chargeAmount,
              currency: amountData.currency[0]
            };
            chargeAmounts.push(chargeAmount);
          });
          chargeType = CHARGE_TYPES.FLAT;
          break;
        case DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE:
          chargePercentage = rule.chargePercentage;
          chargeType = CHARGE_TYPES.PERCENTAGE;
          break;
        case DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY:
          chargeType = CHARGE_TYPES.ARRIVAL_DAY_CHARGE;
          break;
        default:
          break;
      }

      rules.push({
        chargeType: chargeType,
        chargeAmounts,
        chargePercentage,
        percentOnEnhancement
      });
    });
    return {
      rules: rules,
      data: data
    };
  }

  /**
   * Set the deposit configuration rules data for the response model
   * @returns deposit configuration rules data
   */
  setDepositConfigurationRulesData(depositConfigurationRulesData: IPaymentDepositConfigurationRulesData, policyFlow: string) {
    console.log('Payment Deposit Configuration Rules', depositConfigurationRulesData);

    let depositRules: IEmPaymentDepositRule[] = [];
    let status = DEPOSIT_CONFIGURATION_STATUS.UPDATE;

    if (policyFlow === POLICY_FLOW.CREATE) {
      status = DEPOSIT_CONFIGURATION_STATUS.ADD;
    }

    this.paymentDepositConfigurationResponseModel.paymentDepositRule.status = status;
    this.chainInfo = this.sharedDataService.getChainInfo();
    this.paymentDepositConfigurationResponseModel.chainInfo = this.mapDepositConfigurationRequestChainInfo(
      this.chainInfo, status);
    const defaultPropertyCurrencies = this.mapDepositConfigurationRequestPropertyCurrencies(this.chainInfo);

    depositConfigurationRulesData.rules.forEach((rule) => {
      let depositRule: IEmPaymentDepositRule = {
        status: '',
        percentOnEnhancement: 0,
        chargeType: '',
        chargeAmounts: [],
        chargePercentage: 0
      };
      let chargeType: string;
      depositRule.status = status;

      if (rule.chargeType) {
        switch (rule.chargeType) {
          case CHARGE_TYPES.FLAT:
            if (rule.chargeAmounts) {
              rule.chargeAmounts.forEach(x => {
                if (x.currency) {
                  const data = defaultPropertyCurrencies.find(item => item.currency === x.currency);
                  depositRule.chargeAmounts.push({
                    chargeAmount: x.amount,
                    currency: [x.currency],
                    properties: data.properties
                  });
                }
              });
            }
            chargeType = DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT;
            break;
          case CHARGE_TYPES.PERCENTAGE:
            if (rule.chargePercentage) {
              depositRule.chargePercentage = rule.chargePercentage;
            }
            chargeType = DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE;
            break;
          case CHARGE_TYPES.ARRIVAL_DAY_CHARGE:
            chargeType = DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY;
            break;
          default:
            break;
        }
        depositRule.chargeType = chargeType;
      }
      if (rule.percentOnEnhancement) {
        depositRule.percentOnEnhancement = rule.percentOnEnhancement;
      }
      depositRules.push(depositRule);
    });
    this.paymentDepositConfigurationResponseModel.paymentDepositRule.rules = depositRules;
  }

  mapDepositConfigurationRequestChainInfo(chainInfo: IChainInfo, status: string): IPaymentDepositRulesChainInfo {
    const depositConfigurationRequestChainInfo: IPaymentDepositRulesChainInfo = {
      chainCode: chainInfo.chainCode,
      chainHotels: this.mapDepositConfigurationRequestChainHotels(chainInfo.chainHotels, status)
    };
    return depositConfigurationRequestChainInfo;
  }

  /**
   * Set the list of individual hotel information
   * for the deposit configuration
   * @param chainHotels chain hotel information
   * @param status deposit configuration create/update request status
   * @returns deposit configuration chain hotels data
   */
  mapDepositConfigurationRequestChainHotels(chainHotels: Array<IChainHotel>, status: string): Array<IPaymentDepositRulesChainHotel> {
    const depositConfigurationRequestChainHotelList: Array<IPaymentDepositRulesChainHotel> = [];
    chainHotels.forEach(x => {
      depositConfigurationRequestChainHotelList.push({
        hotelId: x.hotelCode,
        hotelName: x.hotelName,
        status: status
      });
    });
    return depositConfigurationRequestChainHotelList;
  }

  mapDepositConfigurationRequestPropertyCurrencies(chainInfo: IChainInfo): Array<IDepositConfigurationDefaultPropertyCurrencies> {
    let defaultCurrencies = new Array<string>();
    let defaultPropertyCurrencies = new Array<IDepositConfigurationDefaultPropertyCurrencies>();

    chainInfo.chainHotels.forEach(hotel => {
      defaultCurrencies.push(hotel.currencyCode);
    });
    let uniqueElements = [...new Set(defaultCurrencies)];

    uniqueElements.forEach(currency => {
      let propertiesPerCurrency = { currency: currency, properties: [] };
      chainInfo.chainHotels.forEach(hotel => {
        if (currency === hotel.currencyCode) {
          propertiesPerCurrency.properties.push(hotel.hotelCode.toString());
        }
      });
      defaultPropertyCurrencies.push(propertiesPerCurrency);
    });

    return defaultPropertyCurrencies;
  }

  getDepositConfigurationRequestDefaultCurrenciesSelection(chainInfo: IChainInfo): Array<IDropDownItem> {
    let defaultCurrenciesSelection = new Array<IDropDownItem>();
    let defaultCurrencies = new Array<string>();
    chainInfo.chainHotels.forEach((hotel: IChainHotel) => {
      if (defaultCurrencies.indexOf(hotel.currencyCode) === -1) {
        defaultCurrencies.push(hotel.currencyCode);
      }
    });

    defaultCurrencies.forEach((currency: string, index) => {
      defaultCurrenciesSelection.push({
        id: index + 1,
        name: currency
      });
    });
    return defaultCurrenciesSelection;
  }

  /**
   * Set deposit configuration detail data
   * @param paymentDepositConfigurationDetailData
   */
  setDepositConfigurationDetailName(paymentDepositConfigurationDetailData: IPaymentDepositConfigurationDetailData) {
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      this.paymentDepositConfigurationResponseModel
        .emPaymentDepositRuleTemplateName = paymentDepositConfigurationDetailData.paymentDepositConfigurationName;
      this.paymentDepositConfigurationResponseModel
        .paymentDepositRule.ruleName = paymentDepositConfigurationDetailData.paymentDepositConfigurationName;
    } else {
      this.propertyPaymentDepositConfigurationResponseModel.paymentDepositRuleName =
        paymentDepositConfigurationDetailData.paymentDepositConfigurationName;
    }
  }

  /**
   * Sets default values required to create deposit configuration response model
   * @param responseModel: Deposit configuration response model
   */
  setDefaultDataForCreateDepositConfigurationModel(responseModel: IEmPaymentDepositRulesResponseModel) {
    let status = DEPOSIT_CONFIGURATION_STATUS.ADD;

    responseModel.paymentDepositRule.status = status;

    this.chainInfo = this.sharedDataService.getChainInfo();
    responseModel.chainInfo = this.mapDepositConfigurationRequestChainInfo(this.chainInfo, status);

    const chargeAmount: IChargeAmount = {
      chargeAmount: 0,
      currency: [''],
      properties: ['']
    };

    responseModel.paymentDepositRule.rules.push({
      chargeType: DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY,
      chargeAmounts: [chargeAmount],
      chargePercentage: 0,
      percentOnEnhancement: 0,
      status: status
    });

    this.setResponseModel(responseModel);
  }

  /**
   * Get the property deposit configuration rules data
   * @returns property deposit configuration rules data
   */
  getPropertyDepositConfigurationRulesData(): IPropertyPaymentDepositConfigurationRulesData {
    const rules: IPropertyPaymentDepositConfigurationRuleDetailParams[] = [];
    const data = {
      chargeType: [
        CHARGE_TYPES.ARRIVAL_DAY_CHARGE,
        CHARGE_TYPES.FLAT,
        CHARGE_TYPES.PERCENTAGE
      ]
    };

    this.propertyPaymentDepositConfigurationResponseModel.rules.forEach((rule: IPropertyPaymentDepositRuleDetail) => {
      let chargeAmount = 0;
      let chargePercentage = 0;
      let percentOnEnhancement = rule.percentOnEnhancement ? rule.percentOnEnhancement : 0;
      let chargeType: string;

      switch (rule.chargeType) {
        case PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY:
          chargeType = CHARGE_TYPES.ARRIVAL_DAY_CHARGE;
          break;
        case PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT:
          chargeAmount = rule.chargeAmount;
          chargeType = CHARGE_TYPES.FLAT;
          break;
        case PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE:
          chargePercentage = rule.chargePercentage;
          chargeType = CHARGE_TYPES.PERCENTAGE;
          break;
        default:
          break;
      }

      rules.push({
        chargeType: chargeType,
        chargeDate: rule.chargeDate,
        chargeAmount,
        chargePercentage,
        percentOnEnhancement
      });
    });
    return {
      rules: rules,
      data: data
    };
  }

  /**
   * Set the property deposit configuration rules data for the response model
   * @returns deposit configuration rules data
   */
  setPropertyDepositConfigurationRulesData(depositConfigurationRulesData: IPropertyPaymentDepositConfigurationRulesData) {
    let depositRuleDetails: IPropertyPaymentDepositRuleDetail[] = [];

    if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
      this.propertyPaymentDepositConfigurationResponseModel.status = PROPERTY_DEPOSIT_CONFIGURATION_STATUS.ADD;
    } else {
      this.propertyPaymentDepositConfigurationResponseModel.status = PROPERTY_DEPOSIT_CONFIGURATION_STATUS.EDIT;
    }

    this.hotelInfo = this.sharedDataService.getHotelInfo();
    this.propertyPaymentDepositConfigurationResponseModel.hotelId = this.hotelInfo.hotelCode;

    this.propertyPaymentDepositConfigurationResponseModel.ownerType = DEPOSIT_CONFIGURATION_OWNER_TYPE.PROPERTY;

    depositConfigurationRulesData.rules.forEach((rule) => {
      let depositRuleDetail: IPropertyPaymentDepositRuleDetail = {
        chargeDate: RULE_PRIORITY.defaultPolicy,
        chargeType: '',
        chargeAmount: 0,
        chargePercentage: 0,
        percentOnEnhancement: 0
      };

      let chargeType: string;

      if (rule.chargeType) {
        switch (rule.chargeType) {
          case CHARGE_TYPES.ARRIVAL_DAY_CHARGE:
            chargeType = PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY;
            break;
          case CHARGE_TYPES.FLAT:
            if (rule.chargeAmount) {
              depositRuleDetail.chargeAmount = rule.chargeAmount;
            }
            chargeType = PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT;
            break;
          case CHARGE_TYPES.PERCENTAGE:
            if (rule.chargePercentage) {
              depositRuleDetail.chargePercentage = rule.chargePercentage;
            }
            chargeType = PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE;
            break;
          default:
            break;
        }
        depositRuleDetail.chargeType = chargeType;
      }
      if (rule.percentOnEnhancement) {
        depositRuleDetail.percentOnEnhancement = rule.percentOnEnhancement;
      }
      depositRuleDetails.push(depositRuleDetail);
    });
    this.propertyPaymentDepositConfigurationResponseModel.rules = depositRuleDetails;
  }

  /**
   * Method to get the default property currency
   * @param hotelInfo
   * @returns: unique code identifier for default property currency
   */
  getPropertyDepositConfigurationDefaultCurrency(hotelInfo: IHotelInfo): string {
    let propertyDefaultCurrency: string = '';
    hotelInfo.currencies.forEach((currency) => {
      if (currency.isDefault) {
        propertyDefaultCurrency = currency.currencyCode;
      }
    });
    return propertyDefaultCurrency;
  }

  /**
  * Sets default values required to create property deposit configuration response model
  * @param responseModel: Property Deposit configuration response model
  */
  setDefaultDataForCreatePropertyDepositConfigurationModel(responseModel: IPropertyPaymentDepositRulesResponseModel) {
    responseModel.status = PROPERTY_DEPOSIT_CONFIGURATION_STATUS.ADD;

    this.hotelInfo = this.sharedDataService.getHotelInfo();
    responseModel.hotelId = this.hotelInfo.hotelCode;
    responseModel.ownerType = DEPOSIT_CONFIGURATION_OWNER_TYPE.PROPERTY;
    responseModel.rules.push({
      chargeType: PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY,
      chargeDate: RULE_PRIORITY.defaultPolicy,
      chargeAmount: 0,
      chargePercentage: 0,
      percentOnEnhancement: 0
    });

    this.setPropertyResponseModel(responseModel);
  }
}
