const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORAGE_KEY = 'dompetqu_data_v1';
const categories = {
  income:['Gaji','Bonus','Bisnis','Hadiah','Investasi','Lainnya'],
  expense:['Makanan','Transportasi','Belanja','Tagihan','Pendidikan','Kesehatan','Hiburan','Rumah tangga','Lainnya']
};
const icons = {'Gaji':'↙','Bonus':'✦','Bisnis':'▣','Hadiah':'♧','Investasi':'◈','Makanan':'☕','Transportasi':'⌁','Belanja':'▤','Tagihan':'▧','Pendidikan':'✎','Kesehatan':'＋','Hiburan':'♫','Rumah tangga':'⌂','Lainnya':'•'};
const today = () => new Date().toISOString().slice(0,10);
const monthKey = d => (d||'').slice(0,7);
const id = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const prettyDate = d => d ? new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-';
const fresh = () => ({transactions:[],budgets:[],goals:[],profile:{name:''}});
let data;
try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || fresh(); } catch { data=fresh(); }
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));renderAll();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
function totals(list=data.transactions){return list.reduce((a,t)=>{a[t.type]+=Number(t.amount);return a;},{income:0,expense:0});}
function monthTransactions(){return data.transactions.filter(t=>monthKey(t.date)===monthKey(today()));}
function used(category){return monthTransactions().filter(t=>t.type==='expense'&&t.category===category).reduce((s,t)=>s+Number(t.amount),0);}
function setPage(name){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+name));$$('.nav-link[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));$('#pageTitle').textContent=({dashboard:'Ringkasan',transactions:'Catatan transaksi',budgets:'Anggaran',savings:'Tabungan',reports:'Laporan',settings:'Pengaturan'})[name]||'Ringkasan';$('#sidebar').classList.remove('open');}
function transactionHTML(t,compact=false){return `<tr><td><div class="transaction-name"><span class="transaction-icon">${icons[t.category]||'•'}</span><strong>${esc(t.name)}</strong></div></td>${compact?'':`<td>${esc(t.category)}</td>`}<td>${prettyDate(t.date)}</td>${compact?'':`<td><span class="type-chip ${t.type}">${t.type==='income'?'Pemasukan':'Pengeluaran'}</span></td>`}<td class="${t.type==='income'?'positive-text':'negative-text'}">${t.type==='income'?'+':'−'}${money(t.amount)}</td>${compact?'':`<td class="row-actions"><button data-edit="${t.id}" title="Edit">✎</button><button data-delete="${t.id}" title="Hapus">×</button></td>`}</tr>`;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderDashboard(){
 const all=totals(), mt=totals(monthTransactions()), saved=data.goals.reduce((s,g)=>s+Number(g.current),0);
 $('#totalBalance').textContent=money(all.income-all.expense);$('#totalIncome').textContent=money(mt.income);$('#totalExpense').textContent=money(mt.expense);$('#totalSaved').textContent=money(saved);
 const recent=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 $('#recentTransactions').innerHTML=recent.length?recent.map(t=>transactionHTML(t,true)).join(''):'<tr><td colspan="3" class="muted">Belum ada transaksi.</td></tr>';
 const budgets=data.budgets.slice(0,4);
 $('#budgetOverview').innerHTML=budgets.length?budgets.map(b=>{let u=used(b.category),p=Math.min(100,u/b.amount*100);return `<div><div class="budget-line-head"><b>${esc(b.category)}</b><span>${money(u)} / ${money(b.amount)}</span></div><div class="progress"><span class="${p>=100?'over':p>=80?'warn':''}" style="width:${p}%"></span></div></div>`}).join(''):'<p class="muted small">Belum ada anggaran yang dibuat.</p>';
 $('#goalOverview').innerHTML=data.goals.length?data.goals.slice(0,3).map(g=>{let p=Math.min(100,g.current/g.target*100);return `<div class="goal-mini"><div class="goal-mini-head"><b>${esc(g.name)}</b><span>${Math.round(p)}%</span></div><div class="progress"><span style="width:${p}%"></span></div></div>`}).join(''):'<p class="muted small">Buat target tabungan pertamamu.</p>';
 const days=Array.from({length:7},(_,i)=>{let d=new Date();d.setDate(d.getDate()-(6-i));let key=d.toISOString().slice(0,10);let ts=data.transactions.filter(t=>t.date===key);return {label:d.toLocaleDateString('id-ID',{weekday:'short'}),inc:ts.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),exp:ts.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)}});
 const max=Math.max(1,...days.flatMap(d=>[d.inc,d.exp]));$('#cashflowChart').innerHTML=days.map(d=>`<div class="chart-day"><div class="bars"><span class="bar" style="height:${Math.max(2,d.inc/max*100)}%"></span><span class="bar out" style="height:${Math.max(2,d.exp/max*100)}%"></span></div><small>${d.label}</small></div>`).join('');
}
function renderTransactions(){
 const q=$('#transactionSearch').value.toLowerCase(),type=$('#typeFilter').value,month=$('#monthFilter').value;
 const rows=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)).filter(t=>(type==='all'||t.type===type)&&(month==='all'||monthKey(t.date)===month)&&(`${t.name} ${t.category} ${t.note||''}`).toLowerCase().includes(q));
 $('#transactionRows').innerHTML=rows.map(t=>transactionHTML(t)).join('');$('#transactionEmpty').classList.toggle('hidden',rows.length>0);
 const months=[...new Set(data.transactions.map(t=>monthKey(t.date)))].sort().reverse();const sel=$('#monthFilter'),old=sel.value;sel.innerHTML='<option value="all">Semua tanggal</option>'+months.map(m=>`<option value="${m}">${new Date(m+'-02').toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</option>`).join('');sel.value=months.includes(old)?old:'all';
}
function renderBudgets(){
 const total=data.budgets.reduce((s,b)=>s+Number(b.amount),0),u=data.budgets.reduce((s,b)=>s+used(b.category),0);
 $('#budgetTotal').textContent=money(total);$('#budgetUsed').textContent=money(u);$('#budgetRemaining').textContent=money(total-u);
 $('#budgetCards').innerHTML=data.budgets.length?data.budgets.map(b=>{let x=used(b.category),p=x/b.amount*100;return `<article class="budget-card"><div class="budget-card-top"><span class="category-symbol">${icons[b.category]||'◈'}</span><button class="card-delete" data-budget-delete="${b.id}">×</button></div><h3>${esc(b.category)}</h3><div class="big-number">${money(b.amount)}</div><div class="subtext">Batas pengeluaran bulan ini</div><div class="progress"><span class="${p>=100?'over':p>=80?'warn':''}" style="width:${Math.min(100,p)}%"></span></div><div class="budget-line-head" style="margin-top:9px"><span>${money(x)} terpakai</span><b>${Math.round(p)}%</b></div>${p>=100?'<div class="budget-warning">Anggaran sudah terlampaui.</div>':''}</article>`}).join(''):'<div class="panel muted">Belum ada anggaran. Buat anggaran untuk mulai mengontrol pengeluaran.</div>';
}
function renderGoals(){
 const sum=data.goals.reduce((s,g)=>s+Number(g.current),0);$('#savingsTotal').textContent=money(sum);
 $('#goalCards').innerHTML=data.goals.length?data.goals.map(g=>{let p=Math.min(100,g.current/g.target*100);return `<article class="goal-card"><div class="goal-card-top"><span class="category-symbol">♧</span><button class="card-delete" data-goal-delete="${g.id}">×</button></div><h3>${esc(g.name)}</h3><div class="goal-amount"><span>${money(g.current)} terkumpul</span><b>${Math.round(p)}%</b></div><div class="progress"><span style="width:${p}%"></span></div><div class="goal-amount"><span>Target ${money(g.target)}</span><b>${money(Math.max(0,g.target-g.current))} lagi</b></div><div class="goal-date">${g.date?'Target: '+prettyDate(g.date):'Tidak ada tanggal target'}</div><div class="goal-actions"><button class="btn secondary" data-deposit="${g.id}">＋ Tambah dana</button><button class="btn secondary" data-goal-edit="${g.id}">Edit</button></div></article>`}).join(''):'<div class="panel muted">Belum ada target tabungan. Mulai dengan satu tujuan sederhana.</div>';
}
function renderReports(){
 const t=totals();$('#reportIncome').textContent=money(t.income);$('#reportExpense').textContent=money(t.expense);$('#reportNet').textContent=money(t.income-t.expense);
 const cats=categories.expense.map(c=>({c,v:data.transactions.filter(t=>t.type==='expense'&&t.category===c).reduce((s,t)=>s+t.amount,0)})).filter(x=>x.v).sort((a,b)=>b.v-a.v),max=Math.max(1,...cats.map(x=>x.v));
 $('#categoryReport').innerHTML=cats.length?cats.map(x=>`<div class="category-report-row"><span>${esc(x.c)}</span><div class="progress"><span style="width:${x.v/max*100}%"></span></div><strong>${money(x.v)}</strong></div>`).join(''):'<p class="muted small">Belum ada data pengeluaran.</p>';
}
function renderAll(){renderDashboard();renderTransactions();renderBudgets();renderGoals();renderReports();}
function openEntry(t=null){$('#entryForm').reset();$('#entryId').value=t?.id||'';$('#modalTitle').textContent=t?'Edit transaksi':'Tambah transaksi';$('#entryType').value=t?.type||'expense';populateEntryCategories();$('#entryName').value=t?.name||'';$('#entryAmount').value=t?.amount||'';$('#entryDate').value=t?.date||today();$('#entryNote').value=t?.note||'';$('#modalBackdrop').classList.remove('hidden');}
function populateEntryCategories(){let type=$('#entryType').value;$('#entryCategory').innerHTML=categories[type].map(c=>`<option>${c}</option>`).join('');}
function closeEntry(){$('#modalBackdrop').classList.add('hidden');}
function exportCsv(){const rows=[['Tanggal','Nama','Jenis','Kategori','Jumlah','Catatan'],...data.transactions.map(t=>[t.date,t.name,t.type,t.category,t.amount,t.note||''])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');download('\ufeff'+csv,'dompetqu-transaksi.csv','text/csv;charset=utf-8');}
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
$$('.nav-link[data-page]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.goto)));
$('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');
$('#datePill').textContent=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
$('#todayLabel').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
$('#quickAdd').onclick=$('#addTransaction').onclick=()=>openEntry();
$('#closeModal').onclick=$('#cancelModal').onclick=closeEntry;
$('#entryType').onchange=populateEntryCategories;
$('#entryForm').onsubmit=e=>{e.preventDefault();const item={id:$('#entryId').value||id(),type:$('#entryType').value,name:$('#entryName').value.trim(),amount:Number($('#entryAmount').value),category:$('#entryCategory').value,date:$('#entryDate').value,note:$('#entryNote').value.trim()};if(!item.name||item.amount<=0)return;const i=data.transactions.findIndex(t=>t.id===item.id);if(i>=0)data.transactions[i]=item;else data.transactions.push(item);save();closeEntry();toast('Transaksi berhasil disimpan.');};
$('#transactionSearch').oninput=renderTransactions;$('#typeFilter').onchange=renderTransactions;$('#monthFilter').onchange=renderTransactions;
$('#transactionRows').onclick=e=>{const del=e.target.closest('[data-delete]'),edit=e.target.closest('[data-edit]');if(del&&confirm('Hapus transaksi ini?')){data.transactions=data.transactions.filter(t=>t.id!==del.dataset.delete);save();toast('Transaksi dihapus.');}if(edit)openEntry(data.transactions.find(t=>t.id===edit.dataset.edit));};
$('#addBudget').onclick=()=>{$('#budgetCategory').innerHTML=categories.expense.map(c=>`<option>${c}</option>`).join('');$('#budgetBackdrop').classList.remove('hidden');};
$('#closeBudget').onclick=$('#cancelBudget').onclick=()=>$('#budgetBackdrop').classList.add('hidden');
$('#budgetForm').onsubmit=e=>{e.preventDefault();let category=$('#budgetCategory').value,amount=Number($('#budgetAmount').value);if(amount<=0)return;let old=data.budgets.find(b=>b.category===category);if(old)old.amount=amount;else data.budgets.push({id:id(),category,amount});save();$('#budgetBackdrop').classList.add('hidden');e.target.reset();toast('Anggaran berhasil disimpan.');};
$('#budgetCards').onclick=e=>{let b=e.target.closest('[data-budget-delete]');if(b&&confirm('Hapus anggaran ini?')){data.budgets=data.budgets.filter(x=>x.id!==b.dataset.budgetDelete);save();}};
$('#addGoal').onclick=()=>{$('#goalForm').reset();$('#goalBackdrop').classList.remove('hidden');};
$('#closeGoal').onclick=$('#cancelGoal').onclick=()=>$('#goalBackdrop').classList.add('hidden');
$('#goalForm').onsubmit=e=>{e.preventDefault();const target=Number($('#goalTarget').value),current=Number($('#goalCurrent').value);if(target<=0||current<0)return;data.goals.push({id:id(),name:$('#goalName').value.trim(),target,current:Math.min(current,target),date:$('#goalDate').value});save();$('#goalBackdrop').classList.add('hidden');toast('Target tabungan dibuat.');};
$('#goalCards').onclick=e=>{let del=e.target.closest('[data-goal-delete]'),dep=e.target.closest('[data-deposit]'),edit=e.target.closest('[data-goal-edit]');if(del&&confirm('Hapus target ini?')){data.goals=data.goals.filter(g=>g.id!==del.dataset.goalDelete);save();}if(dep){let g=data.goals.find(x=>x.id===dep.dataset.deposit),v=prompt('Berapa dana yang ingin ditambahkan? (Rp)');if(v!==null&&Number(v)>0){g.current=Math.min(g.target,g.current+Number(v));save();toast('Tabungan diperbarui.');}}if(edit){let g=data.goals.find(x=>x.id===edit.dataset.goalEdit),name=prompt('Nama target:',g.name),target=prompt('Target dana (Rp):',g.target);if(name&&Number(target)>0){g.name=name;g.target=Number(target);g.current=Math.min(g.current,g.target);save();}}};
$('#exportCsv').onclick=exportCsv;
$('#backupData').onclick=()=>download(JSON.stringify(data,null,2),'dompetqu-backup.json','application/json');
$('#restoreFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.transactions)||!Array.isArray(x.budgets)||!Array.isArray(x.goals))throw Error();if(confirm('Pulihkan cadangan dan ganti data saat ini?')){data=x;save();toast('Data berhasil dipulihkan.');}}catch{alert('File cadangan tidak valid.');}e.target.value='';};
$('#saveProfile').onclick=()=>{data.profile.name=$('#userName').value.trim();save();toast('Profil disimpan.');};
$('#resetData').onclick=()=>{if(confirm('Yakin ingin menghapus SEMUA data DompetQu di browser ini?')){data=fresh();save();$('#userName').value='';toast('Semua data telah dihapus.');}};
$('#userName').value=data.profile?.name||'';
renderAll();
if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));}
