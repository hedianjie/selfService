/**
 * login
 */
import {Router, Request, Response, NextFunction} from 'express'
import {setToken} from '../public/token' 
import loginController from '../controller/login';

const router = Router()

/**
 * 登录
 */
router.post('/', loginController.login)

/**
 * 注册
 */
router.post('/register', loginController.register)

/**
 * 注销
 */
router.get('/logout', loginController.logout)

export = router