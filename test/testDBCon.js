/**
 * Created by wdh on 2017/8/3.
 */
var getCon = require('../config/DBCONFIG')

getCon().then(function(con){
            console.log('连接成功！')
            console.log(con);
        })
        .catch(err=>{
            console.log('连接数据发生错误：'+err);
        })  