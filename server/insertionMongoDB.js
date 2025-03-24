/* eslint-disable no-console, no-process-exit */
const dealabs = require('./websites/dealabs');
const { spawn } = require('child_process');
const { connectDB } = require('./database'); // Connexion à MongoDB
const vintedScraper = require('./websites/vinted'); // Import du scraper Vinted

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    // 1️⃣ Connexion à MongoDB
    const db = await connectDB();
    const dealsCollection = db.collection('deals'); // Collection des deals
    const salesCollection = db.collection('sales'); // Collection des ventes Vinted

    // 2️⃣ Scraping des deals depuis Dealabs
    console.log(`🛒 Scraping des deals depuis ${website}...`);
    const deals = await dealabs.scrape(website);

    // 3️⃣ Extraire les IDs LEGO des deals
    const legoIDs = deals.map(deal => {
      const match = deal.title.match(/\b\d{4,6}\b/); // Cherche un ID LEGO (4 à 6 chiffres)
      return match ? match[0] : null;
    }).filter(id => id !== null);

    console.log('🔎 IDs LEGO extraits:', legoIDs);

    // 4️⃣ Insertion des deals dans MongoDB
    console.log(" Insertion des deals dans MongoDB...");
    const insertDeals = await dealsCollection.insertMany(deals);
    console.log(`✅ ${insertDeals.insertedCount} deals insérés`);

    // 5️⃣ Scraping des ventes Vinted et insertion dans MongoDB
    async function scrapeAndStoreVinted(ids) {
      let allSales = []; // Tableau pour stocker toutes les ventes récupérées
      for (const id of ids) {
        console.log(` Scraping des ventes Vinted pour l'ID LEGO: ${id}...`);

        try {
          // Exécuter le scraper Vinted pour cet ID et s'assurer que l'URL est absolue
          const sales = await vintedScraper.scrape(`https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=${id}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`);

          // Vérifier que les ventes ne sont pas nulles ou vides
          if (sales && sales.length > 0) {
            // Ajouter l'ID LEGO à chaque vente
            const salesWithLegoId = sales.map(sale => ({
              ...sale,
              legoSetId: id,
            }));

            // Ajouter les ventes dans le tableau global
            allSales = [...allSales, ...salesWithLegoId];

            console.log(`✅ ${sales.length} ventes récupérées pour le LEGO ${id}`);
          } else {
            console.log(`⚠️ Aucune vente trouvée pour l'ID LEGO ${id}`);
          }
        } catch (error) {
          console.error(`Erreur lors du scraping de l'ID LEGO ${id}: ${error.message}`);
        }

        // Pause de 2 secondes entre les scrappings pour éviter une surcharge du site
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (allSales.length > 0) {
        // Insertion de toutes les ventes dans MongoDB en une seule opération
        console.log("📦 Insertion des ventes Vinted dans MongoDB...");
        const insertSales = await salesCollection.insertMany(allSales);
        console.log(`✅ ${insertSales.insertedCount} ventes insérées.`);
      }

      console.log('🎉 Tous les scrappings Vinted sont terminés.');
    }

    // Lancer le scraping et l'insertion des ventes Vinted
    await scrapeAndStoreVinted(legoIDs);

    // Fin du processus
    process.exit(0);

  } catch (e) {
    console.error('❌ Erreur:', e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);
