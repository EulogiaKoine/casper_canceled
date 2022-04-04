'use strict';

module.exports = function(path){
    const Directory = require('./Directory.js');

    return new Directory(path);
};