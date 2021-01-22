import {Request, Response, NextFunction} from 'express';
import formidable from 'formidable'
import path from 'path'
import fs from 'fs';

const whiteUrl = [
    ''
]

export default (req: Request, res: Response, next: NextFunction) => {
    // 如果白名单
    if(whiteUrl.indexOf(req.originalUrl) != -1) return next();
    // 如果不是表单
    if(!req.headers["content-type"] || req.headers["content-type"].indexOf('multipart/form-data') === -1) return next();

    const form = new formidable.IncomingForm();
    form.uploadDir = path.resolve(__dirname, '../../uploads')
    form.parse(req, (err, fields, file) => {
        if (err) {
            next(err);
        }
        // 未登录禁止操作
        // else if (!req.session.isLogin) {
        //     for(let k in file) {
        //         fs.unlinkSync((file[k] as any).path)
        //     }
        //     const err = new Error();
        //     err.name = 'UN_LOGIN';
        //     err.message = '用户未登录，请登录后操作！';
        //     next(err)
        // }
        else {
            req.body = {
                ...fields,
                ...file
            }
            next();
        }
    })
}