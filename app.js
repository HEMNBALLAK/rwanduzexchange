const KEY="dollar_exchange_v1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"buys":[],"sells":[],"rates":[],"expenses":[]}');
const $=id=>document.getElementById(id);
const fmt=n=>Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2});
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(data)); render();}
function setupDates(){document.querySelectorAll('input[type="date"]').forEach(x=>{if(!x.value)x.value=today()});}
function rowsHTML(items,type){
 if(!items.length)return '<div class="empty">هیچ تۆمارێک نییە</div>';
 let h='<div class="tablewrap"><table><thead><tr>';
 if(type==="buy"||type==="sell") h+='<th>بەروار</th><th>کات</th><th>ناو</th><th>دۆلار</th><th>نرخ</th><th>کۆی دینار</th><th>شێواز</th><th></th>';
 else if(type==="rate") h+='<th>بەروار</th><th>کات</th><th>کڕین</th><th>فرۆشتن</th><th>تێبینی</th><th></th>';
 else h+='<th>بەروار</th><th>جۆر</th><th>بڕ</th><th>تێبینی</th><th></th>';
 h+='</tr></thead><tbody>';
 items.slice().reverse().forEach((x,i)=>{
   const idx=items.length-1-i;
   if(type==="buy"||type==="sell") h+=`<tr><td>${x.date}</td><td>${x.time||""}</td><td>${esc(x.person)}</td><td>${fmt(x.usd)}</td><td>${fmt(x.rate)}</td><td>${fmt(x.usd*x.rate)}</td><td>${esc(x.method)}</td><td><button class="delete" onclick="del('${type}',${idx})">سڕینەوە</button></td></tr>`;
   else if(type==="rate") h+=`<tr><td>${x.date}</td><td>${x.time||""}</td><td>${fmt(x.buy)}</td><td>${fmt(x.sell)}</td><td>${esc(x.note)}</td><td><button class="delete" onclick="del('rates',${idx})">سڕینەوە</button></td></tr>`;
   else h+=`<tr><td>${x.date}</td><td>${esc(x.type)}</td><td>${fmt(x.amount)}</td><td>${esc(x.note)}</td><td><button class="delete" onclick="del('expenses',${idx})">سڕینەوە</button></td></tr>`;
 });
 return h+'</tbody></table></div>';
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function del(type,i){if(!confirm("دڵنیایت لە سڕینەوە؟"))return; if(type==="buy")data.buys.splice(i,1); else if(type==="sell")data.sells.splice(i,1); else data[type].splice(i,1); save();}
function render(){
 const bu=data.buys.reduce((a,x)=>a+Number(x.usd||0),0), se=data.sells.reduce((a,x)=>a+Number(x.usd||0),0);
 const buyCost=data.buys.reduce((a,x)=>a+Number(x.usd||0)*Number(x.rate||0),0);
 const sellRev=data.sells.reduce((a,x)=>a+Number(x.usd||0)*Number(x.rate||0),0);
 const exp=data.expenses.reduce((a,x)=>a+Number(x.amount||0),0);
 $("dashBuyUSD").textContent=fmt(bu); $("dashSellUSD").textContent=fmt(se); $("dashBalanceUSD").textContent=fmt(bu-se);
 $("dashProfit").textContent=fmt(sellRev-buyCost); $("dashExpenses").textContent=fmt(exp); $("dashNet").textContent=fmt(sellRev-buyCost-exp);
 $("buyTable").innerHTML=rowsHTML(data.buys,"buy"); $("sellTable").innerHTML=rowsHTML(data.sells,"sell"); $("rateTable").innerHTML=rowsHTML(data.rates,"rate"); $("expenseTable").innerHTML=rowsHTML(data.expenses,"expenses");
 const r=data.rates[data.rates.length-1]; $("latestBuy").textContent=r?fmt(r.buy):"—"; $("latestSell").textContent=r?fmt(r.sell):"—";
 let recent=[...data.buys.map(x=>({...x,kind:"کڕین"})),...data.sells.map(x=>({...x,kind:"فرۆشتن"}))].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).slice(0,8);
 $("recent").innerHTML=recent.length?recent.map(x=>`<div class="item"><span>${x.kind} — ${fmt(x.usd)} USD</span><b>${fmt(x.usd*x.rate)} IQD</b></div>`).join(""):'<div class="empty">هیچ مامەڵەیەک نییە</div>';
}
function formObj(form){return Object.fromEntries(new FormData(form).entries())}
$("buyForm").addEventListener("submit",e=>{e.preventDefault();data.buys.push(formObj(e.target));e.target.reset();setupDates();save();});
$("sellForm").addEventListener("submit",e=>{e.preventDefault();data.sells.push(formObj(e.target));e.target.reset();setupDates();save();});
$("rateForm").addEventListener("submit",e=>{e.preventDefault();data.rates.push(formObj(e.target));e.target.reset();setupDates();save();});
$("expenseForm").addEventListener("submit",e=>{e.preventDefault();data.expenses.push(formObj(e.target));e.target.reset();setupDates();save();});
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$(btn.dataset.page).classList.add("active");}));
function exportData(){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="dollar-exchange-backup.json";a.click();URL.revokeObjectURL(a.href);
}
setupDates();render();