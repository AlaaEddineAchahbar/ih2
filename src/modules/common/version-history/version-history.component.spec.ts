import { Component, ViewChild } from '@angular/core';
import { VersionHistoryComponent } from './version-history.component';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { IHistoryRecord } from './version-history.model';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { VersionHistoryService } from './version-history.service';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export class MockVersionHistoryService {

    getVersionHistoryData() {
        const list: Array<IHistoryRecord> = [
            {
                date: '21-DEC-2020 10:30AM',
                id: '1231',
                field: 'name',
                userName: 'ihPrashantK',
                oldValue: ['Test old value'],
                newValue: ['Test new value']
            }
        ];
        return of(list);
    }
}

@Component({
    template: '<version-history></version-history>'
})
class VersionHistoryWrapperComponent {
    @ViewChild(VersionHistoryComponent, { static: false }) versionHistoryModal: VersionHistoryComponent;
    modalCancelCalled: boolean;
    constructor(
        private tcTranslateService: TcTranslateService,
        private translate: TranslateService,
        private versionHistoryService: VersionHistoryService
    ) {
        /**
         * Init translations
         */
        this.tcTranslateService.initTranslation(this.translate);
        this.modalCancelCalled = false;
    }

    showModal() {
        const templateId = 123456;
        this.versionHistoryModal.open(templateId);
    }

    closeModal() {
        this.versionHistoryModal.close();
        this.modalCancelCalled = true;
    }
}

describe('VersionHistoryComponent', () => {
    let component: VersionHistoryComponent;
    let fixture: ComponentFixture<VersionHistoryWrapperComponent>;
    let wrapperComponent: VersionHistoryWrapperComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                VersionHistoryWrapperComponent,
                VersionHistoryComponent
            ],
            imports: [
                CommonModule,
                NgbModule,
                NgbModalModule,
                TranslateModule.forRoot(),
                TableModule,
                DropdownModule,
                KeyFilterModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                TcTranslateService,
                TranslateService,
                {
                    provide: VersionHistoryService,
                    useClass: MockVersionHistoryService
                },
                PolicyMgmtErrorService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VersionHistoryWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(VersionHistoryComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('Should Create Version Hisory Modal', () => {
        expect(component).toBeTruthy();
    });

    it('Should Show Version History Table and Close Modal', () => {
        wrapperComponent.showModal();
        fixture.detectChanges();

        expect(component.historyList[0].field).toEqual('name');
        expect(component.historyList[0].oldValue[0]).toEqual('Test old value');
        expect(component.historyList[0].newValue[0]).toEqual('Test new value');

        wrapperComponent.closeModal();
        fixture.detectChanges();
        expect(wrapperComponent.modalCancelCalled).toBeTruthy();
    });

    it('should show toolip', () => {
        component.tooltipCondition({
            target: {
                scrollWidth: 100,
                clientWidth: 90
            }
        });
        expect(component.toolTipFlag).toBeTruthy();

        component.tooltipCondition({
            target: {
                scrollWidth: 100,
                clientWidth: 120
            }
        });
        expect(component.toolTipFlag).toBeFalsy();
    });
});
