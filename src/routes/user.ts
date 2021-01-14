import {Router, Request, Response, NextFunction} from 'express'
import userController from '../controller/user';

const router = Router()
router.get('/', userController.getUserInfo);

// router.post('/create', userController.createUser)

export = router