/**
 * Created by wdh on 2017/8/3.
 */
var mysql = require('mysql');
var bluebird = require('bluebird');

const host = 'mydb.host';
const port = 3306;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host,
    user            : 'root',
    password        : 'root',
    database        : 'yiMusic'
});

pool.getConnection(function(err,con){
     if(err) return console.log('数据库连接错误：'+err);
     return console.log('数据库连接连接成功！');
})

var getConnect = bluebird.promisify(pool.getConnection);

module.exports = getConnect;
