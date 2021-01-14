/**
 * 内部回调返回内容以下面示例为准
 * data = {
 *      success: true | false,
 *      data: any
 *      msg?: '' 
 * }
 * 
 * 接口返回内容以下面示例为准
 * data = {
 *      status: 200(成功) | 500(失败)
 *      data: any,
 *      msg?: ''
 * }
 */
import path from 'path'
import express from 'express';
import bodyParser from 'body-parser'
import expressSession from 'express-session'
import config from './config';
import requestMiddleware from './src/middleware/requestMiddleware'
import errorMiddleware from './src/middleware/errorMiddleware'
import fs from 'fs';


const app = express();



app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(expressSession({
    secret: config.secret,
    name: 'sid',
    rolling: true,
    cookie: {maxAge: 60000},
    saveUninitialized: true
}))
// 请求拦截 验证登录token
app.all('/*', requestMiddleware);


/**
 * 读取./src/routes目录下所有ts文件
 * 把这些文件配置到路由中，以文件名字为路径
 * app.use('/user', require('user.ts'))
 */
const files = fs.readdirSync(path.resolve(__dirname, './src/routes'));
const fileReg = /\.ts$/;
files.forEach(item => {
    if(!fileReg.test(item)) return
    app.use(`/${item.replace(fileReg, '')}`, require(`./src/routes/${item}`))
});

// 错误信息拦截
app.use(errorMiddleware)

app.listen(config.port, () => {
    console.log(`Server open listen: ${config.port}`)
})