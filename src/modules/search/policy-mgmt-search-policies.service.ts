import { Injectable } from '@angular/core';
import { IPolicySearchRepsonseModel, IListSearchParams } from './policy-mgmt-search.model';
import { SharedDataService } from '../core/shared.data.service';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import {
  PROPERTY_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_LEVEL_FILTERS
} from '../core/rules-config.constant';
import * as moment from 'moment';

@Injectable()
export class PolicyMgmtSearchPolicyService {
  policySearchData: Array<IPolicySearchRepsonseModel> = [];

  constructor(
    private sharedDataService: SharedDataService,
    private utilityService: PolicyMgmtUtilityService
  ) { }

  setPolicySearchData(data: Array<IPolicySearchRepsonseModel>) {
    this.policySearchData = data;
    this.sharedDataService.setPolicySearchData(data);
  }

  getPolicySearchData(): Array<IPolicySearchRepsonseModel> {
    return this.policySearchData;
  }

  getFilteredSearchData(searchPayload: IListSearchParams): Array<IPolicySearchRepsonseModel> {
    let filteredData = [...this.policySearchData];
    if (searchPayload.hasOwnProperty('status')) {
      filteredData = filteredData.filter(item => item.uxPolicyStatus === searchPayload['status']);
    }
    if (searchPayload.hasOwnProperty('policyLevel')) {
      if (searchPayload.policyLevel.includes(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY)
        && !searchPayload.policyLevel.includes(ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY)) {
        searchPayload.policyLevel.push(ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY);
      }
      if (searchPayload.policyLevel.includes(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN)
        && !searchPayload.policyLevel.includes(ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG)) {
        searchPayload.policyLevel.push(ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG);
      }

      filteredData.forEach(policy => policy.uxPolicyLevel = (policy.uxPolicyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE ?
        ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN : policy.uxPolicyLevel));
      filteredData = this.filterPoliciesOnLevelAssignement(searchPayload.policyLevel, filteredData);
      filteredData.forEach(policy => policy.uxPolicyLevel = (policy.uxPolicyLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN
        ? ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE : policy.uxPolicyLevel));
    }
    if (searchPayload.hasOwnProperty('policyName') && searchPayload.policyName) {
      filteredData = filteredData.filter(item => item.uxGroupName.includes(searchPayload['policyName']));
    }
    if (searchPayload.hasOwnProperty('rateCategory') && searchPayload.rateCategory.length > 0) {
      const listData = [];
      const rateCategoryList = searchPayload.rateCategory.map(id => id.substring(id.length - 2));
      filteredData.forEach(item => {
        if (item.uxRateCategoryIds) {
          for (let rateCategoryItem of item.uxRateCategoryIds) {
            // Check if selected RateCategories present in uxRateCategoryIds
            // Add item to listData when found.
            if (rateCategoryList.find(rateCategory => rateCategoryItem.endsWith(rateCategory))) {
              listData.push(item);
              break;
            }
          }
        }
      });
      filteredData = listData;
    }
    if (searchPayload.hasOwnProperty('ratePlan') && searchPayload.ratePlan.length > 0) {
      const listData = [];
      filteredData.forEach(item => {
        if (item.uxRatePlanIds) {
          for (const ratePlanItem of item.uxRatePlanIds) {
            if (searchPayload.ratePlan.find(ratePlan => ratePlan === ratePlanItem)) {
              listData.push(item);
              break;
            }
          }
        }
        if (item.uxRateCatalogs) {
          for (const { rateCatalogId } of item.uxRateCatalogs) {
            if (searchPayload.ratePlan.find(ratePlanId => ratePlanId === rateCatalogId)) {
              listData.push(item);
              break;
            }
          }
        }
      });
      filteredData = listData;
    }
    if (searchPayload.hasOwnProperty('policyTemplateName') && searchPayload.policyTemplateName) {
      filteredData = filteredData.filter(item => item.uxpolicyTemplateName === searchPayload.policyTemplateName);
    }
    if (searchPayload.startDate && !searchPayload.endDate) {
      const listData = [];
      const filterStartDate = moment(searchPayload.startDate);
      filteredData.forEach(item => {
        if (item.uxPolicyDateRange) {
          const dateRangeArray = item.uxPolicyDateRange.split(',');
          for (const dateRange of dateRangeArray) {
            const startDate = moment(dateRange.split('/')[0]);
            const endDate = dateRange.split('/')[1] ?
              moment(dateRange.split('/')[1])
              : null;
            if (startDate.isSameOrAfter(filterStartDate) || !endDate ||
              filterStartDate.isBetween(startDate, endDate, undefined, '[]')) {
              listData.push(item);
              break;
            }
          }
        }
      });
      filteredData = listData;
    } else if (searchPayload.endDate && !searchPayload.startDate) {
      const listData = [];
      const filterEndDate = moment(searchPayload.endDate);
      filteredData.forEach(item => {
        if (item.uxPolicyDateRange) {
          const dateRangeArray = item.uxPolicyDateRange.split(',');
          for (const dateRange of dateRangeArray) {
            const startDate = moment(dateRange.split('/')[0]);
            const endDate = dateRange.split('/')[1] ? moment(dateRange.split('/')[1]) : null;
            if (endDate && endDate.isSameOrBefore(filterEndDate) ||
              filterEndDate.isBetween(startDate, endDate, undefined, '[]')) {
              listData.push(item);
              break;
            }
          }
        }
      });
      filteredData = listData;
    } else if (searchPayload.startDate && searchPayload.endDate) {
      const listData = [];
      const filterStartDate = moment(searchPayload.startDate);
      const filterEndDate = moment(searchPayload.endDate);
      filteredData.forEach(item => {
        if (item.uxPolicyDateRange) {
          const dateRangeArray = item.uxPolicyDateRange.split(',');
          for (const dateRange of dateRangeArray) {
            const startDate = moment(dateRange.split('/')[0]);
            const endDate = dateRange.split('/')[1] ? moment(dateRange.split('/')[1]) : null;
            if (startDate.isBetween(filterStartDate, filterEndDate, undefined, '[]') ||
              endDate && endDate.isBetween(filterStartDate, filterEndDate, undefined, '[]') ||
              (!endDate && filterEndDate.isSameOrAfter(startDate))) {
              listData.push(item);
              break;
            }
          }
        }
      });
      filteredData = listData;
    }

    // Sort FilteredData
    filteredData = this.utilityService.sortPolicyList(filteredData, searchPayload.sortBy);

    return filteredData;
  }

  /**
   * Realise a filter of policy data to conserve only the policy that match with one of policy
   * specified
   * @param policyLevels the policy levels to conserve
   * @param filteredData the list of policy to filter
   * @returns the filtered list of policy
   */
  private filterPoliciesOnLevelAssignement(policyLevels: string[], filteredData: IPolicySearchRepsonseModel[])
    : IPolicySearchRepsonseModel[] {
    const listData = [];
    filteredData.forEach(item => {
      if (item.uxPolicyLevel) {
        policyLevels.forEach(level => {
          if (item.uxPolicyLevel === level) {
            listData.push(item);
          }
        });
      }
    });
    filteredData = listData;
    return filteredData;
  }
}
