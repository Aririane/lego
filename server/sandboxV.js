/* eslint-disable no-console, no-process-exit */
const vinted = require('./websites/vinted'); // Assurez-vous que le chemin est correct

// Fonction principale qui effectue le scraping
async function sandbox(website = 'https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739191153&search_text=42182&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=') {
  try {
    console.log(`browsing ${website} website`);
    const id = 42182;
    // Récupération des deals via la fonction scrape du module vinted
    const deals = await vinted.scrape(website, id);

    // Affichage des résultats
    console.log(deals);
    console.log('done');
    process.exit(0);  // Terminer le processus avec succès
  } catch (e) {
    console.error('Error during scraping:', e);  // Affichage de l'erreur en cas de problème
    process.exit(1);  // Terminer le processus avec erreur
  }
}

// Prendre l'argument de la ligne de commande ou utiliser l'URL par défaut
const [,, eshop] = process.argv;

// Appeler la fonction sandbox avec l'URL donnée
sandbox(eshop);
