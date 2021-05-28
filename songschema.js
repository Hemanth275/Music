const mongoose=require('mongoose');
const Schema= mongoose.Schema;
const SongSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    album:{
        type:String,
        required:true
    },
    artist:{
        type:String,
        required: true
    },
    image:{
        data:Buffer,
        contentType:String
    },
    audio:{
        data:Buffer,
        contentType:String
    }
    
},{timestamp:true});
const Song=mongoose.model('Song',SongSchema);
module.exports=Song;