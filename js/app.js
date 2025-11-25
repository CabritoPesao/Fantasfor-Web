const links=document.querySelectorAll('.menu a');
const frame=document.getElementById('contentFrame');
const header=document.querySelector('.topbar');
const pathMap={Home:'home',plantation:'plantation',talents:'talentos','armor-sets':'set-de-armadura',maps:'mapas',masks:'mascaras','build-maker':'build-maker','armor-sets-lacaios':'conju-armaduras',console:'console',status:'status',leather:'couros',confort:'conforto',foods:'comidas',stack:'stack',boss:'boss'};
function setActive(el){links.forEach(l=>l.classList.remove('active'));el.classList.add('active')}
function resizeFrame(){const h=header.offsetHeight;frame.style.height=`${window.innerHeight - h}px`;}
links.forEach(link=>{link.addEventListener('click',e=>{e.preventDefault();const page=link.getAttribute('data-page');const dir=pathMap[page]??page;frame.src=`pages/${dir}/index.html`;setActive(link)})});
window.addEventListener('resize',resizeFrame);
resizeFrame();
setActive(document.querySelector('.menu a[data-page="Home"]'))
