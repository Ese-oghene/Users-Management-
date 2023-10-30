import mongoose from "mongoose";

//import MongoMemoryServer from "mongodb-memory-server";

async function connect(){
    mongoose.connect('mongodb://0.0.0.0:27017/newApi', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('Connected to db')).catch((err) => console.log(err))
}

export default connect;