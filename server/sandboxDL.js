/* eslint-disable no-console, no-process-exit */
/* execute if you only wants to take deals from dealabs*/
const dealabs = require('./websites/dealabs');

// Step 4 launch dealabs scrapping 

async function sandbox (website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`Browsing ${website} website`);

    const deals = await dealabs.scrape(website);

    //console.log(deals); // display in dealabs.js file 
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
