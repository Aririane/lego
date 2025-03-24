'use strict';

// Variables globales
let allDeals = [];
let currentDeals = [];
let currentPagination = { currentPage: 1, pageSize: 6, pageCount: 0 };

// Sélection des éléments du DOM
const selectPage = document.querySelector('#page-select');
const selectShow = document.querySelector('#show-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals = document.querySelector('#deals-cards');
const spanNbDeals = document.querySelector('#nbDeals');

// Vérification si le conteneur des deals existe
if (!sectionDeals) {
    console.error("L'élément #deals-container est introuvable !");
}

// Fonction pour récupérer les deals
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

// Fonction pour paginer les deals localement
function paginateDeals() {
    const start = (currentPagination.currentPage - 1) * currentPagination.pageSize;
    const end = start + currentPagination.pageSize;

    currentDeals = allDeals.slice(start, end);
    currentPagination.pageCount = Math.ceil(allDeals.length / currentPagination.pageSize);

    console.log(`Deals affichés pour la page ${currentPagination.currentPage}: ${currentDeals.length}`);
}

// Fonction pour afficher les deals
function renderDeals() {
    if (!sectionDeals) return;

    sectionDeals.innerHTML = currentDeals.length 
        ? currentDeals.map(deal => createDealCard(deal)).join('')
        : "<p>Aucun deal disponible.</p>";

    // Ajouter les gestionnaires d'événements pour les boutons favoris
    document.querySelectorAll(".favorite-btn").forEach(button => {
        button.addEventListener("click", toggleFavorite);
    });
}

// Fonction pour créer une carte de deal
function createDealCard(deal) {
    const isFavorite = localStorage.getItem(`favorite-${deal.id}`) === 'true';
    return `
        <div class="deal-card">
            <div class="deal-header">
                <span class="deal-id">ID: ${deal.id}</span>
                <button class="favorite-btn" data-id="${deal.id}" data-favorite="${isFavorite}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            <img src="${deal.photo || 'default.jpg'}" alt="${deal.title || 'No Title'}" class="deal-image">
            <div class="deal-price-discount">
                <span class="deal-price">💰 ${deal.price ? deal.price + '€' : 'Prix inconnu'}</span>
                <span class="deal-discount">${deal.discount ? '⬇️ -' + deal.discount + '%' : ''}</span>
            </div>
            <div class="deal-temp-comments">
                <span class="deal-temperature">🔥 ${deal.temperature || '0'}°</span>
                <span class="deal-comments">💬 ${deal.comments || '0'} commentaires</span>
            </div>
            <a href="${deal.link}" target="_blank" class="view-deal-btn">Voir l'offre</a>
        </div>
    `;
}

// Fonction pour afficher la liste des Lego Set IDs disponibles
function renderLegoSetIds() {
  if (!selectLegoSetIds) return;

  // Extraire les IDs uniques des deals récupérés
  const ids = [...new Set(allDeals.map(deal => deal.id).filter(id => id))];

  // Vérifier si des IDs sont trouvés
  if (ids.length === 0) {
      selectLegoSetIds.innerHTML = `<option value="">Aucun ID disponible</option>`;
      return;
  }

  // Générer les options du select
  selectLegoSetIds.innerHTML = `<option value="">Sélectionner un ID</option>` + 
      ids.map(id => `<option value="${id}">${id}</option>`).join('');
}

// Fonction pour basculer un deal en favori
function toggleFavorite(event) {
    const button = event.target;
    const dealId = button.getAttribute("data-id");
    const isFavorite = button.getAttribute("data-favorite") === "true";

    // Mettre à jour localStorage
    localStorage.setItem(`favorite-${dealId}`, !isFavorite);

    // Mettre à jour l'affichage du bouton
    button.innerHTML = !isFavorite ? "❤️" : "🤍";
    button.setAttribute("data-favorite", !isFavorite);
}

// Fonction pour mettre à jour les indicateurs
function renderIndicators() {
    spanNbDeals.textContent = allDeals.length;
}

// Fonction pour gérer la pagination et la mise à jour de l'affichage
function render() {
    paginateDeals();
    renderDeals();
    renderIndicators();
    renderLegoSetIds();
}

// Écouteur d'événement au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
    const { deals, pagination } = await fetchDeals();

    allDeals = deals;
    currentPagination = pagination;

    render();
});

// Gestion du changement de page
selectPage.addEventListener('change', (event) => {
    currentPagination.currentPage = parseInt(event.target.value);
    render();
});

// Gestion du changement de taille de page
selectShow.addEventListener('change', (event) => {
    currentPagination.pageSize = parseInt(event.target.value);
    currentPagination.currentPage = 1; // Revenir à la première page
    render();
});
