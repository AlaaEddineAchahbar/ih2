/**
 * Core angular modules
 */
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Application component imports
 */
import { PolicyMgmtSearchComponent } from './policy-mgmt-search.component';
import { POLICY_CONFIG } from '../core/constants';

/**
 * Module child routes
 */
export const searchRoutes: Routes = [
    // { path: 'policy', redirectTo: `policy/${POLICY_CONFIG.DEFAULT_POLICY_TYPE}` },
    { path: 'policy', redirectTo: `policy/${POLICY_CONFIG.DEFAULT_POLICY_TYPE}` },
    { path: 'policy/:policyType', component: PolicyMgmtSearchComponent },
    { path: 'template', redirectTo: `template/${POLICY_CONFIG.DEFAULT_POLICY_TYPE}` },
    { path: 'template/:policyType', component: PolicyMgmtSearchComponent },
    { path: 'payment-deposit-rule', component: PolicyMgmtSearchComponent }
];

/**
 * This is child module router which will be loaded lazily in root application
 */
export const PolicyMgmtSearchRouting: ModuleWithProviders<any> = RouterModule.forChild(searchRoutes);
