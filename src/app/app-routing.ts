import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Core angular modules
 */
import { ModuleWithProviders } from '@angular/core';
/**
 * Root app routes to load child modules lazily - here we have to load only one child module
 */
const routes: Routes = [
  { path: '', redirectTo: 'policy-mgmt', pathMatch: 'full' },
  { path: 'policy-mgmt', loadChildren: () => import('../modules/policy-mgmt.module').then(m => m.PolicyMgmtModule) }
];

export const routing: ModuleWithProviders<any> = RouterModule.forRoot(routes, { useHash: true });
