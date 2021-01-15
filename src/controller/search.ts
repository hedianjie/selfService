import {Request, Response, NextFunction} from 'express'
import {format, verification} from '../public/helper'
import db from '../public/mysql'
import md5 from 'md5-node'

export default {
    async search(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({
            keyword:    {require: true, type: 'string', scope: 22},
            type:       {require: true, type: 'number'},
        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) return res.send(format.error([], body));

        let sql = '';

        


    }
}