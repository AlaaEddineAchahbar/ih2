import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';
import {
    IDepositConfigurationStepContinueEvent,
    DEPOSIT_CONFIGURATION_STEPS,
    CHARGE_TYPES,
    IPaymentDepositConfigurationRuleDetailParams,
    IPaymentDepositConfigurationRulesData,
    IPaymentDepositConfigurationRulesErrorModel
} from '../payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationDetailsService } from './deposit-configuration-details.service';
import { IChainInfo, IDropDownItem, ErrorMessage } from '../../../core/common.model';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { ContextService } from '../../../core/context.service';
import { TcTranslateService } from 'tc-angular-services';
import { SharedDataService } from '../../../core/shared.data.service';
import { TranslationMap } from '../../../core/translation.constant';
import { assetURL }  from '../../../constants/constants';

@Component({
    templateUrl: './deposit-configuration-details.component.html',
    selector: 'deposit-configuration-details-edit',
    styleUrls: ['./deposit-configuration-details.component.scss']
})

export class PaymentDepositConfigurationDetailsComponent implements OnInit, OnDestroy {
    /**
     * Input parameters from parent component
     */
    @Input() continueFromStepper: Subject<IDepositConfigurationStepContinueEvent>;

    /**
     * Output from component to parent
     */
    @Output() validate: EventEmitter<IDepositConfigurationStepContinueEvent> = new EventEmitter();

    /**
     * Continuation observable for the deposit configuration details editing
     */
    continueSubscriberRef: SubscriptionLike;

    /**
     * Create/Edit payment deposit configuration step 2: deposit configuration details - rules data
     */
    depositConfigurationRulesData: IPaymentDepositConfigurationRulesData;

    /**
     * Translation Map
     */
    translationMap: any;

    /**
     * Holds inline error message if present
     */
    errorObj: IPaymentDepositConfigurationRulesErrorModel;
    chainInfo: IChainInfo;

    publicPath: string;

    /**
     * Error message flags and selected charge type flags
     */
    amountErrorFlags: Array<boolean>;
    percentOnEnhancementErrorFlags: Array<boolean>;

    /**
     * Holds currency information for dropdown selection
     */
    defaultCurrencies: Array<IDropDownItem>;
    perAmountCurrencies: Array<IDropDownItem[]>;
    selectedCurrencies: Array<number>;
    defaultSelection: Array<number>;

    /**
     * Holds charge type selection information used to
     * disable radio buttons for charge type selection
     */
    selectedChargeTypesMap: boolean[][];

    maxCurrencies: number;
    currenciesSelected: number;

    constructor(
        private contextService: ContextService,
        private translate: TcTranslateService,
        private stepperDataService: PaymentDepositConfigurationStepperDataService,
        private depositConfigurationDetailsService: PaymentDepositConfigurationDetailsService,
        private sharedDataService: SharedDataService
    ) {
      this.translationMap = TranslationMap;
      this.errorObj = {
        selectCurrencyErrorMessage: new ErrorMessage(),
        selectAllCurrenciesErrorMessage: new ErrorMessage(),
        emptyAmountErrorMessage: new ErrorMessage(),
        emptyPercentageErrorMessage: new ErrorMessage(),
        emptyPercentOnEnhancementErrorMessage: new ErrorMessage()
      };

      this.chainInfo = this.sharedDataService.getChainInfo() ? this.sharedDataService.getChainInfo() : null;
      this.publicPath = assetURL;
    }

    ngOnInit() {
        this.continueSubscriberRef = this.continueFromStepper.subscribe((evt: IDepositConfigurationStepContinueEvent) => {
            this.validateStep(evt);
        });
        this.depositConfigurationRulesData = this.stepperDataService.getDepositConfigurationRulesData();
        this.selectedChargeTypesMap = this.depositConfigurationDetailsService
          .getChargeTypeMapping(this.depositConfigurationRulesData.rules);
        this.defaultCurrencies = this.stepperDataService.getDepositConfigurationRequestDefaultCurrenciesSelection(this.chainInfo);
        this.selectedCurrencies = this.depositConfigurationDetailsService
          .getSelectedCurrencyIds(this.defaultCurrencies, this.depositConfigurationRulesData.rules);
        this.perAmountCurrencies = new Array(this.defaultCurrencies.length);
        if (this.selectedCurrencies.length !== 0) {
          this.perAmountCurrencies = this.depositConfigurationDetailsService
            .getChargeAmountCurrencyLists(this.defaultCurrencies, this.selectedCurrencies);
          this.defaultSelection = this.depositConfigurationDetailsService.getDefaultSelection();
        } else {
          this.resetCurrencySelections();
        }
        this.amountErrorFlags = new Array(this.defaultCurrencies.length);
        this.percentOnEnhancementErrorFlags = new Array(3);
        this.amountErrorFlags.fill(false);
        this.percentOnEnhancementErrorFlags.fill(false);
        this.maxCurrencies = this.defaultCurrencies.length;
        this.currenciesSelected = this.maxCurrencies;
    }

    ngOnDestroy() {
        this.continueSubscriberRef.unsubscribe();
    }

    /**
     * This function is called when any changes are made
     * to the charge type of a deposit rule/configuration
     * @param index: rule/configuration index
     * @param item: charge type option
     */
    onChargeTypeChange(index: number, item: string) {
      // Reset amount and currency values
      const previousChargeType = this.depositConfigurationRulesData.rules[index].chargeType;
      this.depositConfigurationRulesData.rules[index].chargePercentage = 0;
      this.depositConfigurationRulesData.rules[index].chargeAmounts = [{amount: 0, currency: ''}];
      this.depositConfigurationRulesData.rules[index].chargeType = item;

      if (previousChargeType === CHARGE_TYPES.FLAT) {
        this.amountErrorFlags = new Array(this.defaultCurrencies.length);
        this.amountErrorFlags.fill(false);
        this.errorObj.selectCurrencyErrorMessage.show = false;
        this.errorObj.selectAllCurrenciesErrorMessage.show = false;
        this.errorObj.emptyAmountErrorMessage.show = false;
        this.resetCurrencySelections();
      } else if (previousChargeType === CHARGE_TYPES.PERCENTAGE) {
        this.errorObj.emptyPercentageErrorMessage.show = false;
      }

      this.selectedCurrencies = this.depositConfigurationDetailsService
        .getSelectedCurrencyIds(this.defaultCurrencies, this.depositConfigurationRulesData.rules);
      this.selectedChargeTypesMap = this.depositConfigurationDetailsService
        .getChargeTypeMapping(this.depositConfigurationRulesData.rules);
    }

    /**
     * This function is called when any changes are made
     * to the percentage on enhancement value of a deposit rule
     * @param event: event
     * @param index: rule/configuration index
     */
    onPercentOnEnhancementChange(event: any, index: number) {
      if (event === '') {
        this.percentOnEnhancementErrorFlags[index] = true;
        this.errorObj.emptyPercentOnEnhancementErrorMessage = {
          show: true,
          message: this.translate.translateService.instant(this.translationMap.ENTER_PERCENT_ON_ENHANCEMENT)
        };
      } else {
        this.percentOnEnhancementErrorFlags[index] = false;
        if (this.percentOnEnhancementErrorFlags.findIndex(item => item === true) < 0) {
          this.errorObj.emptyPercentOnEnhancementErrorMessage.show = false;
        }
      }
    }

    /**
     * This function is called when any changes are made
     * to the percentage value of a deposit rule
     * @param event: event
     */
    onPercentageChange(event: any) {
      if (event === '') {
        this.errorObj.emptyPercentageErrorMessage = {
          show: true,
          message: this.translate.translateService.instant(this.translationMap.ENTER_PERCENTAGE)
        };
      } else {
        this.errorObj.emptyPercentageErrorMessage.show = false;
      }
    }

    /**
     * This function is called when any changes are made
     * to the amount values of a deposit rule
     * @param event: event
     * @param chargeIndex: charge amount index
     */
    onChargeAmountChange(event: any, chargeIndex: number) {
      if (event === '') {
        this.amountErrorFlags[chargeIndex] = true;
        this.errorObj.emptyAmountErrorMessage = {
          show: true,
          message: this.translate.translateService.instant(this.translationMap.ENTER_CHARGE_AMOUNT)
        };
      } else {
        this.amountErrorFlags[chargeIndex] = false;
        this.validateAmounts();
      }
    }

    /**
     * This function is called when any changes are made
     * to the currency value of a deposit rule/configuration
     * @param event: event
     * @param ruleIndex: rule/configuration index
     * @param innerIndex: charge amount index
     */
    onCurrencyChange(event: any, ruleIndex: number, innerIndex: number) {
      this.depositConfigurationRulesData.rules[ruleIndex].
        chargeAmounts[innerIndex].currency = this.depositConfigurationDetailsService
        .getCurrencyById(this.defaultCurrencies, event.selectedObject.id);
      this.selectedCurrencies = this.depositConfigurationDetailsService
        .getSelectedCurrencyIds(this.defaultCurrencies, this.depositConfigurationRulesData.rules);
      this.perAmountCurrencies = this.depositConfigurationDetailsService
        .getChargeAmountCurrencyLists(this.defaultCurrencies, this.selectedCurrencies);
      this.defaultSelection = this.depositConfigurationDetailsService.getDefaultSelection();
      this.validateCurrencies();
    }

    /**
     * To add a new deposit rule to the deposit configuration
     */
    addDepositRule() {
      // Not allowing user to add a new deposit rule
      // If previous deposit rules have errors
      if (this.validateDepositRules() || this.validateAmounts() || this.validateCurrencies() || this.validateCurrencySelection()) {
        return;
      }
      const nextChargeType = this.depositConfigurationDetailsService.getNextAvailableChargeType(this.selectedChargeTypesMap);
      const depositRule: IPaymentDepositConfigurationRuleDetailParams = {
        chargeType: nextChargeType,
        chargeAmounts: [{amount: 0, currency: ''}],
        chargePercentage: 0,
        percentOnEnhancement: 0,
      };

      this.depositConfigurationRulesData.rules.push(depositRule);
      this.selectedChargeTypesMap = this.depositConfigurationDetailsService
        .getChargeTypeMapping(this.depositConfigurationRulesData.rules);
    }

    /**
     * To remove a deposit rule from the deposit configuration
     * @param index: rule/configuration index
     */
    removeDepositRule(index: number) {
      const chargeType = this.depositConfigurationRulesData.rules[index].chargeType;
      this.depositConfigurationRulesData.rules.splice(index, 1);
      if (chargeType === CHARGE_TYPES.FLAT) {
        this.amountErrorFlags = new Array(this.defaultCurrencies.length);
        this.amountErrorFlags.fill(false);
        this.errorObj.emptyAmountErrorMessage.show = false;
        this.errorObj.selectCurrencyErrorMessage.show = false;
        this.selectedCurrencies = new Array<number>();
        this.resetCurrencySelections();
      } else if (chargeType === CHARGE_TYPES.PERCENTAGE) {
        this.errorObj.emptyPercentageErrorMessage.show = false;
      }
      this.percentOnEnhancementErrorFlags.splice(index, 1);
      this.percentOnEnhancementErrorFlags.push(false);
      if (this.percentOnEnhancementErrorFlags.findIndex(item => item === true) < 0) {
        this.errorObj.emptyPercentOnEnhancementErrorMessage.show = false;
      }
      this.selectedChargeTypesMap = this.depositConfigurationDetailsService
        .getChargeTypeMapping(this.depositConfigurationRulesData.rules);
      this.validateCurrencySelection();
    }

    /**
     * To add a new charge amount input value to the configuration
     * @param ruleIndex: index of the rule/configuration
     */
    addChargeAmountInput(ruleIndex: number) {
      // Not allowing user to add a new charge amount
      // if any previous amount is empty
      if (this.validateAmounts() || this.validateCurrencies()
        || (this.depositConfigurationRulesData.rules[ruleIndex].chargeAmounts.length === this.maxCurrencies)) {
        return;
      }

      const chargeAmount = {amount: 0, currency: ''};
      this.depositConfigurationRulesData.rules[ruleIndex].chargeAmounts.push(chargeAmount);
      this.selectedCurrencies = this.depositConfigurationDetailsService
        .getSelectedCurrencyIds(this.defaultCurrencies, this.depositConfigurationRulesData.rules);
      this.perAmountCurrencies = this.depositConfigurationDetailsService
        .getChargeAmountCurrencyLists(this.defaultCurrencies, this.selectedCurrencies);
      this.defaultSelection = this.depositConfigurationDetailsService.getDefaultSelection();

      if (this.depositConfigurationRulesData.rules[ruleIndex].chargeAmounts.length === this.maxCurrencies) {
        this.errorObj.selectAllCurrenciesErrorMessage.show = false;
      }
    }

    /**
     * To remove a charge amount input from the deposit configuration
     * @param ruleIndex: index of the rule/configuration
     * @param innerIndex: index of the input to be removed
     */
    removeChargeAmountInput(ruleIndex: number, innerIndex: number) {
      this.depositConfigurationRulesData.rules[ruleIndex].chargeAmounts.splice(innerIndex, 1);
      this.amountErrorFlags.splice(innerIndex,1);
      this.amountErrorFlags.push(false);
      this.selectedCurrencies = this.depositConfigurationDetailsService
        .getSelectedCurrencyIds(this.defaultCurrencies, this.depositConfigurationRulesData.rules);
      this.perAmountCurrencies = this.depositConfigurationDetailsService
        .getChargeAmountCurrencyLists(this.defaultCurrencies, this.selectedCurrencies);
      this.defaultSelection = this.depositConfigurationDetailsService.getDefaultSelection();
      this.validateAmounts();
      this.validateCurrencies();
    }

    validateStep(evt: IDepositConfigurationStepContinueEvent) {
      this.stepperDataService.setDepositConfigurationRulesData(this.depositConfigurationRulesData, this.contextService.policyFlow);

      if (!(this.validateDepositRules() || this.validateAmounts() || this.validateCurrencies() || this.validateCurrencySelection())) {
          this.validate.emit({
              stepNumber: DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_DETAILS,
              eventType: evt.eventType
          });
      }
    }

    validateDepositRules() {
      let anyError = false;
      if (this.errorObj.emptyPercentageErrorMessage.show === true || this.errorObj.emptyAmountErrorMessage.show === true
        || this.errorObj.emptyPercentOnEnhancementErrorMessage.show === true) {
        anyError = true;
      }
      return anyError;
    }

    validateAmounts() {
      const anyError = (element: boolean) => element === true;
      if (this.amountErrorFlags.findIndex(anyError) >= 0) {
        this.errorObj.emptyAmountErrorMessage.show = true;
        return true;
      }
      this.errorObj.emptyAmountErrorMessage.show = false;
      return false;
    }

    validateCurrencies() {
      const anyError = (element: number) => element === -1;
      if (this.selectedCurrencies.findIndex(anyError) >= 0) {
        this.errorObj.selectCurrencyErrorMessage  = {
          show: true,
          message: this.translate.translateService.instant(this.translationMap.SELECT_CURRENCY)
        };
        return true;
      } else {
        this.errorObj.selectCurrencyErrorMessage.show = false;
        return false;
      }
    }

    validateCurrencySelection() {
      const data = this.depositConfigurationRulesData.rules.find(item => item.chargeType === 'FLAT');
      if (data) {
        this.currenciesSelected = data.chargeAmounts.length;
      } else {
        this.errorObj.selectAllCurrenciesErrorMessage.show = false;
        return false;
      }

      if (this.currenciesSelected < this.maxCurrencies) {
        this.errorObj.selectAllCurrenciesErrorMessage  = {
          show: true,
          message: this.translate.translateService.instant(this.translationMap.SELECT_ALL_CURRENCIES)
        };
        return true;
      } else {
        this.errorObj.selectAllCurrenciesErrorMessage.show = false;
        return false;
      }
    }

    resetCurrencySelections() {
      this.perAmountCurrencies = new Array(this.defaultCurrencies.length);
      this.perAmountCurrencies.fill(this.defaultCurrencies);
      this.defaultSelection = new Array(this.defaultCurrencies.length);
      this.defaultSelection.fill(-1);
    }
}
