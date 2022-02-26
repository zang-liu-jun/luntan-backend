const express=require('express')

const articleHandler=require('../router_handler/article.js')
const userHandler=require('../router_handler/user.js')

const router=express.Router()

router.get('/getarticle',articleHandler.getArticle)

router.get('/like',articleHandler.likeArticle)

router.get('/articledetail',articleHandler.getArticleDetail)

router.get('/mail',userHandler.mail)

router.post('/login',userHandler.login)

module.exports=router