'use strict';

module.exports = function(path){
    if(File === undefined){
        const File = require('./File.js');
    }
    if(Directory === undefined){
        const Directory = require('./Directory.js');
    }

    return new Directory(path);
};