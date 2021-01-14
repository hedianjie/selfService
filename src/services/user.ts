import db from '../public/mysql'


export default {
    async getUserInfo(where) {
        console.log(where)
        return await db.get('user', where);
    },

    async createUser(body) {
        return await db.insert('user', body)
    },

    // 验证账号是否重复
    async getLoginName(login_name) {
        return await db.get('user', {
            login_name
        })
    }
}
