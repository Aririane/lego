/* eslint-disable no-console, no-process-exit */
const websites = {
  avenuedelabrique: require('./websites/avenuedelabrique'),
  dealabs: require('./websites/dealabs'),
  vinted: require('./websites/vinted')
};

// Récupération des arguments
const [,, input] = process.argv;

// Vérifier si l'input est une URL ou un site connu
const isUrl = input && input.startsWith("http");

// Déterminer le scraper à utiliser
let scraper = null;
let websiteUrl = input; // Par défaut, c'est l'URL entrée par l'utilisateur

if (!isUrl) {
  // L'utilisateur a entré un nom de site (ex: "dealabs")
  if (websites[input]) {
    scraper = websites[input]; // Associe le scraper correspondant
    const websiteUrls = {
      avenuedelabrique: 'https://www.avenuedelabrique.com/nouveautes-lego',
      dealabs: 'https://www.dealabs.com/groupe/lego',
      vinted: 'https://www.vinted.fr/items/5622630875'
    };
    websiteUrl = websiteUrls[input]; // Utilise l'URL associée
  }
} else {
  // L'utilisateur a entré une URL complète, essayer de détecter le site
  if (input.includes("avenuedelabrique")) {
    scraper = websites.avenuedelabrique;
  } else if (input.includes("dealabs")) {
    scraper = websites.dealabs;
  } else if (input.includes("vinted")) {
    scraper = websites.vinted;
  } else {
    console.warn("⚠️ Avertissement : Aucun scraper spécifique trouvé, utilisation du scraper avenuedelabrique par défaut.");
    scraper = websites.avenuedelabrique;
  }
}

// Vérifier qu'on a bien une URL valide et un scraper associé
if (!websiteUrl || !scraper) {
  console.error("❌ Erreur : Spécifie un site valide (avenuedelabrique, dealabs, vinted) ou une URL.");
  process.exit(1);
}

async function sandbox() {
  try {
    console.log(`🕵️‍♀️  Scraping ${websiteUrl} avec ${scraper ? scraper.name : "un scraper par défaut"}`);

    const deals = await scraper.scrape(websiteUrl);

    console.log(deals);
    console.log('✅ Done');
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur lors du scraping :", e);
    process.exit(1);
  }
}

console.log(`Scraper sélectionné : ${scraper ? scraper.name : "Aucun"}`);

sandbox();*\
