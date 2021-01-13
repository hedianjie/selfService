import {Router, Request, Response, NextFunction} from 'express'
import userController from '../controller/user';


const router = Router()

router.use('/', userController.getUserInfo)

export = router