import 'express-session';
import 'express';

declare module 'express-session' {
    export interface SessionData {
        isLogin: boolean,
        userInfo: {[key:string]: any}
    }
    
}

declare module 'express' {
    export interface Request{
        // [key:string]: any
    }
}