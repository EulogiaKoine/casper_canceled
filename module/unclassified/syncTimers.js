'use strict';

importClass(java.lang.Thread);
importClass(java.util.concurrent.LinkedBlockingQueue);

module.exports = function(){

let currentId = -2;
const list = {};

const SQ = new LinkedBlockingQueue();
const Stack = new Thread({run: function(){
    let f;
    while(true){
        try{
            f = SQ.take();
            f.args ? f.apply(undefined, f.args) : f();
        } catch(e) {
            Log.e(e);
        }
    }
}});
Stack.start();

const WQ = new LinkedBlockingQueue();
const Waiting = new Thread({run: function(){
    let f;
    while(true){
        try{
            f = WQ.take();

            if(f.end <= Date.now()){
                SQ.put(f);

                if(f.repeat){
                    f.end += f.long;
                    WQ.put(f);
                } else {
                    delete list[f.id];
                }
            } else {
                WQ.put(f);
            }
        } catch(e) {
            Log.e(e);
        }
    }
}});
Waiting.start();

function st2(fn, time, args){
    if(typeof fn !== 'function'){
        throw new TypeError("setTimeout2_ 1st argument, 'function' must be a function");
    }

    if(!(args === undefined || args instanceof Array)){
        throw new TypeError("setTimeout2_ 3rd argument, 'arguments' must be an array");
    }

    fn = new Function(fn);

    fn.args = args;
    fn.end = (typeof time === 'number') ? (Date.now() + Math.floor(time)) : 0;

    let id = ++currentId;
    fn.id = id;

    list[id] = true;
    WQ.put(fn);
    return id;
}
const setTimeout2 = st2.bind(undefined);

function si2(fn, time, args){
    if(typeof fn !== 'function'){
        throw new TypeError("setTimeout2_ 1st argument, 'function' must be a function");
    }

    if(!(args === undefined || args instanceof Array)){
        throw new TypeError("setInterval2_ 3rd argument, 'arguments' must be an array");
    }

    fn = new Function(fn);
    fn.args = args;

    time = (typeof time === 'number')? Math.floor(time): 1000;
    if(time <= 0){
        throw new TypeError("setInterval2_ 2nd argument, 'time' must be more than 0");
    }
    fn.end = Date.now() + time;
    fn.long = time;
    fn.repeat = true;

    let id = ++currentId;
    fn.id = id;

    list[id] = true;
    WQ.put(fn);
    return id;
}
const setInterval2 = si2.bind(undefined);

function ct(id){
    if(!list[id]){
        throw new ReferenceError("clearTime_ id '" + id + "' doesn't exists");
    }

    WQ.remove(list[id]);
    delete list[id];
}
const clearTime = ct.bind(undefined);

function asc(fn){
    if(typeof fn !== 'function'){
        throw new TypeError("async_ 1st argument, 'func' must be a function");
    }

    fn = new Function(fn);
    fn.args = Array.from(arguments).splice(1);
    SQ.put(fn);
}
const as = asc.bind(undefined);


return {
    "setTimeout": setTimeout2,
    "setInterval": setInterval2,
    "clearTime": clearTime,
    "async": as
};
}();
