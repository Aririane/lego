/* eslint-disable no-console, no-process-exit */

// STEP 5: store-mongodb
const dealabs = require('./websites/dealabs');
const { spawn } = require('child_process');
const { connectDB } = require('./database'); // MongoDB connection
const vintedScraper = require('./websites/vinted'); // Import Vinted scraper

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    // 1️⃣ Connect to MongoDB
    const db = await connectDB();
    const dealsCollection = db.collection('deals'); // Deals collection
    const salesCollection = db.collection('sales'); // Vinted sales collection

    // 2️⃣ Scrape deals from Dealabs
    console.log(`🛒 Scraping deals from ${website}...`);
    const deals = await dealabs.scrape(website);

    // 3️⃣ Extract LEGO IDs from deals
    const legoIDs = deals.map(deal => {
      const match = deal.title.match(/\b\d{4,6}\b/); // Look for a LEGO ID (4 to 6 digits)
      return match ? match[0] : null;
    }).filter(id => id !== null);

    console.log('🔎 Extracted LEGO IDs:', legoIDs);

    // 4️⃣ Insert deals into MongoDB
    console.log(" Inserting deals into MongoDB...");
    const insertDeals = await dealsCollection.insertMany(deals);
    console.log(`✅ ${insertDeals.insertedCount} deals inserted`);

    // 5️⃣ Scrape Vinted sales and insert into MongoDB
    async function scrapeAndStoreVinted(ids) {
      let allSales = []; // Array to store all retrieved sales
      for (const id of ids) {
        console.log(` Scraping Vinted sales for LEGO ID: ${id}...`);

        try {
          // Run the Vinted scraper for this ID and ensure the URL is absolute
          const sales = await vintedScraper.scrape(`https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=${id}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`);

          // Check if sales are not null or empty
          if (sales && sales.length > 0) {
            // Add the LEGO ID to each sale
            const salesWithLegoId = sales.map(sale => ({
              ...sale,
              legoSetId: id,
            }));

            // Add sales to the global array
            allSales = [...allSales, ...salesWithLegoId];

            console.log(`✅ ${sales.length} sales retrieved for LEGO ${id}`);
          } else {
            console.log(`⚠️ No sales found for LEGO ID ${id}`);
          }
        } catch (error) {
          console.error(`Error while scraping LEGO ID ${id}: ${error.message}`);
        }

        // Pause for 2 seconds between scrapes to avoid overwhelming the site
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (allSales.length > 0) {
        // Insert all sales into MongoDB in a single operation
        console.log("📦 Inserting Vinted sales into MongoDB...");
        const insertSales = await salesCollection.insertMany(allSales);
        console.log(`✅ ${insertSales.insertedCount} sales inserted.`);
      }

      console.log('🎉 All Vinted scraping tasks completed.');
    }

    // Start scraping and inserting Vinted sales
    await scrapeAndStoreVinted(legoIDs);

    // End the process
    process.exit(0);

  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);
