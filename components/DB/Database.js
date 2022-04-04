'use strict';

module.exports = function(path){
    const File = require('./File.js');
    const Directory = require('./Directory.js');

    return new Directory(path);
};