import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/* Third Party Module Imports */
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TableModule } from 'primeng/table';

import { PolicyMgmtConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { PolicyMgmtErrorMessageComponent } from './policy-mgmt-error-msg.component';
import { InputRestrictDirective } from './input.restrict.directive';
import { PolicyMgmtApiErrorMessageComponent } from './policy-mgmt-api-error-toaster.component';
import { ToastModule } from 'tc-angular-components';
import { VersionHistoryService } from './version-history/version-history.service';
import { VersionHistoryComponent } from './version-history/version-history.component';
import { CopyCloneErrorDetailsComponent } from '../search/list/copy-clone-error-details/copy-clone-error-details.component';
import { CopyCloneErrorDetailsService } from '../search/list/copy-clone-error-details/copy-clone-error-details.service';
import { LinkedPolicyTemplatesErrorComponent } from '../search/list/linked-policy-templates-error/linked-policy-templates-error.component';
import { LinkedPolicyTemplatesErrorService } from '../search/list/linked-policy-templates-error/linked-policy-templates-error.service';
import { PolicyOverlapComponent } from '../create/policy/policy-overlap/policy-overlap.component';
import { PolicyOverlapService } from '../create/policy/policy-overlap/policy-overlap.service';
import { PolicyMgmtSearchService } from '../search/policy-mgmt-search.service';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
    declarations: [
        PolicyMgmtConfirmationModalComponent,
        PolicyMgmtErrorMessageComponent,
        InputRestrictDirective,
        PolicyMgmtApiErrorMessageComponent,
        VersionHistoryComponent,
        CopyCloneErrorDetailsComponent,
        LinkedPolicyTemplatesErrorComponent,
        PolicyOverlapComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        ToastModule,
        TranslateModule,
        DropdownModule,
        TableModule,
        KeyFilterModule,
        InputTextModule
    ],
    exports: [
        PolicyMgmtConfirmationModalComponent,
        PolicyMgmtErrorMessageComponent,
        InputRestrictDirective,
        PolicyMgmtApiErrorMessageComponent,
        VersionHistoryComponent,
        CopyCloneErrorDetailsComponent,
        LinkedPolicyTemplatesErrorComponent,
        PolicyOverlapComponent
    ],
    providers: [
        VersionHistoryService,
        CopyCloneErrorDetailsService,
        LinkedPolicyTemplatesErrorService,
        PolicyOverlapService,
        PolicyMgmtSearchService
    ]
})
export class SharedModule {

}
