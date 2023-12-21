import { of } from 'rxjs';
import { IErrorDetails, IErrorDetailsModel, IErrorDetailsTable } from './copy-clone-error-details.model';
import { Component, ViewChild } from '@angular/core';
import { CopyCloneErrorDetailsComponent } from './copy-clone-error-details.component';
import { CopyCloneErrorDetailsService } from './copy-clone-error-details.service';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Delegates its only methods to the injected service CopyCloneErrorDetailsService
 */
export class MockCopyCloneErrorDetailsService {

    getJobDetails() {
        const errors: Array<IErrorDetails> = [
            {
                code: 'CORE_PROXY_ERROR',
                field: null,
                message: 'Unable to send to core'
            }
        ];
        const errorDetails: Array<IErrorDetailsModel> = [
            {
                status: 'Failed',
                parent_id: 'fRJkhIoBrvYP_KdjF-oe',
                job_child_id: 'fRJkhIoBrvYP_KdjF-oe-71125',
                hotel_code: 71125,
                errors: errors
            }
        ];
        return of(errorDetails);
    }

    setErrorDetailsToDisplay() {
        const returnErrorDetails: Array<IErrorDetailsTable> = [
            {
                hotelCode: 71125,
                hotelName: 'hotelname',
                ErrorCode: 'CORE_PROXY_ERROR',
                ErrorMessage: 'Unable to send to core'
            }
        ];
        return returnErrorDetails;
    }

    getHotelName() {
        return '71125';
    }
}
@Component({
    template: '<copy-clone-error-details></copy-clone-error-details>'
})
class WrapperComponent {
    @ViewChild(CopyCloneErrorDetailsComponent, { static: false }) copyCloneErrorDetailsModal: CopyCloneErrorDetailsComponent;
    modalCancelCalled: boolean;
    constructor(
        private tcTranslateService: TcTranslateService,
        private translate: TranslateService) {
        this.tcTranslateService.initTranslation(this.translate);
        this.modalCancelCalled = false;
    }

    showModal() {
        this.copyCloneErrorDetailsModal.open('fRJkhIoBrvYP_KdjF-oe', 1, 2, null);
    }

    closeModal() {
        this.copyCloneErrorDetailsModal.close();
        this.modalCancelCalled = true;
    }
}

describe('CopyCloneErrorDetailsComponent', () => {
    let component: CopyCloneErrorDetailsComponent;
    let fixture: ComponentFixture<WrapperComponent>;
    let wrapperComponent: WrapperComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                WrapperComponent,
                CopyCloneErrorDetailsComponent
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
                TranslateService,
                {
                    provide: CopyCloneErrorDetailsService,
                    useClass: MockCopyCloneErrorDetailsService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(CopyCloneErrorDetailsComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('Should create copy clone error details component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('Should show copy clone error details table and close it', () => {
        // Act
        wrapperComponent.showModal();
        fixture.detectChanges();

        // Assert
        expect(component.copyCloneErrorDetailsList[0].hotelCode).toEqual(71125);
        expect(component.copyCloneErrorDetailsList[0].hotelName).toEqual('hotelname');
        expect(component.copyCloneErrorDetailsList[0].ErrorCode).toEqual('CORE_PROXY_ERROR');
        expect(component.copyCloneErrorDetailsList[0].ErrorMessage).toEqual('Unable to send to core');

        // Act
        wrapperComponent.closeModal();
        fixture.detectChanges();

        // Assert
        expect(wrapperComponent.modalCancelCalled).toBeTruthy();
    });

    it('should return false before modal close', () => {
        // Act
        const result = component.beforeModalClose();

        // Assert
        expect(result).toBe(false);
    });

    it('should export Excel file', () => {
        // Arrange
        const exportCopyCloneErrorDetailsList = 'exportCopyCloneErrorDetailsList';
        const innerHTML: HTMLElement = document.createElement('div');

        spyOn(document, 'getElementById').and.returnValue(innerHTML);

        const createObjectURLSpy = spyOn(window.URL, 'createObjectURL');
        const openSpy = spyOn(window, 'open');

        // Act
        component.exportExcel(exportCopyCloneErrorDetailsList);

        // Asssert
        expect(document.getElementById).toHaveBeenCalledWith(exportCopyCloneErrorDetailsList);
        expect(createObjectURLSpy).toHaveBeenCalledWith(jasmine.any(Blob));
        expect(openSpy).toHaveBeenCalled();
    });

});
