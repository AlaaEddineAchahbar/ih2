/**
 * Core angular modules
 */
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Application component imports
 */
import { PolicyMgmtCreatePolicyComponent } from './policy/policy-mgmt-create-policy.component';
import { PolicyMgmtCreateTemplateComponent } from './template/policy-mgmt-create-template.component';
import { PaymentDepositConfigurationCreateComponent } from './payment-deposit-configuration/payment-deposit-configuration-create.component';

/**
 * Module child routes
 */
const routes: Routes = [
    { path: 'policy', redirectTo: 'policy/cancellation' },
    { path: 'policy/:policyType', component: PolicyMgmtCreatePolicyComponent },
    { path: 'template', redirectTo: 'template/cancellation' },
    { path: 'template/:policyType', component: PolicyMgmtCreateTemplateComponent },
    { path: 'payment-deposit-rule', component: PaymentDepositConfigurationCreateComponent },
];

/**
 * This is child module router which will be loaded lazily in root application
 */
export const PolicyMgmtCreateRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);
