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
let currentSales = [];
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
 * Fetch deals from API (fetch all and paginate locally)
 * @return {Object} { deals: Array, pagination: Object }
 */
const fetchDeals = async () => {
  try {
    console.log("Fetching all deals...");
    
    // Récupère un grand nombre de deals pour gérer la pagination localement
    const response = await fetch(`https://lego-blond-two.vercel.app/deals/search?limit=40`);
    const body = await response.json();

    if (!body.results || !Array.isArray(body.results)) {
      console.error("Réponse API invalide :", body);
      return { deals: [], pagination: { currentPage: 1, pageSize: 6, pageCount: 0} };
    }

    console.log(`Deals récupérés : ${body.results.length}`);

    return { 
      deals: body.results, 
      pagination: { currentPage: 1, pageSize: 6, pageCount: Math.ceil(body.results.length / 6) } 
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des deals :", error);
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
    const response = await fetch(`https://lego-blond-two.vercel.app/sales/search?legoSetId=${id}`);
    const body = await response.json();

    console.log("Réponse API fetchSales :", body); // Debugging


    if (!body.results || !Array.isArray(body.results)) {
      //console.error("Réponse API invalide :", body);
      return [];
    }

    return body.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes :", error);
    return [];
  }
};

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
        <img src="${deal.image}" alt="${deal.title}" class="deal-image">
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
      currentSales = await fetchSales(selectedSetId);

      // Remplir l'ID du set LEGO
      const selectElement = document.getElementById('lego-set-id-select');
      if (selectElement) {
        selectElement.value = selectedSetId; // Sélectionner l'option correspondante
      }
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

  // Mise à jour du titre avec le nombre de ventes
  const salesCount = sales.length;
  salesTitle.textContent = `Vinted Sales - ${salesCount}`;

  // Nettoyage de la liste avant d'ajouter les nouvelles ventes
  salesList.innerHTML = "";

  if (salesCount === 0) {
    // Si aucune vente, ne pas afficher les indicateurs
    spanLifeTime.innerHTML = "Aucune vente disponible"; // Message alternatif
    return; // Ne pas continuer
  }

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
      const response = await fetch(`https://lego-blond-two.vercel.app/sales/average?legoSetId=${legoSetId}`);
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return { average: 0, totalDeals: 0, P5: 0, P25: 0, P50: 0 };
  }
};

/**
 * Render number of deals indicator
 */
const renderIndicators = async (legoSetId) => {
  if (currentSales.length === 0) {
    // Si aucune vente n'existe, on ne fait pas les calculs d'indicateurs
    console.log("No sales available, skipping indicator rendering...");
    spanNbDeals.innerHTML = 0;
    spanNbSales.innerHTML = 0;
    spanAverage.innerHTML = '0';
    spanP5.innerHTML = '0';
    spanP25.innerHTML = '0';
    spanP50.innerHTML = '0';
    spanLifeTime.innerHTML = '0.00';
    return; // Sortir de la fonction sans faire les calculs
  }

  // Si on arrive ici, cela signifie que les ventes existent.
  console.log("Sales available, fetching stats...");

  spanNbDeals.innerHTML = allDeals.length;
  spanNbSales.innerHTML = currentSales.length;

  const { average, totalDeals, P5, P25, P50 } = await fetchSalesStats(legoSetId);
  console.log("Fetched Stats:", { average, totalDeals, P5, P25, P50 });

  // Mettez à jour les éléments avec les nouvelles valeurs
  spanAverage.innerHTML = `${average}`;
  spanP5.innerHTML = `${P5}`;
  spanP25.innerHTML = `${P25}`;
  spanP50.innerHTML = `${P50}`;

  
  // Calcul de lifetime comme vous l'avez déjà fait
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
};

/**
 * Render Lego set IDs selector
 */
const renderLegoSetIds = () => {
  const ids = [...new Set(currentDeals.map(deal => deal.id).filter(id => id))];

  selectLegoSetIds.innerHTML = `<option value="default">Sélectionner un ID</option>` + 
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
  const { deals, pagination } = await fetchDeals(); // Récupérer toutes les offres au chargement

  allDeals = deals;
  currentPagination = pagination;

  render();
});

/**
 * Gestion du changement de page
 */
selectPage.addEventListener('change', (event) => {
  currentPagination.currentPage = parseInt(event.target.value);
  render();
});

/**
 * Gestion du changement de taille de page
 */
selectShow.addEventListener('change', (event) => {
  currentPagination.pageSize = parseInt(event.target.value);
  currentPagination.currentPage = 1; // Revenir à la première page

  render();
});

/**
 * Bouton pour afficher les sales selon l'id
 */
selectLegoSetIds.addEventListener('change', async (event) => {
  const selectedSetId = event.target.value; // Récupère l'ID sélectionné
  console.log(`Lego Set sélectionné: ${selectedSetId}`);

  if (!selectedSetId || selectedSetId === "default") return;

  // Récupérer les ventes liées à cet ID
  currentSales = await fetchSales(selectedSetId);

  // Afficher les ventes et mettre à jour les indicateurs
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
