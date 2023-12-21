import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ContextService } from './context.service';
import { POLICY_LEVEL, CONFIG_TYPE, POLICY_TYPE, DEPOSIT_RULE_CONFIGURATION_PATH_PATTERN } from './constants';
import { IPolicyRouteParams } from '../create/policy/policy-mgmt-create-policy.model';
import { IPolicyTemplateRouteParams } from '../create/template/policy-mgmt-create-template.model';

@Injectable()
export class RouteStateService {

    /**
     * Params to share for policy flow
     */
    selectedPolicyParams: IPolicyRouteParams;

    /**
     * Params to share for template flow
     */
    selectedPolicyTemplateParams: IPolicyTemplateRouteParams;

    constructor(router: Router, private contextService: ContextService, private activatedRoute: ActivatedRoute) {
        router.events.pipe(filter(evt => evt instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
            this.setApplicationContext(e.urlAfterRedirects);
        });
        // Read and store rate plan id to perform search on load when redirected from groups with rate plan id in url
        this.activatedRoute.queryParams.subscribe((params) => {
            this.contextService.setRatePlanId(params['ratePlanId']);
            // Redirection from the group will be false by default.
            // Once redirected from group, set it to true.
            // It will be true unless user opens policies/templates from other screens/menu
            if (params['ratePlanId']) {
                this.contextService.setIsRedirectFromGroups(true);
            }
        });
    }
    setApplicationContext(url: string) {
        const urlArr: Array<string> = url.split('/');
        // set level (property/enterprise)
        this.contextService.setPolicyLevel(urlArr[2]);

        // set application flow (search/create/edit)
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
            // if property in context
            this.contextService.setPolicyFlow(urlArr[3]);
            this.contextService.setPolicyFlowValue(urlArr[3]);
            if (RegExp(DEPOSIT_RULE_CONFIGURATION_PATH_PATTERN).exec(urlArr[4])) {
                this.contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            } else {
                this.contextService.setPolicyConfigType(urlArr[4]);
            }
            if (this.contextService?.configType !== CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
                this.contextService.setPolicyType(urlArr[5].split('?')[0]);
            }
        } else {
            // if enterprise in context
            this.contextService.setChainCode(urlArr[3]);
            this.contextService.setPolicyFlow(urlArr[4]);
            this.contextService.setPolicyFlowValue(urlArr[4]);
            if (urlArr[5].match(DEPOSIT_RULE_CONFIGURATION_PATH_PATTERN)) {
                this.contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            } else {
                this.contextService.setPolicyConfigType(urlArr[5]);
            }
            if (this.contextService.configType !== CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
                this.contextService.setPolicyType(urlArr[6].split('?')[0]);
            }
        }

    }

    /**
     * GET route of URL based on path passed
     */
    getNavigateRouteUrl(path: string): string {
        let routeUrl = '';

        if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION
            && path === 'search/template') {
            routeUrl = `../../${path}/${POLICY_TYPE.DEPOSIT}`;
        } else if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
            routeUrl = `../../${path}`;
        }else if (this.contextService.policyType === POLICY_TYPE.DEPOSIT
            && path === 'search/payment-deposit-rule') {
            // used for button 'View Deposit Configurations' in Deposit Template page
            routeUrl = `../../../${path}`;
        } else {
            routeUrl = `../../../${path}/${this.contextService.policyType}`;
        }

        return routeUrl;
    }

    setSelectedPolicyParams(params: IPolicyRouteParams) {
        this.selectedPolicyParams = params;
    }

    getSelectedPolicyParams(): IPolicyRouteParams {
        return this.selectedPolicyParams;
    }

    setSelectedPolicyTemplateParams(params: IPolicyTemplateRouteParams) {
        this.selectedPolicyTemplateParams = params;
    }

    getSelectedPolicyTemplateParams(): IPolicyTemplateRouteParams {
        return this.selectedPolicyTemplateParams;
    }
}


/**
 * sample URLs
 *
 * PROPERTY *
 * http://localhost:4200/#/policy-mgmt/property/search/policy/:deposit
 * http://localhost:4200/#/policy-mgmt/property/search/template/cancellation
 * http://localhost:4200/#/policy-mgmt/property/create/policy/:guarantee
 * http://localhost:4200/#/policy-mgmt/property/edit/policy/:guarantee?id=01
 * http://localhost:4200/#/policy-mgmt/property/create/template/:deposit
 *
 * ENTERPRISE *
 * http://localhost:4200/#/policy-mgmt/enterprise/CYB/search/policy/cancellation
 * http://localhost:4200/#/policy-mgmt/enterprise/CYB/create/template/deposit
 * http://localhost:4200/#/policy-mgmt/enterprise/CYB/search/template/guarantee
 * http://localhost:4200/#/policy-mgmt/enterprise/CYB/search/payment-deposit-rule
 */
