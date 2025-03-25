const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');

const PORT = 8092;
const MONGODB_URI = 'mongodb+srv://arianeEsilv:Xy7PLDvbdVVwznAG@cluster0.io1kb.mongodb.net/';
const MONGODB_DB_NAME = 'Lego';

const app = express();

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

let db;

// Connexion à MongoDB
async function connectDB() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log("✅ Connected to MongoDB");
}

// Fermer la connexion MongoDB
async function closeDB() {
    if (db) {
        await db.client.close();
        console.log("❌ MongoDB connection closed.");
    }
}

// Test Route
app.get('/', (req, res) => {
    res.send({ ack: true });
});

// recup la moyenne
app.get('/sales/average', async (req, res) => {
    try {
        const { legoSetId } = req.query;

        // Vérifie si l'ID est fourni
        if (!legoSetId) {
            return res.status(400).json({ error: "legoSetId est requis" });
        }

        // Calcul de la moyenne et du nombre de ventes
        const result = await db.collection('sales').aggregate([
            {
                $match: { legoSetId: legoSetId } // Filtrer par ID spécifique
            },
            {
                $group: {
                    _id: null,
                    averagePrice: { $avg: "$price" }, // Calcul de la moyenne des prix
                    totalDeals: { $sum: 1 } // Compter le nombre de ventes (deals)
                }
            }
        ]).toArray();

        // Récupération des percentiles P5, P25, P50
        const percentilesResult = await db.collection('sales').aggregate([
            { $match: { legoSetId: legoSetId } },
            { $sort: { price: 1 } }, // Trier par prix croissant
            {
                $group: {
                    _id: null,
                    prices: { $push: "$price" } // Stocker tous les prix dans un tableau
                }
            },
            {
                $project: {
                    p5: { $arrayElemAt: ["$prices", { $floor: { $multiply: [{ $size: "$prices" }, 0.05] } }] }, // P5 (5th percentile)
                    p25: { $arrayElemAt: ["$prices", { $floor: { $multiply: [{ $size: "$prices" }, 0.25] } }] }, // P25 (25th percentile)
                    p50: { $arrayElemAt: ["$prices", { $floor: { $multiply: [{ $size: "$prices" }, 0.50] } }] }  // P50 (50th percentile, médiane)
                }
            }
        ]).toArray();

        // Si aucune vente trouvée, retourner des valeurs par défaut
        const average = result.length > 0 ? result[0].averagePrice : 0;
        const totalDeals = result.length > 0 ? result[0].totalDeals : 0;
        const p5 = percentilesResult.length > 0 ? percentilesResult[0].p5 : 0;   // P5 récupéré
        const p25 = percentilesResult.length > 0 ? percentilesResult[0].p25 : 0; // P25 récupéré
        const p50 = percentilesResult.length > 0 ? percentilesResult[0].p50 : 0; // P50 récupéré

        res.json({
            legoSetId,
            average: Math.round(average * 100) / 100, // Arrondi à 2 décimales
            totalDeals,
            P5: p5,
            P25: p25,
            P50: p50
        });

    } catch (error) {
        console.error("❌ Erreur lors du calcul des statistiques:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});




// GET /deals/search - Recherche de deals avec filtres
app.get('/deals/search', async (req, res) => {
    try {

        const { limit = 40, price, date, filterBy } = req.query;
       

        const query = {};
        const sort = {};

        // Filtrage par prix
        if (price) {
            if (price.startsWith('>')) {
                const value = parseFloat(price.substring(1));
                query.price = { $gt: value };
                console.log(`Filtre prix > ${value}`);
            } else if (price.startsWith('<')) {
                const value = parseFloat(price.substring(1));
                query.price = { $lt: value };
                console.log(`Filtre prix < ${value}`);
            } else {
                const value = parseFloat(price);
                query.price = value;
                console.log(`Filtre prix = ${value}`);
            }
        }

        // Filtrage par date
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                query.published = {
                    $gte: startDate.toISOString(),
                    $lt: endDate.toISOString()
                };
            } else {
                console.log(`Date incorrecte : ${date}`);
            }
        }

        // Tri par critère
        if (filterBy === 'best-discount') {
            sort.discount = -1;
            console.log('Tri par meilleure réduction');
        } else if (filterBy === 'most-commented') {
            sort.comments = -1;
            console.log('Tri par nombre de commentaires');
        } else {
            sort.price = 1;
            console.log('Tri par prix croissant');
        }

        console.log('--- QUERY FINALE ---');
        console.log('Query:', query);
        console.log('Sort:', sort);
        console.log('Limit:', limit);

        // Exécution de la requête MongoDB
        const deals = await db.collection('deals').find(query).sort(sort).limit(parseInt(limit)).toArray();


        if (deals.length === 0) {
            console.log('Aucun résultat trouvé');
            return res.status(404).json({ error: 'Aucun deal trouvé' });
        }

        res.json({ limit: parseInt(limit), total: deals.length, results: deals });

    } catch (error) {
        console.error('Erreur lors de la recherche des deals:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// GET /deals/:id - Obtenir un deal spécifique
app.get('/deals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deal = await db.collection('deals').findOne({ id });

        if (!deal) {
            return res.status(404).json({ error: 'Deal non trouvé' });
        }

        res.json(deal);
    } catch (error) {
        console.error(`Erreur lors de la récupération du deal ID ${req.params.id}:`, error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// GET /sales/search - Recherche de ventes spécifiques
// GET /sales/search - Recherche des ventes par ID, triées par prix croissant
app.get('/sales/search', async (req, res) => {
    try {
        const { limit = 200, legoSetId } = req.query;

        // Vérifier si un ID est fourni
        if (!legoSetId) {
            return res.status(400).json({ error: 'legoSetId est requis' });
        }

        const query = { legoSetId: legoSetId }; // Filtre par ID du set LEGO
        const sort = { price: 1 }; // Tri par prix croissant

        console.log(`🔍 Recherche des ventes pour LegoSetId = ${legoSetId}, trié par prix croissant`);

        // Exécution de la requête MongoDB
        const sales = await db.collection('sales')
            .find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .toArray();

        if (sales.length === 0) {
            console.log('⚠️ Aucun résultat trouvé');
            return res.status(404).json({ error: 'Aucune vente trouvée' });
        }

        res.json({ limit: parseInt(limit), total: sales.length, results: sales });

    } catch (error) {
        console.error('❌ Erreur lors de la recherche des ventes:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Lancer le serveur et connecter à MongoDB
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('Erreur de connexion à MongoDB:', error);
        process.exit(1);
    }
}

// Exporter le handler pour Vercel
module.exports = async (req, res) => {
    if (!db) {
        await connectDB();
    }
    return app(req, res);
};

// Arrêt propre de la connexion MongoDB
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

startServer();
