import mongoose from "mongoose";

export  const connectDB = async () => {
  if (mongoose.connections[0].readyState)
    return; //connection is an array
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");
};


//is that the mongoose .connect then we have to give the url of
//  the our mongodb database .
// here instead we give with the environmental variable .
// to access the env we use process which means env is our currect projects instances 


// //env variable contains
// ✅ Keep secrets out of your code
// ✅ Easily change settings for different environments (development, testing, production)
// ✅ Avoid hardcoding things like URLs or API keys