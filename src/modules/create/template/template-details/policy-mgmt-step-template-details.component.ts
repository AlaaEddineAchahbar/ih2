import { Component, Input, OnInit, OnDestroy, EventEmitter, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SubscriptionLike } from 'rxjs';
import {
  IStepContinueEvent, TEMPLATE_STEPS, ITemplateDetailsRulesData, IPolicyTemplateErrorModel, IDepositRuleDetailsModel
} from '../policy-mgmt-create-template.model';
import { PolicyMgmtTemplateStepperDataService } from '../policy-mgmt-template-stepper-data.service';
import { PolicyMgmtStepTemplateDetailsService } from './policy-mgmt-step-template-details.service';
import { ContextService } from '../../../core/context.service';
import {
  POLICY_TYPE, DEFAULT_VALUES, PAYMENT_PROCESSING_STATUS, API_RESPONSE_CODE,
  PAYMENT_AUX_CONFIGS, ACCEPTED_TENDER_OBJECT, DEPOSITE_RULE_PERCENTAGE, POLICY_LEVEL
} from '../../../core/constants';
import { CANCELLATION_OPTIONS } from '../../../core/rules-config.constant';
import { TranslationMap } from '../../../core/translation.constant';
import { ErrorMessage, IHotelInfo, IErrorMessage, IHttpErrorResponse, IChainInfo } from '../../../core/common.model';
import { SharedDataService } from '../../../core/shared.data.service';
import { PolicyMgmtDepositRuleDetailsModalComponent } from './deposit-rule-details-modal/deposit-rule-details-modal';
import { PolicyMgmtCreateTemplateService } from '../policy-mgmt-create-template.service';
import { PolicyMgmtErrorService } from '../../../core/error.service';
import { TcTranslateService } from 'tc-angular-services';
import { assetURL } from '../../../constants/constants';


@Component({
  templateUrl: './policy-mgmt-step-template-details.component.html',
  selector: 'policy-mgmt-step-template-details',
  styleUrls: ['./policy-mgmt-step-template-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class PolicyMgmtStepTemplateDetailsComponent implements OnInit, OnDestroy {

  @ViewChild(PolicyMgmtDepositRuleDetailsModalComponent, { static: false })
  depositRuleDetailsModal: PolicyMgmtDepositRuleDetailsModalComponent;
  /**
   * Input parameters from parent component
   */
  @Input() continueFromStepper: Subject<any>;
  /**
   * Output from component to parent
   */
  @Output() validate: EventEmitter<IStepContinueEvent> = new EventEmitter();

  continueSubscriberRef: SubscriptionLike;

  rulesData: ITemplateDetailsRulesData;
  translationMap: any;
  lateArrivalPopoverInfo: string;

  /**
   * Holds Default indixes of dropdowns
   */
  acceptedTenderDefaultIndex: number;
  acceptedTenderObject;
  lateArrivalDefaultIndex: number;
  depositRuleDefaultIndex: number;
  depositRuleSelectedPercentage;

  /**
   * Holds list of inline error messages if any
   */
  errorObj: IPolicyTemplateErrorModel;
  hotelInfo: IHotelInfo;
  chainInfo: IChainInfo;
  /**
   * Error Toaster related fields
   */
  showToastFlag: boolean;
  apiDepositRuleDetailsErrorMessage: IErrorMessage;

  /**
   * Holds selected cancellation notice option
   */
  cancellationNoticeSelected: string;
  hoursDefaultIndex: number;
  setEnabledInstallment = true;
  paymentAuxConfigsArr = [];
  uniqueDepositsList: Array<any>;
  isInstallmentEnabled = false;
  sameDepositsIdArr: Array<any>;
  chargePercentageCheck: Array<any>;
  publicPath: string;

  constructor(
    private contextService: ContextService,
    private stepperDataService: PolicyMgmtTemplateStepperDataService,
    private templateDetailsService: PolicyMgmtStepTemplateDetailsService,
    private sharedDataService: SharedDataService,
    private translate: TcTranslateService,
    private policyMgmtCreateTemplateService: PolicyMgmtCreateTemplateService,
    private errorService: PolicyMgmtErrorService
  ) {
    this.translationMap = TranslationMap;
    this.lateArrivalPopoverInfo = this.translationMap.LATE_ARRIVAL_INFO;
    this.errorObj = {
      templateNameErrorMessage: new ErrorMessage(),
      lateArrivalErrorMessage: new ErrorMessage(),
      cancellationNoticeErrorMessage: new ErrorMessage()
    };

    /* Hotel info */
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      this.hotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
    } else {
      this.chainInfo = this.sharedDataService.getChainInfo() ? this.sharedDataService.getChainInfo() : null;
    }

    // set default values to error toaster
    this.showToastFlag = false;
    this.apiDepositRuleDetailsErrorMessage = {
      show: true,
      message: {}
    };
    this.publicPath = assetURL;
  }

  ngOnInit() {
    this.sameDepositsIdArr = [];
    this.uniqueDepositsList = [];
    this.continueSubscriberRef = this.continueFromStepper.subscribe(() => {
      this.validateStep();
    });
    this.rulesData = this.stepperDataService.getTemplateDetailData();
    const uniqueDepositKey = 'id';
    if (this.rulesData.data.depositRule) {
      this.uniqueDepositsList = [...new Map(this.rulesData.data.depositRule.map(item => [item[uniqueDepositKey], item])).values()];
    }
    this.setDefaultIndex();
    if (this.checkVisibility('depositRule')) {
      this.setDefaultSelection();
    }

  }

  /**
   * Set default selections for get API data
   */
  setDefaultSelection() {
    this.acceptedTenderObject = this.rulesData.data.acceptedTender[this.acceptedTenderDefaultIndex];
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      this.paymentAuxConfigsArr = this.sharedDataService.getHotelInfo().paymentInfo.paymentAuxConfigs;
    }
    if (this.depositRuleDefaultIndex > -1) {
      const depositId = this.rulesData.data.depositRule[this.depositRuleDefaultIndex].id;
      this.checkSelectedDepositsPercentage(depositId);
    }
    this.setEnableInstallment();
  }



  /**
   * Sets default indexes for dropdowns
   */
  setDefaultIndex() {
    if (this.contextService.policyType === POLICY_TYPE.GUARANTEE) {
      this.acceptedTenderDefaultIndex = this.rulesData.data.acceptedTender.findIndex(item => {
        return item.id === this.rulesData.fields.acceptedTender;
      });
      this.lateArrivalDefaultIndex = this.rulesData.data.lateArrivalTime.findIndex(item => {
        return item.id === this.rulesData.fields.lateArrivalTime;
      });
    }
    if (this.contextService.policyType === POLICY_TYPE.DEPOSIT) {
      this.acceptedTenderDefaultIndex = this.rulesData.data.acceptedTender.findIndex(item => {
        return item.id === this.rulesData.fields.acceptedTender;
      });
      if (this.rulesData.data.depositRule) {
        this.depositRuleDefaultIndex = this.rulesData.data.depositRule.findIndex(item =>
          item.id === this.rulesData.fields.depositRule);
      }
    }
    if (this.rulesData.fields.sameDayNoticeTime || this.rulesData.fields.sameDayNoticeTime === 0) {
      this.hoursDefaultIndex = this.rulesData.data.sameDayNoticeList.findIndex(item => {
        return item.id === this.rulesData.fields.sameDayNoticeTime;
      });
    } else {
      this.hoursDefaultIndex = -1;
    }
  }

  ngOnDestroy() {
    this.continueSubscriberRef.unsubscribe();
  }

  validateStep() {
    this.errorObj = this.templateDetailsService.validateStepData(this.rulesData.fields);
    this.stepperDataService.setTemplateDetailData(this.rulesData.fields);

    let isValidData = true;
    for (const error in this.errorObj) {
      if (this.errorObj[error].show) {
        isValidData = false;
        break;
      }
    }
    if (isValidData) {
      this.validate.emit({
        stepNumber: TEMPLATE_STEPS.TEMPLATE_DETAILS,
        eventType: null
      });
    }
  }

  /**
   * This function is called onChange Event when any changes are made to Policy Template Input
   * @param event: event
   */
  policyTemplateNameChange(event: any) {
    if (event !== '') {
      this.errorObj.templateNameErrorMessage.show = false;
    }
  }

  checkVisibility(key: string) {
    let visibility = this.rulesData.fields.hasOwnProperty(key);
    switch (key) {
      case 'lateArrivalTime':
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          visibility = this.hotelInfo && this.hotelInfo.hotelSettings.isGdsEnabled &&
            visibility && this.rulesData.fields.acceptedTender === DEFAULT_VALUES.acceptedTenderDropdown.acceptAllIdForLateArrival;
        } else {
          visibility = this.rulesData.fields.acceptedTender === DEFAULT_VALUES.acceptedTenderDropdown.acceptAllIdForLateArrival;
        }
        break;
      case 'depositRule':
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          visibility = visibility && this.hotelInfo &&
            (this.hotelInfo.paymentInfo.processingMode !== PAYMENT_PROCESSING_STATUS.DISABLED
              || this.hotelInfo.hotelSettings.isGdsEnabled);
        }
        break;
    }
    return visibility;
  }

  /**
   * Checking paymentInfo key contenting auxConfig obj from API to enabledInstallment checkbox  enabled/disabled
   */
  checkPaymentAuxConfigsObj() {
    if (this.paymentAuxConfigsArr === undefined) { return true; }
    return this.paymentAuxConfigsArr.some((data) => {
      return (data.auxConfigValue === PAYMENT_AUX_CONFIGS.auxConfigValue &&
        data.auxConfigTypeId === PAYMENT_AUX_CONFIGS.auxConfigTypeId);
    });
  }

  /**
   * Conditionally enabled/disabled enabledInstallment checkbox with selection of dropdown
   */

  setEnableInstallment() {
    if ((this.acceptedTenderObject.id === ACCEPTED_TENDER_OBJECT.id ||
      this.acceptedTenderObject.name === ACCEPTED_TENDER_OBJECT.name) &&
      typeof this.chargePercentageCheck !== 'undefined' && this.checkPaymentAuxConfigsObj()) {
      this.setEnabledInstallment = false;
    } else {
      this.setEnabledInstallment = true;
    }
  }

  setEnabledInstallmentChange() {
    this.rulesData.fields['isInstallmentEnabled'] = !this.rulesData.fields['isInstallmentEnabled'];
  }

  /**
   * On accepted tender dropdown selection change, set default index and update rulesData
   * @param event: event
   */

  onAcceptedTenderChange(event: any) {
    this.rulesData.fields.isInstallmentEnabled = false;
    this.acceptedTenderObject = event.selectedObject;
    this.acceptedTenderDefaultIndex = event.selectedIndex;
    this.rulesData.fields.acceptedTender = event.selectedObject.id;
    this.setLateArrivalToDefault();
    this.setEnableInstallment();
  }

  /**
   * on deposit rule dropdown selection, set default index and update rulesData
   * @param event: event
   */
  onDepositRuleSelectionChange(event: any) {
    this.rulesData.fields.isInstallmentEnabled = false;
    this.depositRuleDefaultIndex = event.selectedIndex;
    this.rulesData.fields.depositRule = event.selectedObject.id ? event.selectedObject.id : null;
    this.checkSelectedDepositsPercentage(this.rulesData.fields.depositRule);
    this.setEnableInstallment();
  }

  /**
   * If accepted tender is other than ACCEPT_ALL, then set lateArrival to default
   */
  setLateArrivalToDefault() {
    if (this.contextService.policyType === POLICY_TYPE.GUARANTEE
      && this.rulesData.fields.acceptedTender !== DEFAULT_VALUES.acceptedTenderDropdown.acceptAllIdForLateArrival) {
      this.rulesData.fields.lateArrivalTime = null;
      this.lateArrivalDefaultIndex = -1;
      this.errorObj.lateArrivalErrorMessage.show = false;
    }
  }

  /**
   * on lateArrival dropdown selection change, set default index and update rulesData.
   * @param event: event
   */
  onLateArrivalChange(event: any) {
    this.lateArrivalDefaultIndex = event.selectedIndex;
    this.rulesData.fields.lateArrivalTime = event.selectedObject.id;
    this.errorObj.lateArrivalErrorMessage.show = false;
  }

  /**
   * set cancellation notice option on radio button selection
   * @param cancellationOption: string
   */
  setCancellationNotice(cancellationOption: string) {
    this.errorObj.cancellationNoticeErrorMessage.show = false;
    this.rulesData.fields.advanceNotice.hours = 0;
    this.rulesData.fields.advanceNotice.days = 0;
    this.rulesData.fields.sameDayNoticeTime = null;
    this.hoursDefaultIndex = -1;
    this.rulesData.fields.cancellationNotice = cancellationOption;

    // disable free cancellation field when non-refundable is selected
    if (cancellationOption === CANCELLATION_OPTIONS.NON_REFUNDABLE) {
      this.rulesData.fields.isFreeCancellation = false;
    }
  }

  /**
   * set OTA cancellation charge option on radio button selection
   * @param otaCancellationCharge: string
   */
  setOtaCancellationNotice(otaCancellationCharge: string) {
    this.rulesData.fields.otaNightRoomNTaxAmt = null;
    this.rulesData.fields.otaFlatAmt = null;
    this.rulesData.fields.otaPercentageAmt = null;
    this.rulesData.fields.otaCancellationChargeNotification = otaCancellationCharge;
  }

  onSameDayHoursChange(event: any) {
    this.hoursDefaultIndex = event.selectedIndex;
    this.rulesData.fields.sameDayNoticeTime = event.selectedObject.id;
    this.errorObj.cancellationNoticeErrorMessage.show = false;
  }

  /**
   * Function to Open Deposit Rule Details Modal
   */
  showDepositRuleDetails() {
    this.policyMgmtCreateTemplateService.getDepositRuleDetails(Number(this.rulesData.fields.depositRule))
      .subscribe((response: IDepositRuleDetailsModel) => {
        this.depositRuleDetailsModal.open(response);
      }, (error: IHttpErrorResponse) => {
        if (error.status === API_RESPONSE_CODE.NOT_FOUND_404) {
          this.apiDepositRuleDetailsErrorMessage = this.errorService.setErrorMessage(error.error.errors);
          this.showToastFlag = true;
        }
      });
  }

  /**
   * Toggles free cancellation field value
   */
  onFreeCancellationChange() {
    this.rulesData.fields.isFreeCancellation = !this.rulesData.fields.isFreeCancellation;
  }

  /**
   * Check if Charge percentage is 100 to enable installments
   */
  checkSelectedDepositsPercentage(id: any) {
    this.chargePercentageCheck = [];
    this.sameDepositsIdArr = this.rulesData.data.depositRule.filter(item => item.id === id);
    this.chargePercentageCheck = this.sameDepositsIdArr.find(item => item.chargePercentage === DEPOSITE_RULE_PERCENTAGE.percentage);
  }


  /**
   * Returns the text displayed inside of the tooltip for enable installment
   */
  getEnableInstallmentTooltipText(): string {
    return this.contextService.policyLevel === POLICY_LEVEL.PROPERTY ?
      this.translationMap.ENABLED_INSTALLMENTS_ISACTIVE :
      this.translationMap.ENABLED_INSTALLMENTS;
  }
}
