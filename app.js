const $=id=>document.getElementById(id);
const room=new URLSearchParams(location.search).get("room");
const storageKey=`amu-summon-room-${room||"1"}`;
const pick=list=>list[Math.floor(Math.random()*list.length)];
const cap=10;
let state={monsters:[]};
let selectedId=null;

function save(){localStorage.setItem(storageKey,JSON.stringify(state));}
function load(){try{state=JSON.parse(localStorage.getItem(storageKey))||{monsters:[]};if(!Array.isArray(state.monsters))state={monsters:[]};}catch{state={monsters:[]};}}
function show(id){["admin","main","summonView","warehouseView","detailView"].forEach(name=>$(name).classList.toggle("hidden",name!==id));}
function image(monster){return `進化モンスター/モンスター${monster.imageNumber}/${monster.stage}.png`;}
function createMonster(){return{id:crypto.randomUUID(),imageNumber:1+Math.floor(Math.random()*65),name:pick(GAME_DATA.names),stage:1,feeling:pick(GAME_DATA.feelings),stats:GAME_DATA.stats.slice().sort(()=>Math.random()-.5).slice(0,4).map(name=>({name,value:1+Math.floor(Math.random()*30)}))};}
function stats(monster){return `<div class="stats">${monster.stats.map(item=>`<div class="stat">${item.name}：${item.value}<div class="bar"><div class="fill" style="width:${item.value}%"></div></div></div>`).join("")}</div>`;}
function monsterInfo(monster){return `<img class="monster-img" src="${image(monster)}" alt="${monster.name}"><h2 class="name">${monster.name}</h2><div class="chips"><span>第${monster.stage}段階</span><span>画像No.${monster.imageNumber}</span></div><div class="mood">今の気持ち：${monster.feeling}</div>${stats(monster)}`;}
function renderMain(){show("main");$("collectionCount").textContent=`モンスター：${state.monsters.length} / ${cap}`;}
function renderWarehouse(){show("warehouseView");$("warehouseCount").textContent=`${state.monsters.length} / ${cap} 匹`;if(!state.monsters.length){$("warehouseGrid").innerHTML='<p class="empty">まだモンスターがいません。<br>召喚して仲間にしよう。</p>';return;}$("warehouseGrid").innerHTML=state.monsters.map(monster=>`<article class="monster-card"><button data-monster="${monster.id}"><img src="${image(monster)}" alt="${monster.name}"><div>${monster.name}</div><small>第${monster.stage}段階</small></button></article>`).join("");document.querySelectorAll("[data-monster]").forEach(button=>button.addEventListener("click",()=>{selectedId=button.dataset.monster;renderDetail();}));}
function renderDetail(){const monster=state.monsters.find(item=>item.id===selectedId);if(!monster){renderWarehouse();return;}show("detailView");$("detailContent").innerHTML=monsterInfo(monster);$("evolve").disabled=monster.stage>=3;$("evolve").textContent=monster.stage>=3?"最終進化済み":"進化させる";$("detailNotice").textContent="";}
function summon(){show("summonView");if(state.monsters.length>=cap){$("summonResult").innerHTML='<p class="empty">倉庫がいっぱいです。<br>お別れしてから召喚してください。</p>';return;}const monster=createMonster();state.monsters.push(monster);save();$("summonResult").innerHTML=monsterInfo(monster);$("summonNotice").textContent=`${monster.name}が仲間になりました！`;}
function setupRooms(){$("roomList").innerHTML=Array.from({length:10},(_,index)=>{const number=index+1;return `<div class="room-row"><a class="room-link" href="?room=${number}">${number}　空いている</a><button class="copy-url" data-copy-room="${number}">URL</button></div>`;}).join("");document.querySelectorAll("[data-copy-room]").forEach(button=>button.addEventListener("click",async()=>{const url=`${location.origin}${location.pathname}?room=${button.dataset.copyRoom}`;try{await navigator.clipboard.writeText(url);button.textContent="コピー";setTimeout(()=>button.textContent="URL",900);}catch{prompt("このURLをコピーしてください",url);}}));}

setupRooms();
load();
$("openSummon").addEventListener("click",summon);
$("openWarehouse").addEventListener("click",renderWarehouse);
document.querySelectorAll("[data-back-main]").forEach(button=>button.addEventListener("click",renderMain));
document.querySelectorAll("[data-back-admin]").forEach(button=>button.addEventListener("click",()=>location.href=location.pathname));
document.querySelectorAll("[data-back-warehouse]").forEach(button=>button.addEventListener("click",renderWarehouse));
$("evolve").addEventListener("click",()=>{const monster=state.monsters.find(item=>item.id===selectedId);if(!monster||monster.stage>=3)return;monster.stage++;monster.feeling=pick(GAME_DATA.feelings);monster.stats.forEach(item=>item.value=Math.min(100,item.value+8+Math.floor(Math.random()*13)));save();renderDetail();$("detailNotice").textContent=`${monster.name}は第${monster.stage}段階へ進化した！`;});
$("release").addEventListener("click",()=>{const monster=state.monsters.find(item=>item.id===selectedId);if(!monster)return;if(!confirm(`${monster.name}とお別れしますか？`))return;state.monsters=state.monsters.filter(item=>item.id!==selectedId);save();renderWarehouse();});
if(room)renderMain();else show("admin");
