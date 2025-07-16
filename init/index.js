const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("✅ Connected to DB");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany(); // 🧹 Purana data hatao

  const modifiedData = initData.data.map((listing) => ({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    country: listing.country,
    image: {
      url: listing.image,
      filename: "", // default empty since sample data doesn't have filename
    },
    owner: "65200881ae547c5d37e56b5f", // ✅ default owner
  }));

  await Listing.insertMany(modifiedData);
  console.log("✅ Data inserted successfully");
};

initDB();
