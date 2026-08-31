let logging=(req,res,next)=>{
  console.log(req.method,Date.now())
  next();
}

module.exports=logging