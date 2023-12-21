/**
 * Core angular modules
 */
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * Application component imports
 */
import { PolicyMgmtComponent } from './policy-mgmt.component';


/**
 * Module child routes
 */
export const routes: Routes = [
  {
    path: '', redirectTo: 'property', pathMatch: 'full'
  },
  {
    path: 'property', component: PolicyMgmtComponent,
    children: [
      {
        path: 'search',
        loadChildren: () => import('./search/policy-mgmt-search.module').then(m => m.PolicyMgmtSearchModule)
      },
      {
        path: 'create',
        loadChildren: () => import('./create/policy-mgmt-create.module').then(m => m.PolicyMgmtCreateModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./create/policy-mgmt-create.module').then(m => m.PolicyMgmtCreateModule)
      }
    ]
  },
  {
    path: 'enterprise/:chainCode', component: PolicyMgmtComponent,
    children: [
      {
        path: 'search',
        loadChildren: () => import('./search/policy-mgmt-search.module').then(m => m.PolicyMgmtSearchModule)
      },
      {
        path: 'create',
        loadChildren: () => import('./create/policy-mgmt-create.module').then(m => m.PolicyMgmtCreateModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./create/policy-mgmt-create.module').then(m => m.PolicyMgmtCreateModule)
      }
    ]
  }
];

/**
 * This is child module router which will be loaded lazily in root application
 */
export const PolicyMgmtRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);
