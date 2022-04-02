'use strict';
/**
 * @author Eulogia Koinē
 * @name Clock
 * @see java.lang.Thread
 * @see java.util.concurrent.LinkedBlockingQueue
 * @see CustomLog
 * @description 시계
 */

module.exports = (function(){

//see...
const Thread = java.lang.Thread;
const LinkedBlockingQueue = java.util.concurrent.LinkedBlockingQueue;
const CustomLog = require('./CustomLog.js');
const now = Date.now;


//------------------- privates -------------------
const TQ = new LinkedBlockingQueue();
const WQ = new LinkedBlockingQueue();
const SQ = new LinkedBlockingQueue();

const timer = {};
const alarm = {};
const stopwatch = {};

const event = {
    'send': (i => Api.replyRoom(i.room, i.msg, true)).bind(undefined)
};
const event_log = new CustomLog("event_log", 1000);
const log = event_log.log.bind(event_log);

/**
 * @description a main event thread
 * @see SQ stack queue
 * @see event event functions
 */
const ST = new Thread({run: function(){
    let c; //timer or alarm
    while(true){
        try{
            c = SQ.take();
            log(c.TYPE+"."+c.id+" run :");
            log(event[c.event](c.info));
        } catch(e) {
            log(e);
        }
    }
}});
ST.start();

/**
 * @description a timer checking thread
 * @see TQ timer queue
 */
const TT = new Thread({run: function(){
    let t; //timer
    while(true){
        t = TQ.take();

        if(t.end < now()){
            SQ.put(t);

            if(t.repeat){
                t.editTime(t.long);
                TQ.put(t);
            } else {
                t.start = null;
                t.end = null;
                t.running = false;
            }
        } else {
            TQ.put(t);
        }
    }
}});
TT.start();

/**
 * @description a alarm checking thread
 * @see AQ alarm queue
 */
const AT = new Thread({run: function(){
    let a; //alarm
    while(true){
        a = AQ.take();

        if(a.check()){
            SQ.put(a);

            if(!c.repeat){
                AQ.put(a);
            } else {
                a.running = false;
            }
        } else {
            AQ.put(a);
        }
    }
}});
AT.start();


//------------------- privates -------------------



//------------------- Timer -------------------

/**
 * @name Timer
 * @constructor
 * 
 * @param {String} ev the name of the event that will occur when the time is done
 * @param {Number} long time long; unit: ms
 * @param {any} info an information that will used by event
 * @param {Boolean} repeat repeatable
 * @example new Timer('send', 1000, {room: "프로젝트 - 테스팅 방★", msg: "timer test success!""});
 */
function Timer(ev, long, info, repeat){
    const id = Timer.generateId();
    Object.defineProperty(this, "id", {
        value: id,
        writable: false
    });
    timer[id] = this;

    if(!ev in event){
        throw new ReferenceError("Timer_ event \"" + ev + "\" doesn't exists");
    }
    this.event = ev;

    if((typeof long !== 'number') || (long < 0)){
        throw new TypeError("Timer_ long must be a zero or a positive number");
    }
    this.long = long;

    this.info = info;
    this.running = false;
    this.start = null;
    this.end = null;

    this.speed = 1;
    this.repeat = repeat === true;
}

Object.defineProperties(Timer, {
    queue: {
        value: TQ
    },
    getQueue: {
        value: (function(){
            return this.queue;
        }).bind(Timer),
        enumerable: true
    },

    thread: {
        value: TT
    },
    getThread: {
        value: (function(){
            return this.thread;
        }).bind(Timer),
        enumerable: true
    },

    DB: {
        value: timer
    },
    getList: {
        value: (function(){
            return this;
        }).bind(timer),
        enumerable: true
    },

    lastId: {
        value: 1,
        writable: true
    },
    generateID: {
        value: (function(){
            let id = this.lastId + 1;

            while(id in timer){
                id++;
            }

            return this.lastId = id;
        }).bind(Timer),
        enumerable: true
    },

    get: {
        value: (function(id){
            return this[id];
        }).bind(timer),
        enumerable: truel
    },

    join: {
        value: (function(timer){
            if(timer instanceof this){

            }
        }).bind(Timer)
    }
});

Object.defineProperty(Timer.prototype, 'TYPE', {
    value: "timer",
    writable: false
});


/**
 * @return {Number} Timer's ID
 */
Timer.prototype.getId = function(){
    return this.id;
};

/**
 * @description set long
 * @param {Number} long
 */
Timer.prototype.setLong = function(long){
    if(this.running){
        throw new Error("Timer.setLong_ cannot set the long of timer(ID: "+this.id+"), it's running now");
    }

    if((typeof long !== 'number') || long < 0){
        throw new TypeError("Timer.setLong_ cannot set the long of timer(ID: "+this.id+"), long must be a zero or a positive number");
    }

    this.long = long >>> 0;
};

/**
 * @returns {Number} this.long
 */
Timer.prototype.getLong = function(){
    return this.long;
};

/**
 * @description set event
 * @param {String} ev a name of the event function
 */
Timer.prototype.setEvent = function(ev){
    if(!ev in event){
        throw new ReferenceError("Timer.setEvent_ cannot set event '"+ev+"', it's now an event(timer ID: "+this.id+")");
    }

    this.event = ev;
};

/**
 * @returns {String} this.event
 */
Timer.prototype.getEvent = function(){
    return this.event;
};

/**
 * @description set information that will refered by the time the event occurs
 * @param {any} info the information
 */
Timer.prototype.setInfo = function(info){
    this.info = info;
};

/**
 * @returns {any} this.info
 */
Timer.prototype.getInfo = function(){
    return this.info;
};

/**
 * @description speed is a time magnification
 * @returns {any} this.info
 */
Timer.prototype.getSpeed = function(){
    return this.speed;
}
/**
 * @description if timer is running, resume it; else, start it;
 */
Timer.prototype.run = function(){
    if(this.running){
        throw new Error("Timer.run_ cannot run timer(ID: "+this.id+"), it's already running");
    }

    if(this.end){
        this.end = now() + (this.end / this.speed >>> 0);
    } else {
        this.end = (this.start = now()) + (this.long / this.speed >>> 0);
    }

    this.running = true;
    WQ.put(this);
};

/**
 * @description pause the timer
 */
Timer.prototype.pause = function(){
    if(!this.running){
        throw new Error("Timer.pause_ cannot pause the timer(ID: "+this.id+"), it's already paused");
    }

    while(!WQ.remove(this)){
        //대기열에서 삭제
    }

    this.running = false;
    this.end = (this.end - now()) * this.speed >>> 0; //배속이 적용되지 않은 남은 시간
};

/**
 * @description get the left time
 */
Timer.prototype.left = function(){
    if(this.end){
        if(this.running){
            return (this.end - now()) * this.speed >>> 0;
        }
        return this.end;
    }
    return this.long;
};

/**
 * @description stop and reset the timer to the initial setting
 */
Timer.prototype.reset = function(){
    if(this.running){
        while(!WQ.remove(this)){
            //remove from the queue
        }
        this.running = false;
    }
    this.start = null;
    this.end = null;
};

/**
 * @description increase of decrease the time while it's running
 * @param {Number} time any number
 * @return {Boolean} whether it's edited of not
 */
Timer.prototype.editTime = function(time){
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
};

/**
 * @description set the speed(time msgnification) of the timer
 * @param {Number} speed
 */
Timer.prototype.setSpeed = function(speed){
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
};

/**
 * @description set repeatable
 * @param {Boolean} repeat repeatable
 */
Timer.prototype.setRepeatable = function(repeat){
    this.repeat = repeat === repeat;
};

//------------------- Timer -------------------



//------------------- Alarm -------------------

const DEFAULT_KEYS = ["year", "month", "date", "day", "hour", "minute"];

/**
 * @name Alarm
 * @constructor
 * 
 * @param {String} ev the name of the event that will occur when time condition has satisfied
 * @param {Object} time the time for the alarm to alarm
 * @param {any} info an information that will used by event
 * @param {Boolean} repeat repeatable
 * 
 * @example new Alarm('send', {year: 2022, month: 2, date: 7, day: 1, hour: 18, minute: 10}, {room: "프로젝트 - 테스팅 방★", msg: "timer test success!""});
 */
function Alarm(ev, time, info){
    const id = Alarm.generateId();
    Object.defineProperty(this, "id", {
        value: id,
        writable: false
    });
    alarm[id] = this;

    if(!ev in event){
        throw new ReferenceError("Alarm_ event \"" + ev + "\" doesn't exists");
    }
    this.event = ev;

    if(typeof time !== 'object'){
        throw new TypeError("Alarm_ 2nd argument 'time' must be an object");
    }
    for(let t in time){
        if((DEFAULT_KEYS.indexOf(t) === -1) || (time[t] !== undefined && typeof time[t] !== 'number')){
            delete time[t];
        }
    }
    if(Object.keys(time).length === 0){
        throw new TypeError("Alarm_ 2nd argument 'time' must includes least one of the properties with a number-type value: "+DEFAULT_KEYS.join(","));
    }
    this.time = time;

    this.running = false;
    this.info = info;
    this.repeat = repeat === true;
}

Object.defineProperty(Alarm.prototype, 'TYPE', {
    value: 'alarm',
    writable: false
});

/**
 * @return {String} this.id
 */
Alarm.prototype.getId = function(){
    return this.id;
};

/**
 * @return {String} this.event 
 */
Alarm.prototype.getEvent = function(){
    return this.event;
};

/**
 * @description set event
 * @param {String} ev a name of the event function
 */
Alarm.prototype.setEvent = function(ev){
    if(!ev in event){
        throw new ReferenceError("Alarm.setEvent_ cannot set event '"+ev+"', it's now an event(alarm ID: "+this.id+")");
    }

    this.event = ev;
};

/**
 * @return {Object} this.time
 */
Alarm.prototype.getTime = function(){
    return this.time;
};

/**
 * @description set time
 * @param {Object} time
 */
Alarm.prototype.setTime = function(time){
    if(typeof time !== 'object'){
        throw new TypeError("Alarm.setTime_ time must be an object");
    }
    for(let t in time){
        if((DEFAULT_KEYS.indexOf(t) === -1) || (time[t] !== undefined && typeof time[t] !== 'number')){
            delete time[t];
        }
    }
    if(Object.keys(time).length === 0){
        throw new TypeError("Alarm.setTime_ time must includes least one of the properties with a number-type value: "+DEFAULT_KEYS.join(","));
    }
    this.time = time;
};

/**
 * @returns {any} this.info
 */
Alarm.prototype.getInfo = function(){
    return this.info;
};

/**
 * @description set information that will refered by the time the event occurs
 * @param {any} info the information
 */
Alarm.prototype.setInfo = function(info){
    this.info = info;
};

/**
 * @description set repeatable
 * @param {Boolean} repeat repeatable
 */
Alarm.prototype.setRepeatable = function(repeat){
    this.repeat = repeat === repeat;
};

/**
 * @description on the alarm
 */
Alarm.prototype.run = function(){
    if(this.running){
        throw new Error("Alarm.run_ cannot run alarm(ID: "+this.id+"), it's already running")
    }

    this.running = true;
    AQ.put(this);
};

/**
 * @description off the alarm
 */
Alarm.prototype.pause = function(){
    if(!this.running){
        throw new Error("Alarm.pause_ cannot pause the alarm(ID: "+this.id+"), it's already paused");
    }

    while(!AQ.remove(this)){}
    this.running = false;
};

/**
 * @description check that the alarm is able to run
 * @return {Boolean} is it satisfies the time condition?
 */
Alarm.prototype.check = function(){
    const t = this.time, d = new Date();
    return ((t.year === undefined) || (t.year === d.getFullYear())) &&
           ((t.month === undefined) || (t.month === d.getMonth())) &&
           ((t.date === undefined) || (t.date === d.getDate())) &&
           ((t.day === undefined) || (t.day === d.getDay())) &&
           ((t.hour === undefined) || (t.hour === d.getHours())) &&
           ((t.minute === undefined) || (t.minute === d.getMinutes()));
};

//------------------- Alarm -------------------



//------------------- Stopwatch -------------------

/**
 * @name Stopwatch
 * @constructor
 * @description simple stopwatch without event
 */
function Stopwatch(){
    const id = Clock.generateTimerId();
    Object.defineProperty(this, "id", {
        value: id,
        writable: false
    });
    stopwatch[id] = this;
    
    this.start = null;
    this.last = null;
    this.records = [];
    this.running = false;
}

Object.defineProperty(Stopwatch.prototype, 'TYPE', {
    value: 'stopwatch',
    writable: false
});

/**
 * @returns {Array} this.records
 */
Stopwatch.prototype.getRecords = function(){
    return this.records;
};

/**
 * @description get record by name
 * @param {String} name the name of record
 * @returns {Object} record
 */
Stopwatch.prototype.getRecordByName = function(name){
    return this.records.find(v => v.name === name);
};

/**
 * @description start or resume the stopwatch
 */
Stopwatch.prototype.run = function(){
    if(this.running){
        throw new Error("Stopwatch.run_ stopwatch(ID: "+this.id+") is running now!");
    }

    if(this.start){
        this.last = now();
    } else {
        this.last = (this.start = now());
    }

    this.running = true;
};

/**
 * @description pause the stopwatch
 */
Stopwatch.prototype.pause = function(){
    if(!this.running){
        throw new Error("Stopwatch.pause_ stopwatch(ID: "+this.id+") is paused now!");
    }

    this.last = now();
    this.running = false;
};

Stopwatch.prototype.reset = function(){
    if(this.running){
        throw new Error("Stopwatch.reset_ cannot reset the running stopwatch(ID: "+this.id+")");
    }

    this.start = null;
    this.last = null;
    this.records = [];
};

/**
 * @description check the elapsed time
 * @return {Object} {total: total elapsed time, last: distance from last recorded moment}
 */
Stopwatch.prototype.check = function(){
    if(!this.running){
        throw new Error("Stopwatch.check_ cannot check the paused stopwatch(ID: "+this.id+")");
    }

    const n = now();
    return {
        total: n - this.start,
        last: n - this.last
    };
};

/**
 * @description record
 * @param {String} name the name of record
 * @return {Object} {total: total elapsed time, last: distance from last recorded moment}
 */
Stopwatch.prototype.record = function(name){
    if(!this.running){
        throw new Error("Stopwatch.record_ cannot record the paused stopwatch(ID: "+this.id+")");
    }

    const n = now();
    const record = {
        "name": name,
        total: n - this.start,
        last: n - this.last
    };
    this.last = n;

    this.records.push(record);
    return record;
};

/**
 * @description clear the record
 */
Stopwatch.prototype.clear = function(){
    this.records.length = 0;
};

//------------------- Stopwatch -------------------



//------------------- main interface : Clock -------------------

/**
 * @interface Clock
 * @description manage the timer, alarm, and stopwatch
 */
const Clock = {
    /**
     * @description get a Stack or Waiting queue
     */
    getStackQueue: (() => SQ).bind(undefined),
    getAlarmQueue: (() => AQ).bind(undefined),

    /**
     * @description get a Stack or Waiting thread
     */
    getStackThread: (() => ST).bind(undefined),
    getAlarmThread: (() => AT).bind(undefined),
    
    /**
     * @description generates an ID of timer, alarm, or stopwatch
     */
    generateAlarmId: (function(){
        let id = 1;
        while(id in this){
            id++;
        }
        return String(id);
    }).bind(alarm),
    generateStopwatchId: (function(){
        let id = 1;
        while(id in this){
            id++;
        }
        return String(id);
    }).bind(stopwatch),

    /**
     * @interface
     * @param {Number} id the ID of the timer, alarm, or stopwatch
     */
    getAlarm: (function(id){
        return this[id];
    }).bind(alarm),
    getStopwatch: (function(id){
        return this[id];
    }).bind(stopwatch),

    /**
     * @description apply a clock
     * @param {Object} list {id: clock} format object
     */
    applyTimer: (function(timer){
        if(!timer instanceof Timer){
            throw new TypeError("Clock.applyTimer_ cannot apply the timer, it's not an instanceof Timer");
        }

        if(timer.id in this){
            throw new ReferenceError("Clock.applyTimer_ cannot apply the timer, timer ID '"+timer.id+"' already exists in list");
        }

        this[timer.id   ] = timer;
    }).bind(timer),
    applyAlarm: (function(alarm){
        if(!alarm instanceof Alarm){
            throw new TypeError("Clock.applyAlarm_ cannot apply the alarm, it's not an instanceof Alarm");
        }

        if(alarm.id in this){
            throw new ReferenceError("Clock.applyAlarm_ cannot apply the alarm, alarm ID '"+alarm.id+"' already exists in list");
        }

        this[alarm.id] = alarm;
    }).bind(alarm),
    applyStopWatch: (function(sw){
        if(!sw instanceof Stopwatch){
            throw new TypeError("Clock.applyStopwatch_ cannot apply the stopwatch, it's not an instanceof Stopwatch");
        }

        if(sw.id in this){
            throw new ReferenceError("Clock.applyStopwatch_ cannot apply the stopwatch, stopwatch ID '"+sw.id+"' already exists in list");
        }

        this[sw.id] = sw;
    }).bind(stopwatch),

    /**
     * @description get Entire event object
     */
    getEvents: (function(){
        return this;
    }).bind(event),

    /**
     * @param name the name of a function
     * @description get an event function
     */
    getEvent: (function(name){
        return this[name];
    }).bind(event),

    /**
     * @description apply an event
     * @param {String} name the name of an event
     * @param {Function} fn the function of an event
     * 
     * @example applyEvent("send", i => Api.replyRoom(i.room, i.msg, true))
     */
    applyEvent: (function(name, fn){
        this[name] = fn.bind(undefined);
    }).bind(event),

    /**
     * @description remove the timer, alarm, or stopwatch
     */
    removeTimer: (function(id){
        if(!id in this){
            throw new ReferenceError("Clock.removeTimer_ cannot remove the timer id '"+id+"', it doesn't exists");
        }

        const t = this[id];
        delete this[id];
        while(!TQ.remove(t)){}
    }).bind(timer),
    removeAlarm: (function(id){
        if(!id in this){
            throw new ReferenceError("Clock.removeTimer_ cannot remove the timer id '"+id+"', it doesn't exists");
        }

        const t = this[id];
        delete this[id];
        while(!TQ.remove(t)){}
    }).bind(timer),
    removeAlarm: (function(id){
        if(!id in this){
            throw new ReferenceError("Clock.removeTimer_ cannot remove the timer id '"+id+"', it doesn't exists");
        }

        const t = this[id];
        delete this[id];
        while(!TQ.remove(t)){}
    }).bind(timer)
};

//------------------- main interface : clock -------------------


return {
    Clock: Clock,
    Timer: Timer,
    Alarm: Alarm,
    Stopwatch: Stopwatch
};
})();