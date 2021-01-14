export const printLog = (type: string, msg: string, values?: any) : void => {
    console.log(
        '----------------------------------------------------------',
        `\x1B[33m【${type}】\x1B[0m ${msg}`,
        values ? values : '',
        '----------------------------------------------------------'
    )
}

export const format = {
    success(data:any=[], msg="成功") {
        return {
            status: 200,
            data,
            msg
        }
    },

    error(data:any=[], msg="失败") {
        return {
            status: 500,
            data,
            msg
        }
    }
}

/**
 * 
 * @param fieldData 
 * @param values 
 * 
 * 
 * fieldData: {
 *      key: String
 * 
 * }
 */
export const verification = (fieldData, values) => {
    // require, type ,scope, default, change


    return {
        success: true,
        data: deepCopy(values)
    };
}


export const deepCopy = (data) => {
    return JSON.parse(JSON.stringify(data))
}