import db from '../public/mysql'

export const getTypeList = async () => {
    return await db.select('type');
}

export default {
    getTypeList
}