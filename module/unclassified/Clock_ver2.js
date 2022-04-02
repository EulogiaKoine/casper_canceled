'use strict';

if(Event === undefined){
    throw new ReferenceError("Clock_ this module requires Event module in global");
}

module.exports = (function(){

//protected
const queue = new java.util.concurrent.LinkedBlockingQueue();
const now = Date.now;

function checkingFunc(){
    while(true){
        queue.take().exec();
    }
}
const thread = new java.lang.Thread({run: checkingFunc});
//protected

//---------- Timer ----------
const timer_db = {};

function Timer(event, long, info, speed, repeat){
    const id = Timer.generateId();
    Object.defineProperty(this, 'id', {
        value: id,
        enumerable: true
    });

    if(Event.exists(event)){
        this.event = event;
    } else {
        throw new ReferenceError("Timer_ 1st argument, event \"" + ev + "\" doesn't exists");
    }

    if(typeof long === 'number' || long < 1){
        this.long = long >>> 0;
    } else {
        throw new TypeError("Timer_ 2nd argument, long must be a natural number");
    }

    this.info = typeof info === 'object'? info: {};
    this.start = null;
    this.end = null;
    this.running = false;

    this.speed = speed || 1;
    this.repeat = repeat === true;
}

Object.defineProperties(Timer, {
    DB: {
        value: timer_db
    },
    getList: {
        value: (function(){
            return Object.keys(this).map(v => this[v]);
        }).bind(timer_db),
        enumerable: true
    },
    get: {
        value: (function(id){
            return this[id];
        }).bind(timer_db),
        enumerable: true
    },

    generateId: {
        value: (function(){
            let id = 1;
            while(id in this) id++;
            return String(id);
        }).bind(timer_db),
        enumerable: true
    },

    getRunnings: {
        value: (function(){
            return Object.keys(this)
                    .map(v => this[v])
                    .filter(v => v.running);
        }).bind(list),
        enumerable: true
    }
});

Object.defineProperties(Timer.prototype, {
    TYPE: {
        value: 'timer',
        enumerable: true
    },

    getId: {
        value: function(){
            return this.id;
        },
        enumerable: true
    },
    getLong: {
        value: function(){
            return this.long;
        },
        enumerable: true
    },
    setLong: {
        value: function(){
            if(this.running){
                throw new Error("Timer.setLong_ cannot set the long of timer(ID: "+this.id+"), it's running now");
            }

            if((typeof long !== 'number') || long < 1){
                throw new TypeError("Timer.setLong_ cannot set the long of timer(ID: "+this.id+"), long must be a natural number");
            }
        
            this.long = long >>> 0;
        },
        enumerable: true
    },

    getEvent: {
        value: function(){
            return this.event;
        },
        enumerable: true
    },
    setEvent: {
        value: function(ev){
            if(Event.exists(ev)){
                return this.event = ev;
            }
            throw new ReferenceError("Timer.setEvent_ cannot set event '"+ev+"', it's now an event(timer ID: "+this.id+")");
        },
        enumerable: true
    },

    getInfo: {
        value: function(){
            return this.info;
        },
        enumerable: true
    },
    setInfo: {
        value: function(info){
            if(typeof info === 'object'){
                return this.info = info;
            }
            throw new ReferenceError("Timer.setEvent_ cannot set event '"+ev+"', it's not an event(timer ID: "+this.id+")");
        },
        enumerable: true
    },

    getSpeed: {
        function(){
            return this.speed;
        },
        enumerable: true
    },
    setSpeed: {
        value: function(speed){
            if(this.speed === speed){
                return;
            }
        
            if((typeof speed !== 'number') || (speed <= 0)){
                throw new TypeError("Timer.setSpeed_ the speed must be greater than 0; timer ID: "+this.id);
            }
        
            if(this.end && this.running){
                const N = now();
                this.end = N + ((this.end - N) * this.speed / speed >>> 0);
            }
            
            this.speed = speed;
        },
        enumerable: true
    },

    setRepeatable: {
        value: function(repeat){
            this.repeat = repeat === true;
        },
        enumerable: true
    },

    run: {
        value: function(){
            if(this.running){
                throw new Error("Timer.run_ cannot run timer(ID: "+this.id+"), it's already running");
            }

            if(this.end){
                this.end = now() + (this.end / this.speed >>> 0);
            } else {
                this.end = (this.start = now()) + (this.long / this.speed >>> 0);
            }

            this.running = true;
            queue.put(this);
        },
        enumerable: true
    },

    pause: {
        value: function(){
            if(this.running){
                while(!queue.remove(this)){}
    
                this.running = false;
                this.end = (this.end - now()) * this.speed >>> 0;
            } else {
                throw new Error("Timer.pause_ cannot pause the timer(ID: "+this.id+"), it's already paused");
            }
        },
        enumerable: true
    },

    left: {
        value: function(){
            if(this.end){
                if(this.running){
                    return (this.end - now()) * this.speed >>> 0;
                }
                return this.end;
            }
            return this.long;
        },
        enumerable: true
    },

    reset: {
        value: function(){
            if(this.running){
                while(!queue.remove(this)){}
                this.running = false;
            }
            this.start = null;
            this.end = null;
        }
    },

    edit: {
        value: function(time){
            if(typeof time !== 'number'){
                throw new TypeError("Timer.editTime_ time must be a number; timer ID: "+this.id);
            }

            if(this.end){
                if(this.running){
                    return !!(this.end += time / this.speed >> 0);
                }
                return !!(this.end += time);
            }
            return false;
        },
        enumerable: true
    },

    exec: {
        value: function(){
            if(this.end <= now()){
                Event.exec(this.event, this.info);

                if(this.repeat){
                    this.end += this.long / this.speed >>> 0;

                    queue.put(this);
                } else {
                    this.start = null;
                    this.end = null;
                    this.running = false;
                }
            }
        },
        enumerable: true
    }
});
//---------- Timer ----------

//---------- Alarm ----------
function Alarm(){

}
//---------- Alarm ----------



})();