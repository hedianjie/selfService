import jwt, {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken';
import config from '../../config';

const secret = config.secret;
const expires = config.expires;

export type tokenSuccessResult = {[key:string]: any}
export type tokenResult = {
    success: boolean,
    status: number,
    message: string,
    data: tokenSuccessResult | object | string | JsonWebTokenError | TokenExpiredError | undefined
}

export const setToken = (uid: string | Buffer | object) : string =>  {
    return jwt.sign({uid}, secret, {
        expiresIn: expires
    })
}


export const getToken = (token: string) : tokenResult => {
    try {
        return {
            success: true,
            status: 200,
            message: '获取token信息成功',
            data: jwt.verify(token, secret)
        }
    }
    catch (e) {
        return e;
    }
}
