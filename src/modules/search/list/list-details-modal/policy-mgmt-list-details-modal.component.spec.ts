import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, ViewChild, Component } from '@angular/core';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { PolicyMgmtListDetailsModalComponent } from './policy-mgmt-list-details-modal.component';

/**
 * wrapper component to test modal popup
 */
@Component({
    template: `<policy-mgmt-list-details-modal></policy-mgmt-list-details-modal>`
})
class WrapperComponent {
    @ViewChild(PolicyMgmtListDetailsModalComponent, { static: false }) listDetailsModal: PolicyMgmtListDetailsModalComponent;
    modalCancelCalled: boolean;
    constructor(
        private tcTranslateService: TcTranslateService,
        private translate: TranslateService
    ) {
        /**
         * Init translations
         */
        this.tcTranslateService.initTranslation(this.translate);
        this.modalCancelCalled = false;
    }
    showModal() {
        const list = [
            'List Item 1',
            'List Item 2',
            'List Item 3'
        ];
        const modelLabel = 'List Items';
        this.listDetailsModal.open(list, modelLabel);
    }

    closeModal() {
        this.listDetailsModal.close();
        this.modalCancelCalled = true;
    }
}

describe('Policy Details Modal Component', () => {
    let component: PolicyMgmtListDetailsModalComponent;
    let fixture: ComponentFixture<WrapperComponent>;
    let wrapperComponent: WrapperComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                WrapperComponent,
                PolicyMgmtListDetailsModalComponent
            ],
            imports: [
                CommonModule,
                NgbModule,
                NgbModalModule,
                TranslateModule.forRoot()
            ],
            providers: [
                TcTranslateService,
                TranslateService,
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(PolicyMgmtListDetailsModalComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('Should Create List Details Modal popup', () => {
        expect(component).toBeTruthy();
    });

    it('Should Show List Details and Close Modal', () => {
        wrapperComponent.showModal();
        fixture.detectChanges();
        expect(component.modalHeading).toEqual('List Items');
        wrapperComponent.closeModal();
        fixture.detectChanges();
        expect(wrapperComponent.modalCancelCalled).toBeTruthy();
    });
});
