const { default: mongoose } = require("mongoose");
const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
},
{
    autoIndex: true // Enable auto-indexing for this schema
}
);
const User=mongoose.model('User',userSchema);
User.syncIndexes();
module.exports=User;