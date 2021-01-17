import {Router, Request, Response, NextFunction} from 'express'
import baseController from '../controller/base';


const router = Router()

router.get('/', baseController.info)
router.get('/test', baseController.test)
router.post('/upload', baseController.upload)
export = router