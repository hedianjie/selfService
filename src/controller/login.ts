import {Request, Response, NextFunction} from 'express'
import {format, verification} from '../public/helper'
import db from '../public/mysql'
import md5 from 'md5-node'

export default {
    async register(req:Request, res:Response, next:NextFunction) {

        const bodyParse = verification({
            // name:       {require: false, type: 'string', scope: 16},
            login_name: {require: true, type: 'string', scope: 16},
            pwd:        {require: true, type: 'string', scope: 16, change: val => md5(val)},
            // is_enable:  {require: false, type: 'number', scope: [0, 1], default: 0}
        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) return res.send(format.error([], body));

        const loginNameList = await db.get('user', {login_name: body.login_name});

        if(loginNameList.data.length) return res.send(format.error([], '创建用户失败，账号已经存在，请重试！'));

        const result = await db.insert('user', body);

        if(result.success)
            res.send(format.success([], '创建用户成功！'))
        else {
            res.send(format.error(result.data, '创建用户失败！'))
        }
        
    },


    async login(req:Request, res:Response, next:NextFunction) {

        const bodyParse = verification({
            login_name: {require: true, type: 'string', scope: 16},
            pwd:        {require: true, type: 'string', scope: 16, change: val => md5(val)},
        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) return res.send(format.error([], body));

        const userInfo = await db.get('user', body);

        if(!userInfo.data.length) 
            return res.send(format.error([], '账号或密码错误，请重试！'));
        else {
            req.session.isLogin = true,
            req.session.userInfo = userInfo.data[0];
            return res.send(format.success(userInfo.data[0], '登录成功！'));
        }

    },

    
    async logout(req:Request, res:Response, next:NextFunction) {
        req.session.destroy(err => {
            if(err) {
                res.send(format.error(err, '注销失败，请重试！'));
            }
            else {
                res.send(format.success([], '注销成功！'));
            }
        });
    }
}