var redisCluser = require('.').clusterClient;
//var redisCluser = require('fast-redis-cluster2').clusterClient;


var opts = {
	//`host` can be ip/hostanme of any working instance of cluster
	host: '127.0.0.1',
	port: 7001,
	// auth: 'topsecretpassword',
	// force to use fallback node_redis driver as connector
	// useFallbackDriver: true,
};
//or you can set there just a string
//var opts = '127.0.0.1:7001';

var redis = new redisCluser.clusterInstance(opts, function (err) {
	if (err) throw new Error(err);
	console.log('Connected, cluster is fine and ready for using');
});

redis.on('ready', function(){
	console.log('Connected, cluster is fine and ready for using');
});

redis.on('error', function(err){
	console.log('Redis error', err);
});

//each redis command executed before a `ready` event will be queued and processed in right order when `ready` is occured
//each redis command have a wrapper
//callback is optional and if it exists it must be placed as a last argument
redis.set('foo', 'bar2', function(err, resp){
	console.log('set command returns err: %s, resp: %s', err, resp);
});

//callback is optional
redis.set('foo', 'bar3');

redis.get('foo', function(err, resp){
	console.log('get foo command returns err: %s, resp: %s', err, resp);
});

//internally the library uses a rawCall function
//for higher performance better to use rawCall function directly
//rawCall function has 2 arguments,
//1 - array which contain a redis command
//2 - optional callback
redis.rawCall(['set', 'foo', 'bar'], function(err, resp){
	console.log('SET via rawCall command returns err: %s, resp: %s', err, resp);
});

//types are decoded exactly as redis return it
//eg get will return string
redis.rawCall(['set', 'number', 123]);
redis.rawCall(['get', 'number'], function(err, resp){
	//type of will be "string", this is not related to driver this is behaviour of redis...
	console.log('The value: "%s", number key becomes typeof %s', resp, typeof resp);
});

//but INCR command on same key will return a number
redis.rawCall(['incr', 'number'], function(err, resp){
	//type of will be "number"
	console.log('The value after INCR: "%s", number key becomes typeof %s', resp, typeof resp);
});
//number will be also on INCRBY ZSCORE HLEN and each other redis command which return a number.

//ZRANGE will return an Array, same as redis return..
redis.rawCall(['zadd', 'sortedset', 1, 'a', 2, 'b', 3, 'c']);
redis.rawCall(['zrange', 'sortedset', 0, -1], function(err, resp){
	//type of will be "number"
	console.log('JSON encoded value of zrange: %s', JSON.stringify(resp));
});

//SCAN, HSCAN, SSCAN and other *SCAN* function will return Array within Array inside, like this:
// [ 245, ['key1', 'key2', 'key3'] ]
// first entry (245) - cursor, second one is Array of keys.

//You can pass an object to HMSET redis command
var obj = {
	foo: 'bar',
	hello: 'world',
	integer: 123 //be aware: number type will be returned as a string
};
redis.hmset('HSET:EXAMPLEHASHTABLE', obj);
//rawCall also can handle it
//redis.rawCall(['hmset', 'HSET:EXAMPLEHASHTABLE', obj]);

//HGETALL and HMGET automaticly decode values to object, rawCall do it too
redis.hgetall('HSET:EXAMPLEHASHTABLE', function(err, resp){
	console.log('hgetall command returns err: %s, resp:', err, resp);
});

//Helpers
//=======

//You can use calcSlot function for calculating slot number for key
var slot = redis.calcSlot('привет'); //should be 7365 for this utf-8 key