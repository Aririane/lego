const { Timestamp } = require('mongodb');
const { connectDB } = require('./database');

// /!\ changer valeur de discount > 50 
async function getBestDiscountDeals() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ discount: -1 }).toArray();
    /* // aucun deals > 50% de discount 
     return await db.collection('deals')
        .find({ discount: { $gt: 50 } }) // Filtre pour ne garder que les discounts > 50%
        .sort({ discount: -1 }) // Trie par discount décroissant
        .toArray();*/
}

async function getMostCommentedDeals() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ comments: -1 }).toArray();
}

async function getDealsSortedByPrice() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ price: 1 }).toArray();
}

async function getDealsSortedByDate() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ timestamp: -1 }).toArray();
}
async function getSalesByLegoSetId(legoSetIdToFind) {
    try {
        const db = await connectDB();

        // Recherche avec legoSetId en String
        const query = { legoSetId: String(legoSetIdToFind) };

        console.log("Query envoyée à MongoDB :", query); // Debug

        const sales = await db.collection('sales')
            .find(query)
            .limit(100) // Évite une requête trop lourde
            .toArray();

        return sales;
    } catch (error) {
        console.error('Erreur lors de la récupération des ventes :', error);
        return [];
    }
}

async function getRecentSales() {
    const db = await connectDB();
    
    // Calcul de la date 3 semaines en arrière (en timestamp UNIX)
    const threeWeeksAgo = Math.floor(Date.now() / 1000) - (21 * 24 * 60 * 60);

    console.log("Timestamp recherché :", threeWeeksAgo); // Debug

    return await db.collection('sales')
        .find({ timestamp: { $gte: threeWeeksAgo } })
        .sort({ timestamp: -1 }) // Trier du plus récent au plus ancien
        .limit(100) // Éviter les requêtes trop lourdes
        .toArray();
}

module.exports = {
    getBestDiscountDeals,
    getMostCommentedDeals,
    getDealsSortedByPrice,
    getDealsSortedByDate,
    getSalesByLegoSetId,
    getRecentSales
};
