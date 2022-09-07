import { Jsonable } from "ts-extend"
import * as nodeFs from "node:fs"
import * as nodePath from "node:path"


type GeneralConfig = {
    withLog?: boolean,
    throwWhenError?: boolean
}


type CopyDirConfig = {} & GeneralConfig

/**将一个文件夹里的所有内容复制到另一个位置
 * 
 * 目标位置文件夹如果不存在，则会创建新的文件夹
 * 
 * path: C:\GitHub\nodeDir
 * 
 * to: C:\GitHub\nodeDir_2
 */
export const copyDir = (path: string, to: string, config?: CopyDirConfig) => {
    //检查来源路径
    if (!nodeFs.existsSync(path)) {
        if (config?.throwWhenError) {
            throw "原始文件夹不存在"
        } else { return }
    }
    const pathInfo = nodeFs.statSync(path);
    //检查来源文件夹
    if (!pathInfo.isDirectory()) {
        if (config?.throwWhenError) {
            throw "路径来源不是文件夹"
        } else { return }
    }


    //检查目标文件夹
    if (!nodeFs.existsSync(to)) {
        //如果不存在，则创建
        nodeFs.mkdirSync(to)
    } else {
        //检查目标是否是文件夹
        const pathInfo = nodeFs.statSync(to);
        if (!pathInfo.isDirectory()) {
            if (config?.throwWhenError) {
                throw "目标路径不是文件夹"
            } else { return }
        }
    }

    const files = nodeFs.readdirSync(path);
    files.forEach(file => {
        const filePath = nodePath.resolve(path, `./${file}`)
        const toPath = nodePath.resolve(to, `./${file}`)
        const childInfo = nodeFs.statSync(filePath);
        if (childInfo.isDirectory()) {
            copyDir(filePath, toPath);
        } else {
            nodeFs.copyFileSync(filePath, toPath)
            if (config?.withLog) {
                console.log(`拷贝 ${filePath} 文件成功`);
            } 
        }
    });
}

type EmptyDirConfig = {} & GeneralConfig

/**将一个文件夹清空
 * 
 * 如果目标文件夹不存在，将会创建一个空的文件夹
 * 
 * path: C:\GitHub\nodeDir
 */
export const emptyDir = (path: string, config?: EmptyDirConfig) => {
    if (!nodeFs.existsSync(path)) {
        //如果不存在，则创建
        nodeFs.mkdirSync(path)
    }

    //检查目标是否是文件夹
    const pathInfo = nodeFs.statSync(path);
    if (!pathInfo.isDirectory()) {
        if (config?.throwWhenError) {
            throw "目标路径不是文件夹"
        } else { return }
    }

    const files = nodeFs.readdirSync(path);
    files.forEach(file => {
        const filePath = nodePath.resolve(path, `./${file}`)
        const stats = nodeFs.statSync(filePath);
        if (stats.isDirectory()) {
            emptyDir(filePath);
        } else {
            nodeFs.unlinkSync(filePath);
            if (config?.withLog) {
                console.log(`删除 ${filePath} 文件...`);
            }  
        }
    });
    if (config?.withLog) {
        console.log(`位置: ${path} 已清空`);
    }  
}

