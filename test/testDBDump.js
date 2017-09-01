/**
 * Created by wdh on 2017/9/1.
 */
const {exec} = require('child_process');

exec('ipconfig',(err,stdout,stderr)=>{
    if (err) console.log(['error',err])
    console.log(['stdout',stdout])
    console.log(['stderr',stderr])
})