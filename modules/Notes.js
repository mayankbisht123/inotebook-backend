const mongoose=require('mongoose');
const schema=mongoose.Schema;

const UserNotes=new schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tag:{
        type:String,
        required:true
    }

},
{
    autoIndex:true
});
const Notes=mongoose.model('Notes',UserNotes);
Notes.syncIndexes();
module.exports=Notes;

