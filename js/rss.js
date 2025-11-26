const RSS_URL = "https://api.allorigins.win/raw?url=https://store.steampowered.com/feeds/news/app/2646460/?l=spanish";

fetch(RSS_URL)
  .then(r => r.text())
  .then(xmlStr => new DOMParser().parseFromString(xmlStr, "text/xml"))
  .then(xml => {
    let items = [...xml.querySelectorAll("item")];
    const cont = document.getElementById("rss-feed-container");

    cont.innerHTML = items.slice(0, 2).map(i => {
      const title = i.querySelector("title")?.textContent || "Sin título";
      const link = i.querySelector("link")?.textContent || "#";

      // --- DESCRIPCIÓN ---
      const rawDesc = i.querySelector("description")?.textContent || "";
      const temp = document.createElement("div");
      temp.innerHTML = rawDesc;

      // --- IMAGEN: primero enclosure, si no hay usa la del HTML ---
      const enclosure = i.querySelector("enclosure");
      const img = enclosure?.getAttribute("url") || temp.querySelector("img")?.src || null;

      // --- DESCRIPCIÓN RECORTADA ---
      let desc = temp.textContent.trim().replace(/\s+/g, " ");
      if (desc.length > 250) desc = desc.substring(0, 250) + "...";

      return `
        <div class="steam-card">
          ${img ? `<img class="steam-card-img" src="${img}" alt="">` : ""}
          <div class="steam-card-body">
            <h4><a href="${link}" target="_blank">${title}</a></h4>
            <p>${desc}</p>
          </div>
        </div>
      `;
    }).join("");
  })
  .catch(err => {
    document.getElementById("rss-feed-container").innerText =
      "No se pudieron cargar las noticias.";
    console.error("Error RSS:", err);
  });
