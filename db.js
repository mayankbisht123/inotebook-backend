const { default: mongoose } = require("mongoose");


const db=()=>{
    mongoose.connect('mongodb://localhost:27017/',{autoIndex: true}).then(()=>{
        console.log("Connected to mongoose");
    })
    .catch((e)=>{
        console.log("Something wrong");
    })
}

module.exports=db;
