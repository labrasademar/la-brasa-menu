const LANGUAGES = {
    ca: {
        category: "Categoria CA",
        name: "Nom CA",
        description: "Descripció CA",
        menuTitle: "LA CARTA",
        footer: "BONA GENT · BON MENJAR · SALUT",
        error: "No s'ha pogut carregar la carta.",
        retry: "Tornar-ho a provar"
    },
    es: {
        category: "Categoría ES",
        name: "Nombre ES",
        description: "Descripción ES",
        menuTitle: "LA CARTA",
        footer: "BUENA GENTE · BUENA COMIDA · ¡SALUD!",
        error: "No se ha podido cargar la carta.",
        retry: "Reintentar"
    },
    fr: {
        category: "Catégorie FR",
        name: "Nom FR",
        description: "Description FR",
        menuTitle: "LA CARTE",
        footer: "BONNE COMPAGNIE · BONNE CUISINE · SANTÉ !",
        error: "Impossible de charger la carte.",
        retry: "Réessayer"
    },
    en: {
        category: "Category EN",
        name: "Name EN",
        description: "Description EN",
        menuTitle: "MENU",
        footer: "GOOD PEOPLE · GOOD FOOD · CHEERS!",
        error: "Unable to load the menu.",
        retry: "Try again"
    }
};

const PRICE_COLUMN = "Prix";

let menuData = [];
let currentLanguage = null;

const languageScreen = document.getElementById("language-screen");
const menuScreen = document.getElementById("menu-screen");
const menuContent = document.getElementById("menu-content");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const errorMessage = document.getElementById("error-message");
const retryButton = document.getElementById("retry-button");
const menuTitle = document.getElementById("menu-title");
const footerMessage = document.getElementById("footer-message");

/* Sélection de la langue */

document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => selectLanguage(button.dataset.language));
});

async function selectLanguage(language) {
    if (!LANGUAGES[language]) return;

    currentLanguage = language;

    try {
        localStorage.setItem("la-brasa-language", language);
    } catch (error) {
        // Le stockage local n'est pas indispensable au fonctionnement.
    }

    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState({}, "", url);

    showMenuScreen();
    updateLanguageInterface();
    await loadMenu();
}

function showMenuScreen() {
    languageScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
}

/* Chargement du Google Sheet */

async function loadMenu() {
    showLoading();

    try {
        if (menuData.length === 0) menuData = await fetchMenuData();
        renderMenu();
    } catch (error) {
        console.error(error);
        showError();
    }
}

/* Génération de la carte */

function renderMenu() {
    const language = LANGUAGES[currentLanguage];
    const categories = new Map();

    menuData.forEach(item => {
        const category = cleanText(item[language.category]);
        const name = cleanText(item[language.name]);
        const description = cleanText(item[language.description]);
        const price = cleanText(item[PRICE_COLUMN]);

        if (!name || !category) return;
        if (!categories.has(category)) categories.set(category, []);

        categories.get(category).push({
            name,
            description,
            price
        });
    });

    menuContent.innerHTML = "";

    categories.forEach((items, categoryName) => {
        const section = document.createElement("section");
        section.className = "menu-category";

        const title = document.createElement("h2");
        title.className = "category-title";
        title.textContent = categoryName;
        section.appendChild(title);

        items.forEach(item => section.appendChild(createMenuItem(item)));
        menuContent.appendChild(section);
    });

    hideLoading();
}

function createMenuItem(item) {
    const article = document.createElement("article");
    article.className = "menu-item";

    const main = document.createElement("div");
    main.className = "item-main";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;
    main.appendChild(name);

    if (item.price) {
        const dots = document.createElement("span");
        dots.className = "item-dots";
        dots.setAttribute("aria-hidden", "true");

        const price = document.createElement("span");
        price.className = "item-price";
        price.textContent = item.price;

        main.appendChild(dots);
        main.appendChild(price);
    }

    article.appendChild(main);

    /*
     * Si la description est vide, aucun élément HTML n'est créé.
     * Il n'y aura donc ni message ni espace réservé.
     */
    if (item.description) {
        const description = document.createElement("p");
        description.className = "item-description";
        description.textContent = item.description;
        article.appendChild(description);
    }

    return article;
}

/* Mise à jour des textes selon la langue */

function updateLanguageInterface() {
    const language = LANGUAGES[currentLanguage];

    document.documentElement.lang = currentLanguage;
    menuTitle.textContent = language.menuTitle;
    footerMessage.textContent = language.footer;
    errorMessage.textContent = language.error;
    retryButton.textContent = language.retry;

    document.querySelectorAll(".language-nav button").forEach(button => {
        button.classList.toggle("active", button.dataset.language === currentLanguage);
    });
}

/* États de l'interface */

function showLoading() {
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");
    menuContent.classList.add("hidden");
}

function hideLoading() {
    loadingElement.classList.add("hidden");
    errorElement.classList.add("hidden");
    menuContent.classList.remove("hidden");
}

function showError() {
    loadingElement.classList.add("hidden");
    menuContent.classList.add("hidden");
    errorElement.classList.remove("hidden");
}

retryButton.addEventListener("click", async () => {
    menuData = [];
    await loadMenu();
});

function cleanText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

/* Une URL comme ?lang=fr permet d'ouvrir directement la carte française. */

function init() {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get("lang");

    if (urlLanguage && LANGUAGES[urlLanguage]) {
        selectLanguage(urlLanguage);
        return;
    }

    // Sans paramètre ?lang=, on affiche toujours l'écran d'accueil.
}

init();