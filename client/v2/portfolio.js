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
let showFavoritesOnly = false;

// all deals to have good tri
let allDeals = [];
let currentSort = "";

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanAverage = document.querySelector('#average');
const spanP5 = document.querySelector('#p5');
const spanP25 = document.querySelector('#p25');
const spanP50 = document.querySelector('#p50');
const spanLifeTime = document.querySelector('#lifetime');
const selectPrice = document.querySelector('#sort-select');


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

  // Création du bouton "Show Favorite Deals"
  const showFavoritesBtn = document.createElement('button');
  showFavoritesBtn.textContent = showFavoritesOnly ? 'Show All Deals' : 'Show Favorite Deals';
  showFavoritesBtn.id = 'show-favorites-btn';

  // Lier l'événement au bouton
  showFavoritesBtn.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly; // Basculer l'état
    renderDeals(deals); // Redessiner les deals en fonction de l'état
  });

  // Affichage des deals, filtrer les favoris si nécessaire
  const dealsToDisplay = showFavoritesOnly 
    ? deals.filter(deal => localStorage.getItem(`favorite-${deal.id}`) === 'true') // Récupérer uniquement les deals favoris
    : deals;

  const template = dealsToDisplay
    .map(deal => {
      const isFavorite = localStorage.getItem(`favorite-${deal.id}`) === 'true';
      return `
        <div class="deal" id="${deal.uuid}">
          <span>${deal.id}</span>
          <a href="${deal.link}" target="_blank">${deal.title}</a>
          <span>${deal.price}€ </span>
          <!-- Add Favorite -->
          <button class="favorite-btn" data-id="${deal.id}" data-favorite="${isFavorite}">
            ${isFavorite ? 'Remove from favorites' : 'Add to favorite'}
          </button>
        </div>
      `;
    })
    .join('');
  /*const template = deals
    .map(deal => {
      // verif id the deal is a favorite one
      const isFavorite = localStorage.getItem(`favorite-${deal.id}`) === 'true';

      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a>
        <span>${deal.price}€ </span>
        <!-- Add Favorite -->
        <button class="favorite-btn" data-id="${deal.id}" data-favorite="${isFavorite}">
          ${isFavorite ? 'Remove from favorites' : 'Add to favorite'}
        </button>
      </div>
    `;
    })
    .join('');*/

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(showFavoritesBtn); 
  sectionDeals.appendChild(fragment);

  //manipulate btn favorit
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', handleFavoriteToggle);
  });
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
  const currentSelection = selectLegoSetIds.value;

  /*const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');*/
  const options = [
    `<option value="default" disabled>Make a selection</option>`, // Option par défaut
    ...ids.map((id) => `<option value="${id}" ${id === currentSelection ? 'selected' : ''}>${id}</option>`),
  ].join('');

  selectLegoSetIds.innerHTML = options;

  // S'assurer que l'option sélectionnée reste celle de l'utilisateur
  if (ids.includes(currentSelection)) {
    selectLegoSetIds.value = currentSelection;
  } else {
    selectLegoSetIds.value = 'default';
  }
};


/**
 * Render page selector
 * @param  {Object} pagination
 * @param {Array} sales
 */
const renderIndicators =(pagination, sales) => {
  const {count} = pagination;
  const countSales = sales ? sales.length : 0; // if sales is not selectionned

  //  if sales is not selectionned
  if (sales.length === 0) {
    spanAverage.innerHTML = 'N/A';
    spanP5.innerHTML = 'N/A';
    spanP25.innerHTML = 'N/A';
    spanP50.innerHTML = 'N/A';
    return;
  }

  // Convert price in float and order
  const prices = sales
    .map(sale => parseFloat(sale.price))
    .filter(price => !isNaN(price))  // Filter NaN value
    .sort((a, b) => a - b);  // Order ( croissant)

  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  function calculatePercentile(prices, percentile) {
    const index = (percentile / 100) * (prices.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
      return prices[lower];
    }
    return prices[lower] + (index - lower) * (prices[upper] - prices[lower]);
  }
  const p5 = calculatePercentile(prices, 5);
  const p25 = calculatePercentile(prices, 25);
  const p50 = calculatePercentile(prices, 50);

  // print result 2 decimal
  spanNbDeals.innerHTML = count;
  spanNbSales.innerHTML = countSales;
  spanAverage.innerHTML = average.toFixed(2);
  spanP5.innerHTML = p5.toFixed(2);
  spanP25.innerHTML = p25.toFixed(2);
  spanP50.innerHTML = p50.toFixed(2);

  // calculate lifetime
  const currentDate = new Date();
  const lifetimeValues = sales.map((sale) => {
    const publishedDate = new Date(sale.published); // Assumer que 'published' est un timestamp ou une chaîne de date
    return (currentDate - publishedDate) / (1000 * 60 * 60 * 24); // Calculer en jours
  });

  const averageLifetime = lifetimeValues.reduce((sum, lifetime) => sum + lifetime, 0) / lifetimeValues.length;

  spanLifeTime.innerHTML = averageLifetime.toFixed(2)+" days"; 

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
          <a href="${sale.link}" target="_blank">${sale.title}</a>
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
    let salesCount = sales.length;
    salesSection.innerHTML = `<h2>Vinted Sales - ${salesCount}</h2>`;
    salesSection.appendChild(fragment);
};


const render = (deals, pagination, sales=[]) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination, sales);
  renderLegoSetIds(deals);
  renderSales(sales);
  //selectPrice.value = "selection";
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



// Add event listener for LEGO set sales fetching
document.querySelector('#lego-set-id-select').addEventListener('change', async (event) => {
  const selectedSetId = event.target.value;

  if (!selectedSetId) return;

  const sales = await fetchSales(selectedSetId);
  
  console.log(Object.keys(sales[0]));
  //renderSales(sales);
  render(currentDeals, currentPagination, sales);
});


/**
 * Toggle the favorite status of a deal
 * @param {Event} event
 */
const handleFavoriteToggle = (event) => {
  const button = event.target;
  const dealId = button.getAttribute('data-id');
  const isFavorite = button.getAttribute('data-favorite') === 'true';

  // Add/remove deal from favorite (local storage)
  if (isFavorite) {
    localStorage.setItem(`favorite-${dealId}`, 'false');
    button.textContent = 'Add to favorites';
    button.setAttribute('data-favorite', 'false');
  } else {
    localStorage.setItem(`favorite-${dealId}`, 'true');
    button.textContent = 'Remove from favorites';
    button.setAttribute('data-favorite', 'true');
  }
};

// takes deals from local storage
const getAllDealsFromLocalStorage = () => {
  let allDeals = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('deal-')) {
      const deal = JSON.parse(localStorage.getItem(key));
      allDeals.push(deal);
    }
  }
  return allDeals;
};

// take favorite deals
const getFavoriteDeals = () => {
  const allDeals = getAllDealsFromLocalStorage();
  return allDeals.filter(deal => localStorage.getItem(`favorite-${deal.id}`) === 'true');
};


document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

});