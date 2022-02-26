const express=require('express')
const multer = require("multer");
const router=express.Router()

const articleHandler=require('../router_handler/article')
const userHandler=require('../router_handler/user')

// const upload = multer({ dest: 'uploads/' })
const upload=multer({dest:'public/images'})

router.post('/add',upload.single('picture'),articleHandler.addArticle)

router.post('/comment',articleHandler.commentArticle)

router.post('/register',userHandler.regUser)

router.get('/getuser',userHandler.getUser)

router.get('/quit',userHandler.quit)

module.exports=router
