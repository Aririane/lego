const fs = require('fs'); // Pour ecrire dans une json file 
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
    // take title from the first html page
    const title = $(element)
      .find('a.cept-tt.thread-link.linkPlain.thread-title--list.js-thread-title')
      .attr('title');

    // Take json attribute who contains all deal attributes
    const vue2Data = $(element).find('div.js-vue2').attr('data-vue2');
    
    // all attributes that we want to take
    let idDeals = null, id = null, comments = null, temperature = null, price = null, timestamp=null,
        link = null, discount = null, image = null, retail = null, community = null;

    if (vue2Data) {
      try {
        const parsedData = JSON.parse(vue2Data); // convert JSON in object
        const thread = parsedData?.props?.thread || {};

        idDeals = thread.threadId || null;
        comments = thread.commentCount || 0;
        temperature = thread.temperature || null;
        link = thread.shareableLink || null;
        discount = thread.percentage || null;
        retail = thread.nextBestPrice ||null;
        price = thread.price || null;
        timestamp = thread.publishedAt || null;
        community = 'dealabs'; // community are always dealabs

        // calculate discount 
        discount = Math.round((retail-price)/retail*100);

        // id lego -> take it from  title
        const legoMatch = title ? title.match(/\b\d{5,6}\b/) : null;
        id = legoMatch ? legoMatch[0] : null;


        // Construct picture url
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
      idDeals,
    };
  }).get(); // Return all information in a tab
};

/**
 * Scrape data page
 * @param {String} url - URL to scrap
 * @returns {Promise<Array|null>} Deals extracts
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
    const deals = parse(body); // convert deal in a good format

    if (deals.length === 0) {
      console.log('No deal found.');
    } else {
      console.log('My Deals :');
      console.log(deals);
      // Write all deals in a Json files
      fs.writeFileSync('dealsDL.json', JSON.stringify(deals, null, 2), 'utf-8');
      console.log('All deals have been charged in dealsDL.json');
    }
    return deals;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
};
