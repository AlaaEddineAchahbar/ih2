import { PolicyMgmtCreateTemplateService } from './policy-mgmt-create-template.service';
import { TestBed, async, waitForAsync } from '@angular/core/testing';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { SharedDataService } from '../../core/shared.data.service';
import { HTTPService } from '../../core/http.service';
import { ContextService } from '../../core/context.service';
import { POLICY_LEVEL, POLICY_TYPE, POLICY_FLOW, API_CONTEXT_PATH, POLICY_TYPE_FOR_API } from '../../core/constants';
import { IHttpErrorResponse, IHTTPResponse, IDropDownItem } from '../../core/common.model';
import { Observable, of } from 'rxjs';
import { IDepositRuleDetailsModel, ITemplateResponseModel, IOtaSetting, IpolicySetting } from './policy-mgmt-create-template.model';
import { OTA_CANCELLATION_CHARGE_OPTIONS } from '../../core/rules-config.constant';


const depositRuleDetailInfo = require('../../../assets-policy-mgmt/data/policy-template/getDepositRules/deposit-rule-details.json');
const depoRuleInfoEmpty = require('../../../assets-policy-mgmt/data/policy-template/getDepositRules/deposit-ruleinfo-empty.json');
const getCancellationTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/cancellation.json');
const getGuaranteeTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/guarantee.json');
const getDepositTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/deposit.json');
const postTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/postTemplate/guarantee.json');
const deposRuleListJson = require('../../../assets-policy-mgmt/data/policy-template/getDepositRules/deposit-rules.json');

const CancelEnterpriseTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/enterprise_cancellation.json');
const GuaranteeEnterpriseTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/enterprise_guarantee.json');
const DepositEnterpriseTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/getTemplate/enterprise_deposit.json');

const entCancellationCreateTemplateJson = require('../../../assets-policy-mgmt/data/policy-template/postTemplate/entCancelCreateRq.json');
const entDepositRuleNameList = require('../../../assets-policy-mgmt/data/policy-template/getDepositRules/ent-dr-name-list.json');
const entDepositRuleGetById = require('../../../assets-policy-mgmt/data/policy-template/getDepositRules/ent-dr-get-by-id.json');
const entDepositRuleMappedResponse = require('../../../assets-policy-mgmt/data/policy-template/getDepositRules/ent-dr-mapped-res.json');

const chainCode: string = 'AAM';
const hotelCode: number = 1098;

const errorObject: IHttpErrorResponse = {
    status: 404,
    statusText: 'OK',
    error: 'Error'
};

/**
 * Mock SharedDataService
 */
class MockSharedDataService {
    depositRuleList: Array<IDropDownItem>;
    getHotelInfo() {
        const hotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');
        return hotelInfo;
    }

    getChainInfo() {
        const chainInfo = require('../../../assets-policy-mgmt/data/chain-info.json');
        return chainInfo;
    }

    setDepositRulesList(data: Array<IDropDownItem>) {
        this.depositRuleList = data;
    }

    getDepositRulesList() {
        return this.depositRuleList;
    }
}

/**
 * mock PolicyMgmtCreateTemplateService
 */
class MockHttpService {
    response: IHTTPResponse;
    get(urlPath) {
        if (urlPath === 'hotels/1098/depositrule/66047') {
            this.response = {
                status: 200,
                body: depositRuleDetailInfo
            };
        } else if (urlPath === 'hotels/1098/depositrule/66053') {
            this.response = {
                status: 200,
                body: depoRuleInfoEmpty
            };
        } else if (urlPath === 'hotels/1098/depositrules') {
            this.response = {
                status: 200,
                body: deposRuleListJson
            };
        } else if (urlPath === 'hotels/1098/policy-template/CANCEL/1000') {
            this.response = {
                status: 200,
                body: getCancellationTemplateJson
            };
        } else if (urlPath === 'hotels/1098/policy-template/GUARANTEE/2000') {
            this.response = {
                status: 200,
                body: getGuaranteeTemplateJson
            };
        } else if (urlPath === 'hotels/1098/policy-template/DEPOSIT/3000') {
            this.response = {
                status: 200,
                body: getDepositTemplateJson
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }

    post(urlPath) {
        if (urlPath === 'hotels/1098/policy-template/GUARANTEE') {
            this.response = {
                status: 200,
                body: postTemplateJson
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
    put(urlPath) {
        if (urlPath === 'hotels/1098/policy-template/GUARANTEE/1000') {
            this.response = {
                status: 200,
                body: postTemplateJson
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
}

describe('Create Template Service initialized', () => {
    let createTemplateService: PolicyMgmtCreateTemplateService;
    let contextService: ContextService;
    let sharedDataService: SharedDataService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
                {
                    provide: HTTPService,
                    useClass: MockHttpService
                },
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                ContextService,
                PolicyMgmtCreateTemplateService

            ]
        });
        createTemplateService = TestBed.get(PolicyMgmtCreateTemplateService);
        contextService = TestBed.get(ContextService);
        sharedDataService = TestBed.get(SharedDataService);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
    }));
    it('Should Create Mock PolicyMgmtCreateTemplateService ', () => {
        expect(createTemplateService).toBeTruthy();
    });

    it('Should return Deposit Rule Details for Valid RuleId', () => {
        createTemplateService.getDepositRuleDetails(66047).subscribe((res: IDepositRuleDetailsModel) => {
            expect(res).toEqual(depositRuleDetailInfo);
        });
    });

    it('Should return Empty Deposit Rule Info for Valid RuleId', () => {
        createTemplateService.getDepositRuleDetails(66053).subscribe((res: IDepositRuleDetailsModel) => {
            expect(res).toEqual(depoRuleInfoEmpty);
        });
    });

    it('Should Return Error for Invalid RuleId', () => {
        createTemplateService.getDepositRuleDetails(200).subscribe((res: any) => {
            expect(res.status).toEqual(404);
        });
    });

    it('Should GET Template for Cancellation', () => {
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        createTemplateService.getTemplateResponseData(1000).subscribe((res: ITemplateResponseModel) => {
            expect(res.policySetting.otaSetting.otaChargeAmount).toBeNull();
            expect(res.policySetting.otaSetting.otaChargePercentage).toBeNull();
            expect(res.policySetting.otaSetting.otaChargeType).toEqual(OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX);
        });
    });

    it('Should GET Template for Guarantee', () => {
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        createTemplateService.getTemplateResponseData(2000).subscribe((res: ITemplateResponseModel) => {
            expect(res.policySetting.holdTime).toBeNull();
        });
    });

    it('Should GET Template for Deposit', () => {
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        createTemplateService.getTemplateResponseData(3000).subscribe((res: ITemplateResponseModel) => {
            expect(res.policySetting.depositRuleId).toBeNull();
        });
    });

    it('Should POST Template for Guarantee', () => {
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);
        createTemplateService.createUpdatePolicyTemplate(postTemplateJson).subscribe((res: any) => {
            expect(res).toEqual(postTemplateJson);
        });
    });

    it('Should UPDATE Template for Guarantee', () => {
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyFlow(POLICY_FLOW.EDIT);
        createTemplateService.createUpdatePolicyTemplate(postTemplateJson, 1000).subscribe((res: any) => {
            expect(res).toEqual(postTemplateJson);
        });
    });

    it('Should Call loadDepositRuleListInfo ', async () => {
        const result = await createTemplateService.loadDepositRuleListInfo();
        const depositRuleList = sharedDataService.getDepositRulesList();
        expect(result.depositRuleListObservable).toEqual(depositRuleList);
    });

});

describe('Enterprise create template service', () => {
    let createTemplateService: PolicyMgmtCreateTemplateService;
    let contextService: ContextService;
    let httpService: HTTPService;
    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                ContextService,
                PolicyMgmtCreateTemplateService,
                HTTPService

            ]
        });
        createTemplateService = TestBed.inject(PolicyMgmtCreateTemplateService);
        contextService = TestBed.inject(ContextService);
        httpService = TestBed.inject(HTTPService);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    }));

    it('CreateUpdatePolicyTemplate should call http post', () => {
        //Arrange
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);
        contextService.setChainCode(chainCode);
        spyOn(httpService, 'post').and.returnValue(of(postTemplateJson));
        const enterpriseCancellationApiUrl = `enterprise/${chainCode}/policyTemplate/CANCEL`;

        //Act
        createTemplateService.createUpdatePolicyTemplate(entCancellationCreateTemplateJson);

        //Assert
        expect(httpService.post)
        .toHaveBeenCalledWith(enterpriseCancellationApiUrl, entCancellationCreateTemplateJson, API_CONTEXT_PATH.POLICY_MGMT);
    });
});

describe('Enterprise get deposit rules service', () => {
    let createTemplateService: PolicyMgmtCreateTemplateService;
    let contextService: ContextService;
    let httpService: HTTPService;
    beforeEach(async(() => {

		TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                ContextService,
                PolicyMgmtCreateTemplateService,
                HTTPService

            ]
        });
        createTemplateService = TestBed.inject(PolicyMgmtCreateTemplateService);
        contextService = TestBed.inject(ContextService);
        httpService = TestBed.inject(HTTPService);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyFlow(POLICY_FLOW.CREATE);
        contextService.setChainCode(chainCode);
    }));

    it('Get deposit rule list should call http get', () => {
        //Arrange
        spyOn(httpService, 'get').and.returnValue(of(entDepositRuleNameList));
        const enterprisegETDepositrulesApiUrl = `enterprise/${chainCode}/payment-deposit-rule/name-list`;

        //Act
        createTemplateService.getDepositRuleList();

        //Assert
        expect(httpService.get)
        .toHaveBeenCalledWith(enterprisegETDepositrulesApiUrl, API_CONTEXT_PATH.POLICY_MGMT);
    });

    it('Get deposit rule details should call http get and map data correctly', () => {
        //Arrange
        const depositRuleId = 123;
        const response: HttpResponse<any> = new HttpResponse({
            status: 200,
            body: entDepositRuleGetById
        });
        spyOn(httpService, 'get').and.returnValue(of(response));
        let enterprisegETDepositrulesApiUrl = `enterprise/${chainCode}/payment-deposit-rule/${depositRuleId}`;

        //Act && Assert
        createTemplateService.getDepositRuleDetails(depositRuleId).subscribe((res: any) => {
            expect(res).toEqual(entDepositRuleMappedResponse);
        });
        expect(httpService.get)
        .toHaveBeenCalledWith(enterprisegETDepositrulesApiUrl, API_CONTEXT_PATH.IHONBOARDING);
    });
});


describe('Property get deposit rules service', () => {
  let createTemplateService: PolicyMgmtCreateTemplateService;
  let contextService: ContextService;
  let httpService: HTTPService;
  beforeEach(async(() => {

  TestBed.configureTestingModule({
          imports: [
              HttpClientModule
          ],
          providers: [
              {
                  provide: SharedDataService,
                  useClass: MockSharedDataService
              },
              ContextService,
              PolicyMgmtCreateTemplateService,
              HTTPService

          ]
      });
      createTemplateService = TestBed.inject(PolicyMgmtCreateTemplateService);
      contextService = TestBed.inject(ContextService);
      httpService = TestBed.inject(HTTPService);
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
      contextService.setPolicyFlow(POLICY_FLOW.CREATE);
  }));

  it('Get deposit rule list should call http post', () => {
      //Arrange
      spyOn(httpService, 'post').and.returnValue(of(deposRuleListJson));
      const propertygDepositrulesApiUrl = `hotels/${hotelCode}/payment-deposit-rule/search`;

      //Act
      createTemplateService.getDepositRuleList();

      //Assert
      expect(httpService.post)
      .toHaveBeenCalledWith(propertygDepositrulesApiUrl,{}, API_CONTEXT_PATH.POLICY_MGMT);
  });
});

describe('Retrieve an Enterprise Policy Template',() => {
let createTemplateService: PolicyMgmtCreateTemplateService;
    let contextService: ContextService;
    let httpService: HTTPService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
                SharedDataService,
                ContextService,
                PolicyMgmtCreateTemplateService,
                HTTPService
            ]
        });

        createTemplateService = TestBed.inject(PolicyMgmtCreateTemplateService);
        contextService = TestBed.inject(ContextService);
        httpService = TestBed.inject(HTTPService);
        const chainCode = 'AAM';
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setChainCode(chainCode);
    }));

    it('CreateUpdatePolicyTemplate should call http post', () => {
        //Arrange
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        const response : HttpResponse<any> = new HttpResponse({
            status: 200,
            body: CancelEnterpriseTemplateJson
        });
        const templateId = 1000;
        const url = `enterprise/AAM/policyTemplate/${templateId}`;
        spyOn(httpService, 'get').and.returnValue(of(response));

        // Act && Assert
        createTemplateService.getTemplateResponseData(templateId).subscribe((res: ITemplateResponseModel) => {
            expect(res).toEqual(CancelEnterpriseTemplateJson);
        });

        expect(httpService.get).toHaveBeenCalledWith(url, API_CONTEXT_PATH.IHONBOARDING);
    });

    it('Should GET Enterprise Template for Deposit', () => {
        // Arrange
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        const response : HttpResponse<any> = new HttpResponse({
            status: 200,
            body: DepositEnterpriseTemplateJson
        });
        const templateId = 2000;
        const url = `enterprise/AAM/policyTemplate/${templateId}`;
        spyOn(httpService, 'get').and.returnValue(of(response));

        // Act && Assert
        createTemplateService.getTemplateResponseData(templateId).subscribe((res: ITemplateResponseModel) => {
            expect(res).toEqual(DepositEnterpriseTemplateJson);
        });

        expect(httpService.get).toHaveBeenCalledWith(url, API_CONTEXT_PATH.IHONBOARDING);
    });

    it('Should GET Enterprise Template for Guarantee', () => {
        // Arrange
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        const response : HttpResponse<any> = new HttpResponse({
            status: 200,
            body: GuaranteeEnterpriseTemplateJson
        });
        const templateId = 3000;
        const url = `enterprise/AAM/policyTemplate/${templateId}`;
        spyOn(httpService, 'get').and.returnValue(of(response));

        // Act && Assert
        createTemplateService.getTemplateResponseData(templateId).subscribe((res: ITemplateResponseModel) => {
            expect(res).toEqual(GuaranteeEnterpriseTemplateJson);
        });

        expect(httpService.get).toHaveBeenCalledWith(url, API_CONTEXT_PATH.IHONBOARDING);
    });
});

describe('Update an Enterprise Policy Template',() => {
    let createTemplateService: PolicyMgmtCreateTemplateService;
    let contextService: ContextService;
    let httpService: HTTPService;
    const chainCode = 'AAM';

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
              {
                provide: SharedDataService,
                useClass: MockSharedDataService
              },
                ContextService,
                PolicyMgmtCreateTemplateService,
                HTTPService
            ]
        });

        createTemplateService = TestBed.inject(PolicyMgmtCreateTemplateService);
        contextService = TestBed.inject(ContextService);
        httpService = TestBed.inject(HTTPService);
        contextService.setPolicyFlow(POLICY_FLOW.EDIT);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setChainCode(chainCode);
    }));


      it('Update an Enterprise Template for Cancel', () => {
        // Arrange
        const policyType = POLICY_TYPE.CANCELLATION;
        contextService.setPolicyType(policyType);
        const templateId = CancelEnterpriseTemplateJson.emPolicyTemplateId;
        const response : HttpResponse<any> = new HttpResponse({
            status: 200,
            body: {
              name: CancelEnterpriseTemplateJson.name,
              id: templateId
            }
        });
        const url = `enterprise/${chainCode}/policyTemplate/${POLICY_TYPE_FOR_API[policyType]}`;
        spyOn(httpService, 'put').and.returnValue(of(response));

        // Act && Assert
        createTemplateService.createUpdatePolicyTemplate(CancelEnterpriseTemplateJson).subscribe((res: ITemplateResponseModel) => {
            expect(res.name).toEqual(CancelEnterpriseTemplateJson.name);
            expect(res.id).toEqual(CancelEnterpriseTemplateJson.emPolicyTemplateId);
        });

        expect(httpService.put).toHaveBeenCalledWith(url, CancelEnterpriseTemplateJson, API_CONTEXT_PATH.POLICY_MGMT);
    });

    it('Update an Enterprise Template for Deposit', () => {
        // Arrange
        const policyType = POLICY_TYPE.DEPOSIT;
        contextService.setPolicyType(policyType);
        const templateId = DepositEnterpriseTemplateJson.emPolicyTemplateId;
        const response : HttpResponse<any> = new HttpResponse({
            status: 200,
            body: {
              name: DepositEnterpriseTemplateJson.name,
              id: templateId
            }
        });
        const url = `enterprise/${chainCode}/policyTemplate/${POLICY_TYPE_FOR_API[policyType]}`;
        spyOn(httpService, 'put').and.returnValue(of(response));

        // Act && Assert
        createTemplateService.createUpdatePolicyTemplate(DepositEnterpriseTemplateJson).subscribe((res: ITemplateResponseModel) => {
            expect(res.name).toEqual(DepositEnterpriseTemplateJson.name);
            expect(res.id).toEqual(DepositEnterpriseTemplateJson.emPolicyTemplateId);
        });

        expect(httpService.put).toHaveBeenCalledWith(url, DepositEnterpriseTemplateJson, API_CONTEXT_PATH.POLICY_MGMT);
    });

    it('Update an Enterprise Template for Guarantee', () => {
        // Arrange
        const policyType = POLICY_TYPE.GUARANTEE;
        contextService.setPolicyType(policyType);
        const templateId = GuaranteeEnterpriseTemplateJson.emPolicyTemplateId;
        const response : HttpResponse<any> = new HttpResponse({
            status: 200,
            body: {
              name: GuaranteeEnterpriseTemplateJson.name,
              id: templateId
            }
        });
        const url = `enterprise/${chainCode}/policyTemplate/${POLICY_TYPE_FOR_API[policyType]}`;
        spyOn(httpService, 'put').and.returnValue(of(response));

        // Act && Assert
        createTemplateService.createUpdatePolicyTemplate(GuaranteeEnterpriseTemplateJson).subscribe((res: ITemplateResponseModel) => {
            expect(res.name).toEqual(GuaranteeEnterpriseTemplateJson.name);
            expect(res.id).toEqual(GuaranteeEnterpriseTemplateJson.emPolicyTemplateId);
        });

        expect(httpService.put).toHaveBeenCalledWith(url, GuaranteeEnterpriseTemplateJson, API_CONTEXT_PATH.POLICY_MGMT);
    });

    it('Should Create Template for Cancellation', () => {
       //Arrange
       contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
       contextService.setPolicyFlow(POLICY_FLOW.CREATE);
       contextService.setChainCode('AAM');
       spyOn(httpService, 'post').and.returnValue(of(postTemplateJson));
       let enterpriseCancellationApiUrl = `enterprise/AAM/policyTemplate/CANCEL`;

       //Act
       createTemplateService.createUpdatePolicyTemplate(entCancellationCreateTemplateJson);

       //Assert
       expect(httpService.post)
       .toHaveBeenCalledWith(enterpriseCancellationApiUrl, entCancellationCreateTemplateJson, API_CONTEXT_PATH.POLICY_MGMT);
     });

     it('Get deposit rule list should call http get', () => {
        //Arrange
        spyOn(httpService, 'get').and.returnValue(of(entDepositRuleNameList));
        const enterprisegETDepositrulesApiUrl = `enterprise/${chainCode}/payment-deposit-rule/name-list`;
        //Act
        createTemplateService.getDepositRuleList();
        //Assert
        expect(httpService.get)
        .toHaveBeenCalledWith(enterprisegETDepositrulesApiUrl, API_CONTEXT_PATH.POLICY_MGMT);
    });

    it('Get deposit rule details should call http get and map data correctly', () => {
        //Arrange
        const depositRuleId = 123;
        const response: HttpResponse<any> = new HttpResponse({
            status: 200,
            body: entDepositRuleGetById
        });
        spyOn(httpService, 'get').and.returnValue(of(response));
        let enterprisegETDepositrulesApiUrl = `enterprise/${chainCode}/payment-deposit-rule/${depositRuleId}`;

        //Act && Assert
        createTemplateService.getDepositRuleDetails(depositRuleId).subscribe((res: any) => {
            expect(res).toEqual(entDepositRuleMappedResponse);
        });
        expect(httpService.get)
        .toHaveBeenCalledWith(enterprisegETDepositrulesApiUrl, API_CONTEXT_PATH.IHONBOARDING);
    });

});
