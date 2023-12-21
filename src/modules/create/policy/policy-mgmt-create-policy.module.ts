import { NgModule } from '@angular/core';
import { PolicyMgmtCreatePolicyComponent } from './policy-mgmt-create-policy.component';
import { RouterModule } from '@angular/router';
import { PolicyMgmtStepPolicyLevelComponent } from './policy-level/policy-mgmt-step-policy-level.component';
import { PolicyMgmtStepPolicyDetailsComponent } from './policy-details/policy-mgmt-step-policy-details.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../common/shared.module';
import { StepperModule, DropdownModule, MultilevelDropdownModule, DatePickerModule } from 'tc-angular-components';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/* Third Party Module Imports */
import { TranslateModule } from '@ngx-translate/core';

import { PolicyMgmtCreateTemplateModule } from '../template/policy-mgmt-create-template.module';
import { PolicyMgmtCreateTemplateModalComponent } from './policy-details/create-template-modal/policy-mgmt-create-template-modal.component';
import { PolicyMgmtPolicyStepperDataService } from './policy-mgmt-policy-stepper-data.service';
import { NgbTooltipModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PolicyMgmtStepPolicyLevelService } from './policy-level/policy-mgmt-step-policy-level.service';
import { PolicyMgmtCreatePolicyService } from './policy-mgmt-create-policy.service';
import { PolicyMgmtDateSelectorComponent } from './policy-details/date-selector/policy-mgmt-date-selector.component';
import { PolicyMgmtStepPolicyDetailsService } from './policy-details/policy-mgmt-step-policy-details.service';
import {
    PolicyMgmtStepPolicyLevelPreviewComponent
} from './policy-level/policy-level-preview/policy-mgmt-step-policy-level-preview.component';
import {
    PolicyMgmtStepPolicyDetailsPreviewComponent
} from './policy-details/policy-details-preview/policy-mgmt-step-policy-details-preview.component';
import { PolicyMgmtDateSelectorService } from './policy-details/date-selector/policy-mgmt-date-selector.service';

@NgModule({
    declarations: [
        PolicyMgmtCreatePolicyComponent,
        PolicyMgmtStepPolicyLevelComponent,
        PolicyMgmtStepPolicyDetailsComponent,
        PolicyMgmtCreateTemplateModalComponent,
        PolicyMgmtDateSelectorComponent,
        PolicyMgmtStepPolicyLevelPreviewComponent,
        PolicyMgmtStepPolicyDetailsPreviewComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        SharedModule,
        StepperModule,
        FormsModule,
        PolicyMgmtCreateTemplateModule,
        TranslateModule,
        NgbTooltipModule,
        NgbDropdownModule,
        DropdownModule,
        MultilevelDropdownModule,
        DatePickerModule,
        NgbModule
    ],
    providers: [
        PolicyMgmtPolicyStepperDataService,
        PolicyMgmtStepPolicyLevelService,
        PolicyMgmtCreatePolicyService,
        PolicyMgmtStepPolicyDetailsService,
        PolicyMgmtDateSelectorService
    ],
})
export class PolicyMgmtCreatePolicyModule {
}
