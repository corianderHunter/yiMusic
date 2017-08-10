/**
 * Created by wdh on 2017/8/9.
 */
const Crawler = require('crawler');
const connect = require('../config/DBCONFIG');
const Promise_ = require('bluebird');
const playList = require('../config/CRAWLER').playList;
const Emitter = require('events');
const fs = require('fs')
const path = require('path');
const config = require('../config')


const emitter = new Emitter();

let errorUri = [];


connect.connect(err=>{
    if(err) console.log('数据库连接错误：'+err),process.exit(1);
})

let crawler = new Crawler({
    maxConnections:10
    //  rateLimit:1
})

var sql = 'select sourceId,name,`by`,created_at,updated_at from category'

let query = Promise_.promisify(connect.query,{context:connect});

query(sql).then((result)=>{
    return result.map((val)=>{
        return {
            uri:playList(val.sourceId,undefined,undefined),
            sourceId:val.sourceId
        };
    })
}).catch(err=>{
    console.error(['数据查询报错！','sql-->'+sql,'err-->'+err]);
    process.exit(1);
}).then(urls=>{
    let count = 0;
    let urls_new = urls.map((val,idx)=>{
        return {
            uri:val.uri,
            callback:(err,res,done)=>{
                function getpage($){
                    let $dom = $('#m-pl-pager').children('.u-page').children('.zpgi')
                    let page = $dom.eq($dom.length-1).text();
                    return page-0;
                }
                let page = getpage(res.$);
                urls[idx]['page'] = page;
                count++;
                if(count === urls.length){
                    console.log('所有类别歌单分页数获取结束');
                    emitter.emit('songList',createNewUrls(urls));
                }
                done();
            }
        }
    })
    crawler.queue(urls_new);
});

emitter.on('songList',(urls)=>{
    const length = urls.length;
    let count = 0;
    let buildQueue = urls.map(val=>{
        return {
            uri:val,
            callback:(err,res,done)=>{
                if(err) console.error(['爬去页面信息失败！',err]),exit(1);
                doSql(getSql(res.$),val);
                count++;
                if(count===length){
                    emitter.emit('over');
                }
                done();
            }
        }
    })
    crawler.queue(buildQueue);
})

emitter.on('over',()=>{
    if(!errorUri.length) console.log('listSongSheet over task'),process.exit(1);
    let time = (new Date()).getTime();
    let fileName = time+'-playlist-init';
    fileName = path.resolve(config.errorDir,fileName)
    fs.writeFile(JSON.stringify(errorUri),fileName,'utf-8',function(err){
        if(err) console.log('写入文件报错!'+error);
        console.log('错误文件：'+fileName),process.exit(1);
    })
})

function createNewUrls(urls){
    let result = []
    for(let i=0;i<urls.length;i++){
        for(let j=0;j<urls[i].page;j++){
            result.push(playList(urls[i].sourceId,j*35))//这个35 是分页的limit
        }
    }
    return result;
}

function getSql($) {
    let $doms = $('#m-pl-container>li .u-cover');
    if(!$doms.length) return console.warn('未获取到任何歌单！');
    let sourceId,imgUrl,name;
    let sql = 'insert ignore into playlist (sourceId,name,imgUrl) values ';
    $doms.each(function(idx){
        let that = $doms.eq(idx);
        imgUrl = that.children('img').attr('src');
        name = that.children('a').attr('title');
        name = name.replace(/\"/g,'');
        sourceId = that.children('.bottom').children('a').attr('data-res-id');
        sql += `("${sourceId}","${name}","${imgUrl}"),`;
    });
    return sql.slice(0,-1);
}

function doSql(sql,val) {
    query(sql).then(function(results){
        console.log('爬去页面：'+val);
    }).catch(err=>{
        console.error(['数据查询报错！','sql-->'+sql,'err-->'+err]);
        errorUri.push(val);
    })
}