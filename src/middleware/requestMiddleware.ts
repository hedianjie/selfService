import {Request, Response, NextFunction} from 'express';
import {getToken, tokenSuccessResult} from '../public/token';

type RequestCustom = Request & { [key:string]: any }
const whiteUrl = [
    '/login'
]

export default (req: RequestCustom, res: Response, next: NextFunction) => {
    
    
    // 如果GET
    if(req.method === 'GET') return next();
    // 如果白名单
    if(whiteUrl.indexOf(req.originalUrl) != -1) return next();
    
    console.log('请求拦截，验证token中……');
    const userToken = getToken(req.query.token as string);
    if(userToken.success) {
        req.uid = (userToken.data as tokenSuccessResult).uid
        next();
    }
    else {
        next(userToken)
    }
}