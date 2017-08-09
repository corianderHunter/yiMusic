/**
 * Created by wdh on 2017/8/3.
 */
var mysql = require('mysql');
var bluebird = require('bluebird');

const host = 'localhost';
const port = 3306;

var con  = mysql.createConnection({
    host,
    user            : 'root',
    password        : 'root',
    database        : 'yiMusic'
});

module.exports = con;
