import {Request, Response, NextFunction} from 'express'
import {format, deepCopy, verification} from '../public/helper'
import md5 from 'md5-node'
export default {
    async getUserInfo(req:Request, res:Response, next:NextFunction) {
        if(req.session.isLogin) {
            res.send(format.success(req.session.userInfo, '获取用户信息成功'))
        }
        else {
            res.send(format.error([], '获取用户信息失败，用户未登录'))
        }
    },

    async updateUser(req:Request, res:Response, next:NextFunction) {
        
        res.send(format.success([]))
    },

    
}