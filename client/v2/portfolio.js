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
let showingBestDeals = false;     // Indique si on affiche les meilleurs deals ou tous les deals
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

// Charger et filtrer les meilleurs deals
const fetchBestDeals = async () => {
  try {
    console.log("Fetching best deals...");
    
    const response = await fetch('https://lego-blond-two.vercel.app/deals/best');
    const body = await response.json();

    if (!body.results || !Array.isArray(body.results)) {
      console.error("Réponse API invalide :", body);
      return [];
    }


    return body.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des meilleurs deals :", error);
    return [];
  }
};

const StoreBestDeals = async () => {
  try {
    const bestDealsDisp = await fetchBestDeals(); // Récupérer tous les deals
    topDeals = bestDealsDisp.slice(0, 5); // Prendre les 5 meilleurs
  } catch (error) {
    console.error("Erreur lors de la récupération des meilleurs deals :", error);
    topDeals = []; // En cas d'erreur, s'assurer que c'est un tableau vide
  }
};
// Charger les meilleurs deals au début -> pour l'affichage global
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

  // Bouton favoris
  const showFavoritesBtn = document.createElement('button');
  showFavoritesBtn.textContent = showFavoritesOnly ? 'Show All Deals' : 'Show Favorite Deals';
  showFavoritesBtn.id = 'show-favorites-btn';


  // Conteneur des boutons
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'deals-controls';
  controlsContainer.appendChild(showFavoritesBtn);

  // creation bouton explication que si best deals est activé 
  if (showingBestDeals) {
    const explainScoreBtn = document.createElement('button');
    explainScoreBtn.textContent = '❓';
    explainScoreBtn.id = 'explain-score-btn';

    explainScoreBtn.addEventListener('click', () => {
      alert(`Le score est basé sur :
  - ⏱️ 30% - Durée de disponibilité (plus c’est court, mieux c’est)
  - 💰 30% - Valeur de revente / prix 
  - 🔻 20% - Réduction
  - 🔥 10% - Température
  - 🛒 10% - Nombre de ventes`);
    });

    controlsContainer.appendChild(explainScoreBtn);
  }

  // Filtrage favoris
  const dealsToDisplay = showFavoritesOnly
    ? deals.filter(deal => localStorage.getItem(`favorite-${deal.id}`) === 'true')
    : deals;

  // Création des cartes
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


  // Events

  // Favorites
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', handleFavoriteToggle);
  });

  // Toggle favorites
  showFavoritesBtn.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    renderDeals(deals);
  });

  // Click sur une carte pour afficher les ventes
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('click', async (event) => {
      const selectedSetId = card.querySelector('.deal-id')?.textContent.replace('ID: ', '').trim();
      if (!selectedSetId) return;

      currentSales = await fetchSales(selectedSetId);

      // Mise à jour du sélecteur
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

  // Mise à jour du titre avec le nombre de ventes
  const salesCount = sales.length;
  salesTitle.textContent = `Vinted Sales - ${salesCount}`;

  // Nettoyage de la liste avant d'ajouter les nouvelles ventes
  salesList.innerHTML = "";

  if (salesCount === 0) {
    // Afficher un message lorsqu'il n'y a pas de ventes
    salesList.innerHTML = `<p>No sales available on Vinted for this ID :(</p>`;
    return;
  }

  // Création des éléments de vente
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
  const { deals, pagination } = await fetchDeals(); // Récupérer toutes les offres au chargement

  allDeals = deals;
  currentPagination = pagination;
  selectPrice.value = "selection";
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

/**
 * gestion des boutons
 */
/**
 * Fonction générique de tri des deals en fonction de différents critères
 * @param {string} filterBy - Critère pour filtrer les deals (ex: "best-discount", "most-commented", "hot-deals")
 * @param {string} sortKey - Clé par laquelle trier les deals (ex: "discount", "comments", "temperature")
 */
const sortDeals = async (filterBy, sortKey) => {
  try {
    console.log(`Fetching all deals for ${filterBy} ...`);

    // Appel API avec le paramètre filterBy
    const response = await fetch(`https://lego-blond-two.vercel.app/deals/search?filterBy=${filterBy}`);
    const body = await response.json();

    if (!body.results || !Array.isArray(body.results)) {
      console.error("Réponse API invalide :", body);
      return;
    }

    console.log(`Deals récupérés : ${body.results.length}`);

    // Tri des deals par la clé spécifiée (ordre décroissant)
    const sortedDeals = body.results.sort((a, b) => b[sortKey] - a[sortKey]);

    // Mettre à jour la variable globale allDeals
    allDeals = sortedDeals;

    // Mettre à jour la pagination si besoin
    currentPagination = {
      currentPage: 1,
      pageSize: currentPagination.pageSize || 6, // garder la taille actuelle ou 6 par défaut
      pageCount: Math.ceil(sortedDeals.length / (currentPagination.pageSize || 6))
    };

    // Réafficher la page avec les nouveaux deals triés
    render();
    // reset bouton sort by
    selectPrice.value = "selection";
    // resset all deals btn 
    bestDealsSlider.style.display = "none";  // Cacher le slider
    bestDealsInfo.style.display = "none";  // Cacher le best-deals-info
    showingBestDeals = false;  // Revenir à l'état "tous les deals"
    bestDealsCount.textContent = 5;  // Remettre à 5 le nombre de deals affichés
    toggleBestDealsBtn.textContent = "Best Deals!";  // Modifier le texte du bouton


  } catch (error) {
    console.error("Erreur lors de la récupération des deals :", error);
  }
};

// Ajout des écouteurs d'événements pour chaque bouton
document.querySelector('#best-discount').addEventListener('click', () => sortDeals('best-discount', 'discount'));
document.querySelector('#most-commented').addEventListener('click', () => sortDeals('most-commented', 'comments'));
document.querySelector('#hot-deals').addEventListener('click', () => sortDeals('hot-deals', 'temperature'));

/**
 * Fonction générique de tri des deals par prix et dates en fonction de la sélection de l'utilisateur
 */
selectPrice.addEventListener('change', async (event) => {
  if (!event.target.value) return; // Si aucune valeur n'est sélectionnée, on arrête ici.
  currentSort = event.target.value;

  try {
    // Chargement des deals depuis l'API selon le tri choisi
    console.log(`Fetching all deals for sorting by ${event.target.value} ...`);
    
    let response;
    let body;
    let sortedDeals;
    
    // Faire la requête API avec les différents filtres en fonction du tri
    if (event.target.value === "price-desc" || event.target.value === "price-asc") {
      // Si tri par prix
      response = await fetch('https://lego-blond-two.vercel.app/deals/search');
      body = await response.json();

      if (!body.results || !Array.isArray(body.results)) {
        console.error("Réponse API invalide :", body);
        return;
      }

      // Tri par prix
      sortedDeals = body.results.sort((a, b) => {
        if (event.target.value === "price-desc") {
          return b.price - a.price;  // Tri décroissant par prix
        } else {
          return a.price - b.price;  // Tri croissant par prix
        }
      });

    } else if (event.target.value === "date-desc" || event.target.value === "date-asc") {
      // Si tri par date
      response = await fetch('https://lego-blond-two.vercel.app/deals/search');
      body = await response.json();

      if (!body.results || !Array.isArray(body.results)) {
        console.error("Réponse API invalide :", body);
        return;
      }

      // Tri par date
      sortedDeals= body.results.sort((a, b) => {
        if (event.target.value === "date-desc") {
          return b.timestamp- a.timestamp;  // Tri décroissant par date
        } else {
          return a.timestamp - b.timestamp;  // Tri croissant par date
        }
      });
    }

    // Mettre à jour la variable globale allDeals
    allDeals = sortedDeals;

    // Mettre à jour la pagination si besoin
    currentPagination = {
      currentPage: 1,
      pageSize: currentPagination.pageSize || 6, // garder la taille actuelle ou 6 par défaut
      pageCount: Math.ceil(sortedDeals.length / (currentPagination.pageSize || 6))
    };

    // Réafficher la page avec les nouveaux deals triés
    render();

  } catch (error) {
    console.error("Erreur lors de la récupération des deals :", error);
  }

  // Assurez-vous que la valeur du tri sélectionné est bien rétablie après le rendu
  selectPrice.value = currentSort;
  console.log(event.target.value);

  // reset  all deals btn 
  bestDealsSlider.style.display = "none";  // Cacher le slider
    bestDealsInfo.style.display = "none";  // Cacher le best-deals-info
    showingBestDeals = false;  // Revenir à l'état "tous les deals"
    bestDealsCount.textContent = 5;  // Remettre à 5 le nombre de deals affichés
    toggleBestDealsBtn.textContent = "Best Deals!";  // Modifier le texte du bouton
});

/**
 * Calcul des best deals 
 */
// Sélection des éléments
// 🎯 Sélection des éléments HTML
// Sélection des éléments HTML
const toggleBestDealsBtn = document.getElementById('toggle-best-deals');
const bestDealsSlider = document.getElementById('best-deals-slider');
const bestDealsCount = document.getElementById('best-deals-count');
const bestDealsInfo = document.getElementById('best-deals-info');
const dealsTitle = document.getElementById('DealsTitle');

// États
let bestDeals = [];
let previousDeals = [];
let previousPage = {};

// Met à jour l'affichage en fonction du slider (ne modifie pas les previous!)
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

// Gère le bouton "Best Deals!"
toggleBestDealsBtn.addEventListener('click', async () => {
  if (!showingBestDeals) {
    // Passe en mode Best Deals

    // 👉 Sauvegarde les "All Deals" et pagination seulement une fois
    previousDeals = [...allDeals];
    previousPage = { ...currentPagination };

    bestDeals = await fetchBestDeals();
    bestDealsSlider.style.display = "inline";
    bestDealsSlider.value = 5;
    bestDealsInfo.style.display = "inline";
    toggleBestDealsBtn.textContent = "All Deals";
    showingBestDeals = true;

  } else {
    // 🔙 Retour au mode "All Deals"
    bestDealsSlider.style.display = "none";
    bestDealsInfo.style.display = "none";
    toggleBestDealsBtn.textContent = "Best Deals!";
    showingBestDeals = false;
  }

  updateBestDealsDisplay();
});

// Slider = change le nombre de deals visibles (mais ne touche pas aux "previous")
bestDealsSlider.addEventListener('input', updateBestDealsDisplay);
