const $=id=>document.getElementById(id);
const room=new URLSearchParams(location.search).get("room");
const storageKey=`amu-summon-${room||"1"}`;
let data=null;
const pick=list=>list[Math.floor(Math.random()*list.length)];
const clamp=value=>Math.max(1,Math.min(100,value));

function newMonster(){return{monster:1+Math.floor(Math.random()*65),stage:1,level:1,name:pick(GAME_DATA.names),feeling:pick(GAME_DATA.feelings),stats:GAME_DATA.stats.slice().sort(()=>Math.random()-.5).slice(0,4).map(name=>({name,value:1+Math.floor(Math.random()*30)})),log:[]};}
function save(){localStorage.setItem(storageKey,JSON.stringify(data));}
function show(id){["admin","start","game"].forEach(name=>$(name).classList.toggle("hidden",name!==id));}
function backToAdmin(){location.href=location.pathname;}
function render(){
  show("game");
  $("playerName").textContent=data.breeder;
  $("monsterName").textContent=data.name;
  $("monster").src=`進化モンスター/モンスター${data.monster}/${data.stage}.png`;
  $("level").textContent=`レベル ${data.level}`;
  $("stage").textContent=`第${data.stage}段階`;
  $("feeling").textContent=`今の気持ち：${data.feeling}`;
  $("stats").innerHTML=data.stats.map(stat=>`<div class="stat"><div>${stat.name}：${stat.value}</div><div class="bar"><div class="fill" style="width:${stat.value}%"></div></div></div>`).join("");
  $("evolve").disabled=data.stage>=3;
  $("evolve").textContent=data.stage>=3?"最終進化済み":"進化させる";
  $("log").innerHTML=(data.log||[]).slice(-6).reverse().map(text=>`・${text}`).join("<br>")||"召喚されたばかりです。";
}
document.querySelectorAll(".copy-url").forEach(button=>button.addEventListener("click",async()=>{const url=`${location.origin}${location.pathname}?room=${button.dataset.room}`;try{await navigator.clipboard.writeText(url);button.textContent="コピー";setTimeout(()=>button.textContent="URL",900);}catch{prompt("このURLをコピーしてください",url);}}));
$("player").addEventListener("input",event=>$("summon").disabled=!event.target.value.trim());
$("summon").addEventListener("click",()=>{data=newMonster();data.breeder=$("player").value.trim();save();render();$("notice").textContent="召喚しました！";});
$("replace").addEventListener("click",()=>{const breeder=data.breeder;data=newMonster();data.breeder=breeder;save();render();$("notice").textContent="新しいモンスターを召喚しました！";});
$("evolve").addEventListener("click",()=>{if(data.stage>=3)return;data.stage++;data.level++;data.stats.forEach(stat=>stat.value=clamp(stat.value+5+Math.floor(Math.random()*16)));data.feeling=pick(GAME_DATA.feelings);data.log.push(`${data.name}が第${data.stage}段階へ進化しました。`);save();render();$("notice").textContent="進化しました！";});
$("backAdmin").addEventListener("click",backToAdmin);
$("gameAdmin").addEventListener("click",backToAdmin);
if(room){show("start");try{data=JSON.parse(localStorage.getItem(storageKey));if(data)render();}catch{}}else{show("admin");}
