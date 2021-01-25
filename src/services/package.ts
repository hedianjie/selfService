import path from 'path'
import fs from 'fs'

// export default {
//     async resolvePackage(packageDir,) {
//         const def = {
//             directory_name: `${body.filename}.${body.mime}`,
//             hash: body.hash
//         }
//         // 返回explain.json中的内容
//         if(fs.existsSync(path.join(packageDir, 'explain.json'))) {
//             const explain = require(path.join(packageDir, 'explain.json'));

//             // 查看readme是否存在
//             if(explain.readme && fs.existsSync(path.join(packageDir, explain.readme))) {


//                 res.send(format.success({
//                     ...explain,
//                     ...def,
//                     readme: fs.readFileSync(path.join(packageDir, explain.readme), 'utf-8')
//                 }));
//             }
//             else {
//                 res.send(format.success({
//                     ...explain,
//                     ...def,
//                 }));
//             }
            
//         }
//         else {
//             res.send(format.success(def));
//         }
//     }
// }