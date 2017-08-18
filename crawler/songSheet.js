/**
 * Created by wdh on 2017/8/11.
 */
const Crawler = require('crawler');
const connect = require('../config/DBCONFIG');
const Promise = require('bluebird');
const config = require('../config/CRAWLER');
const Strings = require('../utils/Strings')

connect.connect(err=>{
    if(err) console.log('数据库连接错误：'+err),process.exit(1);
})

let query = Promise.promisify(connect.query,{context:connect});

let crawler = new Crawler({
    maxConnections:50
    //  rateLimit:1
})

let sql = {
    getCount:'select count(1) from playlist',
    getPlaylistByPage:(from,to)=>{
        return `select sourceId from playlist limit ${from},${to}`;
    }
}

query(sql.getCount).then(result=>{
    let count = result[0]['count(1)']
    console.log('目前歌单数量：'+count);
    return count;
}).then(count=>{
    let times = Math.floor(count/1000);
}).then(()=>{
    console.log(2)
}).catch(err=>{
    if(err) console.warn('数据库查询报错');
})

function main(times){
    let curSql = sql.getPlaylistByPage(times*1000,times*1000+1000);
    let count = 0
    query(curSql).then(results=>{
        let queue = results.map(val=>{
            return {
                uri:config.songSheet(val.sourceId),
                callback:(err,res,done)=>{
                    if(err) return console.error(['爬去页面信息失败！',err]);
                    getSql($);
                }
            };
        })
        crawler.queue()
    }).catch(err=>{
        if (err) console.warn('查询')
    })
}

function getSql($){
    let author,ctime,imgUrl,tag,desciption,collectionCount,sharCount,playCount,commentCount;

    author = $('#m-playlist .user .name a').text()||'';
    author = Strings.formatSQLString(author);
    ctime = $('#m-playlist .user .time').text().slice(0,10)||'';
    imgUrl = $('#m-playlist .j-img').attr('data-src');
    imgUrl = Strings.formatSQLString(imgUrl);

    let tag_arr = [];
    let $tags = $('.tags .u-tag i');
    $tags.each(function(idx,val){
        tag_arr.push($tags.eq(idx).text());
    })
    tag = tag_arr.toString();
    desciption = $('#album-desc-more').text();
    desciption = Strings.formatSQLString(desciption);
}