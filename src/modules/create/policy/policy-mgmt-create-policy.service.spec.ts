import { TestBed } from '@angular/core/testing';
import { ContextService } from 'src/modules/core/context.service';
import { HTTPService } from 'src/modules/core/http.service';
import { PolicyMgmtSearchPayloadService } from 'src/modules/core/search-payload.service';
import { SharedDataService } from 'src/modules/core/shared.data.service';
import { PolicyMgmtCreatePolicyService } from './policy-mgmt-create-policy.service';
import { API_CONTEXT_PATH, API_RESPONSE_CODE, POLICY_LEVEL, POLICY_TYPE, POLICY_TYPE_FOR_API } from 'src/modules/core/constants';
import { IPolicyResponseModel, IPolicyRouteParams } from './policy-mgmt-create-policy.model';
import { HttpClient, HttpEventType, HttpHandler, HttpResponse } from '@angular/common/http';
import { RulesMataDataService } from 'src/modules/core/rules-meta-data.service';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { IEMPolicySearchResponseModel } from 'src/modules/search/policy-mgmt-search.model';
import { OPERATION_TYPES } from 'src/modules/core/rules.constant';
import { IChainInfo, IHotelInfo } from 'src/modules/core/common.model';

describe('Policy Create Service', () => {
  let instance: PolicyMgmtCreatePolicyService;
  let sharedDataService: SharedDataService;
  let contextService: ContextService;
  let httpService: HTTPService;

  const chainInfo : IChainInfo = {
    chainId: 0,
    chainCode: 'CODE',
    chainName: '',
    status: '',
    creationDateTime: '',
    creationBy: '',
    lastUpdateDateTime: '',
    lastUpdateBy: '',
    timezone: '',
    categories: [],
    chainHotels: [],
    adminUsers: []
  };

  const hotelInfo : IHotelInfo = {
    hotelCode: 0,
    hotelName: 'Hname',
    chainCode: 'HCOE',
    bid: 0,
    timezone: '',
    gmtOffset: 0,
    unitOfMeasurement: '',
    latitude: '',
    longitude: '',
    languages: [],
    currencies: [],
    hotelSettings: undefined,
    roomTypes: []
  };

  const data: IPolicyResponseModel = {
    groupname: 'grp',
    level: 'level',
    operation: 'op',
    policyTemplateName: 'name',
    rules: [],
    chainCategoryIds: [],
    emRateCategoryIds: [],
    rateCatalogIds: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      imports: [
      ],
      providers: [
        HTTPService,
        ContextService,
        SharedDataService,
        PolicyMgmtSearchPayloadService,
        PolicyMgmtCreatePolicyService,
        HttpClient,
        HttpHandler,
        RulesMataDataService
      ]
    }).compileComponents();
    instance = TestBed.inject(PolicyMgmtCreatePolicyService);
    sharedDataService = TestBed.inject(SharedDataService);
    sharedDataService.setChainInfo(chainInfo);
    sharedDataService.setHotelInfo(hotelInfo);
    contextService = TestBed.inject(ContextService);
    contextService.setPolicyType('policy_type');
    httpService = TestBed.inject(HTTPService);
  });

  it('Should call httpservice get when getPolicyResponseData is called with policy level as Enterprise', () => {
    // Arrange
    spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.ENTERPRISE);
    spyOnProperty(contextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
    spyOn(sharedDataService, 'getChainInfo').and.returnValue({
      chainId: 1,
      chainCode: 'AAM',
      chainName: 'AAM',
      status: 'Active',
      creationDateTime: '',
      creationBy: '',
      lastUpdateDateTime: '',
      lastUpdateBy: '',
      timezone: '',
      categories: [],
      chainHotels: [],
      adminUsers: []
    });
    const httpResponse: HttpResponse<Object> = new HttpResponse();
    spyOn(httpService, 'get').and.returnValue(of(httpResponse));
    const routeParam: IPolicyRouteParams = {
      policyRuleIds: ['12345', '67890']
    };

    // Act
    const result = instance.getPolicyResponseData(routeParam);

    // Assert
    expect(httpService.get).toHaveBeenCalledOnceWith('enterprise/AAM/policy/CANCEL?policyIds=12345,67890', API_CONTEXT_PATH.POLICY_MGMT);
  });

  it('Should return IPolicyResponseModel when calling mapGetPolicyResponse and policy leveL as ENTERPRISE', () => {
    // Arrange
    spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.ENTERPRISE);
    const emPolicyResponse: IEMPolicySearchResponseModel = {
      groupName: 'groupName',
      policyTemplateId: 'policyTemplateId',
      policyTemplateName: 'policyTemplateName',
      policyTemplateCode: 'policyTemplateCode',
      policyType: 'policyType',
      policyDateRange: 'policyDateRange',
      policyStatus: 'policyStatus',
      policyLevel: 'policyLevel',
      rateCatalogIds: [],
      emRateCategoryIds: [],
      chainCategoryIds: [],
      dow: 'dow',
      rules: []
    };
    const init = {
      body: emPolicyResponse,
      status: API_RESPONSE_CODE.GET_SUCCESS,
    };
    const httpResponse: HttpResponse<IEMPolicySearchResponseModel> = new HttpResponse<IEMPolicySearchResponseModel>(init);

    // Act
    const result = instance.mapGetPolicyResponse(httpResponse);

    // Assert
    const policyResponseModel = result as IPolicyResponseModel;
    expect(policyResponseModel.groupname).toEqual(emPolicyResponse.groupName);
    expect(policyResponseModel.operation).toEqual(OPERATION_TYPES.update);
    expect(policyResponseModel.level).toEqual(emPolicyResponse.policyLevel);
    expect(policyResponseModel.policyTemplateName).toEqual(emPolicyResponse.policyTemplateName);
    expect(policyResponseModel.rateCatalogIds).toEqual(emPolicyResponse.rateCatalogIds);
    expect(policyResponseModel.emRateCategoryIds).toEqual(emPolicyResponse.emRateCategoryIds);
    expect(policyResponseModel.chainCategoryIds).toEqual(emPolicyResponse.chainCategoryIds);
    expect(policyResponseModel.rules).toEqual(emPolicyResponse.rules);
  });

  it('Should call Enterprise API when policy level is set to Enterprise', () => {
    //Arrange
    spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.ENTERPRISE);

    spyOn(httpService, 'put').and.callThrough();
    const url = 'enterprise/' + sharedDataService.getChainInfo().chainCode + '/policy/'
    + POLICY_TYPE_FOR_API[contextService.policyType] + '/bulk-upsert';

    //Act
    instance.createUpdatePolicy(data);

    //Assert
    expect(httpService.put).toHaveBeenCalledWith(url, data, API_CONTEXT_PATH.POLICY_MGMT);

    });

    it('Should call Property API when policy level is set to Property', () => {
      //Arrange
      spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.PROPERTY);

      spyOn(httpService, 'put').and.callThrough();
      const url = 'hotels/' + sharedDataService.getHotelInfo().hotelCode + '/policy/'
      + POLICY_TYPE_FOR_API[contextService.policyType] + '/bulk-upsert';

      //Act
      instance.createUpdatePolicy(data);

      //Assert
      expect(httpService.put).toHaveBeenCalledWith(url, data, API_CONTEXT_PATH.POLICY_MGMT);

      });
});
