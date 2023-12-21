import { Component, Input, OnInit, OnDestroy, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';
import {
    IDepositConfigurationStepContinueEvent,
    DEPOSIT_CONFIGURATION_STEPS,
    IPaymentDepositConfigurationDetailData,
    IPaymentDepositConfigurationNameErrorModel
} from '../payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { PaymentDepositConfigurationNameService } from './deposit-configuration-name.service';
import { TranslationMap } from '../../../core/translation.constant';
import { ErrorMessage } from '../../../core/common.model';

@Component({
    selector: 'deposit-configuration-name-edit',
    templateUrl: './deposit-configuration-name.component.html',
    styleUrls: ['./deposit-configuration-name.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PaymentDepositConfigurationNameComponent implements OnInit, OnDestroy {

    /**
     * Input parameters from parent component
     */
    @Input() continueFromStepper: Subject<any>;

    /**
     * Output from component to parent
     */
    @Output() validate: EventEmitter<IDepositConfigurationStepContinueEvent> = new EventEmitter();

    /**
     * Continuation observable for the deposit configuration name editing
     */
    continueSubscriberRef: SubscriptionLike;

    depositConfigurationDetailData: IPaymentDepositConfigurationDetailData;
    translationMap: any;

    /**
     * Holds inline error message if present
     */
    errorObj: IPaymentDepositConfigurationNameErrorModel;

    constructor(
        private stepperDataService: PaymentDepositConfigurationStepperDataService,
        private depositConfigurationNameService: PaymentDepositConfigurationNameService
    ) {
      this.translationMap = TranslationMap;
      this.errorObj = {
        depositConfigurationNameErrorMessage: new ErrorMessage()
      };
    }

    ngOnInit() {
        this.continueSubscriberRef = this.continueFromStepper.subscribe(() => {
            this.validateStep();
        });
        this.depositConfigurationDetailData = this.stepperDataService.getDepositConfigurationDetailData();
    }

    ngOnDestroy() {
        this.continueSubscriberRef.unsubscribe();
    }

    validateStep() {
      this.errorObj = this.depositConfigurationNameService
        .validateDepositConfigurationDetailStepData(this.depositConfigurationDetailData);
      this.stepperDataService.setDepositConfigurationDetailName(this.depositConfigurationDetailData);

      if (!this.errorObj.depositConfigurationNameErrorMessage.show) {
          this.validate.emit({
              stepNumber: DEPOSIT_CONFIGURATION_STEPS.DEPOSIT_CONFIGURATION_NAME,
              eventType: null
          });
      }
    }

    /**
     * This function is called onChange Event when any changes are made to Deposit Configuration name
     * @param event: event
     */
    paymentDepositConfigurationNameChange(event: any) {
      if (event !== '') {
        this.errorObj.depositConfigurationNameErrorMessage.show = false;
      }
    }
}
