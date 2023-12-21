import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';
import {
  IDepositConfigurationStepContinueEvent,
  DEPOSIT_CONFIGURATION_STEPS,
  CHARGE_TYPES,
  IPropertyPaymentDepositConfigurationRulesData,
  IPropertyPaymentDepositConfigurationRulesErrorModel,
  IPropertyPaymentDepositConfigurationRuleDetailParams
} from '../payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationDetailsService } from '../deposit-configuration-details/deposit-configuration-details.service';
import { ErrorMessage, IHotelInfo } from '../../../core/common.model';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { TcTranslateService } from 'tc-angular-services';
import { SharedDataService } from '../../../core/shared.data.service';
import { TranslationMap } from '../../../core/translation.constant';
import { assetURL } from '../../../constants/constants';

@Component({
  templateUrl: './property-deposit-configuration-details.component.html',
  selector: 'property-deposit-configuration-details-edit',
  styleUrls: ['./property-deposit-configuration-details.component.scss']
})

export class PropertyPaymentDepositConfigurationDetailsComponent implements OnInit, OnDestroy {
  /**
   * Input parameters from parent component
   */
  @Input() continueFromStepper: Subject<IDepositConfigurationStepContinueEvent>;

  /**
   * Output from component to parent
   */
  @Output() validate: EventEmitter<IDepositConfigurationStepContinueEvent> = new EventEmitter();

  /**
   * Continuation observable for the deposit configuration details
   */
  continueSubscriberRef: SubscriptionLike;

  /**
   * Create/Edit payment deposit configuration step 2: deposit configuration details - rules data
   */
  depositConfigurationRulesData: IPropertyPaymentDepositConfigurationRulesData;

  /**
   * Translation Map
   */
  translationMap: any;

  /**
   * Holds inline error message if present
   */
  errorObj: IPropertyPaymentDepositConfigurationRulesErrorModel;

  /**
   * Holds the Hotel info
   */
  hotelInfo: IHotelInfo;

  /**
   * Holds the public path
   */
  publicPath: string;

  /**
   * Error message flags and selected charge type flags
   */
  chargeAmountErrorFlags: Array<boolean>;
  chargePercentErrorFlags: Array<boolean>;
  percentOnEnhancementErrorFlags: Array<boolean>;

  /**
   * Holds charge type selection information used to
   * disable radio buttons for charge type selection
   */
  selectedChargeTypesMap: boolean[][];

  /**
   * Indicates the default property currency
   */
  defaultCurrency: string;

  constructor(
    private translate: TcTranslateService,
    private stepperDataService: PaymentDepositConfigurationStepperDataService,
    private depositConfigurationDetailsService: PaymentDepositConfigurationDetailsService,
    private sharedDataService: SharedDataService
  ) {
    this.translationMap = TranslationMap;
    this.errorObj = {
      emptyChargeAmountErrorMessage: new ErrorMessage(),
      emptyChargePercentageErrorMessage: new ErrorMessage(),
      emptyPercentOnEnhancementErrorMessage: new ErrorMessage()
    };

    this.hotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
    this.publicPath = assetURL;
  }

  ngOnInit() {
    this.continueSubscriberRef = this.continueFromStepper.subscribe((evt: IDepositConfigurationStepContinueEvent) => {
      this.validateStep(evt);
    });

    this.depositConfigurationRulesData = this.stepperDataService.getPropertyDepositConfigurationRulesData();
    this.selectedChargeTypesMap = this.depositConfigurationDetailsService.getChargeTypeMapping(this.depositConfigurationRulesData.rules);
    this.defaultCurrency = this.stepperDataService.getPropertyDepositConfigurationDefaultCurrency(this.hotelInfo);

    this.chargeAmountErrorFlags = new Array(3);
    this.chargeAmountErrorFlags.fill(false);

    this.chargePercentErrorFlags = new Array(3);
    this.chargePercentErrorFlags.fill(false);

    this.percentOnEnhancementErrorFlags = new Array(3);
    this.percentOnEnhancementErrorFlags.fill(false);
  }

  ngOnDestroy() {
    this.continueSubscriberRef.unsubscribe();
  }

  /**
   * Method to call when any changes are made to the charge type
   *
   * @param index: rule/configuration index
   * @param item: charge type option
   */
  onChargeTypeChange(index: number, item: string) {
    const previousChargeType = this.depositConfigurationRulesData.rules[index].chargeType;
    this.depositConfigurationRulesData.rules[index].chargePercentage = 0;
    this.depositConfigurationRulesData.rules[index].chargeAmount = 0;
    this.depositConfigurationRulesData.rules[index].chargeType = item;

    if (previousChargeType === CHARGE_TYPES.FLAT) {
      this.errorObj.emptyChargeAmountErrorMessage.show = false;
    } else if (previousChargeType === CHARGE_TYPES.PERCENTAGE) {
      this.errorObj.emptyChargePercentageErrorMessage.show = false;
    }

    this.selectedChargeTypesMap =
      this.depositConfigurationDetailsService.getChargeTypeMapping(this.depositConfigurationRulesData.rules);
  }

  /**
   * Method to call when any changes are made to the charge amount
   * @param event: event
   * @param index: charge amount index
   */
  onChargeAmountChange(event: any, index: number) {
    if (event === '') {
      this.chargeAmountErrorFlags[index] = true;
      this.errorObj.emptyChargeAmountErrorMessage = {
        show: true,
        message: this.translate.translateService.instant(this.translationMap.ENTER_AMOUNT)
      };
    } else {
      this.chargeAmountErrorFlags[index] = false;
      if (this.chargeAmountErrorFlags.findIndex(item => item === true) < 0) {
        this.errorObj.emptyChargeAmountErrorMessage.show = false;
      }
    }
  }

  /**
   * Method to call when any changes are made to the charge percentage
   * @param event: event
   * @param index: charge percentage index
   */
  onChargePercentageChange(event: any, index: number) {
    if (event === '') {
      this.chargePercentErrorFlags[index] = true;
      this.errorObj.emptyChargePercentageErrorMessage = {
        show: true,
        message: this.translate.translateService.instant(this.translationMap.ENTER_PERCENTAGE)
      };
    } else {
      this.chargePercentErrorFlags[index] = false;
      if (this.chargePercentErrorFlags.findIndex(item => item === true) < 0) {
        this.errorObj.emptyChargePercentageErrorMessage.show = false;
      }
    }
  }

  /**
   * Method to call when when any changes are made to the percentage on enhancement
   * @param event: event
   * @param index: percentage on enhancement index
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
   * Method To add a new deposit rule details to the deposit configuration
   */
  addDepositRuleDetails() {
    // Not allow the user to add a new deposit rule details
    // if the previous deposit rule details contain errors
    if (this.validateDepositRulesDetails()) {
      return;
    }

    const nextChargeType = this.depositConfigurationDetailsService.getNextAvailableChargeType(this.selectedChargeTypesMap);
    const ruleDetails: IPropertyPaymentDepositConfigurationRuleDetailParams = {
      chargeType: nextChargeType,
      chargeAmount: 0,
      chargePercentage: 0,
      percentOnEnhancement: 0,
    };

    this.depositConfigurationRulesData.rules.push(ruleDetails);
    this.selectedChargeTypesMap =
      this.depositConfigurationDetailsService.getChargeTypeMapping(this.depositConfigurationRulesData.rules);
  }

  /**
   * Method To remove a deposit rule detail from the deposit configuration
   * @param index: rule detail index
   */
  removeDepositRuleDetails(index: number) {
    const chargeType = this.depositConfigurationRulesData.rules[index].chargeType;
    this.depositConfigurationRulesData.rules.splice(index, 1);

    if (chargeType === CHARGE_TYPES.FLAT) {
      this.chargeAmountErrorFlags.splice(index, 1);
      this.chargeAmountErrorFlags.push(false);
      if (this.chargeAmountErrorFlags.findIndex(item => item === true) < 0) {
        this.errorObj.emptyChargeAmountErrorMessage.show = false;
      }
    } else if (chargeType === CHARGE_TYPES.PERCENTAGE) {
      this.chargePercentErrorFlags.splice(index, 1);
      this.chargePercentErrorFlags.push(false);
      if (this.chargePercentErrorFlags.findIndex(item => item === true) < 0) {
        this.errorObj.emptyChargePercentageErrorMessage.show = false;
      }
    }

    this.percentOnEnhancementErrorFlags.splice(index, 1);
    this.percentOnEnhancementErrorFlags.push(false);
    if (this.percentOnEnhancementErrorFlags.findIndex(item => item === true) < 0) {
      this.errorObj.emptyPercentOnEnhancementErrorMessage.show = false;
    }

    this.selectedChargeTypesMap =
      this.depositConfigurationDetailsService.getChargeTypeMapping(this.depositConfigurationRulesData.rules);
  }

  /**
   * Method to validate step observable for the deposit configuration details
   * @param evt
   */
  validateStep(evt: IDepositConfigurationStepContinueEvent) {
    this.stepperDataService.setPropertyDepositConfigurationRulesData(this.depositConfigurationRulesData);
    if (!this.validateDepositRulesDetails()) {
      this.validate.emit({
        stepNumber: DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_DETAILS,
        eventType: evt.eventType
      });
    }
  }

  /**
   * Method to check for any errors in payment deposit rule details
   * @returns: true if there are any errors
   */
  validateDepositRulesDetails(): boolean {
    let anyError = false;
    if (this.errorObj.emptyChargePercentageErrorMessage.show || this.errorObj.emptyChargeAmountErrorMessage.show
      || this.errorObj.emptyPercentOnEnhancementErrorMessage.show) {
      anyError = true;
    }
    return anyError;
  }
}