module.exports = (function(){
const _SD = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();

const schema = JSON.parse(FileStream.read('./config.json'));
const config = {};
for(let i in schema){
    Object.defineProperty(config, i, {
        value: schema[value],
        writable: true
    });
}

return Object.assign(
    config,
    {
        getPath: (function(path){
            return _SD +'/' + this.name + '/' + path;
        }).bind(config),

        save: (function(){
            FileStream.write('./config.json', JSON.stringify(this, null, 4));
        }).bind(config),

        load: (function(){
            let schema = JSON.parse(FileStream.read('./config.json'));
            for(let i in schema){
                Object.defineProperty(this, i, {
                    value: schema[i],
                    writable: true
                });
            }
        }).bind(config),

        require: (function(path){
            return require('../'+path);
        })
    });
})();