import { Injectable } from '@angular/core';
import * as momentZone from 'moment-timezone';
import { TcTranslateService } from 'tc-angular-services';
import { IPolicyDetailsErrorModel, IPolicyDetailsParams, IDateRange } from '../policy-mgmt-create-policy.model';
import { ErrorMessage } from '../../../core/common.model';
import { TranslationMap } from '../../../core/translation.constant';
import { PolicyMgmtDateSelectorService } from './date-selector/policy-mgmt-date-selector.service';
import { DEFAULT_DATED_POLICY_TYPE } from '../../../core/rules.constant';
import { ITemplateListItemModel } from '../policy-mgmt-create-policy.model';

@Injectable()
export class PolicyMgmtStepPolicyDetailsService {

    /**
     * ErrorObject holder for step2
     */
    errorObj: IPolicyDetailsErrorModel;

    /**
     * Used to hold newly created template list item
     */
    templateListItem: ITemplateListItemModel;

    constructor(
        private translate: TcTranslateService,
        private dateSelectorService: PolicyMgmtDateSelectorService
    ) {
        this.errorObj = {
            policyNameErrorMessage: new ErrorMessage(),
            policyTemplateErrorMessage: new ErrorMessage(),
            startDateErrorMessage: new ErrorMessage(),
            endDateErrorMessage: new ErrorMessage(),
            dowErrorMessage: new ErrorMessage(),
            dateRangeErrorMessage: new ErrorMessage()
        };
    }

    /**
     * Validates step 2 data and returns error object
     * @param data: rule fields data
     */
    validateStepsData(data: IPolicyDetailsParams): IPolicyDetailsErrorModel {
        if (data.policyName.length === 0) {
            this.errorObj.policyNameErrorMessage = {
                show: true,
                message: this.translate.translateService.instant(TranslationMap['POLICY_NAME_IS_REQUIRED'])
            };
        }

        if (!data.policyTemplate) {
            this.errorObj.policyTemplateErrorMessage = {
                show: true,
                message: this.translate.translateService.instant(TranslationMap['POLICY_TEMPLATE_MUST_BE_SELECTED'])
            };
        }

        if (data.policyType === DEFAULT_DATED_POLICY_TYPE.dated) {
            if (data.dateRange) {
                const dateRangeFlag = this.validateStartEndDate(data.dateRange);
                if (dateRangeFlag.startDateFlag) {
                    this.errorObj.startDateErrorMessage.show = true;
                }
                if (dateRangeFlag.endDateFlag) {
                    this.errorObj.endDateErrorMessage.show = true;
                }
                if (this.validateDistinctDateRange(data.dateRange)) {
                    this.errorObj.dateRangeErrorMessage.show = true;
                } else {
                    this.errorObj.dateRangeErrorMessage.show = false;
                }
            }

            if (data.dayOfWeek) {
                if (this.validateDow(data.dayOfWeek)) {
                    this.errorObj.dowErrorMessage.show = true;
                } else {
                    this.errorObj.dowErrorMessage.show = false;
                }
            }
        }

        return { ...this.errorObj };
    }

    /**
     * Validates date range for distinct date range
     * @param dateRange: array of daterange
     */
    validateDistinctDateRange(dateRange: Array<IDateRange>) {
        const sortedData: any = this.dateSelectorService.sortDateRanges(JSON.parse(JSON.stringify(dateRange)));
        const rangeLength = dateRange.length;

        for (let i = 0; i < rangeLength; i++) {
            const currentRange = sortedData[i];
            if (currentRange.startDate && currentRange.endDate) {

                // Check if date ranges are overlapping.
                if (i > 0 && rangeLength > 1) {
                    const previousRange = sortedData[i - 1];
                    if (this.dateSelectorService.isRangeOverlap(previousRange, currentRange)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Validates start and end dates
     * @param dateRange: Array of date ranges
     */
    validateStartEndDate(dateRange: Array<IDateRange>) {
        let startDateFlag;
        let endDateFlag;
        for (let i = 0; i < dateRange.length; i++) {
            const currentRange = dateRange[i];
            if (!currentRange.startDate) {
                startDateFlag = true;
            }
            if (!(currentRange.endDate || (i === 0 ? dateRange[0].noEndDateCheckedFlag : false))) {
                endDateFlag = true;
            }
        }
        return {
            startDateFlag,
            endDateFlag
        };
    }

    /**
     * Validates Day of week
     * @param dayOfWeek: dayOfWeek
     */
    validateDow(dayOfWeek) {
        let flag = true;
        for (const day in dayOfWeek) {
            if (dayOfWeek[day]) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    /**
     * This will return the current date based on property timezone.
     * @param timeZone: property timezone string
     * @param date: date string
     */
    getStartDate(timeZone: string, date?: string) {
        const dateFromTimeZone = date
            ? momentZone.tz(date, timeZone).toObject()
            : momentZone().tz(timeZone).toObject()
            ;

        const currentDate = new Date(
            dateFromTimeZone.years,
            dateFromTimeZone.months,
            dateFromTimeZone.date
        );

        return currentDate;
    }

    /**
     * Set template list item
     * @param item : template list item model object
     */
    setTemplateListItem(item: ITemplateListItemModel) {
        this.templateListItem = {};
        this.templateListItem = item;
    }

    /**
     * Get template list item
     */
    getTemplateListItem() {
        return this.templateListItem;
    }

}
