/**
 * search
 */
import {Router, Request, Response, NextFunction} from 'express'
import searchController from '../controller/search';
const router = Router()

router.get('/', searchController.search)

export = router