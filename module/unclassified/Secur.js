'use strict';

/**
 * @author Eulogia Koinē
 * @name Secur
 * @description Security system with each user's hash code for messengerbot
 */

module.exports = (function(){

const list = {};
const hashmap = {};

/**
 * @interface Secur
 */
const Secur = {};

/**
 * @param {String|Number} id
 * @param {String|Number} hash
 * @param {String} password
 * @description add a new security info of user
 */
Secur.addInfo = function(id, hash, password){
    if(id in list){
        throw new ReferenceError("Secur.addInfo_ id '" + id + "' already exists");
    }

    if(hash in hashmap){
        throw new ReferenceError("Secur.addInfo_ hash '" + hash + "' already exists");
    }

    list[id] = {
        "hash": hash,
        "password": password
    };

    hashmap[hash] = id;
}.bind(Secur);

/**
 * @param {String|Number} id
 * @returns clone of the info of such id
 */
Secur.getInfo = function(id){
    if(!id in list){
        throw new ReferenceError("Secur.getInfo_ id '" + id + "' doesn't exists");
    }

    return Object.assign({}, list[id]);
}.bind(Secur);

/**
 * @param {String|Number} hash
 * @returns id
 */
Secur.getIdByHash = function(hash){
    return hashmap[hash];
}.bind(Secur);

/**
 * @param {String|Number} id
 * @descripion remove the security info.
 */
Secur.remove = function(id){
    if(!id in list){
        throw new ReferenceError("Secur.remove_ id '" + id + "' doesn't exists");
    }

    delete hashmap[list[id].hash];
    delete list[id];
}.bind(Secur);

/**
 * @param {String|Number} id
 * @param {String|Number} hash
 * @param {String} password
 * @description renew the security info.
 */
Secur.renew = function(id, hash, password){
    if(!id in list){
        throw new ReferenceError("Secur.renew_ id '" + id + "'doesn't exists");
    }

    list[id].password = password;

    delete hashmap[list[id].hash];
    hashmap[hash] = id;
}.bind(Secur);

return Secur;
})();