import { IHTTPResponse } from 'src/modules/core/common.model';
import { IErrorDetailsModel, IErrorDetailsTable } from './copy-clone-error-details.model';
import { of } from 'rxjs';
import { CopyCloneErrorDetailsService } from './copy-clone-error-details.service';
import { APP_CONSTANT } from 'src/app/app.constant';
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HTTPService } from 'src/modules/core/http.service';


const chainInfo = require('../../../../assets-policy-mgmt/data/chain-info.json');
const jobDetailsData: IErrorDetailsModel[] =
    require('../../../../assets-policy-mgmt/data/enterprise-policy-templates/search/job-details.json');

class MockHttpService {
    response: IHTTPResponse;
    get(urlPath: string) {
        if (urlPath === 'jobs/fRJkhIoBrvYP_KdjF-oe/detail') {
            this.response = {
                status: 200,
                body: jobDetailsData
            };
        } else {
            this.response = {
                status: 404,
                body: false
            };
        }
        return of(this.response);
    }
}

describe('copy clone error details service', () => {
    let copyCloneErrorDetailsService: CopyCloneErrorDetailsService;
    window['CONFIG'] = {
        tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
        apiUrl: APP_CONSTANT.config.apiUrl
    };

    beforeEach(function () {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ],
            providers: [
                {
                    provide: HTTPService,
                    useClass: MockHttpService
                },
                CopyCloneErrorDetailsService
            ]
        });
        copyCloneErrorDetailsService = TestBed.inject(CopyCloneErrorDetailsService);
    });

    it('Copy clone error details service should be initialized', () => {
        // Assert
        expect(copyCloneErrorDetailsService).toBeTruthy();
    });

    it('Should return job details response in UI format', () => {
        // Act & Assert
        copyCloneErrorDetailsService.getJobDetails('fRJkhIoBrvYP_KdjF-oe').subscribe((data: Array<IErrorDetailsModel>) => {
            expect(data[0].job_child_id).toEqual('fRJkhIoBrvYP_KdjF-oe-5020');
            expect(data[0].parent_id).toEqual('fRJkhIoBrvYP_KdjF-oe');
            expect(data[0].hotel_code.toString()).toEqual('5020');
            expect(data[0].status).toEqual('Failed');
            expect(data[0].errors[0].code).toEqual('CORE_PROXY_ERROR');
            expect(data[0].errors[0].message).toEqual('Unable to send to core');
        });
    });

    it('should return the hotel name when hotel exists in chainInfo', () => {
        // Arrange
        const hotelCode = '5020';
        const expectedHotelName = 'JDV TEST PROPERTY';

        // Act
        const result = copyCloneErrorDetailsService.getHotelName(hotelCode, chainInfo);

        // Assert
        expect(result).toEqual(expectedHotelName);
    });

    it('should return an empty string when hotel does not exist in chainInfo', () => {
        // Arrange
        const hotelCode = '50201';

        // Act
        const result = copyCloneErrorDetailsService.getHotelName(hotelCode, chainInfo);

        // Assert
        expect(result).toEqual('');
    });

    it('should return an array of correct error details when error status is Failed', () => {
        // Act
        const result = copyCloneErrorDetailsService.setErrorDetailsToDisplay(jobDetailsData, chainInfo);

        // Assert
        expect(result[0].hotelCode.toString()).toEqual('5020');
        expect(result[0].hotelName).toEqual('JDV TEST PROPERTY');
        expect(result[0].ErrorCode).toEqual('CORE_PROXY_ERROR');
        expect(result[0].ErrorMessage).toEqual('Unable to send to core');
    });
});