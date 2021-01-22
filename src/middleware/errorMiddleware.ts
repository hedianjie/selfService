import {Errback, Request, Response, NextFunction} from 'express';

export default (err: Errback, req: Request, res: Response, next: NextFunction) => {
    // 未登录
    if(err.name === 'UN_LOGIN') { 
        res.status(403);
    }
    // 其他报错
    else {
        res.status(500)
    }
    res.send(err)
}