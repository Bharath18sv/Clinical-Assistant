import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db/index.js";
const port = process.env.PORT || 5002; //we can pass the path to this, by default will look in the root directory

connectDB()
  .then(
    app.listen(port, () => {
      console.log("Server running on port:", port);
    })
  )
  .catch((err) => {
    console.log("Can't connect to MongoDB!", err);
  });
