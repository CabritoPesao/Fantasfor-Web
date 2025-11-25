let csvHeaders=[]
let csvRows=[]

async function fetchFirst(paths){
  for(const p of paths){
    try{
      const res=await fetch(p)
      if(res.ok){ return await res.text() }
    }catch(e){}
  }
  throw new Error('csv_not_found')
}

async function loadCSV(){
  const raw=await fetchFirst(['con_id.csv','final_table_en.csv','../../final_table.csv','../final_table.csv','final_table.csv'])
  const text=raw.replace(/\r\n/g,'\n')
  const lines=text.split('\n').filter(l=>l.trim().length>0)
  const header=lines[0].replace(/^\ufeff/, '')
  csvHeaders=header.split(',').map(h=>h.trim())
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(',').map(c=>c.trim())
    if(cols.length===0) continue
    while(cols.length<csvHeaders.length) cols.push('')
    csvRows.push(cols)
  }
}

function buildTable(){
  const table=document.getElementById('foodsTable')
  const thead=document.createElement('thead')
  const trHead=document.createElement('tr')
  const idIdx=csvHeaders.findIndex(h=>h.toLowerCase()==='id')
  const nameIdx=csvHeaders.findIndex(h=>h.toLowerCase()==='name')
  ;['id','name',...csvHeaders.filter(h=>{
    const hl=h.toLowerCase();
    return hl!=='id' && hl!=='name'
  })].forEach(h=>{
    const th=document.createElement('th')
    th.textContent=h
    trHead.appendChild(th)
  })
  thead.appendChild(trHead)
  const tbody=document.createElement('tbody')
  for(const row of csvRows){
    const tr=document.createElement('tr')
    const id=(row[idIdx]||'').replace(/\.webp$/i,'')
    const tdId=document.createElement('td')
    const iconCell=document.createElement('div')
    iconCell.className='cell-icon'
    const img=document.createElement('img')
    img.alt=''
    img.src='iconos/'+id+'.webp'
    img.onerror=function(){
      if(img.src.includes('/iconos/')){img.src='../../icon_items/'+id+'.webp'}
      else if(!img.src.endsWith('_C.webp')){img.src='../../icon_items/'+id+'_C.webp'}
      else{img.style.display='none'}
    }
    iconCell.appendChild(img)
    tdId.appendChild(iconCell)
    tr.appendChild(tdId)
    const tdName=document.createElement('td')
    tdName.textContent=row[nameIdx]||''
    tr.appendChild(tdName)
    csvHeaders.forEach((h,i)=>{
      const hl=h.toLowerCase()
      if(hl==='id' || hl==='name') return
      const td=document.createElement('td')
      td.textContent=row[i]||''
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  }
  table.innerHTML=''
  table.appendChild(thead)
  table.appendChild(tbody)
}

(async function(){
  await loadCSV()
  buildTable()
})()
