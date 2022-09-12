import {RequestVerbType} from "./RequestVerbType";
import {RequestStatusCodes} from "./RequestStatusCodes";


export interface WrappedRequest {
    verb: RequestVerbType;
    statuses: RequestStatusCodes;
    url: string;
    data: any;


}