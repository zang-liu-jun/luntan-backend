exports.emailSender=function(userEmail,verify){

  const nodemailer=require('nodemailer')

  let transporter=nodemailer.createTransport({
    service:'163',
    secure:true,
    auth:{
      user:'privzlj@163.com',
      pass:'BNGVNNMFIMHFMSCO'
    }
  })
  
  let mailOptions = {
    from:"privzlj@163.com",
    to:userEmail,
    subject:"验证码",
    text:'欢迎注册，你的验证码是：'+verify
  }
  
  transporter.sendMail(mailOptions,(err,data) => {
    if(err){
        console.log(err);
        //res.json({status:400,msg:"send fail....."})
    }
  })
}