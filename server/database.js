require('dotenv').config();
const { MongoClient } = require('mongodb');

// STEP 5 : Connection with mongo db

//const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI="mongodb+srv://arianeEsilv:Xy7PLDvbdVVwznAG@cluster0.io1kb.mongodb.net/";
const MONGODB_DB_NAME = 'Lego';

if (!MONGODB_URI) {
    console.error("❌ ERROR: The MONGODB_URI environment variable is not set.");
    process.exit(1);
}

let client;
let db;

async function connectDB() {
    if (db) return db; // Évite de recréer plusieurs connexions

    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(MONGODB_DB_NAME);
        console.log("✅ Successful MongoDB connection !");
        return db;
    } catch (error) {
        console.error("❌ Errorr in MongoDB connection :", error);
        process.exit(1);
    }
}

module.exports = { connectDB };
