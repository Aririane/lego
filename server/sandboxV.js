/* eslint-disable no-console, no-process-exit */
const vinted = require('./websites/vinted'); // Assurez-vous que le chemin est correct

// Fonction principale qui effectue le scraping
//async function sandbox(website = 'https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739191153&search_text=42182&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=') {
async function sandbox(id) {
  try {

    if (!id) {
      console.error('Veuillez fournir un ID en argument.');
      process.exit(1);
    }

    console.log(`Recherche de l'ID : ${id} sur Vinted`);
    // Construire dynamiquement l'URL avec l'ID
    

    const website = `https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=${id}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`;

    //const website = "https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=42181&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=";
    //const website = "https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=${Date.now()}&search_text=${id}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=&color_ids=&material_ids=";

    // Récupération des deals via la fonction scrape du module vinted
    const deals = await vinted.scrape(website, id);

    // Affichage des résultats
    console.log(deals);
    console.log('Fin du script sandboxv.js pour l\'ID:', id);
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
