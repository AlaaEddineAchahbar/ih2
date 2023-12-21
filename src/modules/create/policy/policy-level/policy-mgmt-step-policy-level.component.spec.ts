import { PolicyMgmtStepPolicyLevelComponent } from './policy-mgmt-step-policy-level.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../common/shared.module';
import { FormsModule } from '@angular/forms';
import { DropdownModule, MultilevelDropdownModule } from 'tc-angular-components';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgbModule, NgbDropdownModule, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { RulesConfigurationService } from '../../../core/rules-config.service';
import { PolicyMgmtStepPolicyLevelService } from './policy-mgmt-step-policy-level.service';
import { ContextService } from '../../../core/context.service';
import { PolicyMgmtPolicyStepperDataService } from '../policy-mgmt-policy-stepper-data.service';
import { SharedDataService } from '../../../core/shared.data.service';
import { HTTPService } from '../../../core/http.service';
import { RulesMataDataService } from '../../../core/rules-meta-data.service';
import { IPolicyMetadata } from '../../../core/rules-metadata.model';
import { POLICY_METADATA_TYPE } from '../../../core/rules.constant';
import { Subject } from 'rxjs';
import { POLICY_LEVEL } from '../../../core/constants';
import { CREATE_POLICY_STEPS, POLICY_CONFIG } from '../policy-mgmt-create-policy.constant';
import { IPolicyStepContinueEvent } from '../policy-mgmt-create-policy.model';
import {
  ENTERPRISE_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_LEVEL_FILTERS,
  PROPERTY_POLICY_CREATION_LEVEL
} from '../../../core/rules-config.constant';

/**
 *  AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient) {
  /**
   * Update i18nUrl and set it for loading translations
   */

  let langApiUrl;
  langApiUrl = window['CONFIG']['apiUrl']
    .replace('{{api_module_context_path}}', 'i18n/v1')
    + 'apps/ent-policy-ui/locales/';
  return new TcTranslateService().loadTranslation(http, langApiUrl);
}
/**
 * spy stepper data service
 */
const spyStepperDataService = jasmine.createSpyObj('PolicyMgmtPolicyStepperDataService',
  ['getPolicyLevelData', 'setPolicyLevelData']);
const rateCategoryJson = require('../../../../assets-policy-mgmt/data/formatted-ratecategory-dropdown.json');
const ratePlanCategoryJson = require('../../../../assets-policy-mgmt/data/formatted-rateplan-dropdown.json');

class MockSharedDataService {
  listData: Array<IPolicyMetadata>;
  getPolicyMetadata(type) {
    if (type === POLICY_METADATA_TYPE.ratePlan) {
      this.listData = ratePlanCategoryJson;
    } else {
      this.listData = rateCategoryJson;
    }
    return this.listData;
  }
}

describe('Policy-Level Component', () => {
  let fixture: ComponentFixture<PolicyMgmtStepPolicyLevelComponent>;
  let instance: PolicyMgmtStepPolicyLevelComponent;
  let tcTranslateService: TcTranslateService;
  let contextService: ContextService;
  let translateService: TranslateService;
  beforeEach((done) => {
    TestBed.configureTestingModule({
      declarations: [
        PolicyMgmtStepPolicyLevelComponent
      ],
      imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        MultilevelDropdownModule,
        DropdownModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        NgbModule,
        NgbDropdownModule
      ],
      providers: [
        TcTranslateService,
        TranslateService,
        PolicyMgmtStepPolicyLevelService,
        ContextService,
        RulesConfigurationService,
        {
          provide: PolicyMgmtPolicyStepperDataService,
          useValue: spyStepperDataService
        },
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        },
        HTTPService,
        RulesMataDataService
      ]
    }).compileComponents()
      .then(() => {
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
        fixture = TestBed.createComponent(PolicyMgmtStepPolicyLevelComponent);
        instance = fixture.componentInstance;
        instance.continueFromStepper = new Subject<any>();
        instance.continueSubscriberRef = instance.continueFromStepper.subscribe();
        contextService = TestBed.inject(ContextService);
        done();
      });
  });

  beforeEach((done) => {
    spyOn(instance.validate, 'emit');
    instance.dropdownLabels.placeholderText = 'Filter';
    instance.dropdownLabels.customLabels = {
      selectAll: 'Select All',
      clearAll: 'Clear All',
      expandAll: 'Expand All',
      collapseAll: 'Collapse All'
    };

    instance.dropdownLabels.defaultRatePlanText = [
      { selectionText: ('Number of Rate Plans Selected').replace('{{count}}', '') },
      { selectionText: 'All RatePlans Selected' },
      { selectionText: 'Select RatePlans' }
    ];

    instance.dropdownLabels.defaultRateCategoryText = [
      { selectionText: ('Number of Rate Categories Selected').replace('{{count}}', '') },
      { selectionText: 'All Categories Selected' },
      { selectionText: 'Select Rate Catgories' }
    ];
    fixture.detectChanges();
    done();
  });

  describe('Policy - Property Level Flow', () => {
    beforeEach((done) => {
      spyStepperDataService.getPolicyLevelData.and.
        returnValue({ ...POLICY_CONFIG[POLICY_LEVEL.PROPERTY][CREATE_POLICY_STEPS.POLICY_LEVEL] });
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      done();
    });

    it('Policy Level Component instance to be defined', () => {
      expect(instance).toBeDefined();
    });
    it('expect component initialized', () => {
      expect(instance.rulesData.fields).toBeDefined();
      expect(instance.rulesData.data).toBeDefined();
    });

    it('Select Property from Radio Button List', () => {
      instance.setPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
    });

    it('Select RateCategory from Radio Button List', () => {
      instance.setPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      for (const i in selectedObject) {
        if (selectedObject[i]) {
          selectedObject[i].visible = true;
        }
      }
      instance.rulesData.fields.rateCategories = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
    });

    it('Select RatePlan from Radio Button List', () => {
      instance.setPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(ratePlanCategoryJson));
      selectedObject[0].expanded = true;
      for (const i in selectedObject[0].list) {
        if (selectedObject[0].list[i].id === '3601461') {
          selectedObject[0].list[i].selected = false;
        } else {
          selectedObject[0].list[i].selected = true;
        }
      }
      instance.rulesData.fields.ratePlans = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
    });

    it('Should throw error when none of the Radio Buttons are selected', () => {
      instance.setPolicyLevel('');
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      instance.validateStep(evt);
      expect(instance.errorObj.policyLevelErrorMessage.show).toBeTruthy();
      expect(instance.validate.emit).not.toHaveBeenCalled();
    });

    it('Select RateCategory from Radio Button and RateCategory is not selected from the List', () => {
      instance.setPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      instance.validateStep(evt);
      expect(instance.errorObj.policyLevelErrorMessage.show).toBeTruthy();
      expect(instance.validate.emit).not.toHaveBeenCalled();
    });

    it('Select RatePlan from Radio Button and RatePlans is not selected from the List', () => {
      instance.setPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      instance.validateStep(evt);
      expect(instance.errorObj.policyLevelErrorMessage.show).toBeTruthy();
      expect(instance.validate.emit).not.toHaveBeenCalled();
    });
    it('Select RatePlan from Radio Button List and select 21 Rateplans from the RatePlan List', () => {
      instance.setPolicyLevel(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(ratePlanCategoryJson));
      selectedObject[0].expanded = true;
      for (const i in selectedObject[0].list) {
        if (selectedObject[0].list[i]) {
          selectedObject[0].list[i].selected = true;
        }
      }
      instance.rulesData.fields.ratePlans = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.errorObj.policyLevelErrorMessage.show).toBeTruthy();
      expect(instance.validate.emit).not.toHaveBeenCalled();
    });

  });

  describe('Policy - Enterprise Level Flow', () => {
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
      done();
    });
    it('Select RateCatalog from Radio Button List', () => {
      spyStepperDataService.getPolicyLevelData.and.
        returnValue({ ...POLICY_CONFIG[POLICY_LEVEL.ENTERPRISE][CREATE_POLICY_STEPS.POLICY_LEVEL] });

      instance.setPolicyLevel(ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      for (const i in selectedObject) {
        if (selectedObject[i]) {
          selectedObject[i].visible = true;
        }
      }
      instance.rulesData.fields.ratePlans = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
      expect(instance.rulesData.fields.policyLevel).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG);
    });

    it('Select Chain from Radio Button List', () => {
      spyStepperDataService.getPolicyLevelData.and.
        returnValue({ ...POLICY_CONFIG[POLICY_LEVEL.ENTERPRISE][CREATE_POLICY_STEPS.POLICY_LEVEL] });

      instance.setPolicyLevel(ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      for (const i in selectedObject) {
        if (selectedObject[i]) {
          selectedObject[i].visible = true;
        }
      }
      instance.rulesData.fields.rateCategories = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
      expect(instance.rulesData.fields.policyLevel).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE);
    });

    it('Select ChainCategory from Radio Button List', () => {
      spyStepperDataService.getPolicyLevelData.and.
        returnValue({ ...POLICY_CONFIG[POLICY_LEVEL.ENTERPRISE][CREATE_POLICY_STEPS.POLICY_LEVEL] });

      instance.setPolicyLevel(ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(ratePlanCategoryJson));
      selectedObject[0].expanded = true;
      for (const i in selectedObject[0].list) {
        if (selectedObject[0].list[i].id === '3601461') {
          selectedObject[0].list[i].selected = false;
        } else {
          selectedObject[0].list[i].selected = true;
        }
      }
      instance.rulesData.fields.chainCategories = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
      expect(instance.rulesData.fields.policyLevel).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE);
    });

    it('Select EnterpriseRateCategory from Radio Button List', () => {
      spyStepperDataService.getPolicyLevelData.and.
        returnValue({ ...POLICY_CONFIG[POLICY_LEVEL.ENTERPRISE][CREATE_POLICY_STEPS.POLICY_LEVEL] });

      instance.setPolicyLevel(ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES);
      const evt: IPolicyStepContinueEvent = {
        stepNumber: 1,
        eventType: null
      };
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      for (const i in selectedObject) {
        if (selectedObject[i]) {
          selectedObject[i].visible = true;
        }
      }
      instance.rulesData.fields.rateCategories = selectedObject;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onSelectionChange(selectionObject);
      instance.validateStep(evt);
      expect(instance.validate.emit).toHaveBeenCalled();
      expect(instance.rulesData.fields.policyLevel).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY);
    });

    it('Should compare enteprise enum when enterprise flow', () => {
      //Arrange
      instance.emSelectedLevel = ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN;
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

      //Act
      const res = instance.isChecked(ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN);

      //Assert
      expect(res).toEqual(true);
    });

    it('Should compare property enum when property flow', () => {
      //Arrange
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      instance.rulesData.fields.policyLevel = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;

      //Act
      const res = instance.isChecked(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);

      //Assert
      expect(res).toEqual(true);
    });

    it('Should set emSelectedLevel to RATE_PLANS when policy level equal RATE_CATALOG', () => {
      //Arrange
      instance.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG;

      //Act
      instance.setEmPolicyLevel();

      //Assert
      expect(instance.emSelectedLevel).toEqual(ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS);
    });

    it('Should set emSelectedLevel to RATE_CATEGORIES when policy level equal EM_RATE_CATEGORY', () => {
      //Arrange
      instance.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY;

      //Act
      instance.setEmPolicyLevel();

      //Assert
      expect(instance.emSelectedLevel).toEqual(ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES);
    });

    it('Should set emSelectedLevel to CHAIN when policy level equal ENTERPRISE and no ChainIds', () => {
      //Arrange
      instance.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      spyStepperDataService.policyResponseModel = {chainCategoryIds: []};

      //Act
      instance.setEmPolicyLevel();

      //Assert
      expect(instance.emSelectedLevel).toEqual(ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN);
    });

    it('Should set emSelectedLevel to CHAIN_CATEGORIES when policy level equal ENTERPRISE and ChainIds', () => {
      //Arrange
      instance.rulesData.fields.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      spyStepperDataService.policyResponseModel = {chainCategoryIds: [1234]};

      //Act
      instance.setEmPolicyLevel();

      //Assert
      expect(instance.emSelectedLevel).toEqual(ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES);
    });
  });
});
