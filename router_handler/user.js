const db=require('../db/index.js')
const mail=require('../mail/index.js')
const jwt=require('jsonwebtoken')
const jwtSecret=require('../config.js')
const redisClient=require('../redis/index.js')

exports.regUser=(req,res)=>{
  const userInfo=req.body

  if(!userInfo.username||!userInfo.password){
    return res.send({status:1,message:'用户名或密码不能为空'})  //这里return一下，否则它会继续执行if下面的代码
  }

  redisClient.get(req.user.email,(err,result)=>{
    if(err) return res.send({status:1,message:'注册失败'})
    if(userInfo.code!==result){
      return res.send({status:1,message:'验证码错误'})
    }

    redisClient.del(req.user.email)
    
    db.query('select * from user where username = ?',[userInfo.username],function(err,results){
      if(err){
        return res.send({status:1,message:err})
      }
      if(results.length>0){
        return res.send({status:1,message:'用户名被占用，请更换其它用户名'})
      }
  
      db.query('insert into user set ?',{username:userInfo.username,password:userInfo.password,email:req.user.email},function(err,results){
        if(err) return res.send({status:1,message:err.message})
        if(results.affectedRows!==1){
          return res.send({status:1,message:'注册用户失败'})
        }
        return res.send({status:0,message:'注册成功'})
      })
    })
  })
}

exports.login=(req,res)=>{
  const userInfo=req.body

  db.query('select * from user where username = ? and password = ?',[userInfo.username,userInfo.password],(err,results)=>{
    if(err) return res.send({status:1,message:err})
    if(results.length!==1) return res.send({status:1,message:'登录失败'})

    //登录成功用户信息存session
    //req.session.user=results[0]
    redisClient.set(results[0].username,results[0].password)
    // token字符串
    const tokenStr=jwt.sign({username:userInfo.username},jwtSecret.jwtSecret,{algorithm:'HS256'},{expireIn:'30s'})
    res.send({status:0,message:'登录成功',token:tokenStr})  //别忘了Bearer+空格
  })

}

exports.mail=(req,res)=>{
  
  if(!req.query.email){
    return res.send({status:1,message:'邮箱为空，请输入'})
  }
  // req.session.email=req.query.email

  const arr=['1','2','3','4']
  let verifyCode=''+getRandomIntInclusive(0,3)+getRandomIntInclusive(0,3)+getRandomIntInclusive(0,3)+getRandomIntInclusive(0,3)

  redisClient.del(req.query.email)
  redisClient.set(req.query.email,verifyCode)

  mail.emailSender(req.query.email,verifyCode)

  const tokenStr=jwt.sign({email:req.query.email},jwtSecret.jwtSecret,{algorithm:'HS256'},{expireIn:'240s'})

  /* res.header("Access-Control-Allow-Credentials",true)
  res.header("Access-Control-Allow-Origin","http://localhost:8081") */

  res.send({status:0,message:'验证码已发送',token:tokenStr})
}

exports.getUser=(req,res)=>{
  if(!req.user.username){
    return res.send({status:1,message:'未登录！'})
  }
  return res.send({status:0,message:req.user.username})
}

exports.quit=(req,res)=>{
  if(!req.user.username){
    return res.send({status:1,message:'退出登录失败'})
  }
  redisClient.del(req.user.username)
  return res.send({status:0,message:'退出登录成功'})
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值
}
