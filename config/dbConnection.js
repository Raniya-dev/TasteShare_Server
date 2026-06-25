import mongoose from 'mongoose'
import { configDotenv } from 'dotenv';

configDotenv()

const ConnectDB = async ()=>{
    try {
        await mongoose.connect(process.env.CONNECTION_DB)
        console.log("DB connected!");
        console.log("hi");
        

        
    } catch (error) {
        console.log(error)
        
    }
}

export default ConnectDB