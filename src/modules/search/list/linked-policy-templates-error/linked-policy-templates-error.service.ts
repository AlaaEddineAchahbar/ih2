import { Injectable } from '@angular/core';
import {
    ILinkedPolicyTemplatesErrorResponseData,
    ILinkedPolicyTemplatesErrorEnterpriseData,
    ILinkedPolicyTemplatesErrorPropertyData,
    ILinkedPolicyTemplatesErrorInfo
  } from '../../policy-mgmt-search.model';
import { ContextService } from 'src/modules/core/context.service';
import { POLICY_LEVEL } from 'src/modules/core/constants';

@Injectable()
export class LinkedPolicyTemplatesErrorService {

    constructor(private contextService: ContextService,) {}

    /**
     * @param errorResponse
     * @returns linked policy templates information
     * Method to retrieve error information from the error response message
     */
    MapLinkedPolicyTemplatesErrorInformation(errorMessage: string) : Array<ILinkedPolicyTemplatesErrorInfo> {
      let enterpriseErrorInfo: ILinkedPolicyTemplatesErrorResponseData;
      let propertyErrorInfo: Array<ILinkedPolicyTemplatesErrorPropertyData>;
      let modalData: Array<ILinkedPolicyTemplatesErrorInfo> = [];
      
      if(this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE){
        enterpriseErrorInfo = JSON.parse(errorMessage);
        enterpriseErrorInfo.enterprise.forEach((chainTemplateError: ILinkedPolicyTemplatesErrorEnterpriseData) => {
          modalData.push({
            templateName: chainTemplateError.name,
            hotelCode: '-',
            hotelName: '-',
            context: 'Enterprise'
          });
        });
        enterpriseErrorInfo.property.forEach((hotelTemplateError: ILinkedPolicyTemplatesErrorPropertyData) => {
          modalData.push({
            templateName: hotelTemplateError.name,
            hotelCode: hotelTemplateError.hotelCode.toString(),
            hotelName: hotelTemplateError.hotelName,
            context: 'Property'
          });
        });
      } else {
        propertyErrorInfo = JSON.parse(errorMessage);
        propertyErrorInfo.forEach((templateError: ILinkedPolicyTemplatesErrorPropertyData) => {
          modalData.push({
            templateName: templateError.name
          });
        });
      }
      
      return modalData;
    }
}
