const jwt = require('jsonwebtoken');

fetchuser= async (req,res,next)=>{
    const token=await req.header('auth-token');
    if(!token)
    {
        return res.status(401).send("Token not found");
    }
    try{
    const data=jwt.verify(token,process.env.JWTKEY);
    req.user=data.user;
    }
    catch(e){
        return res.status(401).send("Please authenticate a valid token");
    }
    next();
}

module.exports=fetchuser;