const express=require('express')
const session=require('express-session')
const expressJWT=require('express-jwt')
const bodyParser = require('body-parser')
const cors=require('cors')

const jwtSecret=require('./config.js')
const userRouter=require('./router/user.js')
const apiRouter=require('./router/api.js')

const config =require('./config.js')

const app=express()

/* app.use(cors({
  "origin": config.origin,
  "methods":['GET','POST']
})) */ 

app.use(cors())


app.use(session({
  secret:'hello world',
  resave:false,
  saveUninitialized:true,
}))

//解析token
app.use(expressJWT({secret:jwtSecret.jwtSecret,algorithms:['HS256']}).unless({path:[/^\/api\//,/^\/images\/.*/]}))

// 配置body-parser模块,这样在 post 请求的req上面才能访问到 body 参数
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());//数据JSON类型

app.use(express.static('public'))

// 配置路由
app.use('/api',apiRouter)

app.use('/user',userRouter)


// 错误中间件
app.use((err,req,res,next)=>{
  if(err.name==='UnauthorizedError'){
    return res.send({
      status:401,
      message:'无效的token'
    })
  }
  console.log(err);
  res.send({
    status:500,
    message:'未知错误'
  })
}
)

const PORT=8088

app.listen(PORT,()=>{
  console.log(`http://localhost:${PORT}/`);
})