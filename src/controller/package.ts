import {Request, Response, NextFunction} from 'express'
import {format, verification, printLog} from '../public/helper'
import db from '../public/mysql'
import concat from 'concat-files'
import File from 'formidable/lib/file'
import path from 'path'
import fs from 'fs';
import compressing from 'compressing'

const EXPLAIN = 'explain.json';
const UPLOAD = '../../uploads';

export default {
    // 获取文件内容
    getHashContent(baseUserHashDir) {
        

        // 返回explain.json中的内容
        if(fs.existsSync(path.join(baseUserHashDir, EXPLAIN))) {
            const explain = require(path.join(baseUserHashDir, EXPLAIN));

            // 查看readme是否存在
            if(explain.readme && fs.existsSync(path.join(baseUserHashDir, explain.readme))) {
                return {
                    ...explain,
                    readme: fs.readFileSync(path.join(baseUserHashDir, explain.readme), 'utf-8')
                }
            }
            else {
                return {
                    ...explain
                }
            }
            
        }
        else {
            return {};
        }
    },
    /**
     *  生成规则 
     *      文件目录 uploads                baseDir
     *          用户id  userId              baseUserDir
     *              文件碎片  {hash}-{num}
     *              组合文件  {hash}.{mime}
     *              文件内容  {hash}          baseUserHashDir
     */
    async beginUploadPackage(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({

            hash:       {require: true},

        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) {
            return res.send(format.error([], body));
        }

        const _this = this;
        const userId = req.session.userInfo.id;
        const hash = body.hash;
        const baseDir = path.resolve(__dirname, UPLOAD);
        const baseUserDir = path.join(baseDir, `${userId}`);
        const baseUserHashDir = path.join(baseUserDir, `${hash}`);

        /**
         * 1. 查找数据库中 hash 与 userId 是否存在
         */
        const dbResult = await db.get('package', {hash, user_id: userId});

        if(dbResult.data.length) {
            return res.send(format.error([], '文件已创建，重复上传！'));
        }

        /**
         * 2. 查看/uploads/userId/hash是否存在
         *  存在：最终生成的文件内容 201
         */
        if(fs.existsSync(baseUserHashDir)) {
            return res.send(format.success({hash, ..._this.getHashContent(baseUserHashDir)}, '文件传输完成，未创建', 201));
        }

        /**
         * 3. 查看/uploads/userId/中所有碎片包({hash}-{num})
         *  存在：返回所有碎片包名(取名{num})集合
         *  不粗在：返回空数组
         */
        if(fs.existsSync(baseUserDir)) {
            const chunkList = fs.readdirSync(baseUserDir)
                                .filter(item => new RegExp(`^${hash}-[0-9]+$`).test(item))
                                .map(item => item.split('-')[1]);
            
            return res.send(format.success(chunkList));
        }
        else {
            return res.send(format.success([]));
            
        }

    },

    /**
     *  生成规则 
     *      文件目录 filename-hash      路径名(dir)
     *          文件碎片 hash-index     路径名(fileUrl)
     *          组合文件 filename-hash  路径名(resultPath)
     */
    async mergeUploadPackage(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({
            
            total:      {require: true},
            // filename:   {require: true},
            hash:       {require: true},
            mime:       {require: true, type: 'string', scope: ['tar', 'gzip', 'tgz', 'zip']},

        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) {
            return res.send(format.error(body));
        }

        const _this = this;
        const userId = req.session.userInfo.id;
        const hash = body.hash;
        const baseDir = path.resolve(__dirname, UPLOAD);
        const baseUserDir = path.join(baseDir, `${userId}`);
        const baseUserHashDir = path.join(baseUserDir, `${hash}`);

        const packageUrl = path.join(baseUserDir, `${hash}.${body.mime}`);

        /**
         * 1. 查找/uploads/userId文件夹是否存在
         */
        if(!fs.existsSync(baseUserDir)) {
            return res.send(format.error([], '未找到用户文件夹，请重新上传'));
        }

        const chunkList = fs.readdirSync(baseUserDir)
                            .filter(item => new RegExp(`^${hash}-[0-9]+$`).test(item))
                            .sort((a, b) => a.split('-')[1] - b.split('-')[1])
                            .map(item => path.join(baseUserDir, item));
        
        /**
         * 2. 验证/uploads/userId/{hash}-{num}的数量与total是否一致
         */
        if(chunkList.length != body.total) {
            return res.send(format.error({expect: body.total, reality: chunkList.length}, '包数量验证错误，请重新上传'));
        }

        /**
         * 3. 生成名为{hash}.{mime}的文件
         */
        concat(chunkList, packageUrl, err => {

            // 删除所有碎片
            chunkList.forEach(url => fs.unlinkSync(url));

            if(err) {
                return res.send(format.error([], '文件合成失败，文件已损坏，请重新上传'));
            }

            /**
             * 4. 创建名为{hash}的文件夹
             */
            fs.mkdirSync(baseUserHashDir);

            /**
             * 5. 解压生成的包存放到{hash}文件夹中
             */
            compressing[body.mime].uncompress(packageUrl, baseUserHashDir)
            .then(() => {

                /**
                 * 6. 查看解压出来的文件是否为单一文件*夹
                 */
                const a = fs.readdirSync(baseUserHashDir);
                if(a.length === 1) {
                    const p = path.join(baseUserHashDir, a[0])
                    if(fs.statSync(p).isDirectory()) {
                        // 提取单一文件夹中的文件
                        const f = fs.readdirSync(p);
                        // 循环移动零件
                        f.forEach(item => fs.renameSync(
                            path.join(p, item),
                            path.join(baseUserHashDir, item)
                        ));

                        setTimeout(() => {
                            try {
                                fs.unlinkSync(p);
                            }
                            catch(e) {}
                        })
                    }
                }

                /**
                 * 7. 返回读取后的文件
                 */
                return res.send(format.success({hash, ..._this.getHashContent(baseUserHashDir)}));

            })
            .catch(err => {
                fs.unlinkSync(packageUrl);
                return res.send(format.error([], '解压上传包失败，请重新上传！'));
            })
        })
        
    },

    /**
     *  上传
    /**
     *
     *
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns
     */
    async uploadPackage(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({

            file:       {require: true},
            hash:       {require: true},
            index:      {require: true},

        }, req.body), body = bodyParse.data;

        const unlinkFile = () => {
            for(let k in req.body) {
                if(req.body[k] instanceof File) {
                    fs.unlinkSync(bodyParse.source[k].path);
                }
            }
        }

        /**
         * 与其他验证不同，如果是上传文件验证失败后，需要把上传上来的文件同时删除掉
         */
        if(!bodyParse.success) {
            unlinkFile();
            return res.send(format.error(body.index, body));
        }
        
        const _this = this;
        const userId = req.session.userInfo.id;
        const hash = body.hash;
        const baseDir = path.resolve(__dirname, UPLOAD);
        const baseUserDir = path.join(baseDir, `${userId}`);
        const baseUserHashDir = path.join(baseUserDir, `${hash}`);

        const chunkUrl = path.join(baseUserDir, `${body.hash}-${body.index}`);
        
        /**
         * 1. 查看整体文件包是否已经生成 '../../uploads/userId/hash'
         */
        if(fs.existsSync(baseUserHashDir)) {
            unlinkFile();
            return res.send(format.error([], '文件已生成，无需重复上传！'));
        }

        /**
         * 2. 查看文件碎片是否上传过 '../../uploads/userId/hash-{num}'
         */
        if(fs.existsSync(chunkUrl)) {
            unlinkFile();
            return res.send(format.success({index: body.index}, '上传成功!'));
        }

        /**
         * 3. 查看../../uploads/userId文件夹是否存在，没存在则创建
         */
        if(!fs.existsSync(baseUserDir)) {
            try {
                fs.mkdirSync(baseUserDir);
            }
            catch(e) {
                unlinkFile();
                return res.send(format.error(body.index, `创建用户文件夹失败 !`))
            }
        }

        /**
         * 4. 把默认文件移动到../../uploads/userId文件夹下
         */

        try {
            fs.renameSync(body.file.path, baseUserDir);
            return res.send(format.success({index: body.index}, '上传成功!'));
        }
        catch(e) {
            unlinkFile();
            return res.send(format.error(body.index, `移动碎片出错，碎片索引 ${body.index} !`))
        }

    },


    /**
     * 添加/版本 上传包信息
     */

    async createPackage(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({
            // 有id编辑 无id创建
            id: {require: false},
            title: {require: true, type: 'string', scope: 50},
            version: {require: true, type: 'string'},
            version_description: {require: true, type: 'string', scope: 200},
            description: {require: true, type: 'string', scope: 200 },
            // string创建类型 number=>id
            type_id: {require: true, scope: 16},
            cover_img: {require: false, default: []},
            sample_img: {require: false, default: []},
            readme_img: {require: false, default: []},
            // 有parent_id 创建版本
            parent_id: {require: false},
            directory_name: {require: true, type: 'string', scope: 16},
            package_size: {require: true, type: 'string'},

            package_download_url: {require: true, type: 'string'},
            package_sample_url: {require: true, type: 'string'},

            hash: {require: true, type: 'string'},


        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) {
            return res.send(format.error(body));
        }
        
        body.user_id = req.session.userInfo.id;
        body.cover_img = JSON.stringify(body.cover_img);
        body.sample_img = JSON.stringify(body.sample_img);
        body.readme_img = JSON.stringify(body.readme_img);

        

        const result = await db.insert('package', body)
        console.log(result);
        if(result.success) {
            res.send(format.success([]))
        }
        else {
            res.send(format.error(result.data))
        }
        

        
    }
}