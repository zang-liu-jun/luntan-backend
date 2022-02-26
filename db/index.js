const mysql =require('mysql2')

const db=mysql.createPool({
  host:'101.43.215.173',
  port:'3307',
  user:'root',
  password:'123456',
  database:'luntan'
})

module.exports=db