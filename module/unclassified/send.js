'use strict';
/**
 * @author Eulogia Koinē
 * @purpose 카톡봇에서 채팅 전송 스레드 비동기로 분리
 */

module.exports = (function(){

const reply = Api.replyRoom.bind(Api);
const queue = new java.util.concurrent.LinkedBlockingQueue();

const FN = function(){
    let i;
    while(true){
        i = queue.take();
        reply(i.r, i.m, true);
    }
};
new java.lang.Thread({run: FN}).start();

function send(r, m){
    queue.put({"r":r, "m":m});
}

return send.bind(undefined);
})();