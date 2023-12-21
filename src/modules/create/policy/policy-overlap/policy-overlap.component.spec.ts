import { Component, ViewChild } from '@angular/core';
import { PolicyOverlapComponent } from './policy-overlap.component';
import { IOverlapPolicyInfo } from './policy-overlap.model';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';
import { By } from '@angular/platform-browser';
import { PolicyMgmtUtilityService } from 'src/modules/core/utility.service';

const spyUtilityService = jasmine.createSpyObj('PolicyMgmtUtilityService', ['exportToCSV', 'getStartDate']);

@Component({
    template: '<policy-overlap></policy-overlap>'
})

class PolicyOverlapWrapperComponent {
    @ViewChild(PolicyOverlapComponent, { static: false }) policyOverlapModal: PolicyOverlapComponent;
    modalCloseCalled: boolean;
    policyOverlapListData: Array<IOverlapPolicyInfo> = [];

    constructor(private tcTranslateService: TcTranslateService,
        private translate: TranslateService) {
        this.tcTranslateService.initTranslation(this.translate);
        this.policyOverlapListData = [{
            policyName: 'policy name test',
            ruleStartDate: '2023-11-29',
            ruleEndDate: null,
            id: '33042',
            name: 'rate plan name test',
            policyDateRange: '2023/11/29 - No End Date',
            policyLevel: 'RATE_PLANS',
            issue: 'Overlapping dates with active dated policy'
        },
        {
            policyName: 'policy name test',
            ruleStartDate: '2023-11-29',
            ruleEndDate: null,
            id: '14011',
            name: '00 AP - Enterprise RP',
            policyDateRange: '2023/11/29 - No End Date',
            policyLevel: 'RATE_PLANS',
            issue: 'Overlapping dates with active dated policy'
        }];
        this.modalCloseCalled = false;
    }

    showModal() {
        this.policyOverlapModal.openPolicyOverlapModal(this.policyOverlapListData);
    }

    closeModal() {
        this.policyOverlapModal.closePolicyOverlapModal(false);
        this.modalCloseCalled = true;
    }
}

describe('Policy Overlap Component', () => {
    let component: PolicyOverlapComponent;
    let fixture: ComponentFixture<PolicyOverlapWrapperComponent>;
    let wrapperComponent: PolicyOverlapWrapperComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicyOverlapWrapperComponent,
                PolicyOverlapComponent
            ],
            imports: [
                CommonModule,
                NgbModule,
                NgbModalModule,
                TranslateModule.forRoot(),
                TableModule
            ],
            providers: [
                TcTranslateService,
                PolicyMgmtUtilityService,
                {
                    provide: PolicyMgmtUtilityService,
                    useValue: spyUtilityService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolicyOverlapWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(PolicyOverlapComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('Should create policy overlap component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('Should show Policy Overlap Modal with list of overlapping policies and close it', () => {
        // Act
        wrapperComponent.showModal();
        fixture.detectChanges();

        // Assert
        expect(component.policyOverlapListData[0].id).toEqual('33042');
        expect(component.policyOverlapListData[0].name).toEqual('rate plan name test');
        expect(component.policyOverlapListData[0].policyDateRange).toEqual('2023/11/29 - No End Date');
        expect(component.policyOverlapListData[0].policyName).toEqual('policy name test');
        expect(component.policyOverlapListData[0].issue).toEqual('Overlapping dates with active dated policy');

        // Act
        wrapperComponent.closeModal();
        fixture.detectChanges();

        // Assert
        expect(wrapperComponent.modalCloseCalled).toBeTruthy();
    });

    it('should call utilityService.exportToCSV with the correct parameters', () => {
        // Act
        component.exportCsvData(component.policyOverlapListData);

        // Assert
        expect(spyUtilityService.exportToCSV).toHaveBeenCalledWith(component.policyOverlapListData, 'global_Export-LblExport.csv', false);
    });

});