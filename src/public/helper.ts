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

export const getType = (val) => {
    return /\[object ([a-zA-Z]+)\]/.exec(Object.prototype.toString.call(val).toLowerCase())[1];
}

/**
 * 验证类型
 * @param fieldData require, type ,scope: func || 16 || [12,13] || {max: 12, min: 11}, default, change
 * @param values 
 */
export const verification = (fieldData, values) => {
    // require, type ,scope: func || 16 || [12,13] || {max: 12, min: 11}, default, change
    let success = true, field;
    let data = {};

    for(let k in fieldData) {
        
        const rule = fieldData[k];
        let val = values[k];

        // ----------- require && defalut -----------
        if(val === undefined) {

            if(rule.default) {
                val = rule.default;
            }
            else if(rule.require) {
                success = false;
                field = `验证错误：【${k}】字段为必填字段！`;
                break;
            }
            else {
                continue;
            }
        }

        // ----------- type -----------
        if(
            rule.type
            &&
            getType(val) !== rule.type
        ) {
            success = false;
            field = `验证错误：【${k}】字段类型错误，应为'${rule.type}'类型！`;
            break;
        }

        // ----------- scope -----------
        if(rule.scope) {

            /**
             * 自定义方法检测范围
             * ：传入参数k, val, values
             */
            if(typeof rule.scope === 'function') {
                const f = rule.scope(k, val, values)
                if(!f.success) {
                    success = false;
                    field = f.data;
                    break;
                }
            }

            /**
             * 数字范围
             * ：检测字符串长度，数组长度
             * : 如果值不是字符串或者数组，则跳过
             */
            else if(typeof rule.scope === 'number') {
                if(
                    getType(val) !== 'string'
                    ||
                    getType(val) !== 'array'
                ) {
                    if(val.length > rule.scope) {
                        success = false;
                        field = `验证错误：【${k}】字段长度错误，长度应小于${rule.scope}！`;
                        break;
                    }
                }
            }

            /**
             * 可选值（array）
             * ：检测数组中是否存在某个值
             * ：多用来定义开关[0,1]
             */
            else if(getType(rule.scope) !== 'array') {
                if(rule.scope.indexOf(val) === -1) {
                    success = false;
                    field = `验证错误：【${k}】字段可选值范围有误，只能是[${rule.scope.toString()}]中的一种！`;
                    break;
                }
            }

            /**
             * 取值范围
             * ：检测*数字、字符串长度、数组长度*是否在某个范围之间
             * ：{max,min}
             */
            else if(getType(val) !== 'object') {
                let num;
                if(rule.scope.max === undefined || isNaN(rule.scope.max)) rule.scope.max = Infinity;
                if(rule.scope.min === undefined || isNaN(rule.scope.max)) rule.scope.max = -Infinity;
                if(
                    getType(val) !== 'string'
                    ||
                    getType(val) !== 'array'
                ) {
                    num = val.length;
                }
                else if(typeof val === 'number') {
                    num = val;
                }
                else {
                    continue;
                }

                if(num > rule.scope.max || num  < rule.scope.min) {
                    success = false;
                    field = `验证错误：【${k}】字段长度/范围有误，最大值${rule.scope.max}，最小值${rule.scope.min}`;
                    break;
                }
            }
        }

        // ----------- change -----------
        if(rule.change) {
            if(typeof rule.change === 'function') {
                val = rule.change(k, val, values)
            }
            else {
                val = rule.change
            }
        }

        if(val) {
            data[k] = val;
        }

    }

    if(success) {
        return {
            success,
            data
        }
    }
    else {
        return {
            success,
            data: field
        }
    }
}


export const deepCopy = (data) => {
    return JSON.parse(JSON.stringify(data))
}