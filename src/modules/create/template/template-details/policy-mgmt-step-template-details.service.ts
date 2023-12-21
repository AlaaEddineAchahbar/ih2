import { Injectable } from '@angular/core';
import { ITemplateDetailsParams, IPolicyTemplateErrorModel } from '../policy-mgmt-create-template.model';
import { ErrorMessage, IDropDownItem } from '../../../core/common.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../../core/translation.constant';
import { SharedDataService } from '../../../core/shared.data.service';
import { CANCELLATION_OPTIONS } from '../../../core/rules-config.constant';
import { DEFAULT_VALUES, POLICY_LEVEL } from '../../../core/constants';
import { IHotelInfo } from '../../../core/common.model';
import { DEFAULT_ADVANCE_NOTICE } from '../policy-mgmt-create-template.constant';
import { ContextService } from 'src/modules/core/context.service';



@Injectable()
export class PolicyMgmtStepTemplateDetailsService {

    /**
     * Holds Translation map
     */
    translationMap: any;

    /**
     * Holds HotelInfo
     */
    hotelInfo: IHotelInfo;

    constructor(
        private translate: TcTranslateService,
        private sharedDataService: SharedDataService,
        private contextService: ContextService
    ) {
        this.hotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
        this.translationMap = TranslationMap;
    }

    /**
     * Validates and returns error object
     * @param data: rule-fields
     * @returns errorObj: IPolicyTemplateErrorModel
     */
    validateStepData(data: ITemplateDetailsParams) {
        const errorObj: IPolicyTemplateErrorModel = {
            templateNameErrorMessage: new ErrorMessage(),
            lateArrivalErrorMessage: new ErrorMessage(),
            cancellationNoticeErrorMessage: new ErrorMessage()
        };

        // check if Policy Template Name is an Empty String or Not.
        if (data.policyTemplateName.length === 0) {
            errorObj.templateNameErrorMessage = {
                show: true,
                message: this.translate.translateService.instant(this.translationMap.ENTER_A_POLICY_TEMPLATE_NAME),
            };
        }

        // for guarantee type, if accepted tender is "Accept All", then only check for error.
        if(this.contextService.policyLevel === POLICY_LEVEL.PROPERTY){
            if (
                data.hasOwnProperty('lateArrivalTime')
                && this.hotelInfo && this.hotelInfo.hotelSettings.isGdsEnabled
                && data.acceptedTender === DEFAULT_VALUES.acceptedTenderDropdown.acceptAllIdForLateArrival
            ) {
                if (!(data.lateArrivalTime || data.lateArrivalTime === 0)) {
                    errorObj.lateArrivalErrorMessage = {
                        show: true,
                        message: this.translate.translateService.instant(this.translationMap.LATE_ARRIVAL_TIME_MUST_BE_SELECTED)
                    };
                }
            }
        } else {
            if (
                data.hasOwnProperty('lateArrivalTime')
                && data.acceptedTender === DEFAULT_VALUES.acceptedTenderDropdown.acceptAllIdForLateArrival
            ) {
                if (!(data.lateArrivalTime || data.lateArrivalTime === 0)) {
                    errorObj.lateArrivalErrorMessage = {
                        show: true,
                        message: this.translate.translateService.instant(this.translationMap.LATE_ARRIVAL_TIME_MUST_BE_SELECTED)
                    };
                }
            }
        }
        
        /**
         * cancellation notice option is not selected, then display error.
         */
        if (data.hasOwnProperty('cancellationNotice')) {
            if (!data.cancellationNotice) {
                errorObj.cancellationNoticeErrorMessage = {
                    show: true,
                    message: this.translate.translateService.instant(this.translationMap.ERROR_SELECT_CXLNOTICE)
                };
            } else {
                if (data.cancellationNotice === CANCELLATION_OPTIONS.SAME_DAY) {
                    if (!(data.sameDayNoticeTime || data.sameDayNoticeTime === 0)) {
                        errorObj.cancellationNoticeErrorMessage = {
                            show: true,
                            message: this.translate.translateService.instant(this.translationMap.ERROR_SELECT_VALID_SAMEDAY_HOUR)
                        };
                    }
                } else if (data.cancellationNotice === CANCELLATION_OPTIONS.ADVANCE_NOTICE) {
                    if ((!data.advanceNotice.days && data.advanceNotice.days !== DEFAULT_ADVANCE_NOTICE.PRIOR_DAYS)
                        && (!data.advanceNotice.hours && data.advanceNotice.hours !== DEFAULT_ADVANCE_NOTICE.PRIOR_HOURS)) {
                        errorObj.cancellationNoticeErrorMessage = {
                            show: true,
                            message: this.translate.translateService.instant(this.translationMap.PLEASE_ENTER_ADVANCE_NOTICE_DAYS_HOURS)
                        };
                    }
                }
            }
        }
        return errorObj;
    }

    /**
     * Returns name for given id from list
     * @param list: list in which to look for id
     * @param id: id for which name to return
     */
    getFieldNameById(list: IDropDownItem[], id: number | string): string {
        const data = list.find(item => item.id === id);
        if (data) {
            return data.name;
        }
        return null;
    }
}
