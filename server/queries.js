const { Timestamp } = require('mongodb');
const { connectDB } = require('./database');
// STEP 5 - Interraction with mongo db -> local port querries

async function getBestDiscountDeals() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ discount: -1 }).toArray();

    /* // No deals > 50% discount
    return await db.collection('deals')
        .find({ discount: { $gt: 50 } }) // Filter to keep only discounts > 50%
        .sort({ discount: -1 }) // Sort by discount in descending order
        .toArray();
    */
}

async function getMostCommentedDeals() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ comments: -1 }).toArray();
}

async function getDealsSortedByPrice() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ price: 1 }).toArray(); // Ascending price
}

async function getDealsSortedByDate() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ timestamp: -1 }).toArray(); // Most recent first
}

async function getSalesByLegoSetId(legoSetIdToFind) {
    try {
        const db = await connectDB();
        const query = { legoSetId: String(legoSetIdToFind) };

        console.log("Query sent to MongoDB:", query); // Debug

        const sales = await db.collection('sales')
            .find(query)
            .limit(100) // Avoid heavy queries
            .toArray();

        return sales;
    } catch (error) {
        console.error('Error retrieving sales:', error);
        return [];
    }
}

async function getRecentSales() {
    const db = await connectDB();

    // Calculate timestamp for 3 weeks ago
    const threeWeeksAgo = Math.floor(Date.now() / 1000) - (21 * 24 * 60 * 60);

    console.log("Searching for sales after timestamp:", threeWeeksAgo); // Debug

    return await db.collection('sales')
        .find({ timestamp: { $gte: threeWeeksAgo } })
        .sort({ timestamp: -1 }) // Most recent first
        .limit(100) // Limit to avoid heavy queries
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