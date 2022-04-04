'use strict';

module.exports = (function(){

const views = {};
if(true){
    let list = DB.getContent(Meta.read('UI/view').path).list();
    for(let file of list){
        views[file.getName()] = file.read();
    }
}

const reply = Api.replyRoom.bind(Api);
const queue = new java.util.concurrent.LinkedBlockingQueue();
const SEND_FUNC = function(){
    let c;
    while(true){
        c = queue.take();
        reply(c.room, c.content, true);
    }
};
const thread = new java.lang.Thread({run: SEND_FUNC});
thread.start();

/**
 * @interface
 */
function View(){
    if(this instanceof View){
        throw new Error("View_ it's an interface; please use a get() method");
    }
}
View = View.bind(undefined);

View.filters = views;
View.getFilter = (function(type){
    return this[type];
}).bind(views);

View.queue = queue;
View.thread_fn = SEND_FUNC;
View.thread = thread;

const instances = {}
View.get = (function(type){
    if(type in instances){
        return instances[type];
    }

    if(type in list){
        let view = {
            filter: list[type]
        };
        view.__proto__ = this.prototype;

        return view;
    }

    throw new ReferenceError("View.get_ there is no such type of view: '"+type+"'");
}).bind(View);

View.prototype.show = function(target, data){
    queue.put({
        room: target,
        content: this.filter(data)
    });
};

return View;
})();