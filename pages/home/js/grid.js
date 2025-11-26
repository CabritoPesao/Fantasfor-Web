console.log("Menu grid JS cargado");

const menuItems = document.querySelectorAll(".menu-grid .menu-item");

menuItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault(); 
    const page = item.dataset.page.toLowerCase(); // opcional: lowercase para consistencia
    window.location.href = `pages/${page}/index.html`;
  });
});
