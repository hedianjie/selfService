import {Errback, Request, Response, NextFunction} from 'express';

export default (err: Errback, req: Request, res: Response, next: NextFunction) => {
    // 登录超时
    if(err.name === 'TokenExpiredError') { 
        res.status(403);
    }
    // 无效token
    else if(err.name === 'JsonWebTokenError') {
        res.status(402);
    }
    // 其他报错
    else {
        res.status(500)
    }
    res.send(err)
}