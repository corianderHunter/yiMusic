/**
 * Created by wdh on 2017/8/18.
 */

let Strings = {
    formatSQLString(str){
        return str.replace(/\"/g,'').replace(/\\/g,'').replace(/\//g,'');
    }
}

module.exports = Strings;