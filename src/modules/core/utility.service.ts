import { Injectable } from '@angular/core';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from './translation.constant';
import { IDropDownItem } from './common.model';
import * as moment from 'moment';
import * as momentZone from 'moment-timezone';
import { Weekdays } from './constants';
import { SEARCH_SORT_DROPDOWN_OPTIONS } from '../search/policy-mgmt-search.constant';

@Injectable()
export class PolicyMgmtUtilityService {

    constructor(private translate: TcTranslateService) { }

    /**
     * Returns translated Month list
     */
    getMonthListDropDown(): Array<IDropDownItem> {
        const monthListDropDown: Array<IDropDownItem> = [];
        const monthList: Array<string> = this.getMonthList();
        for (let i = 0; i < monthList.length; i++) {
            const monthLabel = monthList[i].toUpperCase();
            monthListDropDown.push({
                id: i,
                name: this.translate.translateService.instant(TranslationMap[monthLabel]),
            });
        }
        return monthListDropDown;
    }

    /**
     * This will return Month List
     */
    getMonthList(): Array<string> {
        return moment.months();
    }

    /**
     * It will sort lisData with below sort orde
     * 1. Symbols
     * 2. Numbers (low to high)
     * 3. Letters (A-Z)
     */
    customSort(order: number, attr: string, listData) {
        const sortChannelComparer = (a, b): number => {
            let c = 0;
            c = (a[attr].toString().toLowerCase() > b[attr].toString().toLowerCase()) ? 1 : -1;
            c = c * order;
            return c;
        };
        listData.sort(sortChannelComparer);
        return listData;
    }

    /**
     * Sort array based on object attribute and orderlist specified
     * @param data: list to sort
     * @param orderedList: sorted list const
     * @param attrName: attribute name
     */
    sortArrayBasedOnOrder(data = [], orderedList: string[] = [], attrName: string): any {
        const sortedArray = [];
        for (const item of orderedList) {
            const val = data.find(param => {
                if (item && param && param[attrName]) {
                    const value = param[attrName].trim().replace(' ', '').toLowerCase();
                    const itemToCompare = item.trim().replace(' ', '').toLowerCase();
                    return value === itemToCompare;
                } else {
                    return false;
                }
            });
            if (val) {
                sortedArray.push(val);
            }
        }
        return sortedArray;
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
     * This will return translated date picker month, clearDates, noEndDate
     */
    getDatePickerTranslatedDates() {
        const translatedDates = {
            months: this.getMonthListDropDown().map(month => month.name),
            weekdays: Weekdays.map((weekday: string) =>
                this.translate.translateService.instant(TranslationMap[weekday])),
            clearDates: this.translate.translateService.instant(TranslationMap['CLEAR_DATES']),
            noEndDate: this.translate.translateService.instant(TranslationMap['NO_END_DATE']),
        };
        return translatedDates;
    }

    /**
     * Sort Policy ListData based on lastModified Date
     *
     */
    sortPolicyList(listData, sortType: string) {
        switch (sortType) {
            case SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_OLDEST_MODIFIED_DATE:
                listData.sort((a, b) => new Date(a.uxLastUpdated).getTime() - new Date(b.uxLastUpdated).getTime());
                break;
            case SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_A_Z:
                this.customSort(1, 'uxGroupName', listData);
                break;
            case SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_Z_A:
                this.customSort(-1, 'uxGroupName', listData);
                break;
            default:
                // Sort to Default Sort Type i.e. Last Modified Date
                listData.sort((a, b) => new Date(b.uxLastUpdated).getTime() - new Date(a.uxLastUpdated).getTime());
                break;
        }
        return listData;
    }

    /**
     * function to check if the input JSON is valid
     * @param string to be tested
     */
    isValidJson(str: string): boolean {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * function to convert last updated time from system timezone to property timezone
     * @param date - actual date
     * @param timezone - property timezone to convert time to
     */
    convertToPropertyTimeZone(timezone: string, date: string) {
        const m = momentZone.tz(date, 'US/Central');
        const utcDate = m.utc().format();
        const updatedDate = momentZone(utcDate).tz(timezone).format('DD-MMM-YYYY HH:mm');
        return updatedDate;
    }

    /**
     * function to export an array of objects to CSV and download it
     * @param arrayOfObjects - array of objects to be exported (objects should have the same data structure)
     * @param fileName - name of the file to be downloaded
     * @param translateHeaders - boolean to indicate if the csv column headers need to be translated
     */
    exportToCSV (arrayOfObjects: any[], fileName: string, translateHeaders: boolean = false) {
        if(arrayOfObjects.length === 0) {
            return;
        }

        let csvContent = 'data:application/csv,';
     
        // get the column names from the first item in the array
        const columnNames = Object.keys(arrayOfObjects[0]);
        
        // compose the CSV headers
        const headers = [];
        columnNames.forEach(name => {
            let result = translateHeaders
                ? this.translate.translateService.instant(TranslationMap[name])
                : name;

            result = result.replace(/"/g, '""');    // escape double quotes
            result = `"${result}"`;
            headers.push(result);
        });
        csvContent += headers.join(',') + '\r\n';
     
        // compose the CSV data rows
        arrayOfObjects.forEach(item => {
            const dataArray = [];
            for (const key of columnNames) {
                const dataValue = item[key] === null ? '' : item[key].toString();
                let result = dataValue.replace(/"/g, '""'); // escape double quotes
                result = `"${result}"`;
                dataArray.push(result);
            }
            csvContent += dataArray.join(',') + '\r\n';
        });
     
        // Download the CSV file
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.href = encodedUri;
        link.download = fileName;
        document.body.appendChild(link);    // required for FireFox
        link.click();
        document.body.removeChild(link);
    }
}
