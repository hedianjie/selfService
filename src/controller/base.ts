import {Request, Response, NextFunction} from 'express'
import baseServices from '../services/base'
import {getTypeList} from '../services/type'


export default {
    async info(req:Request, res:Response, next:NextFunction) {
        const result = await getTypeList();
        res.send({
            success: result.success,
            data: result.data,
            msg: result.success ? '获取成功': '获取失败'
        })
    }
}