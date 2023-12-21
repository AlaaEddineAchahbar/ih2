export interface IErrorDetails {
    code: string;
    field: string;
    message: string;
}

export interface IErrorDetailsModel {
    job_child_id: string;
    parent_id: string;
    hotel_code: number;
    status: string;
    errors: Array<IErrorDetails>;
}

export interface IErrorDetailsTable {
    hotelCode: number;
    hotelName: string;
    ErrorCode: string;
    ErrorMessage: string;
}
