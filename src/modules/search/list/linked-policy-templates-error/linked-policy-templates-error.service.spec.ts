import { async, TestBed } from '@angular/core/testing';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ContextService } from 'src/modules/core/context.service';
import { POLICY_LEVEL } from 'src/modules/core/constants';
import { LinkedPolicyTemplatesErrorService } from './linked-policy-templates-error.service';
import { ILinkedPolicyTemplatesErrorInfo } from '../../policy-mgmt-search.model';

describe('Property LinkedPolicyTemplates service', () => {
    let contextService: ContextService;
    let linkedPolicyTemplateErrorService: LinkedPolicyTemplatesErrorService;
    const errorMessage: string = `
        [
            {
                \"name\":\"test1\"
            },
            {
                \"name\":\"test2\"
            }
        ]`;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [

            ],
            providers: [
                ContextService,
                LinkedPolicyTemplatesErrorService
            ]
        });
        linkedPolicyTemplateErrorService = TestBed.get(LinkedPolicyTemplatesErrorService);
        contextService = TestBed.inject(ContextService);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    }));

    it('should Initialize LinkedPolicyTemplates Service', () => {
        expect(linkedPolicyTemplateErrorService).toBeTruthy();
    });

    it('should Map error data with property data model', () => {
        let result: Array<ILinkedPolicyTemplatesErrorInfo> = linkedPolicyTemplateErrorService
        .MapLinkedPolicyTemplatesErrorInformation(errorMessage);

        expect(result[0].templateName).toEqual('test1');
        expect(result[1].templateName).toEqual('test2');
    });
});

describe('Enterprise LinkedPolicyTemplates service', () => {
    let contextService: ContextService;
    let linkedPolicyTemplateErrorService: LinkedPolicyTemplatesErrorService;
    const errorMessage: string = `{
        \"enterprise\":[
            {
                \"id\":123456,
                \"name\":\"testEnterprise\"
            }           
        ],
        \"property\":[
            {
                \"id\":987654,
                \"name\":\"testProperty\",
                \"hotelCode\":123,
                \"hotelName\":\"Test Hotel\"
            }
        ]
    }`;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [

            ],
            providers: [
                ContextService,
                LinkedPolicyTemplatesErrorService
            ]
        });
        linkedPolicyTemplateErrorService = TestBed.get(LinkedPolicyTemplatesErrorService);
        contextService = TestBed.inject(ContextService);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    }));

    it('should Map error data with enterprise data model', () => {
        let result: Array<ILinkedPolicyTemplatesErrorInfo> = linkedPolicyTemplateErrorService
        .MapLinkedPolicyTemplatesErrorInformation(errorMessage);

        expect(result[0].templateName).toEqual('testEnterprise');
        expect(result[0].hotelCode).toEqual('-');
        expect(result[0].hotelName).toEqual('-');
        expect(result[0].context).toEqual('Enterprise');
        expect(result[1].templateName).toEqual('testProperty');
        expect(result[1].hotelCode).toEqual('123');
        expect(result[1].hotelName).toEqual('Test Hotel');
        expect(result[1].context).toEqual('Property');
    });
});