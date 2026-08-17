require("dotenv").config();
const vatsta = require("./app");
const connectDatabase=require("./config/db")
const PORT = 5000;
const startServer=async()=>{
try{

    await connectDatabase();
    vatsta.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
}catch(error){
    console.log("Failed to start the server");
}
}
startServer();

