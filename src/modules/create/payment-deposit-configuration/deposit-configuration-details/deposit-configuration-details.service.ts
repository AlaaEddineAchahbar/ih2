import { Injectable } from '@angular/core';
import {
    CHARGE_TYPES,
    IPaymentDepositConfigurationRuleDetailParams
  } from '../payment-deposit-configuration-create.model';
import { IDropDownItem } from '../../../core/common.model';


@Injectable()
export class PaymentDepositConfigurationDetailsService {

  defaultSelection: Array<number>;

    constructor() {
      this.defaultSelection = new Array<number>();
    }

    /**
     * Map the selected charge types for each deposit rule in the configuration
     * and determine which charge type options should be disabled on a per rule basis
     * @param depositRules: Array of deposit configuration detail information
     * @returns two-dimensional array representing which charge type options are enabled or disabled
     */
    getChargeTypeMapping(depositRules: IPaymentDepositConfigurationRuleDetailParams[]) {
      /**
       * Max. 3 charge types to select and thus max. of 3 rules to configure, charge type selection is also presented
       * in a set order so each row of booleans represents the disabled flag per charge type option based on
       * (true/disabled - false/enabled). The elected charge type is enabled for its respective rule and disabled elsewhere.
      */
      let chargeTypeMap: boolean[][] = [[false,false,false],[false,false,false],[false,false,false]];
      depositRules.forEach((rule, index) => {
        switch (rule.chargeType) {
          case CHARGE_TYPES.ARRIVAL_DAY_CHARGE:
            chargeTypeMap[0][0] = true;
            chargeTypeMap[1][0] = true;
            chargeTypeMap[2][0] = true;
            chargeTypeMap[index][0] = false;
            break;
          case CHARGE_TYPES.FLAT:
            chargeTypeMap[0][1] = true;
            chargeTypeMap[1][1] = true;
            chargeTypeMap[2][1] = true;
            chargeTypeMap[index][1] = false;
            break;
          case CHARGE_TYPES.PERCENTAGE:
            chargeTypeMap[0][2] = true;
            chargeTypeMap[1][2] = true;
            chargeTypeMap[2][2] = true;
            chargeTypeMap[index][2] = false;
            break;
          default:
            break;
        }
      });

      return chargeTypeMap;
    }

    /**
     * Determines which charge type option is the first one next available based on current charge type selection
     * @param chargeTypeMap: two-dimensional array representing which charge type options are enabled or disabled
     * @returns The first next available charge type
     */
    getNextAvailableChargeType(chargeTypeMap: boolean[][]) {
      const arrivalDayAvailable = !(chargeTypeMap[0][0] || chargeTypeMap[1][0] || chargeTypeMap[2][0]);
      const flatAvailable = !(chargeTypeMap[0][1] || chargeTypeMap[1][1] || chargeTypeMap[2][1]);

      if (arrivalDayAvailable) {
        return CHARGE_TYPES.ARRIVAL_DAY_CHARGE;
      } else if (flatAvailable) {
        return CHARGE_TYPES.FLAT;
      } else {
        return CHARGE_TYPES.PERCENTAGE;
      }
    }

    /**
     * Retrieves codes of selected currencies within the deposit configuration
     * @param currencyList: List of currencies and corresponding IDs
     * @param depositRules: Array of deposit configuration detail information
     * @returns Array of selected currency IDs
     */
    getSelectedCurrencyIds(currencyList: IDropDownItem[], depositRules: IPaymentDepositConfigurationRuleDetailParams[]) {
      let currencies = new Array<number>();
      depositRules.forEach((rule) => {
        if (rule.chargeType === CHARGE_TYPES.FLAT) {
          rule.chargeAmounts.forEach((chargeAmount) => {
            currencies.push(this.getIdByCurrency(currencyList, chargeAmount.currency));
          });
        }
      });

      return currencies;
    }

    /**
     * Retrieves currency lists for each charge amount
     * @param currencyList: List of currencies and corresponding IDs
     * @param selectedCurrencies: Array of selected currency codes per charge amount
     * @returns Array of selectable list of currencies for each charge amount
     */
    getChargeAmountCurrencyLists(currencyList: IDropDownItem[], selectedCurrencies: number[]) {
      let defaultValues = new Array<number>();
      let adaptedCurrencyLists = new Array<IDropDownItem[]>();
      selectedCurrencies.forEach((currencyId) => {
        let chargeAmountCurrencies = new Array<IDropDownItem>();
        currencyList.forEach((currency) => {
          const checkId = (element) => element === currency.id;
          if (currency.id === currencyId || selectedCurrencies.findIndex(checkId) < 0) {
            chargeAmountCurrencies.push(currency);
          }
        });
        defaultValues.push(chargeAmountCurrencies.findIndex(item => item.id === currencyId));
        adaptedCurrencyLists.push(chargeAmountCurrencies);
      });

      this.defaultSelection = defaultValues;
      return adaptedCurrencyLists;
    }

    getDefaultSelection() {
      return this.defaultSelection;
    }

    /**
     * Returns currency code for given id from list
     * @param list: list in which to look for id
     * @param id: id for which currency code to return
     * @returns currency code
     */
    getCurrencyById(list: IDropDownItem[], id: number | string): string {
      const data = list.find(item => item.id === id);
      if (data) {
          return data.name;
      }
      return '';
    }

    /**
     * Returns id for given currency from list
     * @param list: list in which to look for the currency
     * @param currency: currency for which id to return
     * @returns currency id
     */
    getIdByCurrency(list: IDropDownItem[], currency: string): number {
      const data = list.find(item => item.name === currency);
      if (data) {
          return data.id;
      }
      return -1;
    }
}
