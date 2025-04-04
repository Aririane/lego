/* eslint-disable no-console, no-process-exit */
/* Execute this file with the lego id you want to fetch*/
const vinted = require('./websites/vinted'); 

// STEP 4: launch Vinted scrapping 

async function sandbox(id) {
  try {

    if (!id) {
      console.error('Put an id set in argument.');
      process.exit(1);
    }

    console.log(`Resharch id : ${id} on Vinted`);

    // Construct dynamically the url with the id
    //const website = "https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=42181&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=";
    const website = `https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=${id}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`;

    
    // takes all vinted deals from an id  thanks to scrap module on vinted.js
    const deals = await vinted.scrape(website, id);

    // Display result
    console.log(deals);
    console.log('End of sandboxv.js for the \'ID:', id);
    process.exit(0);  // Ending with success
  } catch (e) {
    console.error('Error during scraping:', e);  // Display error during scrapping
    process.exit(1);  // End with error
  }
}

// Prendre l'argument de la ligne de commande ou utiliser l'URL par défaut
const [,, eshop] = process.argv;

// Appeler la fonction sandbox avec l'URL donnée
sandbox(eshop);
