/* eslint-disable no-console, no-process-exit */
const dealabs = require('./websites/dealabs');
const { spawn } = require('child_process');

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`Browsing ${website} website`);
    const deals = await dealabs.scrape(website);

    console.log(deals);

    // Extraire les IDs des sets LEGO
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

    async function launchScrapingSequentially(ids) {
      for (const id of ids) {
        console.log(`Lancement du scraping Vinted pour l'ID: ${id}`);
        await new Promise((resolve) => {
          const process = spawn('node', ['sandboxv.js', id], { stdio: 'inherit' });
    
          process.on('close', (code) => {
            console.log(`Processus Vinted pour ID ${id} terminé avec le code ${code}`);
            setTimeout(resolve, 2000); // Pause de 2 secondes entre chaque scraping
          });
        });
      }
      console.log('Tous les scrapers Vinted ont été exécutés.');
    }
    
    launchScrapingSequentially(legoIDs);
    

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);
