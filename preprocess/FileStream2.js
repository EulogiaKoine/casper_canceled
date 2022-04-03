'use strict';

importClass(java.nio.file.Paths);
importClass(java.nio.file.Files);
const vString = java.lang.String;

module.exports = (function(){

const FS = {};

Object.defineProperties(FS, {
    name: {
        value: "FileStream",
        writable: false,
        enumerable: false
    },

    read: {
        value: (path => {
            path = Paths.get(path);
    
            if(Files.notExists(path)){
                return null;
            }
    
            return new String(new vString(Files.readAllBytes(path)));
        }).bind(undefined),
        writable: false,
        enumerable: false
    },

    write: {
        value: ((path, content) => {
            path = Paths.get(path);
            content = typeof content === 'string'? content: new String(content);
    
            if(Files.notExists(path)){
                Files.createDirectories(path.getParent());
            }
    
            Files.write(path, new vString(content).getBytes());
    
            return content;
        }).bind(undefined),
        writable: false,
        enumerable: false
    },

    append: {
        value: ((path, content) => {
            path = Paths.get(path);
            content = typeof content === 'string'? content: new String(content);
    
            if(Files.notExists(path)){
                Files.createDirectories(path.getParent());
            } else {
                content = new String(new vString(Files.readAllBytes(path)).toString) + content;
            }
    
            Files.write(path, new vString(content).getBytes());
            return content;
        }).bind(undefined),
        writable: false,
        enumerable: false
    },

    remove: {
        value: (path => {
            return Files.deleteIfExists(Paths.get(path));
        }).bind(undefined),
        writable: false,
        enumerable: false
    }
});

return FS;
})();