/**
 * Created by wdh on 2017/8/3.
 */
var mysql = require('mysql');
var bluebird = require('bluebird');

const host = 'localhost';
const port = 3306;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host,
    user            : 'root',
    password        : 'root',
    database        : 'yiMusic'
});

var getConnect = bluebird.promisify(pool.getConnection);

module.exports = getConnect;