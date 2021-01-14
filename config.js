"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // 生成token秘钥
    secret: 'JUU0JUJEJTk1JUU2JUFFJUJGJUU2JTlEJUIw',
    // token过期时间
    expires: 10,
    // 服务端口号
    port: 3000,
    connect: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'project',
        timezone: "08:00"
    }
};
