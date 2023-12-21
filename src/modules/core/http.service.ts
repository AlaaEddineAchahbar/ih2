
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContextService } from './context.service';
import { API_CONTEXT_PLACEHOLDER, API_CONTEXT_PATH, API_ENDPOINT, API_LOCAL_PATH } from './constants';

@Injectable()
export class HTTPService {
    constructor(
        private $http: HttpClient,
        private contextService: ContextService
    ) { }

    /*
        Http method to get rest API calls
    */
    get(urlPath: string, methodName: string) {
        const url = this.getApiUrl(methodName) + urlPath;
        return this.$http.get(url, {
            observe: 'response'
        });
    }
    /*
        Http method to post rest API calls
    */
    post(urlPath: string, param: any, methodName: string) {
        const url = this.getApiUrl(methodName) + urlPath;
        return this.$http.post(url, param, {
            observe: 'response'
        });
    }
    /*
        Http method to post rest API calls locally
    */
    postLocal(urlPath: string, param: any, methodName: string) {
        const url = this.getLocalUrl(methodName) + urlPath;
        return this.$http.post(url, param, {
            observe: 'response'
        });
    }
    /*
        Http method to put rest API calls
    */
    put(urlPath: string, param: any, methodName: string) {
        const url = this.getApiUrl(methodName) + urlPath;
        return this.$http.put(url, param, {
            observe: 'response'
        });
    }
    /*
        Http method to put rest API calls locally
    */
    putLocal(urlPath: string, param: any, methodName: string) {
      const url = this.getLocalUrl(methodName) + urlPath;
      return this.$http.put(url, param, {
          observe: 'response'
      });
    }
    /*
        Http method to patch rest API calls
    */
    patch(urlPath: string, param: any, methodName: string) {
        const url = this.getApiUrl(methodName) + urlPath;
        return this.$http.patch(url, param, {
            observe: 'response'
        });
    }
    /*
        Http method to delete rest API calls
    */
    delete(urlPath: string, param: any, methodName: string) {
        const url = this.getApiUrl(methodName) + urlPath;
        return this.$http.delete(url, param);
    }
    /*
        Http method to test API call using mock json
    */
    getTest(urlPath: string) {
        return this.$http.get(urlPath);
    }
    /*
    * Method returns API url based on API
    */
    getApiUrl(methodName) {
        let apiUrl: string;
        const windowConfigApiUrl = this.contextService.apiConstant.apiUrl;

        if (methodName) {
            if (methodName === API_CONTEXT_PATH.PRICING_API) {
                apiUrl = this.getPricingEngineAPIUrl();
            } else if (methodName === API_CONTEXT_PATH.PRICING_API_V2) {
                apiUrl = this.getPricingEngineAPIUrl(API_CONTEXT_PATH.PRICING_API_V2);
            } else {
                apiUrl = windowConfigApiUrl.replace(API_CONTEXT_PLACEHOLDER.MODULE_CONTEXT_PATH, methodName);
            }
        } else {
            apiUrl = 'http://localhost:4200/assets-policy-mgmt/data/';
        }
        return apiUrl;
    }

    getLocalUrl(methodName) {
      let url = 'UNDEFINED_LOCAL_PATH/';

      switch(methodName){
        case API_CONTEXT_PATH.POLICY_MGMT:
          url = API_LOCAL_PATH.POLICY_MGMT;
          break;

        case API_CONTEXT_PATH.IHONBOARDING:
          url = API_LOCAL_PATH.IHONBOARDING;
          break;
      }

      url += methodName + '/';
      return url;
    }

    /**
     * Gets an environment to be used in the urls
     * @param version Version of an API
     */
    getPricingEngineAPIUrl(version: string = '') {
        const env = this.contextService.apiConstant.apiEnv;
        const apiEnv = env === 'prod' ? '' : env === 'perf' ? '-l1' : '-' + env;
        if (version === API_CONTEXT_PATH.PRICING_API_V2) {
            return API_ENDPOINT.PRICING_V2.replace(API_CONTEXT_PLACEHOLDER.API_ENV, apiEnv);
        }
        return API_ENDPOINT.PRICING.replace(API_CONTEXT_PLACEHOLDER.API_ENV, apiEnv);
    }
}
