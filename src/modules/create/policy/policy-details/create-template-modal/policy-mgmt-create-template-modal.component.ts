/** Basic angular imports */
import { Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';

// third party library imports
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslationMap } from '../../../../core/translation.constant';
import { ITemplateListItemResponseModel, ITemplateListItemModel } from '../../policy-mgmt-create-policy.model';
import { PolicyMgmtStepPolicyDetailsService } from '../policy-mgmt-step-policy-details.service';
import { ContextService } from '../../../../core/context.service';
import { TcTranslateService } from 'tc-angular-services';
import { PolicyMgmtCreateTemplateService } from '../../../template/policy-mgmt-create-template.service';
import { POLICY_FLOW, CONFIG_TYPE, POLICY_LEVEL } from '../../../../core/constants';
/**
 * component used for creating confirmation and information popup
 */
@Component({
    selector: 'policy-mgmt-create-template-modal',
    templateUrl: './policy-mgmt-create-template-modal.component.html',
    styleUrls: ['./policy-mgmt-create-template-modal.styles.scss'],
    encapsulation: ViewEncapsulation.None
})

/**
 * component class for modal popup
 */
export class PolicyMgmtCreateTemplateModalComponent {
    /** event emitter for OK button
     */
    @Output() modalCancel: EventEmitter<string> = new EventEmitter();

    /** event emitter for Cancel button
     */
    @Output() modalOk: EventEmitter<string> = new EventEmitter();

    /**
     * defines content for message body
     */
    messageContent: string;

    /**
     * holds modal title
     */
    modalTitle: string;

    /**
     * holds modal type
     */
    modalType: string;

    /**
     * flag to show/hide close button ontop of modal
     */
    isHideCloseButton: boolean;

    /**
     * defines margin to be added to modal
     */
    marginTopBottom: string;

    /**
     * element ref of modal
     */
    @ViewChild('templateCreationPopup', { static: false }) createTemplateReference: ElementRef;

    /**
     * holds values from constant modal type
     */
    constModalType: object;
    /**
     * used for importing translation JSON
     */
    translationMap: any;

    /**
     * Pointing modal reference for close functionality
     */
    modalRef: NgbModalRef;

    /**
     * Event emitter to update template list items
     */
    @Output() updateTemplateListItems: EventEmitter<any> = new EventEmitter();

    /**
     * Holds header for Template Modal
     */
    flowHeading: string;

    /**
     * initializes class attributes
     * @param modalService - reference of modal popup service
     */

    constructor(
        private modalService: NgbModal,
        private policyMgmtStepDetailsService: PolicyMgmtStepPolicyDetailsService,
        private contextService: ContextService,
        private translate: TcTranslateService,
        private policyMgmtCreateTemplateService: PolicyMgmtCreateTemplateService
        ) {
            this.isHideCloseButton = false;
            this.marginTopBottom = '30px';
            this.translationMap = TranslationMap;
        }

    /**
     * function to open modal
     * @param message: string content of modal
     * @param title: string title of the modal
     * @param className: string user defined class name
     */
    open() {
        this.modalTitle = this.translate.translateService.instant(this.translationMap[
            this.setPolicyTemplateFlowHeading()
        ]);
        this.isHideCloseButton = false;
        this.modalRef = this.modalService.open(this.createTemplateReference, {
            windowClass: 'tc-modal tc-modal-90 modal-holder'
        });
    }

    /**
     * function called before closing of modal
     */
    beforeModalClose() {
        return false;
    }

    /**
     * function called on click of ok button in modal to emit ok event
     */
    clickOk() {
        this.modalOk.emit(this.modalType);
    }

    /**
     * function call on click of cancel to emit cancel event in modal
     */
    clickCancel() {
        this.modalCancel.emit(this.modalType);
        if (this.policyMgmtCreateTemplateService.templatePopUp === true && this.contextService.policyFlowValue === POLICY_FLOW.EDIT) {
            this.contextService.setPolicyFlow(POLICY_FLOW.EDIT);
        }
        this.policyMgmtCreateTemplateService.templatePopUp = false;
    }

    /**
     * Closing creae template popup after click on Save and Activate
     * @param $event: object holding newly created template properties
     */
    closeTemplatePopUp($event?: ITemplateListItemResponseModel) {
        if ($event) {
            const templateListItem: ITemplateListItemModel = {};
            templateListItem.status = $event.policyStatus;
            if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
              this.policyMgmtCreateTemplateService.getTemplateResponseData($event.res.emPolicyTemplateId)
              .subscribe((res: any) => {
                templateListItem.id = res.emPolicyTemplateId.toString();
                templateListItem.name = res.name;
              });
            } else {
              templateListItem.id = $event.res.id;
              templateListItem.name = $event.res.name;
            }

            this.setTemplateListItems(templateListItem);
            this.modalRef.close();
        }
    }

    /**
     * Used to set template list item in service
     * @param templateListItem: object template list item model
     */
    setTemplateListItems(templateListItem: ITemplateListItemModel) {
        this.policyMgmtStepDetailsService.setTemplateListItem(templateListItem);
        this.updateTemplateListItems.emit();
    }

    /**
     * Used to set modal heading
     */
    setPolicyTemplateFlowHeading(): string {
        const flowHeading = POLICY_FLOW.CREATE.toUpperCase() + '_'
            + this.contextService.policyLevel.toUpperCase() + '_'
            + CONFIG_TYPE.TEMPLATE.toUpperCase() + '_'
            + this.contextService.policyType.toUpperCase();
        return flowHeading;
    }
}
