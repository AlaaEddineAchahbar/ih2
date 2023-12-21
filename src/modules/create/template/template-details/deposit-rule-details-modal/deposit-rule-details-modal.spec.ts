import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ViewChild, Component } from '@angular/core';
import { PolicyMgmtDepositRuleDetailsModalComponent } from './deposit-rule-details-modal';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { IDepositRuleDetailsModel } from '../../policy-mgmt-create-template.model';
import { ContextService } from 'src/modules/core/context.service';

/**
 * wrapper component to test modal popup
 */
@Component({
  template: `<deposit-rule-details-modal></deposit-rule-details-modal>`
})
class WrapperComponent {
  @ViewChild(PolicyMgmtDepositRuleDetailsModalComponent, { static: false }) depositRuleModal: PolicyMgmtDepositRuleDetailsModalComponent;
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
    const data: IDepositRuleDetailsModel = {
      depositRuleId: '64217',
      hotelId: '6938',
      name: 'Sample Rule',
      ruleInfo: [
        {
          action: 'CHARGE',
          chargeAmount: '100',
          chargeDate: 'TIME_OF_BOOKING',
          chargePercentage: '0',
          chargeType: 'FLAT',
          percentOnEnhancement: '5',
          status: 'INACTIVE'
        },
        {
          action: 'CHARGE',
          chargeAmount: '10',
          chargeDate: 'TIME_OF_BOOKING',
          chargePercentage: '10',
          chargeType: 'PERCENTAGE',
          percentOnEnhancement: '',
          status: 'ACTIVE'
        }
      ]
    };
    this.depositRuleModal.open(data);
  }

  closeModal() {
    this.depositRuleModal.close();
    this.modalCancelCalled = true;
  }
}

describe('DepositRuleDetailsComponent', () => {
  let component: PolicyMgmtDepositRuleDetailsModalComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WrapperComponent,
        PolicyMgmtDepositRuleDetailsModalComponent
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
        ContextService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(PolicyMgmtDepositRuleDetailsModalComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('Should Create Deposit Rule Details Modal', () => {
    expect(component).toBeTruthy();
  });
  it('Should Show Deposit Rule Details Table and Close Modal', () => {
    wrapperComponent.showModal();
    fixture.detectChanges();
    expect(component.depositRuleDetails.name).toEqual('Sample Rule');
    wrapperComponent.closeModal();
    fixture.detectChanges();
    expect(wrapperComponent.modalCancelCalled).toBeTruthy();
  });
});

