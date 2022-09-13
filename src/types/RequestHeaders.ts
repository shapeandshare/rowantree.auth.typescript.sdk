import {HeadersDefaults} from 'axios';


export interface RequestHeaders extends HeadersDefaults {
    Authorization: string;
}
