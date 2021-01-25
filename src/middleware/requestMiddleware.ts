import {Request, Response, NextFunction} from 'express';
import fs from 'fs'
import path from 'path'
const whiteUrl = [
    '/login',
    // '/package/mergeUploadPackage',
    // '/package/beginUploadPackage'
]

export default (req: Request, res: Response, next: NextFunction) => {
    // 如果是表单
    if(req.headers["content-type"] && req.headers["content-type"].indexOf('multipart/form-data') !== -1) return next();
    // 如果GET
    if(req.method === 'GET') return next();
    // 如果白名单
    if(whiteUrl.indexOf(req.originalUrl) != -1) return next();
    
    if(req.session.isLogin) {
        next();
    }
    else {
        console.log('验证session失败!');
        const err = new Error();
        err.name = 'UN_LOGIN';
        err.message = '用户未登录，请登录后操作！'
        next(err)
    }
}