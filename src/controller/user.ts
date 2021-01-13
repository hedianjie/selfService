import {Request, Response, NextFunction} from 'express'
import userServices from '../services/user'
type RequestCustom = Request & { [key:string]: any }
export default {
    async getUserInfo(req:RequestCustom, res:Response, next:NextFunction) {

        

        const result = await userServices.getUserInfo(123321);

        console.log(result)
        res.send(result)
    }
}