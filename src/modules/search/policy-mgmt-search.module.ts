/* Angular-Module Imports */
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* Third Party Module Imports */
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

/* TC-module Imports */
import { DropdownModule, MultilevelDropdownModule, DatePickerModule } from 'tc-angular-components';

/* Application Level Imports */
import { PolicyMgmtSearchComponent } from './policy-mgmt-search.component';
import { PolicyMgmtSearchRouting } from './policy-mgmt-search.routing';
import { PolicyMgmtSearchService } from './policy-mgmt-search.service';
import { ListComponent } from './list/list.component';
import { FilterComponent } from './filter/filter.component';
import { PolicyMgmtListParsingService } from './list/policy-mgmt-list-parsing.service';
import { PolicyMgmtSearchPolicyService } from './policy-mgmt-search-policies.service';
import { PolicyMgmtListDetailsModalComponent } from './list/list-details-modal/policy-mgmt-list-details-modal.component';
import { PolicyMgmtCreatePolicyService } from '../create/policy/policy-mgmt-create-policy.service';
import { SharedModule } from '../common/shared.module';
import { PolicyMgmtCreateTemplateService } from '../create/template/policy-mgmt-create-template.service';
import { PolicyMgmtSearchExportService } from './policy-mgmt-search-export.service';

@NgModule({
    declarations: [
        PolicyMgmtSearchComponent,
        ListComponent,
        FilterComponent,
        PolicyMgmtListDetailsModalComponent
    ],
    imports: [
        PolicyMgmtSearchRouting,
        NgbModule,
        NgbModalModule,
        FormsModule,
        TranslateModule,
        CommonModule,
        DropdownModule,
        MultilevelDropdownModule,
        DatePickerModule,
        SharedModule
    ],
    providers: [
        PolicyMgmtSearchService,
        PolicyMgmtListParsingService,
        PolicyMgmtSearchPolicyService,
        PolicyMgmtCreatePolicyService,
        PolicyMgmtCreateTemplateService,
        PolicyMgmtSearchExportService
    ]
})
export class PolicyMgmtSearchModule {
}
