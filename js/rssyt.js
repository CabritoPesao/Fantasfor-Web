const YT_RSS = "https://api.allorigins.win/raw?url=https://www.youtube.com/feeds/videos.xml?channel_id=UCUNx7vQ1iTmU_YIvCsApGPw";

fetch(YT_RSS)
  .then(r => r.text())
  .then(xmlStr => new DOMParser().parseFromString(xmlStr, "text/xml"))
  .then(xml => {
    const entries = [...xml.querySelectorAll("entry")];
    const cont = document.getElementById("rss-feed-youtube");

    cont.innerHTML = entries.slice(0, 2).map(e => {

      const title = e.querySelector("title")?.textContent || "Sin título";
      const link = e.querySelector("link")?.getAttribute("href") || "#";

      // MINIATURA CORRECTA
      const thumb = e.querySelector("media\\:thumbnail")?.getAttribute("url")
                  || e.querySelector("thumbnail")?.getAttribute("url")
                  || "";

      return `
        <div class="steam-card">
          ${thumb ? `<img class="steam-card-img" src="${thumb}" alt="">` : ""}
          <div class="steam-card-body">
            <h4><a href="${link}" target="_blank">${title}</a></h4>
          </div>
        </div>
      `;
    }).join("");
  })
  .catch(() => {
    document.getElementById("rss-feed-youtube").innerText =
      "No se pudieron cargar los videos.";
  });
