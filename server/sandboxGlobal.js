/* eslint-disable no-console, no-process-exit */
const dealabs = require('./websites/dealabs');
const { spawn } = require('child_process');

// Step 4: all scrapping in 1 time 

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    // takes all deals from deallabs
    console.log(`Browsing ${website} website`);
    const deals = await dealabs.scrape(website);

    //console.log(deals);

    // Display all lego id set presents in dealabs deals
    const legoIDs = deals.map(deal => {
      const match = deal.title.match(/\b\d{4,6}\b/); // Cherche un ID LEGO (4 à 6 chiffres)
      return match ? match[0] : null;
    }).filter(id => id !== null);

    console.log('IDs LEGO extraits:', legoIDs);

    // Lancer le scraping sur Vinted pour chaque ID LEGO trouvé
    /*legoIDs.forEach(id => {
      console.log(`Lancement du scraping Vinted pour l'ID: ${id}`);
      const process = spawn('node', ['sandboxv.js', id], { stdio: 'inherit' });

      process.on('close', (code) => {
        console.log(`Processus Vinted pour ID ${id} terminé avec le code ${code}`);
      });
    });*/

    // execute sandboxv.js sequentially
    async function launchScrapingSequentially(ids) {
      for (const id of ids) {
        console.log(`launch vinted scrap for ID: ${id}`);
        
        await new Promise((resolve, reject) => {
          const process = spawn('node', ['sandboxv.js', id], { stdio: 'inherit' });

          process.on('error', (err) => {
            console.error(`Error in scrap vinted deals for ${id}:`, err);
            reject(err);
          });

          process.on('close', (code) => {
            console.log(`Vinted procces for ID ${id} ending with success ${code}`);
            setTimeout(resolve, 2000); // wait 2 secondes btw each id scrape
          });
        });
      }
      console.log('Every vinted scrap ok.');
      process.exit(0);
    }

    await launchScrapingSequentially(legoIDs);

  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);
