import mysql from 'mysql'
import {printLog} from './helper'
import config from '../../config'

type valueFuncType = (res: any) => Error | valueType
type valueType = {
    sql: string,
    values?: any
}

type outsideArgType = string | valueType | valueFuncType | valueType[] | valueFuncType[]
type insideArgType = valueType | valueFuncType | valueType[] | valueFuncType[]
const symbolNow = Symbol('now');

const dismantleSQL = (type: 'insert'|'select'|'update'|'delete'|'get', table: string, options: {[key: string]: any}, row:{[key:string]: any} = {}) => {
    let sql, values;
    switch(type) {
        
        case 'insert': {
            const keys = Object.keys(options);
            values = Object.values(options);
            sql = `INSERT INTO ${table} (${keys.toString()}) VALUES (${keys.map(() => '?').toString()})`;
            break;
        }

        case 'select': {
            if(!options) {
                sql = `SELECT * FROM ${table}`;
                values = undefined;
            }
            else {
                const where = options.where;
                const columns = options.columns || ['*'];
                const orders = options.orders;
                const limit = options.limit;
                const offset = options.offset;
                sql = `SELECT ${columns.toString()} FROM ${table} WHERE delete_time IS null`
                if(where) {
                    for(let k in where) {
                        if(typeof where[k] === 'string' || typeof where[k] === 'number') {
                            sql += ` AND ${k} = ?`
                        }
                        else if(where[k] instanceof Array) {
                            sql += ` AND ${k} IN (?)`
                        }
                    }
                    values = Object.values(where)
    
                }
                if(orders) {
                    sql += ' ORDER BY'
                    for(let k in orders) {
                        sql += ` ${k} ${orders[k].toUpperCase()},`
                    }
                    sql = sql.substring(0, sql.length-1)
                }
    
                if(!isNaN(limit)) {
                    sql += ` LIMIT ${limit}`
                }
    
                if(!isNaN(offset)) {
                    sql += ` OFFSET ${offset}`
                }
            }
            break;
        }

        case 'update': {
            sql = `UPDATE ${table} SET `;
            // let values;
            for(let k in row) {
                if(row[k] === symbolNow){
                    sql += ` ${k}=NOW(),`;
                    delete row[k];
                }
                else if(k === 'id') {
                    options.id = row[k];
                    delete row[k];
                }
                else {
                    sql += ` ${k}=?,`
                }
            }
            values = Object.values(row);
            
            sql = sql.substring(0, sql.length-1);
            sql += ' WHERE delete_time IS null';

            if(Object.keys(options).length) {
                if(typeof options === 'object') {
                    for( let k in options) {
                        sql += ` AND ${k}=?`
                    }
                    values = values.concat(Object.values(options))
                }
            }
            break;
        }
        
        case 'delete': {
            sql = `UPDATE ${table} SET delete_time=NOW() WHERE delete_time IS null`;
            if(Object.keys(options).length) {
                if(typeof options === 'object') {
                    for( let k in options) {
                        sql += ` AND ${k}=?`
                    }
                    values = values.concat(Object.values(options))
                }
            }
            break;
        }

        case 'get': {
            sql = `SELECT * FROM ${table} WHERE delete_time IS null`;
            if(typeof options === 'object') {
                for( let k in options) {
                    sql += ` AND ${k} = ?`
                }
                values = Object.values(options);
            }

            sql += ` LIMIT 0, 1`;
            break;
        }
    }

    return {sql, values};
}

const poolConnection = mysql.createPool(config.connect);

poolConnection.on('error', (err) => {

    if(err) {
        printLog('mysql', '链接数据库失败', err)
    }
})



class Query {
    /**
     * 用于返回的Promise
     * 合并了next方法 next的this指向当前类
     * 方便了链式调用
     * db.query().next().next()
     */
    protected connectPromise = null;
    
    /**
     * next链式的存放池，在mysql的连接池中依次调用
     */
    protected invoking: insideArgType[] = [];

    /**
     * 
     * @param sql 
     * @param values 
     */
    query(sql: outsideArgType, values?) {

        const promise = new Promise((resolve, reject) =>{
            // 取出一个连接
            poolConnection.getConnection((err, connect) =>{
                if(err) {
                    printLog('mysql', '抽取一个连接失败', err);

                    return resolve({
                        success: false,
                        data: err
                    });
                }
                else {
                    // printLog('mysql', '成功抽取一个连接')
                }

                connect.beginTransaction(async err => {
                    if(err) {
                        printLog('mysql', '开启事务失败', err)
                    }
                    else {
                        // printLog('mysql', '成功开启事务')
                    }

                    let queryArr: insideArgType[] = [];

                    if(typeof sql === 'string') {
                        sql = {
                            sql,
                            values
                        }
                    }

                    queryArr.push(sql);
                    if(this.invoking.length) {
                        queryArr = queryArr.concat(this.invoking);
                    }

                    const begin = async (queryArr: insideArgType[]) => {
                        const resultArr = [];
                        for(let i = 0; i < queryArr.length; i++) {
                            let item = queryArr[i];
                            let qr = null;
                            
                            // 如果是数组
                            if(item instanceof Array) {
                                qr = await begin(item);
                            }
                            // 如果是函数
                            else if(typeof item === 'function') {
                                let option = item(resultArr[resultArr.length - 1]);
                                if(option instanceof Error) {
                                    qr = {success: false, data: option}
                                }
                                else {
                                    qr = await this.handlerQuery(
                                        connect,
                                        option
                                    )
                                }
                            }
                            // 如果是对象
                            else {
                                qr = await this.handlerQuery(
                                    connect,
                                    item
                                )
                            }

                            // 错误 直接返回错误
                            if(!qr || !qr.success) {
                                return {
                                    success: false,
                                    data: qr.data
                                }
                            }
                            // 成功 添加到返回列表
                            else {
                                resultArr.push(qr.data);
                            }
                            
                        }

                        return {
                            success: true,
                            data: resultArr
                        }
                        
                    }

                    // 开始
                    const result = await begin(queryArr);

                    // 返回结果 如果是单词语句 去掉返回结果外层数组壳
                    if(this.invoking.length === 0 && result.success) {
                        result.data = result.data[0]
                    }

                    if(result.success) {
                        connect.commit(err => {
                            if(err) {
                                printLog('mysql', '提交事务出错', err)
                            }
                            else {
                                // printLog('mysql', '提交事务成功')
                            }
                        })
                    }
                    else {
                        connect.rollback(err => {
                            if(err) {
                                printLog('mysql', '事务回滚出错', err)
                            }
                            else {
                                // printLog('mysql', '成功回滚')
                            }
                        })
                    }

                    connect.release();
                    printLog('mysql', '成功释放连接');
                    resolve(result)
                })
            })
        });

        this.connectPromise = Object.assign(
            promise,
            {
                next: this.next.bind(this),
                insert: this.insert.bind(this),
                select: this.select.bind(this),
                get: this.get.bind(this),
                updata: this.update.bind(this),
                delete: this.delete.bind(this)
            }
        )

        return this.connectPromise;
    }

    next(arg: outsideArgType, values?) {

        if(typeof arg === 'function') {
            this.invoking.push(arg);
        }
        else if (arg instanceof Array) {
            this.invoking.push(arg)
        }
        else if(typeof arg === 'string') {
            this.invoking.push({
                sql: arg,
                values
            })
        }

        return this.connectPromise

    }


    insert(table: string, options: {[key: string]: any}) {
        this.invoking.push(dismantleSQL('insert', table, options));
        return this.connectPromise;
    }

    select(table: string, options?:{[key: string]: any}) {
        this.invoking.push(dismantleSQL('select', table, options));
        return this.connectPromise;
    }

    get(table: string, options?:{[key: string]: any}) {
        this.invoking.push(dismantleSQL('get', table, options));
        return this.connectPromise;
    }
    
    update(table:string, options:{[key:string]: any} = {}, row:{[key:string]: any} = {}) {
        this.invoking.push(dismantleSQL('update', table, options, row));
        return this.connectPromise;
    }

    delete(table:string, options:{[key:string]: any}) {
        this.invoking.push(dismantleSQL('delete', table, options));
        return this.connectPromise;
    }


    handlerQuery(connect, options: valueType) : Promise<{success:boolean, data:any}> {
        return new Promise((resolve, reject) =>{
            console.log(options)
            connect.query(options.sql, options.values, (err, result) => {
                if(err) {
                    resolve({
                        success: false,
                        data: err
                    })
                }
                else {
                    resolve({
                        success: true,
                        data: result
                    })
                }
            })
        });
    }

}




const DB = {

    now: symbolNow,

    insert(table: string, options: {[key: string]: any}) {
        const {sql, values} = dismantleSQL('insert', table, options)
        return new Query().query(sql, values);
    },

    select(table: string, options?:{[key: string]: any}) {
        const {sql, values} = dismantleSQL('select', table, options);
        return new Query().query(sql, values);
    },

    get(table: string, options?:{[key: string]: any}) {
        const {sql, values} = dismantleSQL('get', table, options);
        return new Query().query(sql, values);
    },
    
    update(table:string, options:{[key:string]: any} = {}, row:{[key:string]: any} = {}) {
        const {sql, values} = dismantleSQL('update', table, options, row);
        return new Query().query(sql, values);
    },

    delete(table:string, options:{[key:string]: any}) {
        const {sql, values} = dismantleSQL('delete', table, options);
        return new Query().query(sql, values);
    },

    query(sql: outsideArgType, values?) {
        return new Query().query(sql, values)
    },
}




export default DB