const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

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

// connexion mongo 
const { connectDB } = require('./database');

connectDB().then((db) => {
    console.log("✅ API connectée à MongoDB !");

    // Endpoint pour récupérer un deal par son "idDeals"
    /*app.get('/deals/:idDeals', async (req, res) => {
        try {
            const dealId = req.params.idDeals;
            console.log(`🔍 Recherche du deal avec ID: ${dealId}`);

            const deal = await db.collection('deals').findOne({ idDeals: dealId });

            if (!deal) {
                return res.status(404).json({ error: "Deal non trouvé" });
            }

            res.json(deal);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération du deal :", error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });*/

    // Recherche dans les deals 
    app.get('/deals/search', async (req, res) => {
      try {
          const db = await connectDB(); // Connexion à la DB
  
          // Récupérer les paramètres de la requête
          const limit = parseInt(req.query.limit) || 12; // Nombre max de résultats (default: 12)
          const maxPrice = req.query.price ? parseFloat(req.query.price) : null; // Filtrer par prix
          const dateFilter = req.query.date ? parseInt(req.query.date) : null; // Filtrer par date
          const filterBy = req.query.filterBy || null; // Filtrer selon un critère spécifique
  
          // Construire la requête MongoDB
          let query = {};
  
          if (maxPrice) {
              query.price = { $lte: maxPrice }; // Prix <= maxPrice
          }
          if (dateFilter) {
              query.timestamp = { $gte: dateFilter }; // Date >= dateFilter (timestamp)
          }
  
          // Trier selon `filterBy`
          let sort = { price: 1 }; // Tri par défaut : prix croissant
          if (filterBy === "best-discount") {
              sort = { discount: -1 }; // Meilleure réduction
          } else if (filterBy === "most-commented") {
              sort = { comments: -1 }; // Plus commenté
          } else if (filterBy === "hottest") {
              sort = { temperature: -1 }; // Meilleur score de température
          }
  
          // Exécuter la requête
          const deals = await db.collection('deals')
              .find(query)
              .sort(sort)
              .limit(limit)
              .toArray();
  
          res.json(deals);
      } catch (error) {
          console.error("❌ Erreur lors de la recherche des deals :", error);
          res.status(500).json({ error: "Erreur serveur" });
      }
  });
  app.get('/sales/search', async (req, res) => {
    try {
        const db = await connectDB(); // Connexion à la DB

        // Récupérer les paramètres de la requête
        const limit = parseInt(req.query.limit) || 12; // Nombre max de résultats (default: 12)
        const saleId = req.query.legoSetId || null; // Filtrer par ID (optionnel)

        // Construire la requête MongoDB
        let query = {};

        if (saleId) {
            query.legoSetId = saleId; // Filtrer par ID
        }

        // Trier par prix croissant
        let sort = { price: 1 };

        // Exécuter la requête
        const sales = await db.collection('sales')
            .find(query)
            .sort(sort)
            .limit(limit)
            .toArray();

        res.json(sales);
    } catch (error) {
        console.error("❌ Erreur lors de la recherche des sales :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

  

}).catch(err => {
    console.error("❌ Erreur lors de la connexion API -> MongoDB :", err);
});



