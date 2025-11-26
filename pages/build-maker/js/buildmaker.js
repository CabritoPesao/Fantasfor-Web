console.log("Build Maker cargado");

const CSV_PATH = "csv/db-armor.csv";   // CSV original del build-maker
const ICON_CSV_PATH = "csv/items.csv"; // CSV con id y rutas de iconos

const itemListEl = document.getElementById("itemList");
const searchInput = document.getElementById("itemSearch");
const searchBtn = document.getElementById("searchBtn");
const filterBoxes = document.querySelectorAll(".filter-box input[type='checkbox']");
const filterCountEl = document.getElementById("filterCount");

let allItems = [];
let filteredItems = [];
let iconMap = {}; // id (lowercase) -> icon path

/* ============================
   CARGAR CSV DE ICONOS
=========================== */
async function loadIconsCSV() {
    const res = await fetch(ICON_CSV_PATH);
    const text = await res.text();
    const lines = text.split("\n").filter(l => l.trim() !== "");
    lines.shift(); // eliminar header

    lines.forEach(line => {
        const [name, id, icon] = line.split(",");
        iconMap[id.trim().toLowerCase()] = icon.trim();
    });
}

/* ============================
   CARGAR CSV PRINCIPAL
=========================== */
async function loadCSV() {
    try {
        await loadIconsCSV(); // primero cargamos iconos

        const res = await fetch(CSV_PATH);
        const text = await res.text();

        allItems = parseCSV(text);

        // Asignar iconos según id del CSV
        allItems.forEach(item => {
            const idKey = item.id.toLowerCase();
            item.icon = iconMap[idKey] || "";
        });

        filteredItems = [...allItems];
        renderItems(filteredItems);
        updateFilterCount();
        markEmptySlots(); // aplicar fondo de slots vacíos
    } catch (err) {
        console.error("Error cargando CSV:", err);
    }
}

/* ============================
   PARSER CSV
=========================== */
function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    const lines = text.split("\n").filter(l => l.trim() !== "");
    const headers = lines.shift().split(",");

    return lines.map(line => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = cols[i]?.trim() || "");
        obj.slot = obj.slot || "";
        obj.tags = obj.tags ? obj.tags.split(" ") : [];
        return obj;
    });
}

/* ============================
   RENDER LISTA DE ITEMS CON TOOLTIP ESTRUCTURADO
============================ */
function renderItems(items) {
    itemListEl.innerHTML = "";

    if (!items.length) {
        itemListEl.innerHTML = `<div class="item-entry">No hay resultados</div>`;
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-entry";
        div.dataset.slot = item.slot;
        div.dataset.tags = item.tags.join(",");

        div.innerHTML = `
            <div class="item-icon">
                ${item.icon ? `<img src="csv/${item.icon}" alt="">` : ""}
            </div>
            <div class="item-name">${item.name}</div>
        `;

        // CLICK
        div.addEventListener("click", () => onSelectItem(item));

        // HOVER: tooltip estructurado
        div.addEventListener("mouseenter", e => showTooltipStructured(e, item));
        div.addEventListener("mouseleave", hideTooltip);

        itemListEl.appendChild(div);
    });
}

/* ============================
   TOOLTIP ESTRUCTURADO
============================ */
const tooltip = document.createElement("div");
tooltip.className = "item-tooltip";
document.body.appendChild(tooltip);
tooltip.style.position = "absolute";
tooltip.style.pointerEvents = "none";
tooltip.style.display = "none";
tooltip.style.zIndex = "999";

function showTooltipStructured(e, item) {
    tooltip.innerHTML = `
        <div class="tooltip-name">${item.name}</div>
        <div class="tooltip-icon">${item.icon ? `<img src="csv/${item.icon}" alt="">` : ""}</div>
        <div class="tooltip-description">${item.description || ""}</div>
        <div class="tooltip-attributes">${item.attributes || ""}</div>
        <div class="tooltip-extra"></div>
    `;
    tooltip.style.display = "block";

    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
}

function hideTooltip() {
    tooltip.style.display = "none";
}


/* ============================
   FILTRO POR TEXTO
=========================== */
function applySearch() {
    const q = searchInput.value.toLowerCase();
    filteredItems = allItems.filter(item => item.name.toLowerCase().includes(q));
    applyFilters();
}

/* ============================
   FILTRO POR CHECKBOX
=========================== */
function applyFilters() {
    const activeFilters = [...filterBoxes].filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
    if (activeFilters.length > 0) {
        filteredItems = filteredItems.filter(item =>
            item.tags.some(t => activeFilters.includes(t.toLowerCase()))
        );
    }
    renderItems(filteredItems);
    updateFilterCount();
}

/* ============================
   CONTADOR DE ITEMS
=========================== */
function updateFilterCount() {
    filterCountEl.textContent = filteredItems.length;
}

/* ============================
   CLICK ITEM Y COLOCAR EN SLOT CON TOOLTIP
============================ */
function onSelectItem(item) {
    console.log("Item seleccionado:", item);

    // Buscar todos los slots que coinciden con item.slot
    const slotEls = Array.from(document.querySelectorAll(`.slot[data-item="${item.slot}"]`));
    if (!slotEls.length) return;

    // Seleccionar el primero vacío (sin img), si todos ocupados se toma el primero
    let slotEl = slotEls.find(s => !s.querySelector('img')) || slotEls[0];

    // Eliminar imagen anterior si existía
    const existingImg = slotEl.querySelector('img');
    if (existingImg) existingImg.remove();

    // Crear nueva imagen con icono según id
    if (item.icon) {
        const img = document.createElement("img");
        img.src = `csv/${item.icon}`;
        img.alt = item.name;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        slotEl.appendChild(img);

        // Hacer hover en slot muestre tooltip igual que en la lista
        slotEl.addEventListener("mouseenter", e => showTooltipStructured(e, item));
        slotEl.addEventListener("mouseleave", hideTooltip);
    }

    // Marcar slot como no vacío
    slotEl.classList.remove('empty');
}

/* ============================
   MARCAR SLOTS VACÍOS
=========================== */
function markEmptySlots() {
    document.querySelectorAll('.slot').forEach(slot => {
        if (!slot.querySelector('img')) {
            slot.classList.add('empty');
        } else {
            slot.classList.remove('empty');
        }
    });
}

/* ============================
   EVENTOS
=========================== */
searchBtn.addEventListener("click", applySearch);
searchInput.addEventListener("input", applySearch);
filterBoxes.forEach(cb => cb.addEventListener("change", applySearch));

/* ============================
   START
=========================== */
loadCSV();
