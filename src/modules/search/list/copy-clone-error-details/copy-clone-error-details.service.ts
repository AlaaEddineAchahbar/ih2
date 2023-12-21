import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HTTPService } from 'src/modules/core/http.service';
import { IErrorDetailsModel, IErrorDetailsTable } from './copy-clone-error-details.model';
import { API_CONTEXT_PATH, API_RESPONSE_CODE } from 'src/modules/core/constants';
import { IChainInfo, IHTTPResponse } from 'src/modules/core/common.model';

@Injectable()
export class CopyCloneErrorDetailsService {

    /**
     * Error details table data
     */
    returnErrorDetails: Array<IErrorDetailsTable> = [];

    constructor(private httpService: HTTPService) { }

    /**
     * Method to get job details from API
     * jobDetails : GET https://api-t6.travelclick.com/ihonboarding/v1/jobs/eD4-2okBgwQFyDJqrIoy/detail
     * @param jobId
     * @returns
     */
    getJobDetails(jobId: string): Observable<IErrorDetailsModel[] | boolean> {
        const url: string = 'jobs/' + jobId + '/detail';
        return this.httpService.get(url, API_CONTEXT_PATH.IHONBOARDING).pipe(map(this.mapErrorDetails));
    }

    mapErrorDetails = (res: IHTTPResponse): IErrorDetailsModel[] | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const response: IErrorDetailsModel[] = res.body;
            return response;
        } else {
            return false;
        }
    };

    /**
     * Method to get hotel name from chain info hotels
     * @param hotelCode
     * @param chainInfo
     * @returns
     */
    getHotelName(hotelCode: string, chainInfo: IChainInfo) {
        const hotel = chainInfo.chainHotels.find((element) => element.hotelCode.toString() === hotelCode);
        return hotel ? hotel.hotelName : '';
    }

    /**
     * Method to set error details to display in the popup
     * @param errorDetails: see @IErrorDetailsModel
     * @param chainInfo: see @IChainInfo
     * @returns
     */
    setErrorDetailsToDisplay(errorDetails: IErrorDetailsModel[], chainInfo: IChainInfo): Array<IErrorDetailsTable> {
        const returnErrorDetails: Array<IErrorDetailsTable> = [];
        errorDetails.forEach((errorItem) => {
            if (errorItem.status === 'Failed') {
                errorItem.errors.forEach((error) => {
                    returnErrorDetails.push({
                        hotelCode: errorItem.hotel_code,
                        hotelName: this.getHotelName(errorItem.hotel_code.toString(), chainInfo),
                        ErrorCode: error.code,
                        ErrorMessage: error.message
                    });
                });
            }
        });
        return returnErrorDetails;
    }
}