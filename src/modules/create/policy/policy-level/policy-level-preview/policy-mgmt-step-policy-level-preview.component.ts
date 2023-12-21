import { Component, OnInit } from '@angular/core';
import { PolicyMgmtPolicyStepperDataService } from '../../policy-mgmt-policy-stepper-data.service';
import { IPolicyLevelRulesData } from '../../policy-mgmt-create-policy.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../../../core/translation.constant';
import {
  PROPERTY_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_LEVEL_FILTERS
} from '../../../../core/rules-config.constant';

@Component({
  selector: 'policy-mgmt-step-policy-level-preview',
  templateUrl: './policy-mgmt-step-policy-level-preview.component.html'
})
export class PolicyMgmtStepPolicyLevelPreviewComponent implements OnInit {

  /**
   * Step1 policy level data
   */
  previewStepData: IPolicyLevelRulesData;

  /**
   * Translation Map
   */
  translationMap: any;

  /**
   * Holds translation label for RateCategory / RatePlan
   */
  ratePreviewLabel: string;

  /**
   * Holds translation label for policy level
   */
  levelPreviewLabel: string;

  /**
   * Holds RateCategory / RatePlan string
   */
  ratePlanRateCategorySelected: string;

  constructor(
    private stepperDataService: PolicyMgmtPolicyStepperDataService,
    private translate: TcTranslateService
  ) {
    this.translationMap = TranslationMap;
  }

  ngOnInit() {
    this.previewStepData = this.stepperDataService.getPolicyLevelData();

    const selectedList = [];
    if (this.previewStepData.fields.policyLevel === PROPERTY_POLICY_CREATION_LEVEL.PROPERTY) {
      this.ratePreviewLabel = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
      this.levelPreviewLabel = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
    }

    if (this.previewStepData.fields.policyLevel === PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY
      || this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY) {
      for (const category of this.previewStepData.fields.rateCategories) {
        if (category.visible) {
          selectedList.push(category.name);
        }
      }
      this.ratePlanRateCategorySelected = selectedList.join(', ');
      this.ratePreviewLabel = 'RATECATEGORIES';
      this.levelPreviewLabel = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
      if(this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY) {
        this.levelPreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES;
        this.ratePreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES;
      }

    }

    if (this.previewStepData.fields.policyLevel === PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN) {
      for (const category of this.previewStepData.fields.ratePlans) {
        for (const rateplan of category.list) {
          if (rateplan.selected) {
            selectedList.push(rateplan.name);
          }
        }
      }
      this.ratePlanRateCategorySelected = selectedList.join(', ');
      this.ratePreviewLabel = 'RATEPLANS';
      this.levelPreviewLabel = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
    }

    if (this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG) {
        this.ratePreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS;
        this.levelPreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS;

        // When the context is property
        if (this.previewStepData.fields['rateCatalogsName']) {
          for (const ratePlanName of this.previewStepData.fields['rateCatalogsName']) {
            selectedList.push(ratePlanName);
          }
        }

        // When the context is enterprise
        else if (this.previewStepData.fields.ratePlans) {
          for (const rateplan of this.previewStepData.fields.ratePlans) {
            if (rateplan.visible) {
              selectedList.push(rateplan.name);
            }
          }
        }

        this.ratePlanRateCategorySelected = selectedList.join(', ');
    }

    if (this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
      for (const chainCategory of this.previewStepData.fields.chainCategories) {
        for (const category of chainCategory.list) {
          if (category.selected) {
            selectedList.push(category.name);
          }
        }
      }
      if (selectedList.length > 0) {
        this.ratePreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES;
        this.levelPreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES;
      } else {
        this.ratePreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN;
        this.levelPreviewLabel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN;
        this.previewStepData.fields.policyLevel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN;
      }
      this.ratePlanRateCategorySelected = selectedList.join(', ');
    }
  }

  checkVisibility(key: string) {
    let visibility: boolean;
    switch (key) {
      case PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY:
        visibility = this.previewStepData.fields.policyLevel === PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
        break;
      case PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN:
        visibility = this.previewStepData.fields.policyLevel === PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
        break;
      case ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY:
        visibility = this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY;
        break;
      case ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG:
        visibility = this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG;
        break;
      case ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE:
        visibility = this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
        break;
      case ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN:
        visibility = false;
        break;
      case ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES:
        visibility = this.previewStepData.fields.policyLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES;
        break;
    }
    return visibility;
  }
}
