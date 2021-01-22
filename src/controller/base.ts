import {Request, Response, NextFunction} from 'express'
import {format, verification, printLog} from '../public/helper'
import db from '../public/mysql'


export default {
    async info(req:Request, res:Response, next:NextFunction) {
        const result = await db.select('type');
        if(result.success) {
            res.send(format.success(result.data, '获取成功!'))
        }
        else {
            res.send(format.error(result.data, '获取失败!'))
        }
    },
    
}