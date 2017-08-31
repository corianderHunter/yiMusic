/**
 * Created by wdh on 2017/8/11.
 */
const Crawler = require('crawler');
const connect = require('../config/DBCONFIG');
const Promise = require('bluebird');
const config = require('../config/CRAWLER');
const Strings = require('../utils/Strings');

let logger = require('../config/log4j');

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
    let arr = []
    for(let i=0;i<times;i++){
        arr.push(i);
    }
    Promise.each(arr,(val)=>{
        return new Promise((resolve,reject)=>{
            main(val,resolve,reject)
        })
    }).then(()=>{
        logger.system().info('歌曲爬去完毕！！')
    }).catch(()=>{

    })
}).catch(err=>{
    if(err) console.warn('数据库查询报错');
})



function main(times,resolve,reject){
    let curSql = sql.getPlaylistByPage(times*1000,times*1000+1000);
    let count = 0
    query(curSql).then(results=>{
        let buildQueue = results.map(val=>{
            return {
                uri:config.songSheet(val.sourceId),
                callback:(err,res,done)=>{
                    if(err) return console.error(['爬去页面信息失败！',err]);
                    if(res.statusCode!=200&&res.statusCode!=304) return logger.system().error('页面'+config.songSheet(val.sourceId)+'爬去异常'),logger.system().error('爬去页面返回错误的响应码'+res.statusCode)
                    logger.system().info('爬去歌单'+config.songSheet(val.sourceId)+'的页面内容');
                    var $ = res.$;
                    Promise.all([new Promise((resolve,reject)=>{
                        doSql_songSheet($,val.sourceId,resolve,reject)
                    })],new Promise((resolve,reject)=>{
                        doSql_common($,val.sourceId,resolve,reject)
                    })).then(()=>{
                        count++;
                        if(count===1000) resolve();
                    }).catch(()=>{
                        reject();
                    })
                    done()
                }
            };
        })
        crawler.queue(buildQueue)
    }).catch(err=>{
        if (err) logger.system().error('查询歌单id报错！'),logger.system().error(err);
    })
}

function doSql_songSheet($,sId,resolve,reject){
    let author,ctime,imgUrl,tag,desciption,collectCount,shareCount,playCount,commentCount;
    let sql = '';

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
    collectCount = $('#content-operation .u-btni-fav i').attr('data-count')-0;
    shareCount = $('#content-operation .u-btni-share i').attr('data-count');
    shareCount = shareCount.slice(1,-1)-0;
    playCount = $('#play-count').text() - 0;
    commentCount = $('#cnt_comment_count').text()-0;

    sql += `update playlist set author="${author}",ctime="${ctime}",imgUrl="${imgUrl}",tag="${tag}",description="${desciption}",collectCount="${collectCount}",
        shareCount=${shareCount||0},playCount=${playCount||0},commentCount=${commentCount||0} where sourceId="${sId}"`

    query(sql).then(result=>{
        resolve(result);
    }).catch(err=>{
        logger.system().error(`database 错误：录入歌单${config.songSheet(sId)}报错！`);
        logger.system().error(err);
        reject();
    })

}

function doSql_common($,sId,resolve,reject){
    let songs;
    try {
        let json = $('#song-list-pre-cache textarea').text();
        songs = JSON.parse(json);
    }catch(err) {
        logger.system().error('歌单'+config.songSheet(sId)+'内歌曲列表json to object报错！');
        logger.system().error(err);
        return;
    }
    Promise.all([new Promise((resolve,reject)=>{
        doSql_song(sId,songs,resolve,reject);
    }),new Promise((resolve,reject)=>{
        doSql_album(sId,songs,resolve,reject);
    }),new Promise((resolve,reject)=>{
        doSql_singer(sId,songs,resolve,reject);
    })]).then(()=>{
        resolve();
    }).catch(()=>{
        reject();
    })

}

function doSql_song(sId,songs,resolve,reject) {
    let sourceId,name,singer,album,duration,mvid,score;
    let sql = `insert ignore into song (sourceId,name,singer,album,duration,mvid,score) values `;
    songs.forEach(val=>{
        val.artists.length?singer = val.artists.reduce(function(sum,value){
            return sum.name||''+','+value.name||'';
        }):''
        sql += `("${val.id||""}","${val.name||""}","${singer}","${val.album.id||""}",${val.duration||0},${val.mvid||0},${val.score||null}),`
    })
    sql = sql.slice(0,-1);
    query(sql).then(()=>{
        resolve();
    }).catch(function(err){
        reject();
        logger.system().error('歌单'+config.songSheet(sId)+'内 录入歌曲数据 报错！');
        logger.system().error(err);
    })
}

function doSql_singer(sId,songs,resolve,reject){
    let sourceId,name,tns;
    let sql = `insert ignore into artist (sourceId,name,tns) values `;
    songs.forEach(val=>{
        val.artists.forEach(val=>{
            sql += `("${val.id||""}","${val.name||""}","${val.tns.toString()}"),`
        })
    })
    sql = sql.slice(0,-1)
    query(sql).then(()=>{
        resolve();
    }).catch((err)=>{
        reject();
        logger.system().error('歌单'+config.songSheet(sId)+'内 录入歌手数据 报错！');
        logger.system().error(err);
    })

}

function doSql_album(sId,songs,resolve,reject){
    let sourceId,name,pic,picUrl,tns;
    let sql = `insert ingore into album (sourceId,name,pic,picUrl,tns) values `;
    songs.forEach(val_=>{
        let val = val_.abulm||{};
        sql += `("${val.id||""}","${val.name||""}","${val.pic||""}","${val.picUrl||""}","${val.tns.toString()}"),`
    })
    sql = sql.slice(0,-1)
    query(sql).then(()=>{
        resolve();
    }).catch(()=>{
        reject();
        logger.system().error('歌单'+config.songSheet(sId)+'内 录入专辑数据 报错！');
        logger.system().error(err);
    })
}