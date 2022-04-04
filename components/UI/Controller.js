'use strict';

module.exports = (function(){

const filters = {};
if(true){
    let list = DB.read(Meta.read('UI/controller').path);
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
Controller = Controller.bind(undefined);

Controller.filters = filters;
Controller.getFilter = (function(type){
    return this[type];
}).bind(filters);

Controller.prototype = {
    input: function(user, msg){
        this.view.show(user, this.model.res(user, this.filter(msg)));
    },

    setModel: function(model){
        this.model = model;
    }
};

return Controller;
})();