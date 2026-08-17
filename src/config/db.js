const mongoose=require("mongoose")
const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MONOGB connected succesfully");
    }catch(error){
        console.log("MONGODB connection failed",error.message);
        process.exit(1);
    }
}
module.exports=connectDb;