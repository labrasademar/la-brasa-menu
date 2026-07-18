/*
 * Identifiant du Google Sheet.
 *
 * Exemple d'URL :
 * https://docs.google.com/spreadsheets/d/1EXpuhoHzPCZkR1AadadSQAw1xLeKk9604A8zEXyUsYc/edit?usp=sharing
 *
 * L'identifiant est : 1ABCDEF123456
 */
const GOOGLE_SHEET_ID = "1EXpuhoHzPCZkR1AadadSQAw1xLeKk9604A8zEXyUsYc";
const GOOGLE_SHEET_NAME = "Carte";

function getGoogleSheetUrl() {
    const baseUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq`;
    const params = new URLSearchParams({
        tqx: "out:csv",
        sheet: GOOGLE_SHEET_NAME
    });

    return `${baseUrl}?${params.toString()}`;
}

async function fetchMenuData() {
    if (!GOOGLE_SHEET_ID || GOOGLE_SHEET_ID === "REMPLACE_MOI") {
        throw new Error("L'identifiant Google Sheets n'est pas configuré.");
    }

    const url = `${getGoogleSheetUrl()}&cache=${Date.now()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Impossible de récupérer Google Sheets.");
    }

    const csv = await response.text();
    return parseCSV(csv);
}

/*
 * Parser CSV léger.
 * Gère les virgules, guillemets et retours à la ligne dans les cellules.
 */
function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            cell += '"';
            i++;
            continue;
        }

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === "," && !insideQuotes) {
            row.push(cell.trim());
            cell = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") i++;

            row.push(cell.trim());
            cell = "";

            if (row.some(value => value !== "")) rows.push(row);
            row = [];

            continue;
        }

        cell += char;
    }

    if (cell.length > 0 || row.length > 0) {
        row.push(cell.trim());
        if (row.some(value => value !== "")) rows.push(row);
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(header => header.trim());

    return rows.slice(1).map(row => {
        const object = {};

        headers.forEach((header, index) => {
            object[header] = row[index] ? row[index].trim() : "";
        });

        return object;
    });
}