const { connectDB } = require('./database');

// /!\ changer valeur de discount > 50 
async function getBestDiscountDeals() {
    const db = await connectDB();
    return await db.collection('deals').find().sort({ discount: -1 }).toArray();
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
    return await db.collection('deals').find().sort({ date: -1 }).toArray();
}

async function getSalesByLegoSetId(legoSetId) {
    const db = await connectDB();
    return await db.collection('sales').find({ legoSetId }).toArray();
}

async function getRecentSales() {
    const db = await connectDB();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    return await db.collection('sales').find({ date: { $gte: threeWeeksAgo } }).toArray();
}

module.exports = {
    getBestDiscountDeals,
    getMostCommentedDeals,
    getDealsSortedByPrice,
    getDealsSortedByDate,
    getSalesByLegoSetId,
    getRecentSales
};
