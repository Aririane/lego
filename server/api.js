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
    app.get('/deals/:idDeals', async (req, res) => {
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
    });

}).catch(err => {
    console.error("❌ Erreur lors de la connexion API -> MongoDB :", err);
});



