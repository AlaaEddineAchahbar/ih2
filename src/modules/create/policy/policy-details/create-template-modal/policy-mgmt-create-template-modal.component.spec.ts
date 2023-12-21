import { Component, ViewChild } from '@angular/core';
import { PolicyMgmtCreateTemplateModalComponent } from './policy-mgmt-create-template-modal.component';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { PolicyMgmtStepPolicyDetailsService } from '../policy-mgmt-step-policy-details.service';
import { ContextService } from '../../../../core/context.service';
import { PolicyMgmtCreateTemplateComponent } from '../../../template/policy-mgmt-create-template.component';
import { POLICY_LEVEL, POLICY_FLOW, CONFIG_TYPE, POLICY_TYPE } from '../../../../core/constants';
import { ITemplateListItemResponseModel } from '../../policy-mgmt-create-policy.model';
import { TranslationMap } from '../../../../core/translation.constant';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { PolicyMgmtCreateTemplateService } from '../../../template/policy-mgmt-create-template.service';

/**
 *  AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient) {
    /**
     * Update i18nUrl and set it for loading translations
     */

    let langApiUrl;
    langApiUrl = window['CONFIG']['apiUrl']
        .replace('{{api_module_context_path}}', 'i18n/v1')
        + 'apps/ent-policy-ui/locales/';
    return new TcTranslateService().loadTranslation(http, langApiUrl);
}

export class MockPolicyMgmgtStepDetailsService {
    setTemplateListItem(items) {
    }
}

export class MockPolicyMgmtCreateTemplateService {

}

@Component({
    selector: 'policy-mgmt-create-template',
    template: ''
})
class PolicyMgmtCretaeTemplateComponent implements Partial<PolicyMgmtCreateTemplateComponent> {
}

@Component({
    template: '<policy-mgmt-create-template-modal></policy-mgmt-create-template-modal>'
})
class PolicyMgmtCreateTemplateModalWrapperComponent {
    @ViewChild(PolicyMgmtCreateTemplateModalComponent, { static: false }) createPolicyTemplateModal: PolicyMgmtCreateTemplateModalComponent;

    constructor(
        private policyMgmtStepPolicyDetailsService: PolicyMgmtStepPolicyDetailsService,
        private policyMgmtCreateTemplateService: PolicyMgmtCreateTemplateService
    ) {
    }

    openModal() {
        this.createPolicyTemplateModal.open();
    }

    closeModal(item?: ITemplateListItemResponseModel) {
        this.createPolicyTemplateModal.closeTemplatePopUp();
    }
}

describe('PolicyMgmtCreateTemplateModalComponent', () => {
    let component: PolicyMgmtCreateTemplateModalComponent;
    let fixture: ComponentFixture<PolicyMgmtCreateTemplateModalWrapperComponent>;
    let wrapperComponent: PolicyMgmtCreateTemplateModalWrapperComponent;
    let contextService: ContextService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicyMgmtCreateTemplateModalWrapperComponent,
                PolicyMgmtCreateTemplateModalComponent,
                PolicyMgmtCretaeTemplateComponent
            ],
            imports: [
                CommonModule,
                NgbModule,
                NgbModalModule,
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient]
                    }
                }),
            ],
            providers: [
                ContextService,
                TcTranslateService,
                TranslateService,
                {
                    provide: PolicyMgmtStepPolicyDetailsService,
                    useClass: MockPolicyMgmgtStepDetailsService
                },
                {
                    provide: PolicyMgmtCreateTemplateComponent,
                    useClass: PolicyMgmtCretaeTemplateComponent
                },
                {
                    provide: PolicyMgmtCreateTemplateService,
                    useClass: MockPolicyMgmtCreateTemplateService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        translateService = TestBed.get(TranslateService);
        tcTranslateService = TestBed.get(TcTranslateService);
        tcTranslateService.initTranslation(translateService);

        fixture = TestBed.createComponent(PolicyMgmtCreateTemplateModalWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(PolicyMgmtCreateTemplateModalComponent)).componentInstance;
        contextService = TestBed.get(ContextService);
        component.translationMap = TranslationMap;
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        fixture.detectChanges();
    });

    it('Should Create Create-Policy-Template Modal', () => {
        expect(component).toBeTruthy();
    });

    it('Should Open Modal', () => {
        wrapperComponent.openModal();
        fixture.detectChanges();
        expect(wrapperComponent.openModal).toBeTruthy();
    });

    it('Should Close Modal', () => {
        wrapperComponent.openModal();
        fixture.detectChanges();
        component.clickCancel();
        fixture.detectChanges();
        expect(component.clickCancel).toBeTruthy();
    });

    it('Should Update Template List After Closing Modal Window', () => {
        const templateResponseItem: ITemplateListItemResponseModel = {
            policyStatus: 'ACTIVE',
            res: {
                id: '1234',
                name: 'Test Template',
                emPolicyTemplateId: 123
            }
        };
        wrapperComponent.openModal();
        fixture.detectChanges();
        wrapperComponent.closeModal(templateResponseItem);
        fixture.detectChanges();
        expect(wrapperComponent.closeModal).toBeTruthy();
    });

    it('Should Return Template Flow Heading Translation Key', () => {
       const key = component.setPolicyTemplateFlowHeading();
       expect(key).toBe('CREATE_PROPERTY_TEMPLATE_CANCELLATION');
    });

    it('Should Open Modal for policy type Guarantee', () => {
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        wrapperComponent.openModal();
        fixture.detectChanges();
        expect(wrapperComponent.openModal).toBeTruthy();
    });

    it('Should Close Modal for policy type Guarantee', () => {
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        wrapperComponent.openModal();
        fixture.detectChanges();
        component.clickCancel();
        fixture.detectChanges();
        expect(component.clickCancel).toBeTruthy();
    });

    it('Should Return Template Flow Heading Translation Key for policy type Guarantee', () => {
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        const key = component.setPolicyTemplateFlowHeading();
        expect(key).toBe('CREATE_PROPERTY_TEMPLATE_GUARANTEE');
    });

    it('Should Open Modal for policy type Deposit', () => {
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        wrapperComponent.openModal();
        fixture.detectChanges();
        expect(wrapperComponent.openModal).toBeTruthy();
    });

    it('Should Close Modal for policy type Deposit', () => {
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        wrapperComponent.openModal();
        fixture.detectChanges();
        component.clickCancel();
        fixture.detectChanges();
        expect(component.clickCancel).toBeTruthy();
    });

    it('Should Return Template Flow Heading Translation Key for policy type Deposit', () => {
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        const key = component.setPolicyTemplateFlowHeading();
        expect(key).toBe('CREATE_PROPERTY_TEMPLATE_DEPOSIT');
    });
});
