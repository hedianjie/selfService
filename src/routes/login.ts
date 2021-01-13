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
router.post('/', )

/**
 * 注册
 */
router.post('/register', )

/**
 * 注销
 */
router.post('/logout', )

export = router