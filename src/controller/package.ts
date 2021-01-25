import {Request, Response, NextFunction} from 'express'
import {format, verification, printLog} from '../public/helper'
import db from '../public/mysql'
import concat from 'concat-files'
import File from 'formidable/lib/file'
import path from 'path'
import fs from 'fs';
import compressing from 'compressing'


export default {

    /**
     *  生成规则 
     *      文件目录 filename-hash      路径名(dir)
     *          文件碎片 hash-index     路径名(fileUrl)
     *          组合文件 filename-hash  路径名(resultPath)
     */
    async beginUploadPackage(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({
            total:      {require: true},
            hash:       {require: true},
            filename:   {require: true},
            mime:       {require: true, type: 'string', scope: ['tar', 'gzip', 'tgz', 'zip']},

        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) {
            return res.send(format.error([], body));
        }

        let dirList;
        const userInfo = req.session.userInfo;
        const userId = userInfo.id;
        const userDir = path.resolve(__dirname, `../../uploads/${userId}`);
        const packageDir = path.join(userDir, `${body.filename}-${body.hash}`);
        const resultPath = path.join(packageDir, `${body.filename}-${body.hash}.${body.mime}`);

        // 查看组合文件是否存在 如果存在了 就不需要重复上传了 直接返回结果
        if(fs.existsSync(resultPath)) {
            // 查看数据库是否已经创建这个包
            const result = await db.get('package', {
                hash: body.hash,
                user_id: userId
            });
            // console.log(resultPath)
            if(result.data.length) {
                res.send(format.error([], '文件已创建，重复上传！'));
            }
            else {
                const def = {
                    directory_name: `${body.filename}.${body.mime}`,
                    hash: body.hash
                }
                // 返回explain.json中的内容
                if(fs.existsSync(path.join(packageDir, 'explain.json'))) {
                    const explain = require(path.join(packageDir, 'explain.json'));
    
                    // 查看readme是否存在
                    if(explain.readme && fs.existsSync(path.join(packageDir, explain.readme))) {
    
    
                        res.send(format.success({
                            ...explain,
                            ...def,
                            readme: fs.readFileSync(path.join(packageDir, explain.readme), 'utf-8')
                        }, undefined, 201));
                    }
                    else {
                        res.send(format.success({
                            ...explain,
                            ...def,
                        }, undefined, 201));
                    }
                    
                }
                else {
                    res.send(format.success(def, undefined, 201));
                }
            }
            return;
        }

        // 查看文件目录是否存在 
        if(!fs.existsSync(packageDir)) {
            res.send(format.success([]));
        }
        else {
            dirList = fs.readdirSync(packageDir);
            dirList = dirList.map(item => item.split('-')[1]);
            res.send(format.success(dirList));
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
            filename:   {require: true},
            hash:       {require: true},
            mime:       {require: true, type: 'string', scope: ['tar', 'gzip', 'tgz', 'zip']},

        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) {
            return res.send(format.error(body));
        }

        let dirList;
        const userInfo = req.session.userInfo;
        const userId = userInfo.id;
        const userDir = path.resolve(__dirname, `../../uploads/${userId}`);
        const packageDir = path.join(userDir, `${body.filename}-${body.hash}`);
        const resultPath = path.join(packageDir, `${body.filename}-${body.hash}.${body.mime}`);

        // 查看是否有用户目录
        if(!fs.existsSync(userDir)) {
            return res.send(format.error(body.filename, '未找到用户文件夹，请重新上传'));
        }

        // 查看是否有存放目录
        if(fs.existsSync(packageDir)) {
            dirList = fs.readdirSync(packageDir);
        }
        else {
            return res.send(format.error(body.filename, '未找到包存放文件夹，请重新上传'));
        }

        // 验证文件数量是否符合
        if(dirList.length != body.total) {
            return res.send(format.error({expect: body.total, reality: dirList.length}, '包数量验证错误，请重新上传'));
        }

        // 文件排序
        dirList = dirList.sort((a, b) =>{
            let aIndex = a.split('-')[1];
            let bIndex = b.split('-')[1];
            return aIndex-bIndex;
        }).map(item => path.join(packageDir, item))
  
        concat(dirList, resultPath, (err) => {
            if(err) {
                res.send(format.error([], err));
            }
            else {
                // 删除原文件碎片
                dirList.forEach(url => fs.unlinkSync(url));
                // 解压压缩包
                compressing[body.mime].uncompress(resultPath, packageDir)
                .then(() => {

                    // 查看解压后的文件 如果是文件夹 则把文件移出来
                    let nextDirList = fs.readdirSync(packageDir);
                    // 排除{原}压缩文件
                    nextDirList.splice(nextDirList.indexOf(`${body.filename}-${body.hash}.${body.mime}`), 1);
                    if(nextDirList.length === 1) {
                        // 解压后文件的地址
                        const furl = path.join(packageDir, nextDirList[0]);
                        const stat = fs.statSync(furl);
                        if(stat.isDirectory()) {
                            const flist = fs.readdirSync(furl);
                            // 循环移除零件
                            flist.forEach(item => fs.renameSync(
                                path.join(furl, item),
                                path.join(packageDir, item)
                            ));

                            try {
                                fs.unlinkSync(furl);
                            }
                            catch(e) {}
                        }
                    }

                    const def = {
                        directory_name: `${body.filename}.${body.mime}`,
                        hash: body.hash
                    }
                    // 返回explain.json中的内容
                    if(fs.existsSync(path.join(packageDir, 'explain.json'))) {
                        const explain = require(path.join(packageDir, 'explain.json'));

                        // 查看readme是否存在
                        if(explain.readme && fs.existsSync(path.join(packageDir, explain.readme))) {


                            res.send(format.success({
                                ...explain,
                                ...def,
                                readme: fs.readFileSync(path.join(packageDir, explain.readme), 'utf-8')
                            }));
                        }
                        else {
                            res.send(format.success({
                                ...explain,
                                ...def,
                            }));
                        }
                        
                    }
                    else {
                        res.send(format.success(def));
                    }
                    
                })
                .catch(err =>{
                    res.send(format.error(resultPath, err));
                })
            }
        });
        
    },

    /**
     *  生成规则 
     *      文件目录 filename-hash      路径名(dir)
     *          文件碎片 hash-index     路径名(fileUrl)
     *          组合文件 filename-hash  路径名(resultPath)
     */
    async uploadPackage(req:Request, res:Response, next:NextFunction) {
        const bodyParse = verification({

            file:       {require: true},
            filename:   {require: true},
            hash:       {require: true},
            index:      {require: true},
            mime:       {require: true, type: 'string', scope: ['tar', 'gzip', 'tgz', 'zip']}

        }, req.body), body = bodyParse.data;

        if(!bodyParse.success) {
            for(let k in req.body) {
                if(req.body[k] instanceof File) {
                    fs.unlinkSync(bodyParse.source[k].path);
                }
            }
            return res.send(format.error(body.index, body));
        }
        
        const userInfo = req.session.userInfo;
        const userId = userInfo.id;
        const userDir = path.resolve(__dirname, `../../uploads/${userId}`);
        const packageDir = path.join(userDir, `${body.filename}-${body.hash}`);
        const resultPath = path.join(packageDir, `${body.filename}-${body.hash}.${body.mime}`);
        const fileUrl = path.join(packageDir, `${body.hash}-${body.index}`);

        // 查看是否有用户目录
        if(!fs.existsSync(userDir)) {
            try {
                fs.mkdirSync(userDir);
            }
            catch(e) {
                return res.send(format.error(body.index, `创建用户文件夹失败，文件夹名称 ${body.filename} !`))
            }
        }
        
        // 查看是否有存放目录
        if(!fs.existsSync(packageDir)) {
            try {
                fs.mkdirSync(packageDir);
            }
            catch(e) {
                return res.send(format.error(body.index, `创建包文件夹失败，文件夹名称 ${body.filename} !`))
            }
        }
       
        // 查看最后文件是否已经生成 如果已经生成了 则不操作直接返回成功
        if(fs.existsSync(resultPath)) {
            res.send(format.error([], '文件已生成，无需重复上传！'));
            printLog('big upload', '文件已生成，无 需重复上传！');
            return;
        }
    
        // 查看文件包是否存在 存在则删除内存中的包 直接返回成功
        if(fs.existsSync(fileUrl)) {
            fs.unlinkSync(body.file.path);
            res.send(format.success({
                index: body.index,
                url: fileUrl
            }, '上传成功!'));
            printLog('big upload', '文件已存在')
        }
        // 不存在则把文件移动过来
        else {
            try {
                fs.renameSync(body.file.path, fileUrl);
                res.send(format.success({
                    index: body.index,
                    url: fileUrl
                }, '上传成功!'));
                printLog('big upload', '新上传的文件包')
            }
            catch(e) {
                res.send(format.error(body.index, `移动包出错，包索引 ${body.index} !`))
            }
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