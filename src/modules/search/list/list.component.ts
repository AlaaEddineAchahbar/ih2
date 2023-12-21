import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { PolicyMgmtListParsingService } from './policy-mgmt-list-parsing.service';
import {
  ITemplateSearchListModel, IPolicySearchListModel, IPaginationModel,
  IDepositConfigurationListModel, IEMTemplateSearchListModel
} from './policy-mgmt-list.model';
import { TranslationMap } from '../../core/translation.constant';
import { CONFIG_TYPE, POLICY_FLOW, DEFAULT_VALUES, POLICY_LEVEL } from '../../core/constants';
import { PolicyMgmtSearchService } from '../policy-mgmt-search.service';
import { RouteStateService } from '../../core/route.state.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IHttpErrorResponse, IErrorMessage, IPostApiResponse } from '../../core/common.model';
import { STATUS_LIST, PROPERTY_POLICY_CREATION_LEVEL, ENTERPRISE_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';
import {
  IEmPaymentDepositRulesResponseModel,
  IPolicySearchRepsonseModel,
  IListSearchParams,
  IEMPolicySearchResponseModel,
  IEMTemplateResponseModel,
  ISearchEMTemplateParams,
  IPaymentDepositRulesResponseModel
} from '../policy-mgmt-search.model';
import { TcTranslateService } from 'tc-angular-services';
import { IPolicyTemplateRouteParams, ITemplateResponseModel } from '../../create/template/policy-mgmt-create-template.model';
import { PolicyMgmtListDetailsModalComponent } from './list-details-modal/policy-mgmt-list-details-modal.component';
import { STYLE_ATTR } from './policy-mgmt-list.constant';
import {
  IPolicyRouteParams, IPolicyResponseModel,
  IPolicyCreateResponseModel
} from '../../create/policy/policy-mgmt-create-policy.model';
import { PolicyMgmtCreatePolicyService } from '../../create/policy/policy-mgmt-create-policy.service';
import { OPERATION_TYPES, RULE_STATUS } from '../../core/rules.constant';
import { PolicyMgmtSearchPolicyService } from '../policy-mgmt-search-policies.service';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { PolicyMgmtConfirmationModalComponent } from '../../common/confirmation-modal/confirmation-modal.component';
import { VersionHistoryComponent } from '../../common/version-history/version-history.component';
import { LinkedPolicyTemplatesErrorComponent } from './linked-policy-templates-error/linked-policy-templates-error.component';
import { PolicyMgmtCreateTemplateService } from '../../create/template/policy-mgmt-create-template.service';
import { CopyCloneErrorDetailsComponent } from './copy-clone-error-details/copy-clone-error-details.component';

import { SharedDataService } from 'src/modules/core/shared.data.service';

@Component({
  selector: 'policy-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnChanges {
  listRules: any;

  /**
   * Output events
   */
  @Output() search: EventEmitter<IListSearchParams> | EventEmitter<ISearchEMTemplateParams> = new EventEmitter();

  @Output() filter: EventEmitter<IListSearchParams> = new EventEmitter();

  /**
   * Holds search list response data
   */
  @Input() searchListData: Array<ITemplateResponseModel> | Array<IEMPolicySearchResponseModel> | Array<IPolicySearchRepsonseModel> |
    Array<IEmPaymentDepositRulesResponseModel> | Array<IPaymentDepositRulesResponseModel> | Array<IEMTemplateResponseModel>;

  /**
   * Holds pagination configuration for pagination
   */
  @Input() paginationConfig: IPaginationModel;

  /**
   * child reference of list-details modal
   */
  @ViewChild(PolicyMgmtListDetailsModalComponent, { static: false }) listDetailsModal: PolicyMgmtListDetailsModalComponent;

  /**
   * child reference of confirmation modal
   */
  @ViewChild(PolicyMgmtConfirmationModalComponent, { static: false }) confirmationModal: PolicyMgmtConfirmationModalComponent;

  /**
   * Child reference of Version History Modal
   */
  @ViewChild(VersionHistoryComponent, { static: false }) versionHistoryModal: VersionHistoryComponent;

  /**
   * Child reference of Copy Clone Error Details Modal
   */
  @ViewChild(CopyCloneErrorDetailsComponent, { static: false }) copyCloneErrorDetailsModal: CopyCloneErrorDetailsComponent;

  /**
   * Child reference of Linked Policy Templates Error Modal
   */
  @ViewChild(LinkedPolicyTemplatesErrorComponent, { static: false }) linkedPolicyTemplatesErrorModal: LinkedPolicyTemplatesErrorComponent;

  /**
   * Holds parsed list data
   */
  listData: Array<ITemplateSearchListModel> | Array<IPolicySearchListModel> |
    Array<IDepositConfigurationListModel> = [];

  /**
   * Holds Translation map
   */
  translationMap: any;

  /**
   * Holds config type: Template/Policy
   */
  configType: string;

  /**
   * Holds Config Type Enum
   */
  configTypeEnum: any;

  /**
   * Holds Status List
   */
  statusList: any;
  managePolicyType: string;
  searchRecordInfo: string;
  getCopyCloneErrorDetailsRecord: string;

  /**
   * Holds flag whether user has edit access or not
   */
  hasEditAccess: boolean;

  /**
   * Holds List Style attributes, ex.breakLine
   */
  listStyleAttr: any;

  /**
   * Error Toaster related fields
   */
  showToastFlag: boolean;
  apiErrorMessageDetails: IErrorMessage;

  /**
   * Holds selected policy/template data
   */
  selectedItem: ITemplateSearchListModel | IPolicySearchListModel | IDepositConfigurationListModel | IEMTemplateSearchListModel;

  /**
   *  define confirmation modal button labels
   */
  confirmationModalButtonLabel: object;

  /**
   * To display Installment sections
   */
  enabledInstallmentFlag: boolean;

  /**
   * Indicates if enterprise level
   */
  isEnterpriseLevel: boolean;

  /**
   * Holds buttons Labels
   */
  EditLabel: string;
  ViewLabel: string;

  constructor(
    private contextService: ContextService,
    private rulesConfigService: RulesConfigurationService,
    private parseDataService: PolicyMgmtListParsingService,
    private searchService: PolicyMgmtSearchService,
    private routeStateService: RouteStateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TcTranslateService,
    private createPolicyService: PolicyMgmtCreatePolicyService,
    private searchPolicyService: PolicyMgmtSearchPolicyService,
    private errorService: PolicyMgmtErrorService,
    private sharedDataService: SharedDataService,
    private createPolicyTemplateService: PolicyMgmtCreateTemplateService
  ) {
    this.translationMap = TranslationMap;
    this.configType = this.contextService.configType;
    this.configTypeEnum = CONFIG_TYPE;
    this.statusList = STATUS_LIST;
    this.listStyleAttr = STYLE_ATTR;

    this.hasEditAccess = this.contextService.hasEditAccess();
    // set default values to error toaster
    this.showToastFlag = false;
    this.apiErrorMessageDetails = {
      show: true,
      message: {}
    };
    this.confirmationModalButtonLabel = {
      ok: 'EDIT',
      cancel: 'CANCEL'
    };
  }

  ngOnInit(): void {
    this.listRules = this.rulesConfigService.getSearchListConfigData(
      this.contextService.policyLevel,
      this.contextService.configType,
      this.contextService.policyType
    ).fields;

    if (this.configType === CONFIG_TYPE.TEMPLATE) {
      const policyType = 'MANAGE_' + this.contextService.policyType.toUpperCase() + '_POLICY';
      this.managePolicyType = this.translate.translateService.instant(this.translationMap[policyType]);
    }

    this.setSearchRecordInfo();
    this.enabledInstallmentFlag = this.searchService.setEnableInstallment();
    this.isEnterpriseLevel = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;

    this.EditLabel = this.translate.translateService.instant(this.translationMap['EDIT']);
    this.ViewLabel = this.translate.translateService.instant(this.translationMap['VIEW']);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchListData?.currentValue && changes.searchListData.currentValue?.length) {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          this.listData = this.parseDataService.parseTemplateListData(this.searchListData as Array<ITemplateResponseModel>);
        } else {
          this.listData = this.parseDataService.parseEMTemplateListData(this.searchListData as Array<IEMTemplateResponseModel>);
        }
      } else if (this.contextService.configType === CONFIG_TYPE.POLICY) {
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          this.listData = this.parseDataService
            .parsePropertyPolicyListData(this.searchListData as Array<IPolicySearchRepsonseModel>);
        } else {
          this.listData = this.parseDataService.parseEMPolicyListData(this.searchListData as Array<IEMPolicySearchResponseModel>);
        }
      } else if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
        if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
          this.listData = this.parseDataService.parseDepositConfigurationListData(
            this.searchListData as Array<IPaymentDepositRulesResponseModel>);
        }
        else {
          this.listData = this.parseDataService.parseEmDepositConfigurationListData(
            this.searchListData as Array<IEmPaymentDepositRulesResponseModel>);
        }
      }
    } else {
      this.listData = [];
    }
  }

  /**
   * Edits template for selected templateId
   */
  editItem(data: ITemplateSearchListModel | IPolicySearchListModel | IDepositConfigurationListModel) {
    let id = null;
    if (this.configType === CONFIG_TYPE.TEMPLATE) {
      id = data.id.toString();
      if (!this.isEnterpriseLevel) {
        let templateData = data as ITemplateSearchListModel;
        const params: IPolicyTemplateRouteParams = {
          isTemplateAtEnterpriseLevel: templateData.isCreatedAtEnterpriseLevel,
        };
        this.routeStateService.setSelectedPolicyTemplateParams(params);
      }
    } else {
      id = data.id;
      const params: IPolicyRouteParams = {
        policyName: data.name,
        policyRuleIds: [id]
      };
      if (data.ids) {
        params.policyRuleIds = data.ids;
      }
      this.routeStateService.setSelectedPolicyParams(params);
    }
    this.goToSpecificRoute(POLICY_FLOW.EDIT, this.configType, id);
  }

  /**
   * redirects to edit route
   * @param id: template id
   */
  goToSpecificRoute(policyFlow: string, configType: string, id?: string) {
    let routeUrl = policyFlow + '/' + configType;
    routeUrl = this.routeStateService.getNavigateRouteUrl(routeUrl);
    if (id) {
      this.router.navigate([routeUrl], { queryParams: { id }, relativeTo: this.activatedRoute });
    } else {
      this.router.navigate([routeUrl], { relativeTo: this.activatedRoute });
    }
  }

  /**
   * redirects to policy screen
   */
  managePolicy() {
    this.goToSpecificRoute(POLICY_FLOW.SEARCH, CONFIG_TYPE.POLICY);
  }

  /**
   * Make Policy / Policy Template as Active / Inactive
   */
  makeActiveInactive(rowObj: ITemplateSearchListModel | IPolicySearchListModel) {
    this.selectedItem = rowObj;
    const id = Number(rowObj.id);
    const status = rowObj.status === STATUS_LIST.ACTIVE ? STATUS_LIST.INACTIVE : STATUS_LIST.ACTIVE;
    if (this.configType === CONFIG_TYPE.TEMPLATE) {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        this.searchService.updateStatus(id, status)
          .subscribe((res) => {
            this.getUpdatedPagination();
          }, (error: IHttpErrorResponse) => {
          });
      } else {
        const policyTemplates = this.searchListData as IEMTemplateResponseModel[];
        const policyTemplateToUpdate = policyTemplates.find(({ emPolicyTemplateId }) => emPolicyTemplateId === rowObj.id);
        policyTemplateToUpdate.status = status;
        this.createPolicyTemplateService.createUpdatePolicyTemplate(policyTemplateToUpdate, id)
          .subscribe({
            error: (error: IHttpErrorResponse) => {
              this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
              this.showToastFlag = true;
            },
            complete: () => {
              this.getUpdatedPagination();
            },
          });
      }
    } else {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        // This will work for activating/inactivating Property Policies.

        // Make expired policy to active.
        if (rowObj.status === STATUS_LIST.EXPIRED) {
          this.confirmationModal.open('EXPIRED_POLICY_MODAL_MSG', 'WARNING', null, null, false,
            this.confirmationModalButtonLabel);
        } else {
          // Make active policy to inactive or inactive policy to active.
          this.makeactiveInactivePolicy(rowObj);
        }
      } else {
        const policies = this.searchListData as IEMPolicySearchResponseModel[];

        const policyToUpdate = policies.find(({ groupName }) => groupName === rowObj.name);
        const requestData: IPolicyResponseModel = {
          groupname: policyToUpdate.groupName,
          level: policyToUpdate.policyLevel,
          operation: OPERATION_TYPES.update,
          policyTemplateName: policyToUpdate.policyTemplateName,
          rules: policyToUpdate.rules
        };
        requestData.rules.forEach(element => {
          element.activeStatus = status === STATUS_LIST.INACTIVE ? RULE_STATUS.INACTIVE : status;
        });
        this.createPolicyService.createUpdatePolicy(requestData).subscribe({
          error: (error: IHttpErrorResponse) => {
            this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
            this.showToastFlag = true;
          },
          complete: () => {
            this.getUpdatedPagination();
          },
        });
      }
    }
  }

  /**
   * This will make active policy to inactive or inactive policy to active.
   * @param rowPolicy: single policy data from list of policies
   */

  async makeactiveInactivePolicy(rowPolicy: ITemplateSearchListModel | IPolicySearchListModel) {
    const policyRouteParams: IPolicyRouteParams = {};
    policyRouteParams.policyName = rowPolicy.name;
    let policyData: IPolicyResponseModel;
    await this.createPolicyService.getPolicyResponseData(policyRouteParams).toPromise()
      .then((response: IPolicyResponseModel) => {
        if (response) {
          policyData = response;
          policyData.rules.forEach(rule => {
            rule.activeStatus = rule.activeStatus === RULE_STATUS.ACTIVE ? RULE_STATUS.INACTIVE : RULE_STATUS.ACTIVE;
          });
        }
      }).catch((error: IHttpErrorResponse) => {
        this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
        this.showToastFlag = true;
      });

    // bulk-upsert API call for inactivating/activating policy
    this.createPolicyService.createUpdatePolicy(policyData)
      .subscribe({
        next: (res: IPolicyCreateResponseModel) => {
          this.searchPolicyService.setPolicySearchData([]);
          this.getUpdatedPagination();

        }, error: (error: IHttpErrorResponse) => {
          this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
          this.showToastFlag = true;
        }
      });
  }

  /**
   * On confirmation modal OK click
   * @param evt: expired policy row data
   */
  onModalOk(evt: ITemplateSearchListModel | IPolicySearchListModel | IDepositConfigurationListModel) {
    if (this.selectedItem) {
      this.editItem(this.selectedItem);
    }
  }

  /**
   * On confirmation modal CANCEL click
   * @param evt: confirmation modal type
   */
  onModalCancel(evt?: any) {
    this.selectedItem = null;
  }

  /**
   * Event to be triggered when pageChange using page numbers / arrow buttons.
   */
  loadPage(currentPage: any) {
    let searchPayload: IListSearchParams = {};
    let searchEMPayload: ISearchEMTemplateParams = {};
    const startIndex = ((currentPage - 1) * this.paginationConfig.pageSize) + 1;
    const isEnterpriseTemplateLevel = this.isEnterpriseLevel && this.contextService.configType === CONFIG_TYPE.TEMPLATE;
    if (isEnterpriseTemplateLevel) {
      searchEMPayload.offSet = startIndex;
      this.search.emit(searchEMPayload);
    } else if (this.contextService.configTypeName === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
      searchPayload.pageIndex = startIndex;
      this.filter.emit(searchPayload);
    } else {
      searchPayload.pageIndex = startIndex;
      this.search.emit(searchPayload);
    }
  }

  /**
   * Views details in modal
   * @param key: key
   * @param list: list
   */
  viewDetails(listCardData: IPolicySearchListModel, key: string) {
    let list = [];
    let headerLabel: string;

    if (key === 'date') {
      list = listCardData.dateRangeList;
      headerLabel = TranslationMap.POLICY_ACTIVE_DATES;
    } else if (key === 'level') {
      list = listCardData.linkedMetaDataList;

      if (listCardData.level === PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN ||
        listCardData.level === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG) {
        headerLabel = TranslationMap.RATEPLANS;
      } else if (listCardData.level === PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY ||
        listCardData.level === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY) {
        headerLabel = TranslationMap.RATECATEGORIES;
      }
      else if (listCardData.level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
        headerLabel = TranslationMap.CHAINCATEGORIES;
      }
    }

    const translatedHeaderLabel = this.translate.translateService.instant(headerLabel);
    this.listDetailsModal.open(list, translatedHeaderLabel);
  }

  /**
   * Returns policy level label to display.
   * @param level: policy level
   */
  getPolicyLevelLabel(level: string) {
    let levelLabel;

    if (level === PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN || level === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG) {
      levelLabel = TranslationMap.VIEW_RATE_PLANS;
    } else if (level === PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY || level === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY) {
      levelLabel = TranslationMap.VIEW_RATE_CATEGORIES;
    } else if (level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
      levelLabel = TranslationMap.VIEW_CHAIN_CATEGORIES;
    } else {
      levelLabel = '';
    }

    return this.translate.translateService.instant(levelLabel);
  }

  /**
   * Get updated pagination after active/inactive Policy or Policy Template
   */
  getUpdatedPagination() {
    // Calculate lastPage in Pagination
    const lastPage = Math.ceil(this.paginationConfig.collectionSize / this.paginationConfig.pageSize);
    if (lastPage === this.paginationConfig.page && this.listData.length === 1) {
      /**
       * If currentPage = lastPage of Pagination and listData has only 1 element and
       *  1. If currentPage = 1 then pass Default Page Value to loadPage function
       *  2. If currentPage != 1 then subtract 1 from currentPage which will load it's previousPage.
       */
      if (this.paginationConfig.page === DEFAULT_VALUES.searchScreen.pagination.page) {
        this.loadPage(DEFAULT_VALUES.searchScreen.pagination.page);
      } else {
        this.loadPage(this.paginationConfig.page - 1);
      }
    } else {
      // If currentPage != lastPage of Pagination and listData has more than 1 element
      // then pass currentPage to loadPage function
      this.loadPage(this.paginationConfig.page);
    }
  }

  /**
   * calls version history component instance to open version history modal for template/policy
   * @param id: template/policy id
   */
  viewVersionHistory(id: number) {
    this.versionHistoryModal.open(id);
  }

  /**
   * Calls copy clone error details component instance
   * to open copy clone error details modal for enterprise template
   * @param jobId
   * @param jobInfo
   */
  viewCoppyClonErrorDetails(jobId: any, failedHotelsCount: number, totalHotelsCount: number) {
    this.copyCloneErrorDetailsModal.open(jobId, failedHotelsCount, totalHotelsCount, this.sharedDataService.getChainInfo());
  }

  setSearchRecordInfo() {
    if (this.configType === CONFIG_TYPE.TEMPLATE) {
      if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
        this.getCopyCloneErrorDetailsRecord = TranslationMap.PROPERTIES_FAILED_OUT_OF_TOTAL_COUNT;
      }
      this.searchRecordInfo = TranslationMap.TEMPLATE_SEARCH_RECORDS_INFO;
    } else if (this.configType === CONFIG_TYPE.POLICY) {
      this.searchRecordInfo = TranslationMap.POLICY_SEARCH_RECORDS_INFO;
    } else {
      this.searchRecordInfo = TranslationMap.PAYMENT_DEPOSIT_RULES_SEARCH_RECORDS_INFO;
    }
  }


  deleteDepositConfiguration(index: number) {
    if (this.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
      let depositConfigurationList;
      if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
        depositConfigurationList = this.searchListData as Array<IEmPaymentDepositRulesResponseModel>;
      } else {
        depositConfigurationList = this.searchListData as Array<IPaymentDepositRulesResponseModel>;
      }
      let paymentDepositConfiguration = depositConfigurationList[index];
      this.searchService.setDeleteStatus(paymentDepositConfiguration)
        .subscribe({
          error: (error: IHttpErrorResponse) => {
            const errorCode: string = error.error.errors[0].errorCode;
            if (errorCode === 'DEPOSIT_RULE_DELETION_ERROR'
              || errorCode === 'INVALID_DEPOSIT_RULE_ID_LINKED_TO_DEPOSIT_TEMPLATES') {
              const errorMessage: string = error.error.errors[0].message;
              this.linkedPolicyTemplatesErrorModal.openModalPopUp(errorMessage);
            } else {
              this.apiErrorMessageDetails = this.errorService.setErrorMessage(error.error.errors);
              this.showToastFlag = true;
            }
          },
          complete: () => {
            this.getUpdatedPagination();
          },
        });
    }
  }

  /**
   * Method to display view or edit according to level assignement creation
   * @param isCreatedAtEnterpriseLevel
   * @returns: string as View or Edit
   */
  displayViewOrEditButton(isCreatedAtEnterpriseLevel: boolean): string {
    if (this.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
      return isCreatedAtEnterpriseLevel || !this.contextService.hasEditAccess() ? this.ViewLabel : this.EditLabel;
    }
    return isCreatedAtEnterpriseLevel ? this.ViewLabel : this.EditLabel;
  }

  /**
   * Method to display delete button according to level assignement creation
   * @param isCreatedAtEnterpriseLevel
   * @returns: true if Deposit configuration created at property level
   */
  displayDeleteButton(isCreatedAtEnterpriseLevel: boolean): boolean {
    if (this.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
      return (!this.isEnterpriseLevel && isCreatedAtEnterpriseLevel) || !this.hasEditAccess ? false : true;
    }
    return false;
  }

  /**
   * Method to display history log button according to item context creation.
   * @param isCreatedAtEnterpriseLevel 
   * @returns false if item is created at enterprise level and context is property level, otherwise true
   */
  displayHistoryLogButton(isCreatedAtEnterpriseLevel: boolean): boolean {
    if (this.configType !== CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
      return !this.isEnterpriseLevel && isCreatedAtEnterpriseLevel ? false : true;
    }
    return false;
  }

  /**
   * Method to determine whether to display or disable the action button based on level assignment creation
   * @param isCreatedAtEnterpriseLevel
   * @returns true if Deposit configuration created at property level, false otherwise
   */
  manageActionButton(isCreatedAtEnterpriseLevel: boolean): boolean {
    if (this.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
      return (!this.isEnterpriseLevel && isCreatedAtEnterpriseLevel) || !this.hasEditAccess ? false : true;
    }
    else {
      return !this.isEnterpriseLevel && isCreatedAtEnterpriseLevel ? false : true;
    }
  }
}
