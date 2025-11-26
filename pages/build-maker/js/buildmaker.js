console.log("Build Maker cargado");

// CSV Paths
const CSV_PATH = "csv/db-armor.csv";
const ICON_CSV_PATH = "csv/items.csv";
const ATTR_CSV_PATH = "csv/attr_calculator.csv";

// DOM Elements
const attrTableBody = document.querySelector("#attrTable tbody");

// Data stores
let allItems = [];
let iconMap = {};
let attrStore = {};
let slotState = {}; // slotState["gloves"] = itemId

/* ============================
   SLOT BACKGROUNDS
   (imagenes para slots vacíos)
   ============================ */
const slotBackgrounds = {
    costume: "images/slot-costume.webp",
    pants: "images/slot-pants.webp",
    gloves: "images/slot-gloves.webp",
    shoes: "images/slot-shoes.webp",
    ring: "images/slot-ring.webp",
    necklare: "images/slot-necklare.webp",
    mask: "images/slot-mask.webp",
    meat: "images/slot-meat.webp",
    "staple-food": "images/slot-staple-food.webp",
    "fruits-vegetables": "images/slot-fruits-vegetables.webp",
    beverage: "images/slot-beverage.webp",
    recreational: "images/slot-recreational.webp",
    extra1: "images/slot-extra1.webp",
    extra2: "images/slot-extra2.webp"
};

/* ============================
   MODAL (selector de items)
   ============================ */
const slotModal = document.createElement("div");
slotModal.id = "slotModal";
Object.assign(slotModal.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000"
});
document.body.appendChild(slotModal);

const modalContent = document.createElement("div");
Object.assign(modalContent.style, {
    background: "rgba(28, 28, 28, 0.9)",
    padding: "16px",
    borderRadius: "12px",
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(5, 100px)",
    gap: "10px",
    width: "580px",
    maxWidth: "90%",
    maxHeight: "90%",
    position: "relative"
});
slotModal.appendChild(modalContent);

function openSlotModal(slotCategory, slotEl) {
    modalContent.innerHTML = "";
    const items = allItems.filter(i => i.slot === slotCategory);

    if (items.length === 0) {
        const msg = document.createElement("div");
        msg.textContent = "No hay items";
        msg.style.color = "#fff";
        msg.style.gridColumn = "1/-1";
        msg.style.textAlign = "center";
        modalContent.appendChild(msg);
    } else {
        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "item-entry";
            Object.assign(div.style, {
                width: "90px",
                height: "90px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                background: "rgba(4,4,4,0.55)",
                color: "#fff",
                fontSize: "0.75rem",
                textAlign: "center",
                padding: "4px",
                boxSizing: "border-box"
            });

            if (item.icon) {
                const img = document.createElement("img");
                img.src = `csv/${item.icon}`;
                img.style.width = "80%";
                img.style.height = "60%";
                img.style.objectFit = "contain";
                div.appendChild(img);
            }

            const label = document.createElement("div");
            label.textContent = item.name;
            label.style.marginTop = "4px";
            div.appendChild(label);

            div.addEventListener("click", () => {
                applyItemToSlot(item, slotEl);
                closeSlotModal();
            });

            modalContent.appendChild(div);
        });
    }

    // Close button (centered top)
    let closeX = slotModal.querySelector(".close-slot-modal");
    if (!closeX) {
        closeX = document.createElement("button");
        closeX.className = "close-slot-modal";
        closeX.textContent = "X";
        Object.assign(closeX.style, {
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ff5555",
            color: "#fff",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            border: "none"
        });
        closeX.addEventListener("click", closeSlotModal);
        slotModal.appendChild(closeX);
    }

    slotModal.style.display = "flex";
}

function closeSlotModal() {
    slotModal.style.display = "none";
}

/* ============================
   TOOLTIP
   ============================ */
const tooltip = document.createElement("div");
tooltip.className = "item-tooltip";
Object.assign(tooltip.style, {
    position: "absolute",
    pointerEvents: "none",
    display: "none",
    zIndex: "999",
    background: "rgba(0,0,0,0.85)",
    padding: "8px 12px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "0.85rem",
    maxWidth: "220px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
    lineHeight: "1.2rem"
});
document.body.appendChild(tooltip);

function showTooltipStructured(e, item) {
    tooltip.innerHTML = `
        <div style="font-weight:bold; margin-bottom:4px">${item.name}</div>
        ${item.icon ? `<div style="text-align:center; margin-bottom:6px"><img src="csv/${item.icon}" style="width:48px; height:48px; object-fit:contain"></div>` : ""}
        <div style="margin-bottom:6px">${item.description || ""}</div>
        <div style="font-size:0.85rem; display:flex; gap:8px; justify-content:space-between;">
            <span>ATQ: ${item.atq || 0}</span>
            <span>DEF: ${item.def || 0}</span>
            <span>PV: ${item.pv || 0}</span>
            <span>Crit: ${item.crit || 0}</span>
        </div>
    `;
    tooltip.style.display = "block";
    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
}

function hideTooltip() {
    tooltip.style.display = "none";
}

/* ============================
   SLOT INTERACTIONS
   ============================ */
function addSlotButtons() {
    document.querySelectorAll(".slot").forEach(slot => {
        // Ensure slotState key exists
        if (!(slot.dataset.item in slotState)) slotState[slot.dataset.item] = null;

        // Wrap slot to allow future positioning if needed (keeps DOM stable)
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.width = "fit-content";
        slot.parentNode.insertBefore(wrapper, slot);
        wrapper.appendChild(slot);

        // NOTE: icon_setting creation removed — no visual config icon injected.

        // Slot click: remove or open modal
        slot.addEventListener("click", e => {
            e.stopPropagation();
            const img = slot.querySelector("img");
            if (img) {
                const item = allItems.find(i => i.id === slotState[slot.dataset.item]);
                if (item) removeItemFromSlot(item, slot);
            } else {
                openSlotModal(slot.dataset.item, slot);
            }
        });

        // Hover tooltip for equipped
        slot.addEventListener("mouseenter", e => {
            const img = slot.querySelector("img");
            if (img) {
                const item = allItems.find(i => i.id === slotState[slot.dataset.item]);
                if (item) showTooltipStructured(e, item);
            }
        });
        slot.addEventListener("mouseleave", hideTooltip);
    });
}

/* ============================
   SLOT BACKGROUND UTIL
   ============================ */
function setSlotBackground(slot) {
    const type = slot.dataset.item;
    if (!slot.querySelector("img") && slotBackgrounds[type]) {
        slot.classList.add("empty");
        slot.style.setProperty('--slot-bg', `url('${slotBackgrounds[type]}')`);
    } else {
        slot.classList.remove("empty");
        slot.style.removeProperty('--slot-bg');
    }
}

function markEmptySlots() {
    document.querySelectorAll('.slot').forEach(slot => setSlotBackground(slot));
}

/* ============================
   APPLY / REMOVE ITEMS
   ============================ */
function applyItemToSlot(item, slotEl) {
    const slot = slotEl || document.querySelector(`.slot[data-item="${item.slot}"]`);
    if (!slot) return;

    const existingImg = slot.querySelector("img");
    if (existingImg) {
        const existingItem = allItems.find(i => i.id === slotState[item.slot]);
        if (existingItem) removeItemFromSlot(existingItem, slot);
    }

    if (item.icon) {
        const img = document.createElement("img");
        img.src = `csv/${item.icon}`;
        img.alt = item.name;
        Object.assign(img.style, { width: "100%", height: "100%", objectFit: "contain" });
        slot.appendChild(img);

        slot.classList.remove("empty");
        slotState[item.slot] = item.id;
        slot.style.backgroundImage = "";

        applyItemAttributes(item, item.slot);
    }
}

function removeItemFromSlot(item, slot) {
    if (!item || !slot) return;
    const img = slot.querySelector("img");
    if (img) img.remove();
    slot.classList.add("empty");
    slotState[slot.dataset.item] = null;
    setSlotBackground(slot);

    // Subtract item attributes from attrStore and recalc
    Object.entries(attrStore).forEach(([name, attr]) => {
        if (attr.itemValues && attr.itemValues[item.slot]) {
            attr.other -= attr.itemValues[item.slot] || 0;
            attr.itemValues[item.slot] = 0;
            recalcAttribute(name);
        }
    });
}

/* ============================
   ATRIBUTES & RECALC
   ============================ */
function applyItemAttributes(item, slotName) {
    if (!item) return;
    const mapping = [
        ["ATQ", Number(item.atq) || 0],
        ["DEF", Number(item.def) || 0],
        ["PV", Number(item.pv) || 0],
        ["Crit.", Number(item.crit) || 0]
    ];

    mapping.forEach(([attrName, val]) => {
        if (attrStore[attrName]) {
            if (!attrStore[attrName].itemValues) attrStore[attrName].itemValues = {};
            attrStore[attrName].itemValues[slotName] = val;
            attrStore[attrName].other += val;
            recalcAttribute(attrName);
        }
    });
}

function recalcAttribute(name) {
    const attr = attrStore[name];
    if (!attr) return;
    attr.total = (attr.base || 0) + (attr.other || 0);
    const tdTotal = attr.rowEl.querySelector(".calc-result");
    if (tdTotal) tdTotal.textContent = attr.total;
    const tdOther = attr.rowEl.querySelector(".calc-other");
    if (tdOther) tdOther.textContent = attr.other;
}

/* ============================
   CSV LOADING & PARSING
   ============================ */
async function loadIconsCSV() {
    try {
        const res = await fetch(ICON_CSV_PATH);
        const text = await res.text();
        const lines = text.split("\n").filter(l => l.trim() !== "");
        lines.shift(); // remove header
        lines.forEach(line => {
            const parts = line.split(",");
            // expected: name,id,icon
            const id = parts[1]?.trim();
            const icon = parts[2]?.trim();
            if (id) iconMap[id.toLowerCase()] = icon || "";
        });
    } catch (err) {
        console.warn("No se pudo cargar ICON_CSV:", err);
    }
}

function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    const lines = text.split("\n").filter(l => l.trim() !== "");
    const headers = lines.shift().split(",").map(h => h.trim());

    return lines.map(line => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h] = cols[i]?.trim() || "");
        obj.slot = obj.slot || "";
        obj.tags = obj.tags ? obj.tags.split(" ") : [];
        return obj;
    });
}

async function loadCSV() {
    try {
        await loadIconsCSV();

        const res = await fetch(CSV_PATH);
        const text = await res.text();

        allItems = parseCSV(text);
        allItems.forEach(item => {
            const idKey = (item.id || "").toLowerCase();
            item.icon = iconMap[idKey] || item.icon || "";
        });

        markEmptySlots();
        addSlotButtons();
        await loadAttributesTable();
    } catch (err) {
        console.error("Error cargando CSV:", err);
    }
}

/* ============================
   ATTRIBUTES TABLE (calculadora)
   ============================ */
async function loadAttributesTable() {
    try {
        const res = await fetch(ATTR_CSV_PATH);
        const text = await res.text();
        const rows = text.split("\n").filter(l => l.trim() !== "");
        rows.shift(); // remove header
        attrTableBody.innerHTML = "";

        rows.forEach(row => {
            const cols = row.split(",");
            const icon1 = cols[0] || "";
            const name = (cols[1] || "").trim();
            const baseValue = cols[2] || "0";
            const base = Number(baseValue.trim()) || 0;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><img src="csv/${icon1.trim()}" class="icon-cell" style="width:28px;height:28px;object-fit:contain"></td>
                <td class="attr-name">${name}</td>
                <td class="editable"><input type="number" value="${base}" style="width:80px;padding:4px"></td>
                <td class="calc-result">${base}</td>
                <td class="calc-other">0</td>
            `;
            attrTableBody.appendChild(tr);

            attrStore[name] = { base, other: 0, total: base, rowEl: tr, itemValues: {} };

            const input = tr.querySelector("input");
            input.addEventListener("input", () => {
                attrStore[name].base = Number(input.value) || 0;
                recalcAttribute(name);
            });
        });
    } catch (err) {
        console.error("Error cargando attr_calculator.csv:", err);
    }
}

/* ============================
   START
   ============================ */
loadCSV();
