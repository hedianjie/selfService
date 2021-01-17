import {Request, Response, NextFunction} from 'express'
import {format, verification} from '../public/helper'
import baseServices from '../services/base'
import {getTypeList} from '../services/type'
import db from '../public/mysql'

import fs from 'fs';

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



    async test(req:Request, res:Response, next:NextFunction) {
        const result =  await db.insert('user', { login_name: 'HelloWorld', pwd: 'hellohedianjie'})
                        .insert('user', { login_name: 'HelloWorld2', pwd: 'hellohedianjie2'});

        res.send({
            success: result.success,
            data: result.data,
            msg: result.success ? '获取成功': '获取失败'
        })
    },

    async upload(req:Request, res:Response, next:NextFunction) {
        console.log(req.body)
        // var data  = [];
        // req.files
        // req.on("data",(chunk)=>{
        //     console.log(32131)
        //     data.push(chunk)
        // })
        // req.on("end",()=>{
            
        //     console.log(665566)
            
        //     var buffer = Buffer.concat(data);
        //     fs.writeFile("./a",buffer,(err)=>{
        //         if(!err){
        //             res.end("ok")
        //         }
        //     })
        // })
        res.send({
            success: true,
            data: '2342424242',
        })
    }
}