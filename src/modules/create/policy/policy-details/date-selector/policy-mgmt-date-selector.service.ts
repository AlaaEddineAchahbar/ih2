import { Injectable } from '@angular/core';
import { TcTranslateService } from 'tc-angular-services';

import * as moment from 'moment';
import { TranslationMap } from '../../../../core/translation.constant';
import { PolicyMgmtUtilityService } from '../../../../core/utility.service';
import { ShortDays} from '../../policy-mgmt-create-policy.model';

@Injectable()
export class PolicyMgmtDateSelectorService {

    constructor(
        private translate: TcTranslateService,
        private utilityService: PolicyMgmtUtilityService
    ) { }

    /**
     * Checks whether we have overlapping date ranges
     */
    isRangeOverlap(previousRange, currentRange) {
        return !(
            moment(previousRange.endDate).isBefore(currentRange.startDate)
            && moment(currentRange.startDate).isAfter(previousRange.endDate)
        );
    }

    /**
     * Sort the date ranges based on start date
     */
    sortDateRanges(data: any[]) {
        return data.sort((previousDate, nextDate) => {
            if ((moment(previousDate.startDate).isBefore(nextDate.startDate))) {
                return -1;
            }

            if ((moment(previousDate.startDate).isAfter(nextDate.startDate))) {
                return 1;
            }

            return 0;
        });
    }
}
