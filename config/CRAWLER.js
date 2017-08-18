const listUrl = 'http://music.163.com/discover/playlist';


const playList = (sourceId,offset=0,limit = 35)=>{
    return `http://music.163.com/discover/playlist/?order=hot&cat=${sourceId}&limit=${limit}&offset=${offset}`;
}

const songSheet = sourceId =>{
    return `http://music.163.com/#/playlist?id=${sourceId}`
}
module.exports = {listUrl,playList,songSheet};