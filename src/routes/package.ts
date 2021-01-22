import {Router, Request, Response, NextFunction} from 'express'
import packageController from '../controller/package';

const router = Router()

router.post('/beginUploadPackage', packageController.beginUploadPackage)
router.post('/mergeUploadPackage', packageController.mergeUploadPackage)
router.post('/uploadPackage', packageController.uploadPackage);

export = router