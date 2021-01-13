export const printLog = (type: string, msg: string, values?: any) : void => {
    console.log(
        '----------------------------------------------------------',
        `【${type}】 ${msg}`,
        values ? values : '',
        '----------------------------------------------------------'
    )
}