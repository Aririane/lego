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
  div.classList.add('deals-container');

  // section title
  const dealsTitle = document.createElement('h2');
  dealsTitle.id = 'DealsTitle';
  dealsTitle.textContent = 'Deals Available';  


  // Créer le bouton "Show Favorite Deals"
  const showFavoritesBtn = document.createElement('button');
  showFavoritesBtn.textContent = showFavoritesOnly ? 'Show All Deals' : 'Show Favorite Deals';
  showFavoritesBtn.id = 'show-favorites-btn';

  // Lier l'événement au bouton
  showFavoritesBtn.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    renderDeals(deals); // Redessiner les deals en fonction de l'état
  });

  // Filtrer les favoris si nécessaire
  const dealsToDisplay = showFavoritesOnly
    ? deals.filter(deal => localStorage.getItem(`favorite-${deal.id}`) === 'true')
    : deals;

  // Créer les cartes de deals
  const template = dealsToDisplay
    .map(deal => {
      const isFavorite = localStorage.getItem(`favorite-${deal.id}`) === 'true';
      return `
      <div class="deal-card">
        <div class="deal-header">
          <span class="deal-id">ID: ${deal.id}</span>
          <button class="favorite-btn" data-id="${deal.id}" data-favorite="${isFavorite}">
              ${isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <img src="${deal.photo}" alt="${deal.title}" class="deal-image">
        <div class="deal-price-discount">
          <span class="deal-price">💰 ${deal.price}€</span>
          <span class="deal-discount">⬇️ -${deal.discount}%</span>
        </div>
        <div class="deal-temp-comments">
          <span class="deal-temperature">🔥 ${deal.temperature}°</span>
          <span class="deal-comments">💬 ${deal.comments} comments</span>
        </div>
        <a href="${deal.link}" target="_blank" class="view-deal-btn">Go to the offer</a>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);

  // Vérification que les conteneurs existent avant d'ajouter des éléments
  const dealsButtonsContainer = document.getElementById('deals-buttons');
  if (dealsButtonsContainer) {
    dealsButtonsContainer.innerHTML = ''; // Nettoyer les anciens boutons
    dealsButtonsContainer.appendChild(dealsTitle); 
    dealsButtonsContainer.appendChild(showFavoritesBtn); // Ajouter le bouton
  }

  const dealsCardsContainer = document.getElementById('deals-cards');
  if (dealsCardsContainer) {
    dealsCardsContainer.innerHTML = ''; // Nettoyer les anciennes cartes de deals
    dealsCardsContainer.appendChild(fragment); // Ajouter les nouvelles cartes
  }

  // Réattacher les gestionnaires d'événements après avoir rendu les éléments
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', handleFavoriteToggle);
  });

  // Ajout d'un gestionnaire d'événement pour afficher les informations d'un deal
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('click', async (event) => {
      const selectedSetId = card.querySelector('.deal-id')?.textContent.replace('ID: ', '').trim();
      console.log('Selected Deal ID:', selectedSetId);

      if (!selectedSetId) return; // Vérifie que l'ID est bien récupéré
  
      // Récupérer les ventes associées
      const sales = await fetchSales(selectedSetId);

      // Remplir l'ID du set LEGO
      const selectElement = document.getElementById('lego-set-id-select');
      if (selectElement) {
        selectElement.value = selectedSetId; // Sélectionner l'option correspondante
      }
      
      // Afficher les indicateurs et les ventes
      renderIndicatorsAndSales(currentPagination, sales);
    });
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
  
  spanNbDeals.innerHTML = count;
  spanNbSales.innerHTML = countSales;

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

  spanLifeTime.innerHTML = averageLifetime.toFixed(2); 

};

/**
* Render list of sales
* @param  {Array} sales
*/
const renderSales = (sales) => {
  const salesTitle = document.getElementById("salesTitle");
  const salesList = document.getElementById("sales-list");

  // Mise à jour du titre avec le nombre de ventes
  const salesCount = sales.length;
  salesTitle.textContent = `Vinted Sales - ${salesCount}`;

  // Nettoyage de la liste avant d'ajouter les nouvelles ventes
  salesList.innerHTML = "";

  // Création des éléments de vente
  sales.forEach((sale) => {
      const saleDiv = document.createElement("div");
      saleDiv.classList.add("sale");

      saleDiv.innerHTML = `
          <span>⭐</span>
          <a href="${sale.link}" target="_blank">${sale.title}</a>
          <span>${sale.price}€</span>
      `;

      salesList.appendChild(saleDiv);
  });
};

/*
const render = (deals, pagination, sales=[]) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination, sales);
  renderLegoSetIds(deals);
  renderSales(sales);
  //selectPrice.value = "selection";
};*/

const renderDealsAndPagination = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderLegoSetIds(deals);
};

const renderIndicatorsAndSales = (pagination, sales=[]) => {
  renderIndicators(pagination, sales);
  renderSales(sales);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display -> maj logic
 */
selectShow.addEventListener('change', async (event) => {
  //const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));
  //go to page 1 when we change the nb of deals by page 
  const deals = await fetchDeals(1, parseInt(event.target.value));

  //maj deal pagi
  setCurrentDeals(deals);
  //render(currentDeals, currentPagination);
  renderDealsAndPagination(currentDeals, currentPagination);

  // maj if needed indicator and sales 
  const sales = await fetchSales(selectLegoSetIds.value);
  renderIndicatorsAndSales(currentPagination, sales);


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
  //render(currentDeals, currentPagination);

  renderDealsAndPagination(currentDeals, currentPagination);

  // Maj if needed pagination & sales
  const sales = await fetchSales(selectLegoSetIds.value);
  renderIndicatorsAndSales(currentPagination, sales);
});


/**
 * Sort deals by discount
 */
const sortByBestDiscount = () => {
  currentDeals.sort((a, b) => b.discount - a.discount); 
  //render(currentDeals, currentPagination);
  renderDealsAndPagination(currentDeals, currentPagination);
};
document.querySelector('#best-discount').addEventListener('click', sortByBestDiscount);

/**
 * Sort deals by most commented
 */
const sortByMostCommented = () => {
  currentDeals.sort((a, b) => b.comments - a.comments); 
  //render(currentDeals, currentPagination);
  renderDealsAndPagination(currentDeals, currentPagination);
};
document.querySelector('#most-commented').addEventListener('click', sortByMostCommented);

/**
 * Sort deals by hot deals
 */
const sortByHotDeals = () => {
  currentDeals.sort((a, b) => b.temperature - a.temperature); 
  //render(currentDeals, currentPagination);
  renderDealsAndPagination(currentDeals, currentPagination);
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
  //render(currentDeals, currentPagination);
  renderDealsAndPagination(currentDeals, currentPagination);
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
    const response = await fetch(`https://lego-api-blue.vercel.app/sales?id=${id}`);
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
  //render(currentDeals, currentPagination, sales);
  renderDealsAndPagination(currentDeals, currentPagination);
  renderIndicatorsAndSales(currentPagination, sales);
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
    button.textContent = '🤍';
    button.setAttribute('data-favorite', 'false');
  } else {
    localStorage.setItem(`favorite-${dealId}`, 'true');
    button.textContent =  '❤️' ;
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

document.querySelector('#lego-set-id-select').addEventListener('change', async (event) => {
  const selectedSetId = event.target.value;
  if (!selectedSetId) return;

  const sales = await fetchSales(selectedSetId);

  // only render page and sales
  renderIndicatorsAndSales(currentPagination, sales);
});


document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  //render(currentDeals, currentPagination);
  renderDealsAndPagination(currentDeals, currentPagination);
});