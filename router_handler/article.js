const db = require("../db/index.js");

const moment = require('moment')
const { v4: uuidv4 } = require('uuid');
const fs=require('fs')
const redisClient=require('../redis/index.js')

// 添加文章
exports.addArticle = (req, res) => {
  /* if (!req.session.user || req.session.user.username !== req.user.username) {
    return res.send({ status: 1, message: "发帖失败，请重新登录" });
  } */

  if(!req.user.username){
    return res.send({status:1,message:'未登录，请先登录'})
  }

  redisClient.get(req.user.username,(err,result)=>{
    if(err)return res.send({status:1,message:err})
    const articleInfo = req.body;
    let pic=null
    if(req.file){
      var fileName = req.file.originalname.lastIndexOf(".");//取到文件名开始到最后一个点的长度
  
      var fileNameLength = req.file.originalname.length;//取到文件名长度
  
      var fileFormat = req.file.originalname.substring(fileName + 1, fileNameLength);//截
      picName=req.file.filename+'.'+fileFormat; // 图片完整名字
      fs.rename('./'+req.file.path,'./'+req.file.destination +'/'+ picName,(err)=>{
        if(err) return res.send({status:1,message:err})
      })
    }
    const u_aid=uuidv4()  //文章id

    db.query(
      "insert into article set ?",
      {
        aid:u_aid,
        article_title: articleInfo.title,
        article_content: articleInfo.content,
        article_like: 0,
        article_comments:0,
        article_time:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        author_name:req.user.username,
        pic_url:picName
      },
      (err, results) => {
        if (err) return res.send({ status: 1, message: err });
        if (results.affectedRows !== 1)
          return res.send({ status: 1, message: "添加文章失败" });

        //文章有图片
        if(req.file){
          db.query('insert into picture set ?',{
            pic_art_id:u_aid,
            picture_url:picName,
            mime:req.file.mimetype,
            origin_name:req.file.originalname
          },
          (err,results)=>{
            if(err) return res.send({status:1,message:'图片添加失败'})
          })
        } 
        return res.send({ status: 0, message: "添加文章成功" });
      }
    );
  })
};

// 获取文章列表
exports.getArticle=(req,res)=>{
  const page=req.query.page
  const limit=req.query.limit
  if(!req.query.page||!req.query.limit){
    return res.send({status:1,message:'获取文章列表失败'})
  }
  db.query(`SELECT * FROM article ORDER BY article_time DESC LIMIT ${(page-1)*limit}, ${limit}`,(err,results)=>{
    if(err) return res.send({status:1,message:err})
    let data=[];
    for(let i=0;i<results.length;i++){
      data[i]={
        aid:results[i].aid,
        title:results[i].article_title,
        author:results[i].author_name,
        time:results[i].article_time,
        likes:results[i].article_like,
        comments:results[i].article_comments,
        image:results[i].pic_url,
        content:results[i].article_content.substring(0,50)
      }
    }
    return res.send({
      status:0,
      message:"获取文章列表成功",
      data
    })
  })
}

//点赞
exports.likeArticle=(req,res)=>{
  if(!req.query.aid) return res.send({status:1,message:"点赞失败"})
  db.query(`UPDATE article SET article_like=article_like+1 where aid = '${req.query.aid}'`,(err,results)=>{
    if(err) return res.send({status:1,message:err})
    return res.send({status:0,message:'点赞成功'})
  })
}

//评论
exports.commentArticle=(req,res)=>{
  if (!req.user.username) {
    return res.send({ status: 1, message: "评论失败，请先登录" });
  }
  if(req.body.content){
    db.query('INSERT INTO comments set ?',{
      caid:req.body.aid,
      comment_content:req.body.content,
      comment_author:req.user.username,
      comment_time:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    },(err,results)=>{
      if(err) return res.send({status:1,message:err})
      if(results.affectedRows!==1) return res.send({status:1,message:"添加评论失败"})
      
      db.query('UPDATE article SET article_comments=article_comments+1 where aid = ?',req.body.aid,(err,results)=>{
        if(err) return res.send({status:1,message:err})
        return res.send({status:0,message:"添加评论成功"})
      })
      
    })
  }
  else return res.send({status:1,message:"评论为空，添加失败"})
}

//获取文章详情
exports.getArticleDetail=(req,res)=>{
  if(!req.query.aid) return res.send({status:1,message:'获取文章详情失败'})
  db.query('SELECT * FROM article where aid = ?',req.query.aid,(err,results)=>{
    if(err) return res.send({status:1,message:err})
    let data={}
    data.title=results[0].article_title
    data.content=results[0].article_content
    data.likes=results[0].article_like
    data.author=results[0].author_name
    data.time=results[0].article_time
    data.image=results[0].pic_url
    data.comments=[]
    if(results[0].article_comments!==0){
      db.query('SELECT * FROM comments where caid = ? ORDER BY comment_time ASC',req.query.aid,(err,results)=>{
        if(err) return res.send({status:1,message:err})
        for(let j=0;j<results.length;j++){
          data.comments[j]={
            comment_content:results[j].comment_content,
            comment_author:results[j].comment_author,
            comment_time:results[j].comment_time
          }
        }
        return res.send({
          status:0,
          message:"文章详情获取成功",
          data
        })
      })
    }else{
      return res.send({
        status:0,
        message:"文章详情获取成功",
        data
      })
    }
  }) 

}

