const LANGUAGES = {
    ca: {
        category: "Categoria CA",
        name: "Nom CA",
        description: "Descripció CA",
        menuTitle: "LA CARTA",
        allergenTitle: "AL·LÈRGENS",
        footer: "BONA GENT · BON MENJAR · SALUT",
        error: "No s'ha pogut carregar la carta.",
        retry: "Tornar-ho a provar"
    },
    es: {
        category: "Categoría ES",
        name: "Nombre ES",
        description: "Descripción ES",
        menuTitle: "LA CARTA",
        allergenTitle: "ALÉRGENOS",
        footer: "BUENA GENTE · BUENA COMIDA · ¡SALUD!",
        error: "No se ha podido cargar la carta.",
        retry: "Reintentar"
    },
    fr: {
        category: "Catégorie FR",
        name: "Nom FR",
        description: "Description FR",
        menuTitle: "LA CARTE",
        allergenTitle: "ALLERGÈNES",
        footer: "BONNE COMPAGNIE · BONNE CUISINE · SANTÉ !",
        error: "Impossible de charger la carte.",
        retry: "Réessayer"
    },
    en: {
        category: "Category EN",
        name: "Name EN",
        description: "Description EN",
        menuTitle: "MENU",
        allergenTitle: "ALLERGENS",
        footer: "GOOD PEOPLE · GOOD FOOD · CHEERS!",
        error: "Unable to load the menu.",
        retry: "Try again"
    }
};

const ALLERGENS = {
    gluten: {
        file: "gluten.png",
        sheetName: "Gluten",
        aliases: ["gluten"],
        ca: "Gluten", es: "Gluten", fr: "Gluten", en: "Gluten"
    },
    crustaces: {
        file: "crustaces.png",
        sheetName: "Crustacés",
        aliases: ["crustaces", "crustacés", "crustace", "crustacé"],
        ca: "Crustacis", es: "Crustáceos", fr: "Crustacés", en: "Crustaceans"
    },
    oeufs: {
        file: "oeufs.png",
        sheetName: "Oeufs",
        aliases: ["oeufs", "œufs", "oeuf", "œuf", "huevos", "ous", "eggs"],
        ca: "Ous", es: "Huevos", fr: "Œufs", en: "Eggs"
    },
    poissons: {
        file: "poissons.png",
        sheetName: "Poissons",
        aliases: ["poisson", "poissons", "pescado", "peix", "fish"],
        ca: "Peix", es: "Pescado", fr: "Poissons", en: "Fish"
    },
    arachides: {
        file: "arachides.png",
        sheetName: "Arachides",
        aliases: ["arachide", "arachides", "cacahuete", "cacahuetes", "cacauet", "cacauets", "peanut", "peanuts"],
        ca: "Cacauets", es: "Cacahuetes", fr: "Arachides", en: "Peanuts"
    },
    soja: {
        file: "soja.png",
        sheetName: "Soja",
        aliases: ["soja", "soy"],
        ca: "Soja", es: "Soja", fr: "Soja", en: "Soy"
    },
    lait: {
        file: "lait.png",
        sheetName: "Lait",
        aliases: ["lait", "leche", "llet", "milk"],
        ca: "Llet", es: "Leche", fr: "Lait", en: "Milk"
    },
    fruitsacoque: {
        file: "fruits-a-coque.png",
        sheetName: "Fruits à coque",
        aliases: ["fruits a coque", "fruits à coque", "frutos secos", "fruits secs", "nuts"],
        ca: "Fruits secs", es: "Frutos de cáscara", fr: "Fruits à coque", en: "Nuts"
    },
    celeri: {
        file: "celeri.png",
        sheetName: "Céleri",
        aliases: ["celeri", "céleri", "apio", "api", "celery"],
        ca: "Api", es: "Apio", fr: "Céleri", en: "Celery"
    },
    moutarde: {
        file: "moutarde.png",
        sheetName: "Moutarde",
        aliases: ["moutarde", "mostaza", "mostassa", "mustard"],
        ca: "Mostassa", es: "Mostaza", fr: "Moutarde", en: "Mustard"
    },
    sesame: {
        file: "sesame.png",
        sheetName: "Sésame",
        aliases: ["sesame", "sésame", "sesamo", "sésamo"],
        ca: "Sèsam", es: "Sésamo", fr: "Sésame", en: "Sesame"
    },
    sulfites: {
        file: "sulfites.png",
        sheetName: "Sulfites",
        aliases: ["sulfites", "sulfitos", "sulphites"],
        ca: "Sulfits", es: "Sulfitos", fr: "Sulfites", en: "Sulphites"
    },
    lupin: {
        file: "lupin.png",
        sheetName: "Lupin",
        aliases: ["lupin", "altramuz", "altramuces", "tramussos"],
        ca: "Tramussos", es: "Altramuces", fr: "Lupin", en: "Lupin"
    },
    mollusques: {
        file: "mollusques.png",
        sheetName: "Mollusques",
        aliases: ["mollusque", "mollusques", "moluscos", "mol·luscs", "moluscs", "molluscs"],
        ca: "Mol·luscs", es: "Moluscos", fr: "Mollusques", en: "Molluscs"
    }
};

const PRICE_COLUMN = "Prix";
const ALLERGEN_COLUMN = "Allergènes";

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
const categoryNav = document.getElementById("category-nav");
const allergenLegend = document.getElementById("allergen-legend");
const allergenLegendTitle = document.getElementById("allergen-legend-title");
const allergenLegendContent = document.getElementById("allergen-legend-content");

document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => selectLanguage(button.dataset.language));
});

async function selectLanguage(language) {
    if (!LANGUAGES[language]) return;

    currentLanguage = language;

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

function renderMenu() {
    const language = LANGUAGES[currentLanguage];
    const categories = new Map();
    
    menuData.forEach(item => {
        const category = cleanText(item[language.category]);
        const name = cleanText(item[language.name]);
        const description = cleanText(item[language.description]);
        const price = cleanText(item[PRICE_COLUMN]);
        const allergens = parseAllergens(item[ALLERGEN_COLUMN]);

        if (!name || !category) return;
        if (!categories.has(category)) categories.set(category, []);

        categories.get(category).push({ name, description, price, allergens });
    });

    menuContent.innerHTML = "";
    categoryNav.innerHTML = "";

    categories.forEach((items, categoryName) => {
        const categoryId = createSlug(categoryName);

        const section = document.createElement("section");
        section.className = "menu-category";
        section.id = categoryId;

        const title = document.createElement("h2");
        title.className = "category-title";
        title.textContent = categoryName;
        section.appendChild(title);

        items.forEach(item => section.appendChild(createMenuItem(item)));
        menuContent.appendChild(section);

        const navButton = document.createElement("button");
        navButton.className = "category-button";
        navButton.textContent = categoryName;
        navButton.addEventListener("click", () => scrollToCategory(categoryId));
        categoryNav.appendChild(navButton);
    });

    categoryNav.classList.toggle("hidden", categories.size === 0);
    renderAllergenLegend();
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

    if (item.description) {
        const description = document.createElement("p");
        description.className = "item-description";
        description.textContent = item.description;
        article.appendChild(description);
    }

    if (item.allergens.length > 0) {
        const allergens = document.createElement("div");
        allergens.className = "item-allergens";

        item.allergens.forEach(key => {
            const allergen = ALLERGENS[key];
            const image = document.createElement("img");

            image.src = `assets/allergens/${allergen.file}`;
            image.alt = allergen[currentLanguage];
            image.title = allergen[currentLanguage];
            image.loading = "lazy";

            allergens.appendChild(image);
        });

        article.appendChild(allergens);
    }

    return article;
}

function parseAllergens(value) {
    const text = cleanText(value);
    if (!text) return [];

    const entries = text.split(/[,;]+/).map(entry => normalizeText(entry)).filter(Boolean);
    const matches = [];

    entries.forEach(entry => {
        Object.entries(ALLERGENS).forEach(([key, allergen]) => {
            const aliases = allergen.aliases.map(alias => normalizeText(alias));
            if (aliases.includes(entry) && !matches.includes(key)) matches.push(key);
        });
    });

    return matches;
}

function renderAllergenLegend() {
    allergenLegendContent.innerHTML = "";

    Object.values(ALLERGENS).forEach(allergen => {
        const item = document.createElement("div");
        item.className = "legend-item";

        const image = document.createElement("img");
        image.src = `assets/allergens/${allergen.file}`;
        image.alt = allergen.sheetName;

        const label = document.createElement("span");
        label.textContent = allergen.sheetName;

        item.appendChild(image);
        item.appendChild(label);
        allergenLegendContent.appendChild(item);
    });

    allergenLegend.classList.remove("hidden");
}

function scrollToCategory(categoryId) {
    const section = document.getElementById(categoryId);
    if (!section) return;

    const navigationHeight = document.querySelector(".sticky-navigation").offsetHeight;
    const top = section.getBoundingClientRect().top + window.scrollY - navigationHeight - 18;

    window.scrollTo({ top, behavior: "smooth" });
}

function updateLanguageInterface() {
    const language = LANGUAGES[currentLanguage];

    document.documentElement.lang = currentLanguage;
    menuTitle.textContent = language.menuTitle;
    footerMessage.textContent = language.footer;
    errorMessage.textContent = language.error;
    retryButton.textContent = language.retry;
    allergenLegendTitle.textContent = language.allergenTitle;

    document.querySelectorAll(".language-nav button").forEach(button => {
        button.classList.toggle("active", button.dataset.language === currentLanguage);
    });
}

function showLoading() {
    loadingElement.classList.remove("hidden");
    errorElement.classList.add("hidden");
    menuContent.classList.add("hidden");
    categoryNav.classList.add("hidden");
}

function hideLoading() {
    loadingElement.classList.add("hidden");
    errorElement.classList.add("hidden");
    menuContent.classList.remove("hidden");
}

function showError() {
    loadingElement.classList.add("hidden");
    menuContent.classList.add("hidden");
    categoryNav.classList.add("hidden");
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

function normalizeText(value) {
    return cleanText(value)
        .toLowerCase()
        .replace(/œ/g, "oe")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function createSlug(value) {
    return `category-${normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function init() {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get("lang");

    if (urlLanguage && LANGUAGES[urlLanguage]) selectLanguage(urlLanguage);
}

init();
