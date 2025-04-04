const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

// STEP 5 - store MongoDB : interaction

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

// connection mongo 
const { connectDB } = require('./database');

connectDB().then((db) => {
    console.log("API connected to MongoDB !");

    // search deals in database and catch them
    app.get('/deals/search', async (req, res) => {
      try {
          const db = await connectDB(); // Connection
  
          // takes elelent 
          const limit = parseInt(req.query.limit) || 12; // Max 12 elements 
          const maxPrice = req.query.price ? parseFloat(req.query.price) : null; // Filter by price
          const dateFilter = req.query.date ? parseInt(req.query.date) : null; // Filter by date 
          const filterBy = req.query.filterBy || null; // Filter by smthg
  
          // Make the request
          let query = {};
  
          if (maxPrice) {
              query.price = { $lte: maxPrice }; // Price <= maxPrice
          }
          if (dateFilter) {
              query.timestamp = { $gte: dateFilter }; // Date >= dateFilter (timestamp)
          }
  
          // `filterBy`
          let sort = { price: 1 }; // default price asc
          if (filterBy === "best-discount") {
              sort = { discount: -1 }; // best discount
          } else if (filterBy === "most-commented") {
              sort = { comments: -1 }; // Most commented
          } else if (filterBy === "hottest") {
              sort = { temperature: -1 }; // best temp
          }
  
          // Execute the request
          const deals = await db.collection('deals')
              .find(query)
              .sort(sort)
              .limit(limit)
              .toArray();
  
          res.json(deals);
      } catch (error) {
          console.error("❌ Error when searching for deals :", error);
          res.status(500).json({ error: "Server error" });
      }
  });
  app.get('/sales/search', async (req, res) => {
    try {
        const db = await connectDB(); // Connection to DB

        // Takes element of request for sales 
        const limit = parseInt(req.query.limit) || 12; // max 12 results
        const saleId = req.query.legoSetId || null; // Filter by id 

        // request construction
        let query = {};

        if (saleId) {
            query.legoSetId = saleId; // Filter by id 
        }

        // Sort by price (asc)
        let sort = { price: 1 };

        // Execute request
        const sales = await db.collection('sales')
            .find(query)
            .sort(sort)
            .limit(limit)
            .toArray();

        res.json(sales);
    } catch (error) {
        console.error("❌ Error when searching for sales :", error);
        res.status(500).json({ error: "Server error " });
    }
    });

    // Endpoint to takes deals by id idDeals"
    app.get('/deals/:id', async (req, res) => {
        try {
            const dealId = req.params.id;
            console.log(`Search for deals with id : ${dealId}`);

            const deal = await db.collection('deals').findOne({ id: dealId });

            if (!deal) {
                return res.status(404).json({ error: "Deal not found" });
            }

            res.json(deal);
        } catch (error) {
            console.error("❌ Error during deal recovery:", error);
            res.status(500).json({ error: "Server error" });
        }
    });

  

}).catch(err => {
    console.error("❌ Error during API -> MongoDB connection :", err);
});
module.exports = app;


