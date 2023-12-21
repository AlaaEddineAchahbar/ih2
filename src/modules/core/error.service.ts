// Angular imports
import { Injectable } from '@angular/core';

// Application level imports
import { IErrorMessage, IErrorApiRes } from './common.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from './translation.constant';
import { ERROR_CODES } from './constants';

@Injectable()
export class PolicyMgmtErrorService {
    /**
     * Holds Toaster error message format
     */
    toastMessage: IErrorMessage;

    /**
     * used for importing translation JSON
     */
    translationMap: any;

    /**
     * initializes service variables
     */
    constructor(private translate: TcTranslateService) {
        this.toastMessage = {
            show: false,
            message: {}
        };
        this.translationMap = TranslationMap;
    }

    /**
     * Sets Toaster error message
     * @param errors: List of errors
     */
    setErrorMessage(errors: IErrorApiRes[]) {
        const errorMessage: IErrorMessage = {
            message: {},
            show: true
        };
        const translatedErrors = [];
        if (errors.length) {
            errors.forEach(error => {
                const translatedError = this.translate.translateService.instant(
                    ERROR_CODES[error.errorCode] ? this.translationMap[ERROR_CODES[error.errorCode]] : error.message
                );
                translatedErrors.push(translatedError);
            });
        }
        errorMessage.message['bodyText'] = translatedErrors;
        errorMessage.message['titleText'] = '';
        return errorMessage;
    }
}
