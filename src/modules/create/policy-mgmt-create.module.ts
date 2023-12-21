import { NgModule } from '@angular/core';

/* Third Party Module Imports */
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PolicyMgmtCreateRouting } from './policy-mgmt-create.routing';
import { PolicyMgmtCreateTemplateModule } from './template/policy-mgmt-create-template.module';
import { PolicyMgmtCreatePolicyModule } from './policy/policy-mgmt-create-policy.module';
import { PaymentDepositConfigurationCreateModule } from './payment-deposit-configuration/payment-deposit-configuration-create.module';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
    ],
    imports: [
        RouterModule,
        PolicyMgmtCreatePolicyModule,
        PolicyMgmtCreateTemplateModule,
        PaymentDepositConfigurationCreateModule,
        PolicyMgmtCreateRouting,
        TranslateModule,
        NgbModule
    ],
    providers: [
    ]
})
export class PolicyMgmtCreateModule {

}
