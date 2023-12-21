import { ILanguageList } from '../create/template/policy-mgmt-create-template.model';

/**Dummy HTTP Response interface
 * to retrieve data while getting from shared service
 */
export interface IHTTPResponse {
    status: number;
    body: any;
}

export interface IPostApiResponse {
    id: number;
    name?: string;
    jsoupChangedText?: boolean;
}

export interface IHttpErrorResponse {
    error: any;
    status: number;
    statusText: string;
}

export interface IErrorApiRes {
    message: string;
    errorCode: string;
    field?: string;
}

export interface IDropDownItem {
    id: number;
    name?: string;
    chargePercentage?: string;
}

export interface IListFormat {
    id: string;
    name: string;
}

/**
 * Holds Inline error message format
 */
export interface IErrorMessage {
    show: boolean;
    message: string | object;
    type?: string;
}

export class ErrorMessage {
    show: boolean;
    message: string | object;
    constructor() {
        this.show = false;
        this.message = '';
    }
}

/**
 * Meta Data Model
 */
export interface IMetadata {
    acceptedTenderDeposit: Array<IDropDownItem>;
    acceptedTenderGuarantee: Array<IDropDownItem>;
    rateCategories: Array<IDropDownItem>;
    acceptedTender: {
        guarantee: Array<IDropDownItem>,
        deposit: Array<IDropDownItem>
    };
}

/**
 * Chain category group model
 */
export interface IChainCategoryGroup {
    categoryGroupId: string;
    categoryGroupName: string;
}

/**
 * Chain category model
 */
export interface IChainCategory {
    categoryId: string;
    categoryName: string;
    status: string;
    categoryGroups: Array<IChainCategoryGroup>;
}

/**
 * Hotel info model
 */
export interface IHotelInfo {
    hotelCode: number;
    hotelName: string;
    chainCode: string;
    bid: number;
    timezone: string;
    gmtOffset: number;
    unitOfMeasurement: string;
    latitude: string;
    longitude: string;
    languages: Array<any>;
    currencies: Array<any>;
    hotelSettings: any;
    roomTypes: Array<any>;
    languageList?: Array<ILanguageList>;
    paymentInfo?: any;
}

/**
 * Hotel info provider as part of the chain info API
 */
export interface IChainHotel {
    hotelCode: number;
    bid: number;
    hotelName: string;
    currencyCode: string;
    status: string;
    defaultLanguageId: number;
    supportedLanguages: Array<number>;
    rewardType: string;
    earn: boolean;
    burn: boolean;
}

/**
 * The admin user for a chain.
 */
export interface IAdminUserChain {
    userId: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
}

/**
 * Chain info returned by chain management API
 */
export interface IChainInfo {
    chainId: number;
    chainCode: string;
    chainName: string;
    status: string;
    creationDateTime: string;
    creationBy: string;
    lastUpdateDateTime: string;
    lastUpdateBy: string;
    timezone: string;
    categories: Array<IChainCategory>;
    chainHotels: Array<IChainHotel>;
    adminUsers: Array<IAdminUserChain>;
}

/**
 * A language object as returned by the chain management API
 */
export interface ILanguage {
    id: number;
    name: string;
    cflocal: string;
    longDateMask: string;
    dateMask: string;
    shortDateMask: string;
    isoCode: string;
    nativeLanguage: string;
    isoCountryCode: string;
    defaultLocale: string;
    languageCode: string;
}

/**
 * List of languages know to the system
 */
export interface ILanguages {
    languages: Array<ILanguage>;
}

/**
 * Holds window config model type
 */
export interface IWindowConfig {
    apiUrl: string;
    apiEnv: string;
    tokenDecodedData: {
        sub: string;
        propertyid: string;
        user_permission: string;
        uid: string;
        role: string;
    };
}

