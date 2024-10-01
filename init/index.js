const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

main()
  .then(() => {
    console.log("Connection Success");
  })
  .catch((err) => {
    console.log("DB fail: ", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "66fa8cf0037e545f1ccf8c97",
  }));
  await Listing.insertMany(initdata.data);
  console.log("dataSaved");
};

initDB();
