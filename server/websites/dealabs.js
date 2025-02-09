const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object[]} deals
 */
const parse = (data) => {
  const $ = cheerio.load(data);
  
  return $('div.js-threadList article').map((_, element) => {
    // Extraire le titre
    const title = $(element)
      .find('a.cept-tt.thread-link.linkPlain.thread-title--list.js-thread-title')
      .attr('title');

    // Récupérer l'attribut JSON "data-vue2" qui contient les données du deal
    const vue2Data = $(element).find('div.js-vue2').attr('data-vue2');
    
    let id = null, comments = null, temperature = null, price = null, timestamp=null,
        link = null, discount = null, image = null, retail = null, community = null;

    if (vue2Data) {
      try {
        const parsedData = JSON.parse(vue2Data); // Convertir JSON en objet
        const thread = parsedData?.props?.thread || {};

        id = thread.threadId || null;
        comments = thread.commentCount || 0;
        temperature = thread.temperature || null;
        link = thread.shareableLink || null;
        discount = thread.percentage || null;
        retail = thread.nextBestPrice ||null;
        price = thread.price || null;
        timestamp = thread.publishedAt || null;
        community = 'dealabs';
        // construire le discount 
        discount = Math.round((retail-price)/retail*100);
        // Construire l'URL complète de l'image
        if (thread.mainImage) {
          image = `https://static-pepper.dealabs.com/threads/raw/${thread.mainImage.slotId}/${thread.mainImage.name}/re/300x300/qt/60/${thread.mainImage.name}.${thread.mainImage.ext}`;
        }
      } catch (error) {
        console.error(`Erreur lors du parsing JSON: ${error.message}`);
      }
    }

    return {
      link,
      retail,
      price,
      discount,
      temperature,
      image,
      comments,
      timestamp,
      title,
      id,
      community,
    };
  }).get(); // Retourner les résultats sous forme de tableau
};

/**
 * Scrape une page donnée
 * @param {String} url - URL à scraper
 * @returns {Promise<Array|null>} Deals extraits
 */
module.exports.scrape = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Referer': 'https://www.google.com/',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const body = await response.text();
    return parse(body);
  } catch (error) {
    console.error(`Erreur lors du scraping ${url}:`, error.message);
    return null;
  }
};
