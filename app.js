const $=id=>document.getElementById(id);
const room=new URLSearchParams(location.search).get("room");
const storageKey=`amu-summon-room-${room||"1"}`;
const pick=list=>list[Math.floor(Math.random()*list.length)];
const cap=10;
let state={monsters:[],activeId:null};

function load(){try{state=JSON.parse(localStorage.getItem(storageKey))||state;if(!Array.isArray(state.monsters))state={monsters:[],activeId:null};}catch{}}
function save(){localStorage.setItem(storageKey,JSON.stringify(state));}
function show(id){["admin","main","warehouseView"].forEach(name=>$(name).classList.toggle("hidden",name!==id));}
function image(monster){return `進化モンスター/モンスター${monster.imageNumber}/${monster.stage}.png`;}
function active(){return state.monsters.find(monster=>monster.id===state.activeId)||state.monsters[0]||null;}
function createMonster(){return{id:crypto.randomUUID(),imageNumber:1+Math.floor(Math.random()*65),name:pick(GAME_DATA.names),stage:1,feeling:pick(GAME_DATA.feelings),stats:GAME_DATA.stats.slice().sort(()=>Math.random()-.5).slice(0,4).map(name=>({name,value:1+Math.floor(Math.random()*30)}))};}
function statHtml(monster){return `<div class="stats">${monster.stats.map(item=>`<div class="stat">${item.name}：${item.value}<div class="bar"><div class="fill" style="width:${item.value}%"></div></div></div>`).join("")}</div>`;}
function monsterHtml(monster){return `<img class="monster-img" src="${image(monster)}" alt="${monster.name}"><h2 class="name">${monster.name}</h2><div class="chips"><span>第${monster.stage}段階</span><span>画像No.${monster.imageNumber}</span></div><div class="mood">今の気持ち：${monster.feeling}</div>${statHtml(monster)}`;}
function renderMain(){show("main");$("collectionCount").textContent=`モンスター：${state.monsters.length} / ${cap}`;const monster=active();$("mainMonster").innerHTML=monster?monsterHtml(monster):'<p class="empty">まだモンスターがいません。<br>「召喚する」から仲間を呼ぼう。</p>';}
function renderWarehouse(){show("warehouseView");$("warehouseCount").textContent=`表示したいモンスターを選んでください（${state.monsters.length} / ${cap} 匹）`;if(!state.monsters.length){$("warehouseGrid").innerHTML='<p class="empty">倉庫は空です。</p>';return;}$("warehouseGrid").innerHTML=state.monsters.map(monster=>`<article class="monster-card ${monster.id===state.activeId?"selected":""}"><button data-select="${monster.id}"><img src="${image(monster)}" alt="${monster.name}"><div>${monster.name}</div><small>${monster.id===state.activeId?"表示中":"第"+monster.stage+"段階"}</small></button></article>`).join("");document.querySelectorAll("[data-select]").forEach(button=>button.addEventListener("click",()=>{state.activeId=button.dataset.select;save();renderMain();}));}
function summon(){if(state.monsters.length>=cap){alert("倉庫がいっぱいです。モンスター倉庫を確認してください。");return;}const monster=createMonster();state.monsters.push(monster);state.activeId=monster.id;save();renderMain();}
function setupRooms(){$("roomList").innerHTML=Array.from({length:10},(_,index)=>{const number=index+1;return `<div class="room-row"><a class="room-link" href="?room=${number}">${number}　空いている</a><button class="copy-url" data-copy-room="${number}">URL</button></div>`;}).join("");document.querySelectorAll("[data-copy-room]").forEach(button=>button.addEventListener("click",async()=>{const url=`${location.origin}${location.pathname}?room=${button.dataset.copyRoom}`;try{await navigator.clipboard.writeText(url);button.textContent="コピー";setTimeout(()=>button.textContent="URL",900);}catch{prompt("このURLをコピーしてください",url);}}));}
setupRooms();load();
$("openSummon").addEventListener("click",summon);
$("openWarehouse").addEventListener("click",renderWarehouse);
document.querySelectorAll("[data-back-main]").forEach(button=>button.addEventListener("click",renderMain));
if(room)renderMain();else show("admin");
