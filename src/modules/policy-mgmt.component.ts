/**
 * Core angular modules
 */
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TcTranslateService, TcHttpHandler } from 'tc-angular-services';
import { ContextService } from './core/context.service';
import { RouteStateService } from './core/route.state.service';
import { POLICY_LEVEL } from './core/constants';

import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'policy-mgmt-app',
    templateUrl: './policy-mgmt.component.html',
    styleUrls: [
        './policy-mgmt.component.css'
    ],
    encapsulation: ViewEncapsulation.None
})

/**
 * Root component for template project
 */
export class PolicyMgmtComponent implements OnInit {
    tokenData: object;
    isLoading: false;

    constructor(
        private tcTranslateService: TcTranslateService,
        private http: HttpClient,
        private translate: TranslateService,
        private tcHttpHandler: TcHttpHandler,
        private contextService: ContextService,
        private routeStateService: RouteStateService,
        private route: ActivatedRoute) {

        /**
         * Init translations
         */
        this.tcTranslateService.initTranslation(translate);

        /**
         * Subscribe to loader object
         */
        tcHttpHandler.requestData.subscribe(data => {
            this.isLoading = data['inProgress'];
        });

        this.contextService.setChainCode(this.route.snapshot.paramMap.get('chainCode'));

        /**
         * Token decoded data is available in global CONFIG object
         * Such as user info, property info etc
         */
        this.tokenData = window['CONFIG']['tokenDecodedData'];
    }

    ngOnInit(): void {
        if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
            this.route.params.subscribe(params => {
                this.contextService.setChainCode(params['chainCode']);
            });
        }
    }
}
