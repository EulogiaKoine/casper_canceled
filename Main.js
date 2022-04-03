//---------- Preprocessing Layer -----------
const scriptName = "Casper";
const SD = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
const config = require(SD+'/'+scriptName+'/preprocess/config.js')(scriptName);
const setTimeout2 = config.require('preprocess/setTimeout2.js');
const clearTime = setTimeout.clearTime;
[setTimeout, setInterval, clearTimeout, clearInterval] = [setTimeout2.setTimeout, setTimeout2.setInterval, i => clearTime(i), i => clearTime(i)];

//---------- Database Layer ----------
const DB = config.require('components/DB/Database.js')(config.getPath('database'));



//---------- 임시 eval용 ----------
importClass(java.lang.System);
const nanoTime = System.nanoTime;
var start, result;

function response(room, msg, sender, isGroupChat, replier, imageDB){
    if(room.indexOf("★") !== -1 || !isGroupChat){
        if(msg.startsWith('e') && config.admin.hash.includes(imageDB.getProfileHash())){
            const rp = replier.reply.bind(replier);
            msg = msg.slice(1).trim();
            try {
                start = nanoTime();
                result = eval(msg);
                rp("\u23f1\u02da " + Math.max((nanoTime() - start - 230000) / 1000000000, 0) + " sec.\n" + result);
            }
            catch (e) {
                rp("\u2622 " + e.name + " \xb7\xb7\xb7 " + e.lineNumber + "\n " + e.message);
            }
        }
    }
}