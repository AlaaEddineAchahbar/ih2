/* Angular-Module Imports */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* Third Party Module Imports */
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/* TC-module Imports */
import { DropdownModule, ToastModule } from 'tc-angular-components';
import { PolicyMgmtCreateTemplateComponent } from './policy-mgmt-create-template.component';
import { RouterModule } from '@angular/router';
import { PolicyMgmtStepTemplateDetailsComponent } from './template-details/policy-mgmt-step-template-details.component';
import { PolicyMgmtStepDistributionMessagesComponent } from './distribution-messages/policy-mgmt-step-distribution-messages.component';
import {
    PolicyMgmtTemplateDetailsPreviewComponent
} from './template-details/template-details-preview/policy-mgmt-template-details-preview.component';
import {
    PolicyMgmtDistributionMessagesPreviewComponent
} from './distribution-messages/distribution-messages-preview/policy-mgmt-distribution-messages-preview.component';
import { StepperModule } from 'tc-angular-components';
import { SharedModule } from '../../common/shared.module';
import { PolicyMgmtCreateTemplateService } from './policy-mgmt-create-template.service';
import { PolicyMgmtTemplateStepperDataService } from './policy-mgmt-template-stepper-data.service';
import { PolicyMgmtStepTemplateDetailsService } from './template-details/policy-mgmt-step-template-details.service';
import { PolicyMgmtDepositRuleDetailsModalComponent } from './template-details/deposit-rule-details-modal/deposit-rule-details-modal';

@NgModule({
    declarations: [
        PolicyMgmtCreateTemplateComponent,
        PolicyMgmtStepTemplateDetailsComponent,
        PolicyMgmtStepDistributionMessagesComponent,
        PolicyMgmtTemplateDetailsPreviewComponent,
        PolicyMgmtDistributionMessagesPreviewComponent,
        PolicyMgmtDepositRuleDetailsModalComponent
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
        NgbModule
    ],
    providers: [
        PolicyMgmtCreateTemplateService,
        PolicyMgmtTemplateStepperDataService,
        PolicyMgmtStepTemplateDetailsService
    ],
    exports: [
        PolicyMgmtCreateTemplateComponent
    ]
})
export class PolicyMgmtCreateTemplateModule {
}
