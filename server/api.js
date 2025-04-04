const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');

// STEP 6 : api EXPRESS 

const PORT = 8092;
const MONGODB_URI = 'mongodb+srv://arianeEsilv:Xy7PLDvbdVVwznAG@cluster0.io1kb.mongodb.net/';
const MONGODB_DB_NAME = 'Lego';

const app = express();

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

let db;

// MongoDB connection 
async function connectDB() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log("Connected to MongoDB");
}

// Close MongoDB connection
async function closeDB() {
    if (db) {
        await db.client.close();
        console.log("MongoDB connection closed.");
    }
}

// Test Route
app.get('/', (req, res) => {
    res.send({ ack: true });
});

// take indicators of one Id
app.get('/sales/average', async (req, res) => {
    try {
        const { legoSetId } = req.query;

        // Check if the ID is provided
        if (!legoSetId) {
            return res.status(400).json({ error: "legoSetId is required" });
        }

        // Calculate average price and number of sales
        const result = await db.collection('sales').aggregate([
            {
                $match: { legoSetId: legoSetId } // Filter by specific ID
            },
            {
                $group: {
                    _id: null,
                    averagePrice: { $avg: "$price" }, // Average price
                    totalDeals: { $sum: 1 } // Count sales
                }
            }
        ]).toArray();

        // Get P5, P25, P50 percentiles
        const percentilesResult = await db.collection('sales').aggregate([
            { $match: { legoSetId: legoSetId } },
            { $sort: { price: 1 } }, // Sort by ascending price
            {
                $group: {
                    _id: null,
                    prices: { $push: "$price" } // Store all prices in array
                }
            },
            {
                $project: {
                    p5: { $arrayElemAt: ["$prices", { $floor: { $multiply: [{ $size: "$prices" }, 0.05] } }] },
                    p25: { $arrayElemAt: ["$prices", { $floor: { $multiply: [{ $size: "$prices" }, 0.25] } }] },
                    p50: { $arrayElemAt: ["$prices", { $floor: { $multiply: [{ $size: "$prices" }, 0.50] } }] }
                }
            }
        ]).toArray();

        const average = result.length > 0 ? result[0].averagePrice : 0;
        const totalDeals = result.length > 0 ? result[0].totalDeals : 0;
        const p5 = percentilesResult.length > 0 ? percentilesResult[0].p5 : 0;
        const p25 = percentilesResult.length > 0 ? percentilesResult[0].p25 : 0;
        const p50 = percentilesResult.length > 0 ? percentilesResult[0].p50 : 0;

        res.json({
            legoSetId,
            average: Math.round(average * 100) / 100,
            totalDeals,
            P5: p5,
            P25: p25,
            P50: p50
        });

    } catch (error) {
        console.error("❌ Error calculating statistics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /deals/search - Search deals with filters
app.get('/deals/search', async (req, res) => {
    try {
        const { limit = 40, price, date, filterBy } = req.query;

        const query = {};
        const sort = {};

        // Price filtering
        if (price) {
            if (price.startsWith('>')) {
                const value = parseFloat(price.substring(1));
                query.price = { $gt: value };
                console.log(`Price filter > ${value}`);
            } else if (price.startsWith('<')) {
                const value = parseFloat(price.substring(1));
                query.price = { $lt: value };
                console.log(`Price filter < ${value}`);
            } else {
                const value = parseFloat(price);
                query.price = value;
                console.log(`Price filter = ${value}`);
            }
        }

        // Date filtering
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
                console.log(`Invalid date: ${date}`);
            }
        }

        // Sorting logic
        if (filterBy === 'best-discount') {
            sort.discount = -1;
            console.log('Sorting by best discount');
        } else if (filterBy === 'most-commented') {
            sort.comments = -1;
            console.log('Sorting by most comments');
        } else {
            sort.price = 1;
            console.log('Sorting by lowest price');
        }

        console.log('--- FINAL QUERY ---');
        console.log('Query:', query);
        console.log('Sort:', sort);
        console.log('Limit:', limit);

        const deals = await db.collection('deals')
            .find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .toArray();

        if (deals.length === 0) {
            console.log('No results found');
            return res.status(404).json({ error: 'No deals found' });
        }

        res.json({ limit: parseInt(limit), total: deals.length, results: deals });

    } catch (error) {
        console.error('Error searching for deals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get best deals
app.get('/deals/best', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const deals = await db.collection('deals').find().toArray();

        if (!deals.length) {
            return res.status(404).json({ error: 'No deals found' });
        }

        const scoredDeals = await Promise.all(deals.map(async (deal) => {
            const sales = await db.collection('sales').find({ legoSetId: deal.id }).toArray();

            if (!sales.length) {
                return { ...deal, score: 0 };
            }

            const lifetimeAvg = sales.reduce((sum, sale) => sum + (sale.lifetime || 0), 0) / sales.length || 0;
            const pValueAvg = sales.reduce((sum, sale) => sum + (sale.pvalue / sale.price), 0) / sales.length || 0;
            const totalSales = sales.length || 0;

            const lifetimeScore = 1 / (lifetimeAvg + 1);
            const pValueScore = pValueAvg;
            const discountScore = deal.discount / 100;
            const temperatureScore = deal.temperature / 100;
            const salesScore = Math.log(1 + totalSales);

            const finalScore = 
                (lifetimeScore * 0.3) +
                (pValueScore * 0.3) +
                (discountScore * 0.2) +
                (temperatureScore * 0.1) +
                (salesScore * 0.1);

            return { ...deal, score: finalScore };
        }));

        const bestDeals = scoredDeals
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit));

        res.json({ total: bestDeals.length, results: bestDeals });

    } catch (error) {
        console.error("Error calculating best deals:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /deals/:id - Get specific deal
app.get('/deals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deal = await db.collection('deals').findOne({ id });

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        res.json(deal);
    } catch (error) {
        console.error(`Error retrieving deal ID ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /sales/search - Search for sales by ID, sorted by price
app.get('/sales/search', async (req, res) => {
    try {
        const { limit = 200, legoSetId } = req.query;

        if (!legoSetId) {
            return res.status(400).json({ error: 'legoSetId is required' });
        }

        const query = { legoSetId: legoSetId };
        const sort = { price: 1 };

        console.log(`🔍 Searching for sales of LegoSetId = ${legoSetId}, sorted by lowest price`);

        const sales = await db.collection('sales')
            .find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .toArray();

        if (sales.length === 0) {
            console.log('⚠️ No results found');
            return res.status(404).json({ error: 'No sales found' });
        }

        res.json({ limit: parseInt(limit), total: sales.length, results: sales });

    } catch (error) {
        console.error('❌ Error searching sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server and connect to MongoDB
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// Export handler for Vercel
module.exports = async (req, res) => {
    if (!db) {
        await connectDB();
    }
    return app(req, res);
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

startServer();
