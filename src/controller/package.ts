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
        const dir = path.resolve(__dirname, `../../uploads/${body.filename}-${body.hash}`);
        const resultPath = path.join(dir, `${body.filename}-${body.hash}.${body.mime}`);

        // 查看组合文件是否存在 如果存在了 就不需要重复上传了
        if(fs.existsSync(resultPath)) {
            return res.send(format.error(resultPath, '文件已生成，无需重复上传！'));
        }

        // 查看文件目录是否存在 
        if(!fs.existsSync(dir)) {
            res.send(format.success([]));
        }
        else {
            dirList = fs.readdirSync(dir);
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
            return next(body)
        }

        let dirList;
        const dir = path.resolve(__dirname, `../../uploads/${body.filename}-${body.hash}`);
        const resultPath = path.join(dir, `${body.filename}-${body.hash}.${body.mime}`);


        // 查看是否有存放目录
        if(fs.existsSync(dir)) {
            dirList = fs.readdirSync(dir);
        }
        else {
            return res.send(format.error(body.filename, '未找到文件夹，请重新上传'));
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
        }).map(item => path.join(dir, item))
  
        concat(dirList, resultPath, (err) => {
            if(err) {
                res.send(format.error([], err));
            }
            else {
                // 删除原文件碎片
                dirList.forEach(url => fs.unlinkSync(url));
                // 解压压缩包
                compressing[body.mime].uncompress(resultPath, dir)
                .then(() => {

                    // 查看解压后的文件 如果是文件夹 则把文件移出来
                    let nextDirList = fs.readdirSync(dir);
                    // 排除{原}压缩文件
                    nextDirList.splice(nextDirList.indexOf(`${body.filename}-${body.hash}.${body.mime}`), 1);
                    if(nextDirList.length === 1) {
                        // 解压后文件的地址
                        const furl = path.join(dir, nextDirList[0]);
                        const stat = fs.statSync(furl);
                        if(stat.isDirectory()) {
                            const flist = fs.readdirSync(furl);
                            // 循环移除零件
                            flist.forEach(item => fs.renameSync(
                                path.join(furl, item),
                                path.join(dir, item)
                            ));

                            try {
                                fs.unlinkSync(furl);
                            }
                            catch(e) {}
                        }
                    }


                    // 返回explain.json中的内容
                    if(fs.existsSync(path.join(dir, 'explain.json'))) {
                        res.send(format.success(require(path.join(dir, 'explain.json'))));
                    }
                    else {
                        res.send(format.success({}));
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

        const dir = path.resolve(__dirname, `../../uploads/${body.filename}-${body.hash}`);
        const fileUrl = path.join(dir, `/${body.hash}-${body.index}`);
        const resultPath = path.join(dir, `${body.filename}-${body.hash}.${body.mime}`);

        // 查看是否有存放目录
        if(!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir);
            }
            catch(e) {
                return res.send(format.error(body.index, `创建文件夹失败，文件夹名称 ${body.filename} !`))
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
    }
}