module.exports = function(name){
const _SD = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
const _PATH = _SD+'/'+name+'/preprocess/config.json';

const config = JSON.parse(FileStream.read(_PATH));

return Object.assign(
    config,
    {
        getPath: (function(path){
            return _SD +'/' + name + '/' + path;
        }).bind(config),

        save: (function(){
            FileStream.write(_PATH, JSON.stringify(this, null, 4));
        }).bind(config),

        load: (function(){
            let schema = JSON.parse(FileStream.read(_PATH));
            for(let i in schema){
                this[i] = schema[i];
            }
        }).bind(config),

        require: (function(path){
            return require('../'+path);
        })
    });
};