import { Component, ViewChild } from '@angular/core';
import { LinkedPolicyTemplatesErrorComponent } from './linked-policy-templates-error.component';
import { of } from 'rxjs';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TcTranslateService } from 'tc-angular-services';
import { LinkedPolicyTemplatesErrorService } from './linked-policy-templates-error.service';
import { ILinkedPolicyTemplatesErrorInfo } from '../../policy-mgmt-search.model';
import { TableModule } from 'primeng/table';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ContextService } from 'src/modules/core/context.service';
import { POLICY_LEVEL } from 'src/modules/core/constants';

export class MockLinkedPolicyTemplatesErrorService {

  MapLinkedPolicyTemplatesErrorInformation() {
        const list: Array<ILinkedPolicyTemplatesErrorInfo> = [
            {
                templateName: 'test',
                hotelName: 'TRAVELCLICK - iStay2 Test hotel',
                hotelCode: '3311',
                context: 'Property'
            }
        ];
        return list;
    }
}

@Component({
    template: '<linked-policy-templates-error></linked-policy-templates-error>'
})
class LinkedPolicyTemplatesErrorWrapperComponent {
    @ViewChild(LinkedPolicyTemplatesErrorComponent, { static: false }) linkedPolicyTemplatesErrorModal: LinkedPolicyTemplatesErrorComponent;
    modalCancelCalled: boolean;
    constructor(
        private tcTranslateService: TcTranslateService,
        private translate: TranslateService,
        private linkedPolicyTemplatesErrorService: LinkedPolicyTemplatesErrorService
    ) {
        /**
           * Init translations
           */
        this.tcTranslateService.initTranslation(this.translate);
        this.modalCancelCalled = false;
    }

    showModal() {
        // tslint:disable-next-line:max-line-length
        // eslint-disable-next-line max-len
        const errorMessage: string = '{\"enterprise\":[],\"property\":[{\"id\":1240112,\"name\":\"test\",\"hotelCode\":3311,\"hotelName\":\"TRAVELCLICK - iStay2 Test hotel\"}]}';
        this.linkedPolicyTemplatesErrorModal.openModalPopUp(errorMessage);
    }

    closeModal() {
        this.linkedPolicyTemplatesErrorModal.closeModalPopUp();
        this.modalCancelCalled = true;
    }
}

beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [
            LinkedPolicyTemplatesErrorWrapperComponent,
            LinkedPolicyTemplatesErrorComponent
        ],
        imports: [
            CommonModule,
            NgbModule,
            NgbModalModule,
            TranslateModule.forRoot(),
            TableModule
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
            TcTranslateService,
            TranslateService,
            {
                provide: LinkedPolicyTemplatesErrorService,
                useClass: MockLinkedPolicyTemplatesErrorService
            },
            ContextService
        ]
    });
}));

describe('Enterprise LinkedPolicyTemplatesErrorComponent', () => {
    let component: LinkedPolicyTemplatesErrorComponent;
    let fixture: ComponentFixture<LinkedPolicyTemplatesErrorWrapperComponent>;
    let wrapperComponent: LinkedPolicyTemplatesErrorWrapperComponent;
    let contextService: ContextService;

    beforeEach(() => {
        contextService = TestBed.inject(ContextService);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        fixture = TestBed.createComponent(LinkedPolicyTemplatesErrorWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(LinkedPolicyTemplatesErrorComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('Should Create Linked Policy Templates Modal', () => {
        expect(component).toBeTruthy();
    });

    it('Should Show Linked Policy Templates Table and Close Modal', () => {
        wrapperComponent.showModal();
        fixture.detectChanges();

        expect(component.columns[0].field).toEqual('templateName');
        expect(component.errorListData[0].templateName).toEqual('test');
        expect(component.errorListData[0].hotelName).toEqual('TRAVELCLICK - iStay2 Test hotel');
        expect(component.errorListData[0].hotelCode).toEqual('3311');
        expect(component.errorListData[0].context).toEqual('Property');

        wrapperComponent.closeModal();
        fixture.detectChanges();
        expect(wrapperComponent.modalCancelCalled).toBeTruthy();
    });

    it('Enterprise context modal should have columns length equal to 4', () => {
        wrapperComponent.showModal();
        fixture.detectChanges();
        expect(component.columns.length).toEqual(4);

        wrapperComponent.closeModal();
        fixture.detectChanges();
        expect(wrapperComponent.modalCancelCalled).toBeTruthy();
    });
});

describe('Property LinkedPolicyTemplatesErrorComponent', () => {
    let component: LinkedPolicyTemplatesErrorComponent;
    let fixture: ComponentFixture<LinkedPolicyTemplatesErrorWrapperComponent>;
    let wrapperComponent: LinkedPolicyTemplatesErrorWrapperComponent;
    let contextService: ContextService;

    beforeEach(() => {
        contextService = TestBed.inject(ContextService);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        fixture = TestBed.createComponent(LinkedPolicyTemplatesErrorWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(LinkedPolicyTemplatesErrorComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('Property context modal should have columns length equal to 1', () => {
        wrapperComponent.showModal();
        fixture.detectChanges();

        expect(component.columns.length).toEqual(1);

        wrapperComponent.closeModal();
        fixture.detectChanges();
        expect(wrapperComponent.modalCancelCalled).toBeTruthy();
    });
});
