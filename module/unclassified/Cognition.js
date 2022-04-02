'use strict';
/**
 * @author Eulogia Koinē
 * @name Cognition
 * @see send
 * @see java.lang.Thread
 * @see java.util.concurrent.LinkedBlockingQueue
 * @description 인지필터(Cognitive filter); 객체 상태의 정보를 필터를 거쳐 문자열로 가공하여 전송
 */

module.exports = (function(){

if(send === undefined){
    throw new ReferenceError("module-Cognition_ this module sees function 'send'");
}

const filters = {
    "none": (i => i).bind(undefined),
    "msg": (i => i.msg).bind(undefined),
    "json": (i => JSON.stringify(i, null, 3)).bind(undefined)
};
const queue = new java.util.concurrent.LinkedBlockingQueue();

const thread = new java.lang.Thread({run: function(){
    let s, f;
    while(true){
        try{
            s = queue.take();
            f = filters[s.f];
            send(s.r, (f? f: filters.none)(s.i));
        } catch(e) {
            Log.e(e);
        }
    }
}});
thread.start();

const process = (r, i, f) => queue.put({'r':r, 'i':i, 'f': f});

return {
    getFilter: (function(f){
        return this[f];
    }).bind(filters),
    getFilters: (function(){
        return this;
    }).bind(filters),
    setFilter: (function(f, fn){
        return this[f] = fn.bind(undefined);
    }).bind(filters),
    process: process.bind(undefined)
};
})();