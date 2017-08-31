/**
 * Created by wdh on 2017/8/29.
 */
var log4j = require('log4js')

var config = {
    appenders:[
        {
            type:'console'
        },
        {
            type: 'dateFile',
            category: 'system',
            filename: '../logs/system/system',
            pattern: '-MM-dd.log',
            alwaysIncludePattern: true
        },
        {
            type: 'logLevelFilter',
            level: 'ERROR',
            appender: {
                type: 'dateFile',
                filename: '../logs/error/error',
                pattern: '-MM-dd.log',
                alwaysIncludePattern: true
            }
        }
    ],
    replaceConsole: true
}

log4j.configure(config);

module.exports = {
    system: function () {
        return log4j.getLogger('system');
    },
}