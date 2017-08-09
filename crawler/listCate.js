/**
 * Created by wdh on 2017/8/4.
 */
const Crawler = require('crawler');
const crawler_config = require('../config/CRAWLER');
const connect = require('../config/DBCONFIG');

const EventEmitter = require('events');

let emitter = new EventEmitter();

let crawler = new Crawler({
    maxConnections:1,
})

crawler.queue({
    uri:crawler_config.listUrl,
    callback:(err,res,done)=>{
        if(err){
            console.warn('爬去歌单分类报错！');
            done();
            process.exit(1)
        }else{
            done();
            dbFunc(connect,getContext(res.$))
            emitter.emit('over');
        }
    }});


function getContext($){
    var $context  = $('#cateListBox .f-cb');
    if(!$context.length) return console.warn('歌单分类dom 为空！');
    let sourceId, //
        name,//分类名称
        by;//大分类
        // created_at;//创建时间
        // updated_at//更新时间

    let sql = 'insert ignore into category (sourceId,name,`by`,created_at) values ';

    $context.each(function(idx){
        let $val = $context.eq(idx)
        by = $val.children('dt').text();
        let $val_son = $val.children('dd').children('a');
        $val_son.each(function(idx){
            let $tmp = $val_son.eq(idx);
            name = $tmp.attr('data-cat');
            sourceId = encodeURI(name);
            sql += `('${sourceId}','${name}','${by}',now()),`;
        })
        // name = val/
    })
    sql = sql.slice(0,-1);
    return sql;
}

function dbFunc(con,sql) {
    con.connect((err)=>{
        if(err) console.warn('创建数据连接失败：'+err);
    })
    con.query(sql,(err,results,fields)=>{
        if(err) return console.warn(err);
        process.exit(1);
    })
}

module.exports = {emitter};