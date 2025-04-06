// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Portfolio developt with my api
*/

// current deals on the page
let currentDeals = [];
let currentSales = [];
let currentPagination = {};
let showFavoritesOnly = false;
let showingBestDeals = false;     
let topDeals = [];

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
 * Fetch deals from API (fetch all and paginate locally)
 * @return {Object} { deals: Array, pagination: Object }
 */
const fetchDeals = async () => {
  try {
    console.log("Fetching all deals...");
    
    // takes all deals form my api
    const response = await fetch(`https://lego-blond-two.vercel.app/deals/search?limit=40`);
    const body = await response.json();

    if (!body.results || !Array.isArray(body.results)) {
      console.error("Invalid API response :", body);
      return { deals: [], pagination: { currentPage: 1, pageSize: 6, pageCount: 0} };
    }

    console.log(`Deals fetch : ${body.results.length}`);

    return { 
      deals: body.results, 
      pagination: { currentPage: 1, pageSize: 6, pageCount: Math.ceil(body.results.length / 6) } 
    };
  } catch (error) {
    console.error("Error fetching deals :", error);
    return { deals: [], pagination: { currentPage: 1, pageSize: 6, pageCount: 0 } };
  }
};

/**
 * Fetch sales for a specific LEGO set id
 * @param  {String}  id - LEGO set ID
 * @return {Array}
 */
const fetchSales = async (id) => {
  try {
    // takes sales on my api for a specific id
    const response = await fetch(`https://lego-blond-two.vercel.app/sales/search?legoSetId=${id}`);
    const body = await response.json();

    //console.log("Réponse API fetchSales :", body);

    if (!body.results || !Array.isArray(body.results)) {
      return [];
    }

    return body.results;
  } catch (error) {
    console.error("Error fetching sales :", error);
    return [];
  }
};

/***
 * Charger et filtrer les meilleurs deals
 */
const fetchBestDeals = async () => {
  try {
    console.log("Fetching best deals...");
    
    const response = await fetch('https://lego-blond-two.vercel.app/deals/best');
    const body = await response.json();

    if (!body.results || !Array.isArray(body.results)) {
      console.error("API answer invalid :", body);
      return [];
    }


    return body.results;
  } catch (error) {
    console.error("Error fetching best deals :", error);
    return [];
  }
};

const StoreBestDeals = async () => {
  try {
    const bestDealsDisp = await fetchBestDeals(); // fetch deals 
    topDeals = bestDealsDisp.slice(0, 5); // Takes 5 best
  } catch (error) {
    console.error("Error fetching best deals :", error);
    topDeals = []; // error case
  }
};
// Load best deals at start -> for global display (best deals ion yellow)
StoreBestDeals();

/**
 * Paginate deals manually
 */
const paginateDeals = () => {
  const start = (currentPagination.currentPage - 1) * currentPagination.pageSize;
  const end = start + currentPagination.pageSize;

  console.log(`PaginateDeals - Page: ${currentPagination.currentPage}, Start: ${start}, End: ${end}, Total: ${allDeals.length}`);

  currentDeals = allDeals.slice(start, end);
  currentPagination.pageCount = Math.ceil(allDeals.length / currentPagination.pageSize);

  console.log(`Deals affichés pour cette page: ${currentDeals.length}`);
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = (deals) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.classList.add('deals-container');

  const dealsTitle = document.createElement('h2');
  dealsTitle.id = 'DealsTitle';
  dealsTitle.textContent = showingBestDeals ? 'Best Deals' : 'Deals Available';

  // Favorite btn
  const showFavoritesBtn = document.createElement('button');
  showFavoritesBtn.textContent = showFavoritesOnly ? 'Show All Deals' : 'Show Favorite Deals';
  showFavoritesBtn.id = 'show-favorites-btn';

  // btn container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'deals-controls';
  controlsContainer.appendChild(showFavoritesBtn);

  // Explain bouton explication (only when bestdeals activate) 
  if (showingBestDeals) {
    const explainScoreBtn = document.createElement('button');
    explainScoreBtn.textContent = '❓';
    explainScoreBtn.id = 'explain-score-btn';

    explainScoreBtn.addEventListener('click', () => {
      alert(`The score is based on:
  - ⏱️ 30% - Availability time (the shorter the better)
 - 💰 30% - Resale value / price 
 - 🔻 20% - Discount
 - 🔥 10% - Temperature
 - 🛒 10% - Number of sales`);
    });

    controlsContainer.appendChild(explainScoreBtn);
  }

  // Filter favorite
  const dealsToDisplay = showFavoritesOnly
    ? deals.filter(deal => localStorage.getItem(`favorite-${deal.id}`) === 'true')
    : deals;

  // Create cards
  const template = dealsToDisplay
    .map(deal => {
      const isFavorite = localStorage.getItem(`favorite-${deal.id}`) === 'true';
      const isInTopDeals = topDeals.some(topDeal => topDeal.id === deal.id);

      let scoreSection = '';
      if (typeof deal.score === 'number' && !isNaN(deal.score)) {
        const roundedScore = deal.score.toFixed(3);
        scoreSection = `
          <div class="deal-score">
            <strong>Best Deal Score:</strong> <span>${roundedScore}</span>
          </div>`;
      }

      return `
        <div class="deal-card ${isInTopDeals ? 'best-deal-style' : ''}">
          <div class="deal-header">
            <span class="deal-id">ID: ${deal.id}</span>
            <button class="favorite-btn" data-id="${deal.id}" data-favorite="${isFavorite}">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <img src="${deal.image}" alt="${deal.title}" class="deal-image">
          <div class="deal-price-discount">
            <span class="deal-price">💰 ${deal.price}€</span>
            <span class="deal-discount">⬇️ -${deal.discount}%</span>
          </div>
          <div class="deal-temp-comments">
            <span class="deal-temperature">🔥 ${deal.temperature}°</span>
            <span class="deal-comments">💬 ${deal.comments} comments</span>
          </div>
          ${scoreSection}
          <a href="${deal.link}" target="_blank" class="view-deal-btn">Go to the offer</a>
        </div>
      `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);

  // Insertion dans le DOM
  const dealsButtonsContainer = document.getElementById('deals-buttons');
  if (dealsButtonsContainer) {
    dealsButtonsContainer.innerHTML = '';
    dealsButtonsContainer.appendChild(dealsTitle);
    dealsButtonsContainer.appendChild(controlsContainer);
  }

  const dealsCardsContainer = document.getElementById('deals-cards');
  if (dealsCardsContainer) {
    dealsCardsContainer.innerHTML = '';
    dealsCardsContainer.appendChild(fragment);
  }


  /**
   * Events
   */

  // Favorites
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', handleFavoriteToggle);
  });

  // Toggle favorites
  showFavoritesBtn.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    renderDeals(deals);
  });

  // Click on card to display its vinted sales
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('click', async (event) => {
      const selectedSetId = card.querySelector('.deal-id')?.textContent.replace('ID: ', '').trim();
      if (!selectedSetId) return;

      currentSales = await fetchSales(selectedSetId);

      // Update selector
      const selectElement = document.getElementById('lego-set-id-select');
      if (selectElement) {
        selectElement.value = selectedSetId;
      }
      console.log('a');

      renderSales();
      renderIndicators(selectedSetId);
    });
  });
};


/**
* Render list of sales
* @param  {Array} sales
*/
const renderSales = () => {
  sales = currentSales;
  const salesTitle = document.getElementById("salesTitle");
  const salesList = document.getElementById("sales-list");

  // Update title with nb of sales 
  const salesCount = sales.length;
  salesTitle.textContent = `Vinted Sales - ${salesCount}`;

  // clean list for new sales 
  salesList.innerHTML = "";

  if (salesCount === 0) {
    // print when no vinted sales 
    salesList.innerHTML = `<p>No sales available on Vinted for this ID :(</p>`;
    return;
  }

  // display list of sales 
  sales.forEach((sale) => {
      const saleDiv = document.createElement("div");
      saleDiv.classList.add("sale");

      saleDiv.innerHTML = `
          <span>⭐</span>
          <a href="${sale.url}" target="_blank">${sale.title}</a>
          <span>${sale.price}€</span>
      `;

      salesList.appendChild(saleDiv);
  });
};

/**
 * Render pagination selector
 */
const renderPagination = () => {
  selectPage.innerHTML = Array.from(
    { length: currentPagination.pageCount },
    (_, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  selectPage.selectedIndex = currentPagination.currentPage - 1;
};

const fetchSalesStats = async (legoSetId) => {
  try {
      // takes stat for an id 
      const response = await fetch(`https://lego-blond-two.vercel.app/sales/average?legoSetId=${legoSetId}`);
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching state:", error);
      return { average: 0, totalDeals: 0, P5: 0, P25: 0, P50: 0 };
  }
};

/**
 * Render number of deals indicator
 */
const renderIndicators = async (legoSetId) => {
  if (currentSales.length === 0) {
    // No sales -> no calculs 
    console.log("No sales available");
    spanNbDeals.innerHTML = 0;
    spanNbSales.innerHTML = 0;
    spanAverage.innerHTML = '0';
    spanP5.innerHTML = '0';
    spanP25.innerHTML = '0';
    spanP50.innerHTML = '0';
    spanLifeTime.innerHTML = '0.00';
    return; 
  }

  // Fetching stats
  spanNbDeals.innerHTML = allDeals.length;
  spanNbSales.innerHTML = currentSales.length;

  const { average, totalDeals, P5, P25, P50 } = await fetchSalesStats(legoSetId);
  console.log("Fetched Stats:", { average, totalDeals, P5, P25, P50 });
  

  // takes the statistics
  spanAverage.innerHTML = `${average}`;
  spanP5.innerHTML = `${P5}`;
  spanP25.innerHTML = `${P25}`;
  spanP50.innerHTML = `${P50}`;


  // Calculate lifetime
  const currentDate = new Date();
  const lifetimeValues = sales
    .filter((sale) => {
      const publishedDate = new Date(sale.timestamp * 1000);
      return !isNaN(publishedDate) && publishedDate.getTime() > 0;
    })
    .map((sale) => {
      const publishedDate = new Date(sale.timestamp * 1000);
      const lifetimeInMilliseconds = currentDate - publishedDate;
      const lifetimeInDays = lifetimeInMilliseconds / (1000 * 60 * 60 * 24);
      return lifetimeInDays;
    });

  const averageLifetime = lifetimeValues.length > 0
    ? lifetimeValues.reduce((sum, lifetime) => sum + lifetime, 0) / lifetimeValues.length
    : 0;

  spanLifeTime.innerHTML = averageLifetime.toFixed(2);
};

/**
 * Render Lego set IDs selector
 */
const renderLegoSetIds = () => {
  const ids = [...new Set(currentDeals.map(deal => deal.id).filter(id => id))];

  selectLegoSetIds.innerHTML = `<option value="default">Select an ID</option>` + 
    ids.map(id => `<option value="${id}">${id}</option>`).join('');
};

/**
 * Re-render the page
 */
const render = () => {
  paginateDeals();
  renderDeals(currentDeals);
  renderPagination();
  //renderIndicators();
  renderLegoSetIds();
};

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', async () => {
  const { deals, pagination } = await fetchDeals(); // Retrieve all offers on loading

  allDeals = deals;
  currentPagination = pagination;
  selectPrice.value = "selection";
  render();
});

/**
 * Page change management -nb element/page
 */
selectPage.addEventListener('change', (event) => {
  currentPagination.currentPage = parseInt(event.target.value);
  render();
});

/**
 * Page change management - page number
 */
selectShow.addEventListener('change', (event) => {
  currentPagination.pageSize = parseInt(event.target.value);
  currentPagination.currentPage = 1; // Revenir à la première page

  render();
});

/**
 * Buton to select sales of an id 
 */
selectLegoSetIds.addEventListener('change', async (event) => {
  const selectedSetId = event.target.value; // takes selected id
  console.log(`Lego Set sélectionné: ${selectedSetId}`);

  if (!selectedSetId || selectedSetId === "default") return;

  // Fetch sales of this id 
  currentSales = await fetchSales(selectedSetId);

  // display sales and indicators 
  renderSales();
  renderIndicators(selectedSetId);
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

/**
 * button management 
 */
/**
 * Fonction to sort deals 
 * @param {string} filterBy - filter les deals ("best-discount", "most-commented", "hot-deals")
 * @param {string} sortKey - key to sort deals ("discount", "comments", "temperature")
 */
const sortDeals = async (filterBy, sortKey) => {
  try {
    console.log(`Fetching all deals for ${filterBy} ...`);

    // call API for filterBy
    const response = await fetch(`https://lego-blond-two.vercel.app/deals/search?filterBy=${filterBy}`);
    const body = await response.json();

    if (!body.results || !Array.isArray(body.results)) {
      console.error("API answer invalid : :", body);
      return;
    }

    console.log(`Deals récupérés : ${body.results.length}`);

    // order deals dec
    const sortedDeals = body.results.sort((a, b) => b[sortKey] - a[sortKey]);

    // Updates deals
    allDeals = sortedDeals;

    // display 
    render();
    // reset bouton sort by
    selectPrice.value = "selection";

    // reset all deals btn 
    bestDealsSlider.style.display = "none";  // hide slider
    bestDealsInfo.style.display = "none";  // hide best-deals-info
    showingBestDeals = false;  // Go back to "all deals " mode
    bestDealsCount.textContent = 5;  // 5 best deals in Yellow
    toggleBestDealsBtn.textContent = "Best Deals!";  // reste txt content


  } catch (error) {
    console.error("Erreur lors de la récupération des deals :", error);
  }
};

// event handler 
document.querySelector('#best-discount').addEventListener('click', () => sortDeals('best-discount', 'discount'));
document.querySelector('#most-commented').addEventListener('click', () => sortDeals('most-commented', 'comments'));
document.querySelector('#hot-deals').addEventListener('click', () => sortDeals('hot-deals', 'temperature'));

/**
 * Fonction to sort deals by price/date 
 */
selectPrice.addEventListener('change', async (event) => {
  if (!event.target.value) return; // no value selected -> stop here
  currentSort = event.target.value;

  try {
    // takes deals from api
    console.log(`Fetching all deals for sorting by ${event.target.value} ...`);
    
    let response;
    let body;
    let sortedDeals;
    
    // request in fonction of the target value 
    if (event.target.value === "price-desc" || event.target.value === "price-asc") {
      // sort by price 
      response = await fetch('https://lego-blond-two.vercel.app/deals/search');
      body = await response.json();

      if (!body.results || !Array.isArray(body.results)) {
        console.error("API answer invalid : :", body);
        return;
      }
      sortedDeals = body.results.sort((a, b) => {
        if (event.target.value === "price-desc") {
          return b.price - a.price;  // dec
        } else {
          return a.price - b.price;  // asc
        }
      });

    } else if (event.target.value === "date-desc" || event.target.value === "date-asc") {
      // sort by date 
      response = await fetch('https://lego-blond-two.vercel.app/deals/search');
      body = await response.json();

      if (!body.results || !Array.isArray(body.results)) {
        console.error("API answer invalid : :", body);
        return;
      }

      sortedDeals= body.results.sort((a, b) => {
        if (event.target.value === "date-desc") {
          return b.timestamp- a.timestamp;  // desc
        } else {
          return a.timestamp - b.timestamp;  // asc
        }
      });
    }

    // update deals to show 
    allDeals = sortedDeals;

    // display
    render();

  } catch (error) {
    console.error("Error fetching deals  :", error);
  }

  // Make sure that the value of the selected sort is restored after rendering.
  selectPrice.value = currentSort;
  console.log(event.target.value);

  // reset  best deals btn 
  bestDealsSlider.style.display = "none";  // hide slider
    bestDealsInfo.style.display = "none";  // hide best-deals-info
    showingBestDeals = false;  // Go back to "all deals " mode
    bestDealsCount.textContent = 5;  // 5 best deals in Yellow
    toggleBestDealsBtn.textContent = "Best Deals!";  // reset txt content
});

/**
 * best deals features 
 */
// Sélection des éléments
const toggleBestDealsBtn = document.getElementById('toggle-best-deals');
const bestDealsSlider = document.getElementById('best-deals-slider');
const bestDealsCount = document.getElementById('best-deals-count');
const bestDealsInfo = document.getElementById('best-deals-info');
const dealsTitle = document.getElementById('DealsTitle');

// State
let bestDeals = [];
let previousDeals = [];
let previousPage = {};

// Update with the slider
const updateBestDealsDisplay = () => {
  if (showingBestDeals) {
    const count = parseInt(bestDealsSlider.value, 10);
    allDeals = bestDeals.slice(0, count);
    bestDealsCount.textContent = count;
    if (dealsTitle) dealsTitle.textContent = "Best Deals";
  } else {
    allDeals = previousDeals;
    currentPagination = previousPage;
    bestDealsCount.textContent = 5;
    if (dealsTitle) dealsTitle.textContent = "All Deals";
  }

  render();
};

// best deals btn event
toggleBestDealsBtn.addEventListener('click', async () => {
  if (!showingBestDeals) {
    // go to Best Deals mode

    // keeps "All Deals" et pagination 
    previousDeals = [...allDeals];
    previousPage = { ...currentPagination };

    bestDeals = await fetchBestDeals();
    bestDealsSlider.style.display = "inline";
    bestDealsSlider.value = 5;
    bestDealsInfo.style.display = "inline";
    toggleBestDealsBtn.textContent = "All Deals";
    showingBestDeals = true;

  } else {
    // go back "All Deals" mode
    bestDealsSlider.style.display = "none";
    bestDealsInfo.style.display = "none";
    toggleBestDealsBtn.textContent = "Best Deals!";
    showingBestDeals = false;
  }

  updateBestDealsDisplay();
});

// Slider = change the nb of deals available 
bestDealsSlider.addEventListener('input', updateBestDealsDisplay);
