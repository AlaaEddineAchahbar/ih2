import { Injectable } from '@angular/core';
import { TranslationMap } from '../../../core/translation.constant';
import { IPolicyLevelRulesData, IPolicyLevelErrorModel, IPolicyLevelParams } from '../policy-mgmt-create-policy.model';
import { ErrorMessage } from '../../../core/common.model';
import { TcTranslateService } from 'tc-angular-services';
import { ENTERPRISE_POLICY_CREATION_LEVEL, PROPERTY_POLICY_CREATION_LEVEL } from '../../../core/rules-config.constant';
import { DEFAULT_VALUES } from '../../../core/constants';

@Injectable()
export class PolicyMgmtStepPolicyLevelService {
  constructor(
    private translate: TcTranslateService
  ) { }

  validateStepsData(data: IPolicyLevelParams, isChainCategories: boolean = false): IPolicyLevelErrorModel {
    const errorObj: IPolicyLevelErrorModel = {
      policyLevelErrorMessage: new ErrorMessage()
    };

    let count = 0;
    switch (data.policyLevel) {
      case PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN:
        for (const category of data.ratePlans) {
          for (const rateplan of category.list) {
            if (rateplan.selected) {
              ++count;
            }
          }
        }
        if (count === 0) {
          errorObj.policyLevelErrorMessage = {
            show: true,
            message: this.translate.translateService.instant(TranslationMap['SINGLE_RATE_PLAN_SHOULD_BE_SELECTED'])
          };
        }
        if (count > DEFAULT_VALUES.ratePlanSelectionLimit) {
          errorObj.policyLevelErrorMessage = {
            message: this.translate.translateService.instant(TranslationMap['ERROR_MAX_RATEPLAN_SELECTION_LIMIT']),
            show: true
          };
        }
        break;

      case PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY:
      case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY:
        let flag = false;
        for (const category of data.rateCategories) {
          if (category.visible) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          errorObj.policyLevelErrorMessage = {
            show: true,
            message: this.translate.translateService.instant(TranslationMap['SINGLE_RATE_CATEGORY_SHOULD_BE_SELECTED'])
          };
        }
        break;

      case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG:
        for (const rateplan of data.ratePlans) {
          if (rateplan.visible) {
            ++count;
          }
        }
        if (count === 0) {
          errorObj.policyLevelErrorMessage = {
            show: true,
            message: this.translate.translateService.instant(TranslationMap['SINGLE_RATE_PLAN_SHOULD_BE_SELECTED'])
          };
        }
        if (count > DEFAULT_VALUES.ratePlanSelectionLimit) {
          errorObj.policyLevelErrorMessage = {
            message: this.translate.translateService.instant(TranslationMap['ERROR_MAX_RATEPLAN_SELECTION_LIMIT']),
            show: true
          };
        }
        break;

      case ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE:
        if (isChainCategories) {
          let count = 0;
          for (const group of data.chainCategories) {
            for (const category of group.list) {
              if (category.selected) {
                ++count;
              }
            }
          }
          if (count === 0) {
            errorObj.policyLevelErrorMessage = {
              show: true,
              message: this.translate.translateService.instant(TranslationMap['SINGLE_CHAIN_CATEGORY_SHOULD_BE_SELECTED'])
            };
          }
        }
        break;

      case null:
      case undefined:
      case '':
        errorObj.policyLevelErrorMessage = {
          show: true,
          message: this.translate.translateService.instant(TranslationMap['ERROR_POLICY_LEVEL_REQUIRED'])
        };
        break;
    }

    return errorObj;
  }

}
