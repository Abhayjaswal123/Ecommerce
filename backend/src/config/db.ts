import "dotenv/config";
import mongoose from "mongoose";

const connectDb = async ()=> {
    try{
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not set in the environment.");
        }

        await mongoose.connect(mongoUri)
        console.log("mongodb connected.......")
    } catch(err){
        console.log("err........", err)
    }
}

export default connectDb;