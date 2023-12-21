import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

import * as moment from 'moment';

import { IPolicyDetailsErrorModel, IDateRange } from '../../policy-mgmt-create-policy.model';
import { TranslationMap } from '../../../../core/translation.constant';
import { ShortDays, IDateSelector } from '../../policy-mgmt-create-policy.model';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DEFAULT_VALUES } from '../../../../core/constants';
import { PolicyMgmtDateSelectorService } from './policy-mgmt-date-selector.service';
import { PolicyMgmtUtilityService } from '../../../../core/utility.service';
import { assetURL }  from '../../../../constants/constants';

@Component({
  selector: 'policy-mgmt-date-selector',
  templateUrl: './policy-mgmt-date-selector.component.html',
  styleUrls: ['./policy-mgmt-date-selector.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyMgmtDateSelectorComponent implements OnInit, OnChanges {
  /**
   * Holds current date as per property
   * locale.
   */
  @Input() currentDate: Date;

  /**
   * Holds current selections of dateRange and DayOfWeek
   */
  @Input() dateSelector: IDateSelector;

  /**
   * Holds if monday is true or false based on locale.
   */
  @Input() mondayCalendarStart: boolean;

  /**
   * Holds flag deciding whether to hide DOW strip or not
   */
  @Input() showDOWStrip: boolean;

  /**
   * Returns if date is changed irrespective of validity.
   * "postback" event emits the date data structure only if
   * it is the valid date object.
   */
  @Output() dateChanged = new EventEmitter<IDateSelector>();

  /**
   * Holds the dateformat for date picker
   */
  dateFormat: string;

  /**
   * Holds day names to construct dow selector
   */
  shortDays = ShortDays;

  /**
   * Holds status for dow master toggle
   */
  toggleDaySelection = true;

  /**
   * Holds translation map
   */
  translateMap: any;

  /**
   * Holds validation messages flags
   */
  isDateRangeOverlapping = false;

  /**
   * This will hold week & month values to be given to Date Picker
   */
  datePickeri18nValues: {};

  /**
   * On flyout to bulk modal context load, set startDate for first date range
   * For next date ranges, set start date as Null
   */
  noStartDate = {
    year: null,
    month: null,
    day: null
  };

  /**
   * Check End Date is editable
   */
  isNoEndDateChecked: boolean;

  /**
   * Holds flag deciding whether to show date range validation error message
   */
  @Input() errorObj: IPolicyDetailsErrorModel;

  /**
   * Holds max selectable end Date
   */
  maxSelectableDate: Date;
  publicPath: any;

  constructor(
    private dateSelectorService: PolicyMgmtDateSelectorService,
    private utilityService: PolicyMgmtUtilityService
  ) {
    this.publicPath = assetURL;
    }

  ngOnInit() {
    this.translateMap = TranslationMap;
    this.dateFormat = DEFAULT_VALUES.datePickerUIFormat;
    this.datePickeri18nValues = this.utilityService.getDatePickerTranslatedDates();
    this.maxSelectableDate = moment(this.currentDate).add(DEFAULT_VALUES.datePickerMaxSelectableYears, 'year').toDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.toggleDaySelection = this.isAllDaysSelected();
  }

  /**
   * To add new date input in the list
   */
  addDateRangeInput() {
    // Not allowing user to add new date range
    // If previous date range is not selected
    // or has errors
    if (!(this.validateDateRanges(this.dateSelector))) {
      return;
    }
    const dateRanges: IDateRange = {
      startDate: '',
      endDate: '',
      minSelectableDate: this.currentDate,
      maxSelectableDate: moment(this.currentDate).add(6, 'year').toDate(),
      noEndDateCheckedFlag: false,
    };

    this.dateSelector.dateRanges.push(dateRanges);

    this.postSelection();
  }

  checkValidStartEndDate() {
    const dateRanges = this.dateSelector.dateRanges;
    for (let i = 0; i < dateRanges.length; i++) {

      if (!(dateRanges[i].startDate && (dateRanges[i].endDate || (i === 0 ? dateRanges[0].noEndDateCheckedFlag : true)))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Remove date input from the list
   */
  removeDateRangeInput(index: number) {
    // Remove DateRange from Selected Index's Remove Button
    this.dateSelector.dateRanges.splice(index, 1);
    this.isDateRangeOverlapping = false;
    this.postSelection();
  }

  /**
   * Sets the start date in date range modal
   * @param index - current index of date
   */
  onStartDateChange(selectedDate, index) {
    if (
      selectedDate
      && !moment(this.dateSelector.dateRanges[index].startDate).isSame(selectedDate)
    ) {
      this.dateSelector.dateRanges[index].startDate = selectedDate;
      this.errorObj.startDateErrorMessage.show = false;
    } else if (selectedDate === null) {
      this.dateSelector.dateRanges[index].startDate = null;
      this.errorObj.startDateErrorMessage.show = true;
    }

    this.postSelection();
  }

  /**
   * Sets the end date in date range modal
   * @param index - current index of date
   */
  onEndDateChange(selectedDate, index) {
    if (
      selectedDate
      && !moment(this.dateSelector.dateRanges[index].endDate).isSame(selectedDate)
    ) {
      this.dateSelector.dateRanges[index].endDate = selectedDate;
      this.errorObj.endDateErrorMessage.show = false;
    } else if (selectedDate === null) {
      this.dateSelector.dateRanges[index].endDate = null;
      this.errorObj.endDateErrorMessage.show = true;
    }

    this.postSelection();
  }

  /**
   * sets master toggle according to
   * the selection of particular checkbox
   */
  selectDow() {
    this.toggleDaySelection = this.isAllDaysSelected();
    this.postSelection();
  }

  /**
   * It toggles master dow toggle and adjust
   * other dow checkboxes accordingly
   */
  selectAllDOW() {
    this.toggleDaySelection = !this.toggleDaySelection;
    for (const day of this.shortDays) {
      this.dateSelector.dows[day] = this.toggleDaySelection;
    }
    this.postSelection();
  }

  /**
   * Submits the selected info
   */
  postSelection() {
    this.dateChanged.emit(JSON.parse(JSON.stringify(this.dateSelector)));
  }

  /**
   * Returns true if all days are
   * selected.
   */
  isAllDaysSelected() {
    for (const key of Object.keys(this.dateSelector.dows)) {
      if (!this.dateSelector.dows[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Called when date picker open
   * @param event return boolean value if checkbox is checked
   */
  onNoEndDateChange(event: any, index: number) {
    this.dateSelector.dateRanges[0].endDate = null;
    this.dateSelector.dateRanges[0].noEndDateCheckedFlag = event;
    if (event) {
      this.errorObj.endDateErrorMessage.show = false;
    }
    this.postSelection();
  }

  /**
   * Validates date range(s)
   * 1. No date range should be empty
   * 2. Ranges should not overlap
   * @memberOf UrmBulkUpdateModalComponent
   */
  validateDateRanges(data: any) {
    const sortedData: any = this.dateSelectorService.sortDateRanges(JSON.parse(JSON.stringify(data.dateRanges)));
    const rangeLength = data.dateRanges.length;

    for (let i = 0; i < rangeLength; i++) {
      const currentRange = sortedData[i];
      if (currentRange.startDate && currentRange.endDate) {

        // Check if date ranges are overlapping.
        if (i > 0 && rangeLength > 1) {
          const previousRange = sortedData[i - 1];
          if (this.dateSelectorService.isRangeOverlap(previousRange, currentRange)) {
            this.isDateRangeOverlapping = true;
            return false;
          }
        }
      } else {
        return false;
      }
    }

    return true;
  }
}
