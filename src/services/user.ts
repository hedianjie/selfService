import db from '../public/mysql'


export default {
    async getUserInfo(uid: string | number) {
        const param = [
            ['hedianjie', '123321', 1],
            ['hedianjie2', '123321', 0]
        ]
        return await db.insert('user', { });
    }
}
