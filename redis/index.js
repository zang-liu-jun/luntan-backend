const redis = require('redis')

// 创建客户端
const redisClient = redis.createClient(6379, '101.43.215.173')
redisClient.auth('123456')
redisClient.on('error', err => {
    console.error(err)
})

module.exports=redisClient

/* redisClient.hset("chengshi","shandong","yantai","shanxi","xian123")

redisClient.hset("chengshi","shanxi","123")

redisClient.hgetall("chengshi",(err,res)=>{
  console.log(res);
})
 */
