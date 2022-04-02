'use strict'

module.exports = (function(){

const logs = {};

function CustomLog(name, max){
    if(this instanceof CustomLog){
        if(name in logs || name === undefined){
            throw new ReferenceError("CustomLog_ cannot construct such name of custom log: '"+name+"', it already exists");
        }

        Object.defineProperty((logs[name] = this), 'name', {
            value: name,
            writable: false
        });
        
        this.max = ((typeof max === 'number') && (max >= 0))? (max >>> 0) : 100;
        this.list = [];
    } else {
        return new CustomLog(name, max);
    }
}

CustomLog.prototype = {
    log: function(content){
        const list = this.list;
        list.unshift({
            "date": new Date(),
            "content": content
        });
        if(list.length > this.max){
            list.length = this.max;
        }
    },
    getLogs: function(){
        return this.list;
    },
    getLatest: function(){
        return this.list[0];
    },
    getLatests: function(n){
        return this.list.slice(0, (n || 1));
    },
    clear: function(){
        this.list.length = 0;
    },
    setMax: function(max){
        if((typeof max !== 'number') || (max < 1)){
            throw new TypeError("CustomLog.setMax_ max size must be a natural number");
        }
        max = max >>> 0;
        if(this.list.length > max) this.list.length = max;
        return (this.max = max);
    },
    toString: function(n){
        n = this.list[n];
        if(n){
            return JSON.stringify(n);
        }
        return undefined;
    }
};

CustomLog.get = (function(name){
    return this[name];
}).bind(logs);

CustomLog.getAll = (function(){
    return this;
}).bind(logs);

CustomLog.remove = (function(name){
    if(name in this){
        return delete this[name];
    }
    return false;
}).bind(logs);

return CustomLog;
})();