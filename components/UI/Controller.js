'use strict';

module.exports = (function(){

const filters = {};
if(true){
    let list = DB.getContent(Meta.read('UI/controller').path).list();
    for(let file of list){
        filters[file.getName()] = file.read();
    }
}

function Controller(type, model, view){
    if(type in filters){
        this.filter = filters[type];
        this.model = model;
        this.view = view;
    } else {
        throw new ReferenceError("Controller_ there is no such type of filter '"+type+"'");
    }
}

Controller.filters = filters;
Controller.getFilter = (function(type){
    return this[type];
}).bind(filters);

Controller.prototype = {
    input: function(user, msg){
        let result = this.filter(msg);
        if(result === undefined) return;
        
        result = this.model.res(user, result);
        if(result === undefined) return;

        this.view.show(user, this.model.res(user, this.filter(msg)));
    },

    setModel: function(model){
        this.model = model;
    }
};

return Controller;
})();