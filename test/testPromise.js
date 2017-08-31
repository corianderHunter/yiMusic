/**
 * Created by wdh on 2017/8/30.
 */
// var Promise = require('bluebird')
//
// var a = [1000,3000,2000,4000,1]
//
// Promise.each(a,(val,idx)=>{
//     new Promise((resolve,reject)=>{
//         setTimeout(()=>{
//             resolve();
//             console.log(idx)
//         },val)
//     })
// }).then((val)=>{
//     console.log(val);
// })

var Promise = require('bluebird');

function makePromise(name, delay) {
    return new Promise((resolve) => {
        console.log(`${name} started`);
        setTimeout(() => {
            console.log(`${name} completed`);
            resolve(name);
        }, delay);
    });
}

var data = [2000, 1, 1000];

Promise.each(data, (item, index) => makePromise(index, item)).then(res => {
    console.log(res);
});