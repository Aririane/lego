require('dotenv').config();
const { MongoClient } = require('mongodb');

//const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI="mongodb+srv://arianeEsilv:Xy7PLDvbdVVwznAG@cluster0.io1kb.mongodb.net/";
const MONGODB_DB_NAME = 'Lego';

if (!MONGODB_URI) {
    console.error("❌ ERREUR: La variable d'environnement MONGODB_URI n'est pas définie.");
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
        console.log("✅ Connexion MongoDB réussie !");
        return db;
    } catch (error) {
        console.error("❌ Erreur de connexion à MongoDB :", error);
        process.exit(1);
    }
}

module.exports = { connectDB };
