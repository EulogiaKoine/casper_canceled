'use strict';

/**
 * @see CustomLog
 * @author Koinē
 */

if(CustomLog === undefined){
    throw new ReferenceError("Event_ this module requires CustomLog in global");
}

module.exports = (function(){

const list = {};
const exec = new CustomLog("event_execution", 1000);
const err = new CustomLog("event_error", 100);
let id = 1;

const Q = new java.util.concurrent.LinkedBlockingQueue();
const F = function(){
    let e;
    while(true){
        try{
            e = Q.take();
            if(e.f in list){
                list[e.f](e.i);
                exec.log(e.id);
            } else {
                exec.log("no event: "+e.id);
            }
        } catch(er){
            err.log({'ev':e, 'err':er});
        }
    }
};
const T = new java.lang.Thread({run: F});

const Event = {};
Object.defineProperties(Event, {
    list: {
        value: list
    },
    getList: {
        value: (function(){
            return this;
        }).bind(list),
        enumerable: true
    },
    get: {
        value: (function(e){
            return this[e];
        }).bind(list),
        enumerable: true
    },
    exists: {
        value: (function(e){
            return e in this;
        }).bind(list),
        enumerable: true
    },

    exec_log: {
        value: exec
    },
    err_log: {
        value: err
    },
    getLog: {
        value: (function(type){
            switch(type){
                case 'execution':
                    return exec;
                case 'error':
                    return err;
            }
            throw new TypeError("Event.getLog_ there is no log called \""+type+'"');
        }).bind(undefined)
    },

    queue: {
        value: Q
    },
    getQueue: {
        value: (function(){
            return Q;
        }).bind(undefined),
        enumerable: true
    },

    fn: {
        value: F,
        writable: true
    },
    thread: {
        value: T,
        writable: true
    },
    getThread: {
        value: (function(){
            return this.thread;
        }).bind(Event),
        enumerable: true
    }
});

Event.set = (function(name, fn){
    if(name in list){ 
        throw new ReferenceError("Event.set_ event name '"+name+"' already exists");
    }
    if(typeof fn !== 'function'){
        throw new TypeError("Event.set_ 2nd argument must be a function");
    }
    this[name] = fn.bind(undefined);
}).bind(list);

Event.remove = (function(name){
    if(name in this){
        return delete this[name];
    }
    return false;
}).bind(list);

Event.exec = (function(fn, info){
    if(fn in list){
        Q.put({
            id: new String(id++),
            f: new String(fn),
            i: info
        });
    } else {
        throw new ReferenceError("Event.exec_ there is no event '"+fn+"'");
    }
}).bind(undefined);

return Event;
})();