// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// all deals to have good tri
let allDeals = [];
let currentSort = "";

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const selectPrice = document.querySelector('#sort-select')


/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};


/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  /*const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');*/
  const options = [
    `<option value="default" disabled selected>Make a selection</option>`, // Option par défaut
    ...ids.map((id) => `<option value="${id}">${id}</option>`),
  ].join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};



const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
  selectPrice.value = "selection";
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Select Page
 */
selectPage.addEventListener('change', async (event) => {
  const goToPage = parseInt(event.target.value);

  console.log(goToPage);
  
  const deals = await fetchDeals(goToPage,parseInt(selectShow.value));
  // recuperer ce qu'on à cliquer

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});


/**
 * Sort deals by discount
 */
const sortByBestDiscount = () => {
  currentDeals.sort((a, b) => b.discount - a.discount); // Suppose que les deals ont une propriété 'discount'
  render(currentDeals, currentPagination);
};
document.querySelector('#best-discount').addEventListener('click', sortByBestDiscount);

/**
 * Sort deals by most commented
 */
const sortByMostCommented = () => {
  currentDeals.sort((a, b) => b.comments - a.comments); // Suppose que les deals ont une propriété 'comments'
  render(currentDeals, currentPagination);
};
document.querySelector('#most-commented').addEventListener('click', sortByMostCommented);

/**
 * Sort deals by hot deals
 */
const sortByHotDeals = () => {
  currentDeals.sort((a, b) => b.temperature - a.temperature); // Suppose que les deals ont une propriété 'popularity'
  render(currentDeals, currentPagination);
};
document.querySelector('#hot-deals').addEventListener('click', sortByHotDeals);

/**
 * Sort deals by price & dates
 */
selectPrice.addEventListener('change', async (event) => {
  if (!event.target.value) return;
  currentSort = event.target.value;
  if(event.target.value=="price-desc"){
    currentDeals.sort((a, b) => b.price - a.price); // Suppose que les deals ont une propriété 'popularity'
  }
  if(event.target.value == "price-asc"){
    currentDeals.sort((a, b) => a.price - b.price); // Suppose que les deals ont une propriété 'popularity'
  }
  if(event.target.value=="date-desc"){
    currentDeals.sort((a, b) => a.published - b.published); // Suppose que les deals ont une propriété 'popularity'
  }
  if(event.target.value == "date-asc"){
    currentDeals.sort((a, b) => b.published - a.published); // Suppose que les deals ont une propriété 'popularity'
  }
  render(currentDeals, currentPagination);
  selectPrice.value = currentSort;
  console.log(event.target.value);
});


/**
 * Display sales for a current id
 */
/**
 * Fetch sales for a specific LEGO set id
 * @param  {String}  id - LEGO set ID
 * @return {Array}
 */
const fetchSales = async (id) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/sales?id=${id}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return [];
    }

    return body.data.result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Render list of sales
 * @param  {Array} sales
 */
const renderSales = (sales) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = sales
    .map((sale) => {
      return `
      <div class="sale">
        <span>Sale ID: ${sale.uuid}</span>
        <a href="${sale.link}">${sale.title}</a>
        <span>Price: ${sale.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);

  // Create or update the sales section
  let salesSection = document.querySelector('#sales');
  if (!salesSection) {
    salesSection = document.createElement('section');
    salesSection.id = 'sales';
    document.body.appendChild(salesSection); // Append to the body or a specific container
  }

  salesSection.innerHTML = '<h2>Vinted Sales</h2>';
  salesSection.appendChild(fragment);
};

// Add event listener for LEGO set sales fetching
document.querySelector('#lego-set-id-select').addEventListener('change', async (event) => {
  const selectedSetId = event.target.value;

  if (!selectedSetId) return;

  const sales = await fetchSales(selectedSetId);

  renderSales(sales);
});


/**
 * 
 */

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

});