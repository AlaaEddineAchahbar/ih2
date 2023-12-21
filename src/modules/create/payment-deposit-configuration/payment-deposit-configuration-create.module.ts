/* Angular-Module Imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/* Third Party Module Imports */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

/* TC-module Imports */
import { DropdownModule, MultilevelDropdownModule, StepperModule, ToastModule } from 'tc-angular-components';
import { SharedModule } from '../../common/shared.module';
import { PaymentDepositConfigurationRulesPreviewComponent } from './deposit-rules-preview/deposit-rules-preview.component';
import { PaymentDepositConfigurationNameComponent } from './deposit-configuration-name/deposit-configuration-name.component';
import { PaymentDepositConfigurationDetailsComponent } from './deposit-configuration-details/deposit-configuration-details.component';
import { PaymentDepositConfigurationCreateComponent } from './payment-deposit-configuration-create.component';
import { PaymentDepositConfigurationCreateService } from './payment-deposit-configuration-create.service';
import { PaymentDepositConfigurationStepperDataService } from './payment-deposit-configuration-stepper-data.service';
import { PaymentDepositConfigurationNameService } from './deposit-configuration-name/deposit-configuration-name.service';
import { PaymentDepositConfigurationDetailsService } from './deposit-configuration-details/deposit-configuration-details.service';
import { PropertyPaymentDepositConfigurationDetailsComponent }
  from './property-deposit-configuration-details/property-deposit-configuration-details.component';

@NgModule({
  declarations: [
    PaymentDepositConfigurationCreateComponent,
    PaymentDepositConfigurationRulesPreviewComponent,
    PaymentDepositConfigurationNameComponent,
    PaymentDepositConfigurationDetailsComponent,
    PropertyPaymentDepositConfigurationDetailsComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
    StepperModule,
    FormsModule,
    DropdownModule,
    TranslateModule,
    ToastModule,
    NgbModule,
    NgbDropdownModule,
    MultilevelDropdownModule
  ],
  providers: [
    PaymentDepositConfigurationCreateService,
    PaymentDepositConfigurationStepperDataService,
    PaymentDepositConfigurationNameService,
    PaymentDepositConfigurationDetailsService
  ],
  exports: [
    PaymentDepositConfigurationCreateComponent
  ]
})
export class PaymentDepositConfigurationCreateModule { }
