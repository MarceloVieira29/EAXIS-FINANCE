    const KEY = "PF_CLIENTES_V5";
    const KEY_THEME = "PF_THEME_V1";
    const KEY_PIN = "PF_PIN_V1";
    const KEY_LAST_BACKUP = "PF_LAST_BACKUP";
    const KEY_LAST_IMPORT = "PF_LAST_IMPORT";
    const KEY_LAYOUT_KPI_ORDER = "PF_LAYOUT_KPI_ORDER";
    const KEY_LAYOUT_PANEL_ORDER = "PF_LAYOUT_PANEL_ORDER";
    const KEY_LAYOUT_PANEL_SIZE = "PF_LAYOUT_PANEL_SIZE";
    const KEY_LAYOUT_SIDEBAR = "PF_LAYOUT_SIDEBAR";
    const KEY_LAYOUT_MODE = "PF_LAYOUT_MODE";

    const now = new Date();
    const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

    const el = {
      lockBadge: document.getElementById("lockBadge"),
      lockDot: document.getElementById("lockDot"),
      lockText: document.getElementById("lockText"),
      btnTheme: document.getElementById("btnTheme"),
      btnNewLaunch: document.getElementById("btnNewLaunch"),
      btnNewClient: document.getElementById("btnNewClient"),
      btnHistory: document.getElementById("btnHistory"),
      btnExportExcel: document.getElementById("btnExportExcel"),
      btnBackup: document.getElementById("btnBackup"),
      fileImport: document.getElementById("fileImport"),
      btnReset: document.getElementById("btnReset"),
      btnChangePin: document.getElementById("btnChangePin"),
      btnLock: document.getElementById("btnLock"),
      btnLayout: document.getElementById("btnLayout"),
      layoutBar: document.getElementById("layoutBar"),
      selCols: document.getElementById("selCols"),
      selSidebarPos: document.getElementById("selSidebarPos"),
      rngSidebar: document.getElementById("rngSidebar"),
      btnExitLayout: document.getElementById("btnExitLayout"),
      btnResetLayout: document.getElementById("btnResetLayout"),

      lastBackupText: document.getElementById("lastBackupText"),
      lastImportText: document.getElementById("lastImportText"),

      clientList: document.getElementById("clientList"),

      globalClient: document.getElementById("globalClient"),
      monthSelect: document.getElementById("monthSelect"),
      yearSelect: document.getElementById("yearSelect"),
      categorySelect: document.getElementById("categorySelect"),
      typeSelect: document.getElementById("typeSelect"),
      dateFrom: document.getElementById("dateFrom"),
      dateTo: document.getElementById("dateTo"),
      futureSelect: document.getElementById("futureSelect"),

      currentFilterLabel: document.getElementById("currentFilterLabel"),

      tabAnnual: document.getElementById("tabAnnual"),
      tabDashboard: document.getElementById("tabDashboard"),
      viewAnnual: document.getElementById("viewAnnual"),
      viewDashboard: document.getElementById("viewDashboard"),

      kpiReceitas: document.getElementById("kpiReceitas"),
      kpiDespesas: document.getElementById("kpiDespesas"),
      kpiSaldo: document.getElementById("kpiSaldo"),
      kpiFuturos: document.getElementById("kpiFuturos"),

      tbodyLaunches: document.getElementById("tbodyLaunches"),
      tbodyCategorySummary: document.getElementById("tbodyCategorySummary"),
      tbodyMonthSummary: document.getElementById("tbodyMonthSummary"),

      cardsRoot: document.getElementById("cardsRoot"),
      mainRoot: document.getElementById("mainRoot"),

      modalLaunch: document.getElementById("modalLaunch"),
      launchModalTitle: document.getElementById("launchModalTitle"),
      btnCloseLaunch: document.getElementById("btnCloseLaunch"),
      btnSaveLaunch: document.getElementById("btnSaveLaunch"),
      fDate: document.getElementById("fDate"),
      fClient: document.getElementById("fClient"),
      fType: document.getElementById("fType"),
      fCategory: document.getElementById("fCategory"),
      fDesc: document.getElementById("fDesc"),
      fValue: document.getElementById("fValue"),
      fObs: document.getElementById("fObs"),
      fFuturo: document.getElementById("fFuturo"),
      fVencimento: document.getElementById("fVencimento"),

      modalClient: document.getElementById("modalClient"),
      clientModalTitle: document.getElementById("clientModalTitle"),
      btnCloseClient: document.getElementById("btnCloseClient"),
      btnSaveClient: document.getElementById("btnSaveClient"),
      cName: document.getElementById("cName"),
      cDoc: document.getElementById("cDoc"),
      cContact: document.getElementById("cContact"),

      modalPin: document.getElementById("modalPin"),
      btnClosePin: document.getElementById("btnClosePin"),
      btnPinOk: document.getElementById("btnPinOk"),
      pinInput: document.getElementById("pinInput"),

      modalHistory: document.getElementById("modalHistory"),
      btnCloseHistory: document.getElementById("btnCloseHistory"),
      hFrom: document.getElementById("hFrom"),
      hTo: document.getElementById("hTo"),
      hAction: document.getElementById("hAction"),
      hClient: document.getElementById("hClient"),
      btnClearHistoryFilter: document.getElementById("btnClearHistoryFilter"),
      tbodyHistory: document.getElementById("tbodyHistory"),
      historyHint: document.getElementById("historyHint"),

      btnAutozirarFuturos: document.getElementById("btnAutozirarFuturos"),

      sidebar: document.getElementById("sidebar"),
      content: document.getElementById("content")
    };

    let db = null;
    let trendChart = null;
    let catChart = null;

    const state = {
      clientId:"ALL",
      month: now.getMonth()+1,
      year: now.getFullYear(),
      category:"ALL",
      type:"ALL",
      dateFrom:"",
      dateTo:"",
      futureMode:"INCLUIR",
      view:"annual",
      adminLocked:false,
      editingLaunchId:null,
      editingClientId:null,
      theme: (localStorage.getItem(KEY_THEME) || "dark"),
      mainCols:2,
      sidebarW:320,
      sidebarPos:"left",
      layoutMode:false
    };

    function ymd(d){
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,"0");
      const day = String(d.getDate()).padStart(2,"0");
      return `${y}-${m}-${day}`;
    }

    function fmtBRL(v){
      return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    }

    function round2(n){
      return Math.round((Number(n)||0)*100)/100;
    }

    function escapeHtml(str){
      return String(str||"").replace(/[&<>"']/g, c=>({
        "&":"&","<":"<",">":">","\"":"&quot;","'":"&#39;"
      })[c]);
    }

    function baseDB(){
      const cId = crypto.randomUUID();
      return {
        clients:[
          {id:cId, name:"Cliente Exemplo", doc:"", contact:""}
        ],
        launches:[],
        history:[]
      };
    }

    function loadDB(){
      try{
        const raw = localStorage.getItem(KEY);
        if(!raw) return baseDB();
        const obj = JSON.parse(raw);
        if(!Array.isArray(obj.clients) || !Array.isArray(obj.launches)) return baseDB();
        if(!obj.history) obj.history = [];
        obj.launches = obj.launches.map(l=>({
          ...l,
          futuro: l.futuro === true,
          vencimento: l.vencimento || ""
        }));
        return obj;
      }catch(e){
        console.error("Erro carregando DB", e);
        return baseDB();
      }
    }

    function saveDB(data){
      localStorage.setItem(KEY, JSON.stringify(data));
    }

    function getPin(){
      const p = localStorage.getItem(KEY_PIN);
      if(!p) return "1234";
      return p;
    }

    function setPin(p){
      localStorage.setItem(KEY_PIN, p);
    }

    function applyTheme(){
      document.body.setAttribute("data-theme", state.theme);
      el.btnTheme.textContent = state.theme === "light" ? "Fundo Escuro" : "Fundo Branco";
      localStorage.setItem(KEY_THEME, state.theme);
      if(trendChart) trendChart.update();
      if(catChart) catChart.update();
    }

    function applyLockUI(){
      if(state.adminLocked){
        el.lockText.textContent = "Admin: Bloqueado";
        el.lockDot.classList.add("locked");
      }else{
        el.lockText.textContent = "Admin: Desbloqueado";
        el.lockDot.classList.remove("locked");
      }
    }

    function refreshBackupImportUI(){
      const lb = Number(localStorage.getItem(KEY_LAST_BACKUP)||0);
      const li = Number(localStorage.getItem(KEY_LAST_IMPORT)||0);
      el.lastBackupText.textContent = lb ? ("Últ. Backup: " + new Date(lb).toLocaleString("pt-BR")) : "Últ. Backup: —";
      el.lastImportText.textContent = li ? ("Últ. Import: " + new Date(li).toLocaleString("pt-BR")) : "Últ. Import: —";
    }

    function clientName(id){
      const c = db.clients.find(x=>x.id===id);
      return c ? c.name : "(sem cliente)";
    }

    function refreshClientSelectors(){
      const sel = el.globalClient;
      sel.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "ALL";
      optAll.textContent = "Todos os clientes";
      sel.appendChild(optAll);

      for(const c of db.clients){
        const o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.name;
        sel.appendChild(o);
      }

      if(!db.clients.length){
        state.clientId = "ALL";
      }else if(state.clientId!=="ALL"){
        const exists = db.clients.some(c=>c.id===state.clientId);
        if(!exists) state.clientId = db.clients[0].id;
      }

      sel.value = state.clientId;

      el.fClient.innerHTML = "";
      for(const c of db.clients){
        const o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.name;
        el.fClient.appendChild(o);
      }
      if(db.clients.length){
        if(!state.clientId || state.clientId==="ALL") el.fClient.value = db.clients[0].id;
        else el.fClient.value = state.clientId;
      }

      el.hClient.innerHTML = "";
      const hcAll = document.createElement("option");
      hcAll.value = "ALL";
      hcAll.textContent = "Todos";
      el.hClient.appendChild(hcAll);
      db.clients.forEach(c=>{
        const o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.name;
        el.hClient.appendChild(o);
      });
      el.hClient.value = "ALL";

      const list = el.clientList;
      list.innerHTML = "";
      db.clients.forEach(c=>{
        const div = document.createElement("div");
        div.className = "client" + (state.clientId===c.id ? " active":"");
        div.dataset.id = c.id;

        const left = document.createElement("div");
        left.style.display = "flex";
        left.style.flexDirection = "column";
        left.style.gap = "2px";

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = c.name;
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = c.doc || c.contact || "Sem documento/contato";

        left.appendChild(name);
        left.appendChild(meta);

        const right = document.createElement("div");
        right.className = "clientBtns";

        const btnSel = document.createElement("button");
        btnSel.className = "pill";
        btnSel.textContent = "Selecionar";
        btnSel.onclick = ()=>{
          state.clientId = c.id;
          refreshClientSelectors();
          refreshCategoryFilter();
          render();
        };

        const btnEdit = document.createElement("button");
        btnEdit.className = "pill";
        btnEdit.textContent = "Editar";
        btnEdit.onclick = (ev)=>{
          ev.stopPropagation();
          openClient(c.id);
        };

        const btnDel = document.createElement("button");
        btnDel.className = "pill danger";
        btnDel.textContent = "Excluir";
        btnDel.onclick = (ev)=>{
          ev.stopPropagation();
          deleteClient(c.id);
        };

        right.appendChild(btnSel);
        right.appendChild(btnEdit);
        right.appendChild(btnDel);

        div.appendChild(left);
        div.appendChild(right);

        list.appendChild(div);
      });

      const btnAll = document.createElement("button");
      btnAll.className = "pill";
      btnAll.textContent = "Todos";
      btnAll.style.marginTop = "4px";
      btnAll.onclick = ()=>{
        state.clientId = "ALL";
        refreshClientSelectors();
        refreshCategoryFilter();
        render();
      };
      list.appendChild(btnAll);
    }

    function refreshMonthYearSelectors(){
      const minYear = 2020;
      const maxYear = now.getFullYear() + 1;

      el.yearSelect.innerHTML = "";
      for(let y=minYear; y<=maxYear; y++){
        const o = document.createElement("option");
        o.value = y;
        o.textContent = y;
        el.yearSelect.appendChild(o);
      }
      el.yearSelect.value = state.year;

      el.monthSelect.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "ALL";
      optAll.textContent = "Ano todo";
      el.monthSelect.appendChild(optAll);
      monthNames.forEach((name, idx)=>{
        const o = document.createElement("option");
        o.value = idx+1;
        o.textContent = `${idx+1} - ${name}`;
        el.monthSelect.appendChild(o);
      });
      el.monthSelect.value = state.month==="ALL" ? "ALL" : String(state.month);
    }

    function refreshCategoryFilter(){
      const set = new Set();
      db.launches.forEach(l=>{
        if(state.clientId!=="ALL" && l.clientId!==state.clientId) return;
        if(l.category) set.add(l.category);
      });

      const arr = Array.from(set).sort((a,b)=>a.localeCompare(b,"pt-BR"));

      el.categorySelect.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "ALL";
      optAll.textContent = "Todas";
      el.categorySelect.appendChild(optAll);

      arr.forEach(cat=>{
        const o = document.createElement("option");
        o.value = cat;
        o.textContent = cat;
        el.categorySelect.appendChild(o);
      });

      if(!arr.includes(state.category)) state.category = "ALL";
      el.categorySelect.value = state.category;

      const datalist = document.getElementById("categorySuggestions");
      datalist.innerHTML = "";
      arr.forEach(cat=>{
        const op = document.createElement("option");
        op.value = cat;
        datalist.appendChild(op);
      });
    }

    function sumByType(list){
      let inc=0, out=0;
      list.forEach(l=>{
        const v = Number(l.value||0);
        if(l.type==="Receita") inc+=v;
        if(l.type==="Despesa") out+=v;
      });
      return {inc:round2(inc), out:round2(out), net:round2(inc-out)};
    }

    function filterLaunches(){
      const {clientId, month, year, category, type, dateFrom, dateTo, futureMode} = state;

      return db.launches.filter(l=>{
        if(clientId!=="ALL" && l.clientId!==clientId) return false;

        const [y,m,d] = l.date.split("-").map(Number);
        if(year && y!==year) return false;
        if(month!=="ALL" && m!==month) return false;

        if(category!=="ALL" && (l.category||"")!==category) return false;
        if(type!=="ALL" && l.type!==type) return false;

        if(dateFrom && l.date < dateFrom) return false;
        if(dateTo && l.date > dateTo) return false;

        if(futureMode==="APENAS" && !l.futuro) return false;
        if(futureMode==="IGNORAR" && l.futuro) return false;

        return true;
      }).sort((a,b)=> a.date.localeCompare(b.date) || String(a.category||"").localeCompare(b.category||"") );
    }

    // Versão para KPIs e gráficos: sempre ignora futuros
    function filterLaunchesForKpi(){
      const base = filterLaunches();
      return base.filter(l=> !l.futuro);
    }

    function renderKpis(){
      const listReal = filterLaunchesForKpi();
      const listFiltro = filterLaunches();
      const sumsReal = sumByType(listReal);
      const futuros = listFiltro.filter(l=> l.futuro);
      const sumsFut = sumByType(futuros);

      el.kpiReceitas.textContent = fmtBRL(sumsReal.inc);
      el.kpiDespesas.textContent = fmtBRL(sumsReal.out);
      el.kpiSaldo.textContent = fmtBRL(sumsReal.net);
      el.kpiSaldo.style.color = sumsReal.net >= 0 ? "var(--good)" : "var(--bad)";
      el.kpiFuturos.textContent = fmtBRL(sumsFut.inc - sumsFut.out);

      const clientLabel = state.clientId==="ALL" ? "Todos os clientes" : clientName(state.clientId);
      const monthLabel = state.month==="ALL" ? "Ano todo" : monthNames[state.month-1];
      const catLabel = state.category==="ALL" ? "Todas categorias" : state.category;
      el.currentFilterLabel.textContent = `${clientLabel} — ${monthLabel}/${state.year} — ${catLabel}`;
    }

    function renderTable(){
      const list = filterLaunches();
      el.tbodyLaunches.innerHTML = "";

      for(const l of list){
        const tr = document.createElement("tr");

        const dataBase = l.date.split("-").reverse().join("/");
        let dataHtml = dataBase;
        if(l.futuro){
          const venc = l.vencimento ? l.vencimento.split("-").reverse().join("/") : "sem venc.";
          dataHtml += `<br><span class="muted" style="font-size:11px;">Futuro · vence em ${venc}</span>`;
        }

        const desc = l.desc || "";
        const obs = l.obs || "";
        const obsHtml = obs ? `<span class="obsIcon" title="${escapeHtml(obs)}">i</span>` : "";

        const badgeTipo = `<span class="tag ${l.type==="Receita"?"rec":"des"}">${l.type}</span>`;

        const valor = fmtBRL(Number(l.value||0));

        // Botões de ação
        let botoes = `
          <button class="btnTable" data-edit="${l.id}">Editar</button>
          <button class="btnTable danger" data-del="${l.id}">Excluir</button>
        `;
        if(l.futuro){
          botoes = `
            <button class="btnTable primary" data-auth="${l.id}">Autorizar</button>
            ${botoes}
          `;
        }

        tr.innerHTML = `
          <td>${dataHtml}</td>
          <td>${escapeHtml(clientName(l.clientId))}</td>
          <td>${badgeTipo}</td>
          <td>${escapeHtml(l.category||"")}</td>
          <td class="descCell">${escapeHtml(desc || "—")}${obsHtml}</td>
          <td class="num ${l.type==="Receita"?"rec":"des"}">${valor}</td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">${botoes}</td>
        `;

        el.tbodyLaunches.appendChild(tr);
      }

      // Delegação dos botões
      el.tbodyLaunches.querySelectorAll("button[data-edit]").forEach(btn=>{
        btn.onclick = ()=>{
          const id = btn.getAttribute("data-edit");
          openLaunch(id);
        };
      });
      el.tbodyLaunches.querySelectorAll("button[data-del]").forEach(btn=>{
        btn.onclick = ()=>{
          const id = btn.getAttribute("data-del");
          deleteLaunch(id);
        };
      });
      el.tbodyLaunches.querySelectorAll("button[data-auth]").forEach(btn=>{
        btn.onclick = ()=>{
          const id = btn.getAttribute("data-auth");
          authorizeSingleLaunch(id);
        };
      });
    }

    function groupByCategory(list){
      const map = new Map();
      list.forEach(l=>{
        const cat = l.category || "Sem categoria";
        const v = Number(l.value||0);
        map.set(cat, (map.get(cat)||0) + v);
      });
      const entries = Array.from(map.entries()).sort((a,b)=> b[1]-a[1]);
      return {
        labels: entries.map(e=>e[0]),
        values: entries.map(e=>round2(e[1]))
      };
    }

    function renderCategorySummary(){
      el.tbodyCategorySummary.innerHTML = "";
      const listReal = filterLaunchesForKpi();
      const map = new Map();

      listReal.forEach(l=>{
        const cat = l.category || "Sem categoria";
        if(!map.has(cat)) map.set(cat,{inc:0,out:0});
        const obj = map.get(cat);
        const v = Number(l.value||0);
        if(l.type==="Receita") obj.inc+=v;
        if(l.type==="Despesa") obj.out+=v;
      });

      const arr = Array.from(map.entries()).sort((a,b)=> (b[1].inc+b[1].out)-(a[1].inc+a[1].out));

      arr.forEach(([cat, vals])=>{
        const saldo = vals.inc - vals.out;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(cat)}</td>
          <td class="num">${fmtBRL(vals.inc)}</td>
          <td class="num">${fmtBRL(vals.out)}</td>
          <td class="num" style="color:${saldo>=0?"var(--good)":"var(--bad)"}">${fmtBRL(saldo)}</td>
        `;
        el.tbodyCategorySummary.appendChild(tr);
      });
    }

    function renderMonthSummary(){
      el.tbodyMonthSummary.innerHTML = "";
      const listReal = filterLaunchesForKpi();
      const map = new Map();

      listReal.forEach(l=>{
        const [y,m] = l.date.split("-").map(Number);
        const key = `${y}-${String(m).padStart(2,"0")}`;
        if(!map.has(key)) map.set(key,{inc:0,out:0});
        const obj = map.get(key);
        const v = Number(l.value||0);
        if(l.type==="Receita") obj.inc+=v;
        if(l.type==="Despesa") obj.out+=v;
      });

      const arr = Array.from(map.entries()).sort((a,b)=> a[0].localeCompare(b[0]));

      arr.forEach(([key, vals])=>{
        const [y,m] = key.split("-").map(Number);
        const saldo = vals.inc - vals.out;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${String(m).padStart(2,"0")}/${y}</td>
          <td class="num">${fmtBRL(vals.inc)}</td>
          <td class="num">${fmtBRL(vals.out)}</td>
          <td class="num" style="color:${saldo>=0?"var(--good)":"var(--bad)"}">${fmtBRL(saldo)}</td>
        `;
        el.tbodyMonthSummary.appendChild(tr);
      });
    }

    function initCharts(){
      const ctxTrend = document.getElementById("chartTrendDashboard").getContext("2d");
      const ctxCat = document.getElementById("chartCategory").getContext("2d");

      trendChart = new Chart(ctxTrend,{
        type:"line",
        data:{
          labels:[],
          datasets:[
            {
              label:"Receitas",
              borderColor:"#22c55e",
              backgroundColor:"rgba(34,197,94,.15)",
              data:[],
              tension:.25,
              fill:true
            },
            {
              label:"Despesas",
              borderColor:"#ef4444",
              backgroundColor:"rgba(239,68,68,.15)",
              data:[],
              tension:.25,
              fill:true
            }
          ]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          scales:{
            x:{ grid:{color:"rgba(148,163,184,.25)"} },
            y:{ grid:{color:"rgba(148,163,184,.25)"}, ticks:{ callback:v=>fmtBRL(v)} }
          },
          plugins:{
            legend:{ position:"top" },
            tooltip:{ callbacks:{ label:ctx=> `${ctx.dataset.label}: ${fmtBRL(ctx.parsed.y)}`} }
          }
        }
      });

      catChart = new Chart(ctxCat,{
        type:"doughnut",
        data:{
          labels:[],
          datasets:[{
            data:[],
            backgroundColor:[
              "#4f46e5","#22c55e","#f97316","#6366f1","#06b6d4",
              "#ec4899","#facc15","#10b981","#3b82f6","#ef4444"
            ]
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            tooltip:{callbacks:{ label:ctx=> `${ctx.label}: ${fmtBRL(ctx.parsed)}`}}
          },
          cutout:"55%"
        }
      });
    }

    function renderTrendChart(){
      if(!trendChart) return;
      const listReal = filterLaunchesForKpi();
      const map = new Map();

      listReal.forEach(l=>{
        const [y,m] = l.date.split("-").map(Number);
        const key = `${y}-${String(m).padStart(2,"0")}`;
        if(!map.has(key)) map.set(key,{inc:0,out:0});
        const obj = map.get(key);
        const v = Number(l.value||0);
        if(l.type==="Receita") obj.inc+=v;
        if(l.type==="Despesa") obj.out+=v;
      });

      const keys = Array.from(map.keys()).sort((a,b)=>a.localeCompare(b));
      const labels = keys.map(k=>{
        const [y,m] = k.split("-").map(Number);
        return `${monthNames[m-1]}/${String(y).slice(-2)}`;
      });
      const inc = keys.map(k=>round2(map.get(k).inc));
      const out = keys.map(k=>round2(map.get(k).out));

      trendChart.data.labels = labels;
      trendChart.data.datasets[0].data = inc;
      trendChart.data.datasets[1].data = out;
      trendChart.update();
    }


    function ajustarAlturaPainelDistribuicao(){
      syncDashboardCategoryHeight();
    }

    function renderCatChart(){
      if(!catChart) return;
      const listReal = filterLaunchesForKpi();
      const grouped = groupByCategory(listReal);

      catChart.data.labels = grouped.labels;
      catChart.data.datasets[0].data = grouped.values;
      catChart.update();

      const legendDiv = document.getElementById("catLegend");
      legendDiv.innerHTML = "";
      const total = grouped.values.reduce((a,b)=>a+b,0) || 1;

      grouped.labels.forEach((label, idx)=>{
        const v = grouped.values[idx];
        const pct = (v/total)*100;
        const row = document.createElement("div");
        row.className = "catLegendRow";

        const sw = document.createElement("div");
        sw.className = "swatch";
        sw.style.backgroundColor = catChart.data.datasets[0].backgroundColor[idx % catChart.data.datasets[0].backgroundColor.length];

        const name = document.createElement("div");
        name.className = "catName";
        name.textContent = label;

        const right = document.createElement("div");
        right.style.display = "flex";
        right.style.alignItems = "center";

        const val = document.createElement("div");
        val.className = "catVal";
        val.textContent = fmtBRL(v);

        const pctSpan = document.createElement("div");
        pctSpan.className = "catPct";
        pctSpan.textContent = `${pct.toFixed(1)}%`;

        right.appendChild(val);
        right.appendChild(pctSpan);

        row.appendChild(sw);
        row.appendChild(name);
        row.appendChild(right);

        legendDiv.appendChild(row);
      });

      requestAnimationFrame(ajustarAlturaPainelDistribuicao);
    }


    function syncDashboardCategoryHeight(){
      const dash = document.getElementById("viewDashboard");
      const grid = document.querySelector('#viewDashboard .dashboardGrid');
      const panel = document.querySelector('#viewDashboard .panel[data-panel="category-dashboard"]');
      const trendPanel = document.querySelector('#viewDashboard .panel[data-panel="trend-dashboard"]');
      const wrap = document.querySelector('#viewDashboard .panel[data-panel="category-dashboard"] .catWrap');
      const legend = document.getElementById("catLegend");
      const content = document.getElementById("content");
      if(!dash || !grid || !panel || !wrap || !legend) return;

      // Remove qualquer altura fixa antiga do layout salvo e prepara a medição real.
      panel.style.setProperty("height", "auto", "important");
      panel.style.setProperty("max-height", "none", "important");
      panel.style.setProperty("overflow", "visible", "important");
      wrap.style.setProperty("height", "auto", "important");
      wrap.style.setProperty("max-height", "none", "important");
      wrap.style.setProperty("overflow", "visible", "important");
      legend.style.setProperty("height", "auto", "important");
      legend.style.setProperty("max-height", "none", "important");
      legend.style.setProperty("overflow", "visible", "important");

      // Dois frames: o Chart.js e a legenda precisam terminar de redesenhar antes da medida.
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          const panelTop = panel.getBoundingClientRect().top;
          const lastLegendRow = legend.lastElementChild;
          const legendBottom = lastLegendRow
            ? lastLegendRow.getBoundingClientRect().bottom
            : legend.getBoundingClientRect().bottom;

          const neededPanelHeight = Math.ceil(Math.max(360, legendBottom - panelTop + 28));

          // Aqui é o pulo do gato: altura real com prioridade máxima.
          // Assim o card branco da distribuição desce junto com TODAS as categorias.
          panel.style.setProperty("height", neededPanelHeight + "px", "important");
          panel.style.setProperty("min-height", neededPanelHeight + "px", "important");
          panel.style.setProperty("max-height", "none", "important");
          panel.style.setProperty("overflow", "visible", "important");

          const trendHeight = trendPanel ? trendPanel.getBoundingClientRect().height : 360;
          const gridHeight = Math.ceil(Math.max(neededPanelHeight, trendHeight));
          grid.style.setProperty("min-height", gridHeight + "px", "important");
          dash.style.setProperty("min-height", gridHeight + 24 + "px", "important");

          if(content){
            const contentTop = content.getBoundingClientRect().top;
            const dashBottom = dash.getBoundingClientRect().bottom;
            const neededContentHeight = Math.ceil(dashBottom - contentTop + 42);
            content.style.setProperty("min-height", neededContentHeight + "px", "important");
          }
        });
      });
    }

    function applyView(){
      if(state.view==="annual"){
        el.viewAnnual.classList.add("active");
        el.viewDashboard.classList.remove("active");
        el.tabAnnual.classList.add("active");
        el.tabDashboard.classList.remove("active");
      }else{
        el.viewAnnual.classList.remove("active");
        el.viewDashboard.classList.add("active");
        el.tabAnnual.classList.remove("active");
        el.tabDashboard.classList.add("active");
      }
    }

    function render(){
      renderKpis();
      renderTable();
      renderCategorySummary();
      renderMonthSummary();
      renderTrendChart();
      renderCatChart();
    }


    function exportExcel(){
      try{
        if(typeof XLSX === "undefined"){
          alert("Biblioteca Excel ainda não carregou. Aguarde alguns segundos e tente novamente.");
          return;
        }

        const visibleLaunches = filterLaunches();
        const realLaunches = filterLaunchesForKpi();
        const clientLabel = state.clientId === "ALL" ? "TODOS" : clientName(state.clientId);
        const monthLabel = state.month === "ALL" ? "Ano todo" : monthNames[state.month-1];
        const generatedAt = new Date().toLocaleString("pt-BR");

        const receitas = visibleLaunches.filter(l=>l.type === "Receita");
        const despesas = visibleLaunches.filter(l=>l.type === "Despesa");
        const totalReceitas = round2(realLaunches.filter(l=>l.type === "Receita").reduce((a,l)=>a+Number(l.value||0),0));
        const totalDespesas = round2(realLaunches.filter(l=>l.type === "Despesa").reduce((a,l)=>a+Number(l.value||0),0));
        const saldoFinal = round2(totalReceitas - totalDespesas);

        const wb = XLSX.utils.book_new();

        const COLORS = {
          navy:"1F4E78",
          navy2:"17365D",
          blue:"4472C4",
          lightBlue:"D9EAF7",
          green:"C6EFCE",
          greenText:"006100",
          red:"F4CCCC",
          redText:"9C0006",
          orange:"FCE4D6",
          yellow:"FFF2CC",
          white:"FFFFFF",
          dark:"0B1220",
          gray:"EAF0F7",
          line:"B7C9DE",
          soft:"F7FAFF"
        };

        const borderThin = {
          top:{style:"thin", color:{rgb:COLORS.line}},
          bottom:{style:"thin", color:{rgb:COLORS.line}},
          left:{style:"thin", color:{rgb:COLORS.line}},
          right:{style:"thin", color:{rgb:COLORS.line}}
        };
        const titleStyle = {font:{bold:true, sz:18, color:{rgb:COLORS.white}}, fill:{fgColor:{rgb:COLORS.navy}}, alignment:{horizontal:"left", vertical:"center"}, border:borderThin};
        const subTitleStyle = {font:{bold:true, sz:11, color:{rgb:COLORS.white}}, fill:{fgColor:{rgb:COLORS.navy2}}, alignment:{horizontal:"left", vertical:"center"}, border:borderThin};
        const headStyle = {font:{bold:true, color:{rgb:COLORS.white}}, fill:{fgColor:{rgb:COLORS.dark}}, alignment:{horizontal:"center", vertical:"center"}, border:borderThin};
        const sectionStyle = {font:{bold:true, color:{rgb:COLORS.white}}, fill:{fgColor:{rgb:COLORS.navy}}, alignment:{horizontal:"center", vertical:"center"}, border:borderThin};
        const labelStyle = {font:{bold:true, color:{rgb:COLORS.dark}}, fill:{fgColor:{rgb:COLORS.gray}}, border:borderThin};
        const valueStyle = {font:{bold:true, color:{rgb:COLORS.dark}}, alignment:{horizontal:"right"}, border:borderThin, numFmt:'R$ #,##0.00'};
        const moneyStyle = {alignment:{horizontal:"right"}, border:borderThin, numFmt:'R$ #,##0.00'};
        const dateStyle = {alignment:{horizontal:"center"}, border:borderThin};
        const bodyStyle = {border:borderThin, alignment:{vertical:"top"}};
        const goodStyle = {font:{bold:true, color:{rgb:COLORS.greenText}}, fill:{fgColor:{rgb:COLORS.green}}, alignment:{horizontal:"right"}, border:borderThin, numFmt:'R$ #,##0.00'};
        const badStyle = {font:{bold:true, color:{rgb:COLORS.redText}}, fill:{fgColor:{rgb:COLORS.red}}, alignment:{horizontal:"right"}, border:borderThin, numFmt:'R$ #,##0.00'};

        function setCell(ws, addr, value, style){
          ws[addr] = {v:value, t: typeof value === "number" ? "n" : "s"};
          if(style) ws[addr].s = style;
        }
        function styleRange(ws, range, style){
          const r = XLSX.utils.decode_range(range);
          for(let R=r.s.r; R<=r.e.r; ++R){
            for(let C=r.s.c; C<=r.e.c; ++C){
              const addr = XLSX.utils.encode_cell({r:R,c:C});
              if(!ws[addr]) ws[addr] = {v:"", t:"s"};
              ws[addr].s = {...(ws[addr].s||{}), ...style};
            }
          }
        }
        function merge(ws, range){
          ws["!merges"] = ws["!merges"] || [];
          ws["!merges"].push(XLSX.utils.decode_range(range));
        }
        function autoFilter(ws, ref){ ws["!autofilter"] = {ref}; }
        function safeSheetName(name){ return String(name).replace(/[\\/?*\[\]:]/g," ").slice(0,31) || "Planilha"; }
        function brDate(iso){ return iso ? String(iso).split("-").reverse().join("/") : ""; }

        // ===================== ABA PRINCIPAL =====================
        const ws = XLSX.utils.aoa_to_sheet([]);
        ws["!cols"] = [
          {wch:12},{wch:20},{wch:30},{wch:24},{wch:14},
          {wch:3},
          {wch:12},{wch:22},{wch:30},{wch:24},{wch:14},
          {wch:3},
          {wch:14},{wch:14},{wch:14}
        ];
        ws["!rows"] = [{hpt:26},{hpt:18},{hpt:18},{hpt:22},{hpt:8},{hpt:22}];

        merge(ws,"A1:O1"); setCell(ws,"A1",`Relatório Financeiro — ${clientLabel}`, titleStyle);
        merge(ws,"A2:L2"); setCell(ws,"A2",`Filtro: ${monthLabel}/${state.year} — Categoria: ${state.category === "ALL" ? "Todas" : state.category} — Tipo: ${state.type === "ALL" ? "Todos" : state.type}`, subTitleStyle);
        merge(ws,"M2:O2"); setCell(ws,"M2",`Gerado em: ${generatedAt}`, subTitleStyle);

        setCell(ws,"A4","Receitas", labelStyle); merge(ws,"B4:E4"); setCell(ws,"B4",totalReceitas, goodStyle);
        setCell(ws,"G4","Despesas", labelStyle); merge(ws,"H4:K4"); setCell(ws,"H4",totalDespesas, badStyle);
        setCell(ws,"M4","Saldo", labelStyle); merge(ws,"N4:O4"); setCell(ws,"N4",saldoFinal, saldoFinal >= 0 ? goodStyle : badStyle);

        merge(ws,"A6:E6"); setCell(ws,"A6","RECEITAS", sectionStyle);
        merge(ws,"G6:K6"); setCell(ws,"G6","DESPESAS", sectionStyle);
        const headers = ["Data","Categoria","Descrição","Obs.","Valor (R$)"];
        headers.forEach((h,i)=>setCell(ws,XLSX.utils.encode_cell({r:6,c:i}),h,headStyle));
        headers.forEach((h,i)=>setCell(ws,XLSX.utils.encode_cell({r:6,c:i+6}),h,headStyle));

        const maxRows = Math.max(receitas.length, despesas.length, 1);
        for(let i=0;i<maxRows;i++){
          const r = 7+i;
          const rec = receitas[i];
          const des = despesas[i];
          if(rec){
            [brDate(rec.date), rec.category||"", rec.desc||"", rec.obs||"", Number(rec.value||0)].forEach((v,c)=>setCell(ws,XLSX.utils.encode_cell({r,c}),v,c===4?moneyStyle:(c===0?dateStyle:bodyStyle)));
          }else{
            for(let c=0;c<5;c++) setCell(ws,XLSX.utils.encode_cell({r,c}),"",bodyStyle);
          }
          if(des){
            [brDate(des.date), des.category||"", des.desc||"", des.obs||"", Number(des.value||0)].forEach((v,c)=>setCell(ws,XLSX.utils.encode_cell({r,c:c+6}),v,c===4?moneyStyle:(c===0?dateStyle:bodyStyle)));
          }else{
            for(let c=6;c<11;c++) setCell(ws,XLSX.utils.encode_cell({r,c}),"",bodyStyle);
          }
        }
        const totalRow = 8 + maxRows;
        merge(ws,`D${totalRow}:D${totalRow}`); setCell(ws,`D${totalRow}`,"TOTAL", headStyle); setCell(ws,`E${totalRow}`,totalReceitas, goodStyle);
        setCell(ws,`J${totalRow}`,"TOTAL", headStyle); setCell(ws,`K${totalRow}`,totalDespesas, badStyle);
        ws["!ref"] = `A1:O${totalRow+2}`;
        autoFilter(ws,`A7:K${7+maxRows}`);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName(clientLabel));

        // ===================== DASHBOARD =====================
        const dash = XLSX.utils.aoa_to_sheet([]);
        dash["!cols"] = [
          {wch:11},{wch:14},{wch:14},{wch:14},{wch:14},{wch:4},
          {wch:26},{wch:15},{wch:4},{wch:26},{wch:15}
        ];
        merge(dash,"A1:K1"); setCell(dash,"A1","DASHBOARD FINANCEIRO", titleStyle);
        setCell(dash,"A3","ANO", labelStyle); setCell(dash,"B3",state.year, bodyStyle);
        setCell(dash,"A4","CLIENTE", labelStyle); merge(dash,"B4:D4"); setCell(dash,"B4",clientLabel, bodyStyle);

        ["MÊS","ENTRADAS","SAÍDAS","SALDO","ACUMULADO"].forEach((h,i)=>setCell(dash,XLSX.utils.encode_cell({r:5,c:i}),h,headStyle));
        let acumulado = 0;
        for(let m=1;m<=12;m++){
          const inc = round2(realLaunches.filter(l=>Number(l.date.split("-")[1])===m && l.type==="Receita").reduce((a,l)=>a+Number(l.value||0),0));
          const out = round2(realLaunches.filter(l=>Number(l.date.split("-")[1])===m && l.type==="Despesa").reduce((a,l)=>a+Number(l.value||0),0));
          const saldo = round2(inc-out);
          acumulado = round2(acumulado+saldo);
          const rr = 6+(m-1);
          [m,inc,out,saldo,acumulado].forEach((v,c)=>setCell(dash,XLSX.utils.encode_cell({r:rr,c}),v,c===0?dateStyle:moneyStyle));
        }
        setCell(dash,"A19","TOTAL", headStyle);
        setCell(dash,"B19",totalReceitas, goodStyle);
        setCell(dash,"C19",totalDespesas, badStyle);
        setCell(dash,"D19",saldoFinal, saldoFinal >=0 ? goodStyle : badStyle);
        setCell(dash,"E19",saldoFinal, saldoFinal >=0 ? goodStyle : badStyle);

        const catDash = new Map();
        realLaunches.forEach(l=>{
          const cat = l.category || "Sem categoria";
          if(!catDash.has(cat)) catDash.set(cat,{receitas:0, despesas:0});
          const o = catDash.get(cat);
          const v = Number(l.value||0);
          if(l.type === "Receita") o.receitas += v;
          if(l.type === "Despesa") o.despesas += v;
        });
        const topDespesas = Array.from(catDash.entries()).map(([cat,o])=>({cat,total:round2(o.despesas)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);
        const topReceitas = Array.from(catDash.entries()).map(([cat,o])=>({cat,total:round2(o.receitas)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);

        merge(dash,"G6:H6"); setCell(dash,"G6","TOP DESPESAS (Categoria)", sectionStyle);
        setCell(dash,"G7","Categoria", {...headStyle, fill:{fgColor:{rgb:COLORS.red}}}); setCell(dash,"H7","Total", {...headStyle, fill:{fgColor:{rgb:COLORS.red}}});
        topDespesas.forEach((x,i)=>{ const r=7+i+1; setCell(dash,XLSX.utils.encode_cell({r,c:6}),x.cat,bodyStyle); setCell(dash,XLSX.utils.encode_cell({r,c:7}),x.total,moneyStyle); });

        const recStart = Math.max(34, 9 + topDespesas.length);
        merge(dash,`G${recStart}:H${recStart}`); setCell(dash,`G${recStart}`,"TOP RECEITAS (Categoria)", sectionStyle);
        setCell(dash,`G${recStart+1}`,"Categoria", {...headStyle, fill:{fgColor:{rgb:"00B050"}}}); setCell(dash,`H${recStart+1}`,"Total", {...headStyle, fill:{fgColor:{rgb:"00B050"}}});
        topReceitas.forEach((x,i)=>{ const r=recStart+i+1; setCell(dash,XLSX.utils.encode_cell({r,c:6}),x.cat,bodyStyle); setCell(dash,XLSX.utils.encode_cell({r,c:7}),x.total,moneyStyle); });

        dash["!ref"] = `A1:K${Math.max(recStart + topReceitas.length + 3, 42)}`;
        XLSX.utils.book_append_sheet(wb, dash, "DASHBOARD");

        // ===================== LANÇAMENTOS COMPLETOS =====================
        const launchesRows = visibleLaunches.map(l=>({
          "Data": brDate(l.date),
          "Cliente": clientName(l.clientId),
          "Tipo": l.type || "",
          "Categoria": l.category || "",
          "Descrição": l.desc || "",
          "Valor": Number(l.value || 0),
          "Futuro": l.futuro ? "Sim" : "Não",
          "Vencimento": brDate(l.vencimento),
          "Observações": l.obs || ""
        }));
        const wsLaunches = XLSX.utils.json_to_sheet(launchesRows.length ? launchesRows : [{"Aviso":"Nenhum lançamento no filtro atual"}]);
        wsLaunches["!cols"] = [{wch:12},{wch:28},{wch:12},{wch:24},{wch:36},{wch:14},{wch:10},{wch:14},{wch:36}];
        if(launchesRows.length){
          styleRange(wsLaunches,`A1:I1`,headStyle);
          for(let r=2;r<=launchesRows.length+1;r++){
            styleRange(wsLaunches,`A${r}:I${r}`,bodyStyle);
            if(wsLaunches[`F${r}`]) wsLaunches[`F${r}`].s = moneyStyle;
          }
          autoFilter(wsLaunches,`A1:I${launchesRows.length+1}`);
        }
        XLSX.utils.book_append_sheet(wb, wsLaunches, "LANÇAMENTOS");

        // ===================== HISTÓRICO =====================
        const historyRows = (db.history || []).slice().sort((a,b)=>b.ts-a.ts).map(ev=>{
          const item = ev.after || ev.before || {};
          return {
            "Quando": new Date(ev.ts).toLocaleString("pt-BR"),
            "Ação": ev.action || "",
            "Cliente": item.clientId ? clientName(item.clientId) : "",
            "Tipo": item.type || "",
            "Categoria": item.category || "",
            "Descrição": item.desc || "",
            "Valor": Number(item.value || 0),
            "Observações": item.obs || ""
          };
        });
        const wsHistory = XLSX.utils.json_to_sheet(historyRows.length ? historyRows : [{"Aviso":"Nenhum histórico registrado"}]);
        wsHistory["!cols"] = [{wch:22},{wch:10},{wch:28},{wch:12},{wch:24},{wch:36},{wch:14},{wch:36}];
        if(historyRows.length){
          styleRange(wsHistory,`A1:H1`,headStyle);
          for(let r=2;r<=historyRows.length+1;r++){
            styleRange(wsHistory,`A${r}:H${r}`,bodyStyle);
            if(wsHistory[`G${r}`]) wsHistory[`G${r}`].s = moneyStyle;
          }
          autoFilter(wsHistory,`A1:H${historyRows.length+1}`);
        }
        XLSX.utils.book_append_sheet(wb, wsHistory, "HISTÓRICO");

        wb.Workbook = {Views:[{RTL:false}]};
        const fileClient = clientLabel.replace(/[^a-z0-9]+/gi,"_").slice(0,24).toLowerCase() || "todos";
        const fileMonth = state.month === "ALL" ? "ano_todo" : String(state.month).padStart(2,"0");
        XLSX.writeFile(wb, `relatorio_eaxis_${fileClient}_${fileMonth}_${state.year}.xlsx`);
      }catch(err){
        console.error(err);
        alert("Falha ao exportar Excel: " + (err.message || err));
      }
    }

    function openLaunch(id){
      if(id){
        const l = db.launches.find(x=>x.id===id);
        if(!l) return;
        state.editingLaunchId = id;
        el.launchModalTitle.textContent = "Editar Lançamento";
        el.btnSaveLaunch.textContent = "Salvar alterações";

        el.fDate.value = l.date;
        el.fClient.value = l.clientId;
        el.fType.value = l.type;
        el.fCategory.value = l.category || "";
        el.fDesc.value = l.desc || "";
        el.fValue.value = l.value || "";
        el.fObs.value = l.obs || "";
        el.fFuturo.value = l.futuro ? "sim" : "nao";
        el.fVencimento.value = l.vencimento || "";
      }else{
        state.editingLaunchId = null;
        el.launchModalTitle.textContent = "Novo Lançamento";
        el.btnSaveLaunch.textContent = "Salvar";

        el.fDate.value = ymd(new Date());
        if(db.clients.length){
          el.fClient.value = state.clientId==="ALL" ? db.clients[0].id : state.clientId;
        }
        el.fType.value = "Receita";
        el.fCategory.value = "";
        el.fDesc.value = "";
        el.fValue.value = "";
        el.fObs.value = "";
        el.fFuturo.value = "nao";
        el.fVencimento.value = "";
      }
      el.modalLaunch.classList.add("open");
      setTimeout(()=>el.fDate.focus(), 50);
    }

    function closeLaunch(){
      el.modalLaunch.classList.remove("open");
    }

    function deleteLaunch(id){
      if(state.adminLocked){
        alert("Administrador bloqueado. Desbloqueie com PIN para excluir.");
        return;
      }
      const idx = db.launches.findIndex(x=>x.id===id);
      if(idx<0) return;
      if(!confirm("Excluir este lançamento?")) return;
      const before = db.launches[idx];
      db.launches.splice(idx,1);
      saveDB(db);
      logHistory("DELETE", before, null);
      refreshCategoryFilter();
      render();
    }

    // Autorizar apenas 1 lançamento (se futuro)
    function authorizeSingleLaunch(id){
      if(state.adminLocked){
        alert("Administrador bloqueado. Desbloqueie com PIN para autorizar lançamentos futuros.");
        return;
      }
      const idx = db.launches.findIndex(x=>x.id===id);
      if(idx < 0) return;
      const l = db.launches[idx];
      if(!l.futuro){
        alert("Este lançamento já está autorizado.");
        return;
      }

      if(!confirm("Autorizar este lançamento futuro como realizado?")){
        return;
      }

      const hoje = ymd(new Date());
      const before = JSON.parse(JSON.stringify(l));
      db.launches[idx] = {
        ...l,
        futuro: false,
        date: l.vencimento || hoje
      };
      const after = JSON.parse(JSON.stringify(db.launches[idx]));
      saveDB(db);
      logHistory("EDIT", before, after);

      refreshMonthYearSelectors();
      refreshCategoryFilter();
      render();
    }

    function openClient(id){
      if(id){
        const c = db.clients.find(x=>x.id===id);
        if(!c) return;
        state.editingClientId = id;
        el.clientModalTitle.textContent = "Editar Cliente";
        el.cName.value = c.name;
        el.cDoc.value = c.doc || "";
        el.cContact.value = c.contact || "";
      }else{
        state.editingClientId = null;
        el.clientModalTitle.textContent = "Novo Cliente";
        el.cName.value = "";
        el.cDoc.value = "";
        el.cContact.value = "";
      }
      el.modalClient.classList.add("open");
      setTimeout(()=>el.cName.focus(), 50);
    }

    function closeClient(){
      el.modalClient.classList.remove("open");
    }

    function deleteClient(id){
      if(state.adminLocked){
        alert("Administrador bloqueado. Desbloqueie com PIN para excluir cliente.");
        return;
      }

      const idx = db.clients.findIndex(x=>x.id===id);
      if(idx < 0) return;

      const c = db.clients[idx];
      const totalLaunches = db.launches.filter(l=>l.clientId===id).length;
      const msg = totalLaunches
        ? `Excluir o cliente "${c.name}" e também ${totalLaunches} lançamento(s) vinculado(s)?`
        : `Excluir o cliente "${c.name}"?`;

      if(!confirm(msg)) return;

      const removedClient = JSON.parse(JSON.stringify(c));
      const removedLaunches = db.launches.filter(l=>l.clientId===id).map(l=>JSON.parse(JSON.stringify(l)));

      db.clients.splice(idx,1);
      db.launches = db.launches.filter(l=>l.clientId!==id);

      if(!db.clients.length){
        const base = baseDB();
        db.clients = base.clients;
        state.clientId = "ALL";
      }else if(state.clientId === id){
        state.clientId = "ALL";
      }

      saveDB(db);
      logHistory("DELETE_CLIENT", {client: removedClient, launches: removedLaunches}, null);

      refreshClientSelectors();
      refreshCategoryFilter();
      render();
    }

    function logHistory(action, before, after){
      const ev = {
        ts: Date.now(),
        action,
        before: before||null,
        after: after||null
      };
      db.history.push(ev);
      if(db.history.length>1000){
        db.history.splice(0, db.history.length-1000);
      }
      saveDB(db);
    }

    function openHistory(){
      el.modalHistory.classList.add("open");
      renderHistory();
    }

    function closeHistory(){
      el.modalHistory.classList.remove("open");
    }

    function renderHistory(){
      const from = el.hFrom.value;
      const to = el.hTo.value;
      const act = el.hAction.value;
      const client = el.hClient.value;

      let list = db.history.slice().sort((a,b)=>b.ts-a.ts);

      list = list.filter(ev=>{
        const d = new Date(ev.ts);
        const ymdEv = ymd(d);

        if(from && ymdEv < from) return false;
        if(to && ymdEv > to) return false;

        if(act!=="ALL" && ev.action!==act) return false;

        if(client!=="ALL"){
          const cl = (ev.after||ev.before||{}).clientId;
          if(cl!==client) return false;
        }
        return true;
      });

      el.tbodyHistory.innerHTML = "";

      const limited = list.slice(0,300);

      for(const ev of limited){
        const d = new Date(ev.ts);
        const when = d.toLocaleString("pt-BR");

        const item = ev.after || ev.before || {};
        const histClient = item.client || item;
        const cName = item.client ? (item.client.name || "(cliente removido)") : clientName(item.clientId);
        const type = item.client ? "Cliente" : (item.type || "");
        const cat = item.client ? "Cadastro" : (item.category || "");
        const desc = item.client ? `Cliente excluído${item.launches?.length ? ` com ${item.launches.length} lançamento(s)` : ""}` : (item.desc || "");
        const val = item.client ? 0 : Number(item.value||0);
        const obs = item.client ? (item.client.doc || item.client.contact || "") : (item.obs || "");

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(when)}</td>
          <td><span class="tag ${ev.action==="DELETE" ? "des" : "rec"}">${escapeHtml(ev.action)}</span></td>
          <td>${escapeHtml(cName)}</td>
          <td>${escapeHtml(type)}</td>
          <td>${escapeHtml(cat)}</td>
          <td class="descCell">${escapeHtml(desc)}</td>
          <td class="num">${fmtBRL(val)}</td>
          <td>${escapeHtml(obs || "—")}</td>
        `;
        el.tbodyHistory.appendChild(tr);
      }

      const total = list.length;
      const shown = limited.length;
      el.historyHint.textContent = `Encontrados: ${total} evento(s). Mostrando: ${shown}.`;
    }

    function applyLayoutVars(){
      document.documentElement.style.setProperty("--sidebarW", state.sidebarW+"px");
      document.documentElement.style.setProperty("--mainCols", state.mainCols);
      document.body.setAttribute("data-sidebarpos", state.sidebarPos);
      el.selCols.value = state.mainCols;
      el.selSidebarPos.value = state.sidebarPos;
      el.rngSidebar.value = state.sidebarW;
      localStorage.setItem(KEY_LAYOUT_SIDEBAR, JSON.stringify({
        mainCols: state.mainCols,
        sidebarW: state.sidebarW,
        sidebarPos: state.sidebarPos
      }));
    }

    function applyOrder(key, rootEl, selector, attr){
      try{
        const raw = localStorage.getItem(key);
        if(!raw) return;
        const order = JSON.parse(raw);
        if(!Array.isArray(order)) return;
        const nodes = Array.from(rootEl.querySelectorAll(selector));
        const map = new Map(nodes.map(n=>[n.getAttribute(attr),n]));
        rootEl.innerHTML = "";
        order.forEach(id=>{
          const node = map.get(id);
          if(node) rootEl.appendChild(node);
        });
        nodes.forEach(n=>{
          if(!rootEl.contains(n)) rootEl.appendChild(n);
        });
      }catch(e){}
    }

    function applyPanelSizes(){
      let map = {};
      try{
        const raw = localStorage.getItem(KEY_LAYOUT_PANEL_SIZE);
        if(raw) map = JSON.parse(raw) || {};
      }catch(e){
        map = {};
      }

      // O Dashboard precisa crescer para baixo quando "Ano todo" gera muitas categorias.
      // Por isso ele não pode receber altura fixa salva pelo modo layout.
      delete map["trend-dashboard"];
      delete map["category-dashboard"];

      document.querySelectorAll(".panel[data-panel]").forEach(p=>{
        const id = p.getAttribute("data-panel");

        if(id === "trend-dashboard" || id === "category-dashboard"){
          p.style.minHeight = "";
          p.style.height = "";
          p.style.maxHeight = "";
          return;
        }

        const h = map[id];

        if(typeof h === "number"){
          if(h < 220 || h > 600){
            delete map[id];
            p.style.minHeight = "";
            p.style.height = "";
            p.style.maxHeight = "";
            return;
          }

          p.style.minHeight = h + "px";
          p.style.height = h + "px";
        }else{
          p.style.minHeight = "";
          p.style.height = "";
          p.style.maxHeight = "";
        }
      });

      localStorage.setItem(KEY_LAYOUT_PANEL_SIZE, JSON.stringify(map));
    }

    function resetLayoutAll(){
      localStorage.removeItem(KEY_LAYOUT_KPI_ORDER);
      localStorage.removeItem(KEY_LAYOUT_PANEL_ORDER);
      localStorage.removeItem(KEY_LAYOUT_PANEL_SIZE);
      localStorage.removeItem(KEY_LAYOUT_SIDEBAR);
      state.mainCols = 2;
      state.sidebarW = 320;
      state.sidebarPos = "left";
      applyLayoutVars();
      applyOrder(KEY_LAYOUT_KPI_ORDER, el.cardsRoot, ".card[data-kpi]", "data-kpi");
      applyOrder(KEY_LAYOUT_PANEL_ORDER, el.mainRoot, ".panel[data-panel]", "data-panel");
      Array.from(el.mainRoot.querySelectorAll(".panel")).forEach(p=>p.style.minHeight="");
    }

    function bindDnD(){
      const draggables = document.querySelectorAll(".dragHandle");
      draggables.forEach(h=>{
        const panel = h.parentElement;
        if(!panel) return;
        h.onmousedown = (e)=>{
          if(!document.body.classList.contains("layout-mode")) return;
          e.preventDefault();
          panel.classList.add("dragging");
          const rect = panel.getBoundingClientRect();
          const offsetY = e.clientY - rect.top;

          function onMove(ev){
            ev.preventDefault();
            const y = ev.clientY;
            const center = y - offsetY + rect.height/2;
            const siblings = Array.from(panel.parentElement.children).filter(ch=>ch!==panel);
            let best = null;
            let bestDist = Infinity;
            siblings.forEach(s=>{
              const r = s.getBoundingClientRect();
              const cy = r.top + r.height/2;
              const d = Math.abs(cy-center);
              if(d<bestDist){
                bestDist = d;
                best = s;
              }
            });
            siblings.forEach(s=>s.classList.remove("dropTarget"));
            if(best) best.classList.add("dropTarget");
          }

          function onUp(ev){
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            const siblings = Array.from(panel.parentElement.children).filter(ch=>ch!==panel);
            let target = null;
            siblings.forEach(s=>{
              if(s.classList.contains("dropTarget")){
                target = s;
                s.classList.remove("dropTarget");
              }
            });
            panel.classList.remove("dragging");
            if(target){
              panel.parentElement.insertBefore(panel, target);
            }
            const isKpi = panel.closest("#cardsRoot");
            if(isKpi){
              const ids = Array.from(el.cardsRoot.querySelectorAll(".card[data-kpi]")).map(c=>c.getAttribute("data-kpi"));
              localStorage.setItem(KEY_LAYOUT_KPI_ORDER, JSON.stringify(ids));
            }else{
              const ids = Array.from(el.mainRoot.querySelectorAll(".panel[data-panel]")).map(p=>p.getAttribute("data-panel"));
              localStorage.setItem(KEY_LAYOUT_PANEL_ORDER, JSON.stringify(ids));
            }
          }

          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        };
      });

      const resizeHandles = document.querySelectorAll(".panel .resize-handle");
      resizeHandles.forEach(rh=>{
        const panel = rh.parentElement;
        rh.onmousedown = (e)=>{
          if(!document.body.classList.contains("layout-mode")) return;
          e.preventDefault();
          const startY = e.clientY;
          const startH = panel.offsetHeight;
          const id = panel.getAttribute("data-panel");

          function onMove(ev){
            const dy = ev.clientY - startY;
            const newH = Math.max(220, startH + dy);
            panel.style.minHeight = newH+"px";
          }
          function onUp(ev){
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            const raw = localStorage.getItem(KEY_LAYOUT_PANEL_SIZE);
            let map = {};
            if(raw) try{map = JSON.parse(raw)||{};}catch(e){}
            map[id] = panel.offsetHeight;
            localStorage.setItem(KEY_LAYOUT_PANEL_SIZE, JSON.stringify(map));
          }

          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        };
      });

      const sidebarHandle = document.querySelector(".sidebar .resize-handle");
      if(sidebarHandle){
        sidebarHandle.onmousedown = (e)=>{
          if(!document.body.classList.contains("layout-mode")) return;
          e.preventDefault();
          const startX = e.clientX;
          const startW = state.sidebarW;

          function onMove(ev){
            const dx = ev.clientX - startX;
            let newW = startW + (state.sidebarPos==="left" ? dx : -dx);
            newW = Math.min(420, Math.max(240,newW));
            state.sidebarW = newW;
            applyLayoutVars();
          }
          function onUp(ev){
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
          }
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
        };
      }
    }

    el.globalClient.onchange = ()=>{
      state.clientId = el.globalClient.value;
      refreshCategoryFilter();
      refreshClientSelectors();
      render();
    };
    el.monthSelect.onchange = ()=>{
      const v = el.monthSelect.value;
      state.month = (v === "ALL") ? "ALL" : Number(v);
      render();
    };
    el.yearSelect.onchange = ()=>{ state.year = Number(el.yearSelect.value); render(); };
    el.categorySelect.onchange = ()=>{ state.category = el.categorySelect.value; render(); };
    el.typeSelect.onchange = ()=>{ state.type = el.typeSelect.value; render(); };
    el.dateFrom.onchange = ()=>{ state.dateFrom = el.dateFrom.value; render(); };
    el.dateTo.onchange = ()=>{ state.dateTo = el.dateTo.value; render(); };
    el.futureSelect.onchange = ()=>{
      state.futureMode = el.futureSelect.value || "INCLUIR";
      render();
    };

    el.tabAnnual.onclick = ()=>{
      state.view = "annual";
      applyView();
    };

    el.tabDashboard.onclick = ()=>{
      state.view = "dashboard";
      applyView();
      setTimeout(()=>{
        if(trendChart){
          trendChart.resize();
          trendChart.update();
        }
        if(catChart){
          catChart.resize();
          catChart.update();
        }
        syncDashboardCategoryHeight();
      }, 80);
    };

    el.btnTheme.onclick = ()=>{
      state.theme = (state.theme === "light") ? "dark" : "light";
      applyTheme();
    };

    el.btnNewLaunch.onclick = ()=> openLaunch(null);
    el.btnCloseLaunch.onclick = closeLaunch;
    el.modalLaunch.addEventListener("click", (e)=>{ if(e.target === el.modalLaunch) closeLaunch(); });

    el.btnSaveLaunch.onclick = ()=>{
      if(state.adminLocked) return;

      const date = el.fDate.value;
      const clientId = el.fClient.value;
      const type = el.fType.value;
      const category = el.fCategory.value.trim();
      const desc = el.fDesc.value.trim();
      const value = Number(el.fValue.value||0);
      const obs = el.fObs.value.trim();

      const isFuturo = el.fFuturo.value === "sim";
      const vencimento = el.fVencimento.value;

      if(isFuturo && !vencimento){
        alert("Informe o vencimento para lançamentos futuros.");
        return;
      }

      if(!date || !clientId || !type || !category || value<=0){
        alert("Preencha: Data, Cliente, Tipo, Categoria e Valor > 0.");
        return;
      }

      if(state.editingLaunchId){
        const idx = db.launches.findIndex(x=>x.id===state.editingLaunchId);
        if(idx < 0){ alert("Lançamento não encontrado."); return; }
        const before = JSON.parse(JSON.stringify(db.launches[idx]));
        db.launches[idx] = {
          ...db.launches[idx],
          date,
          clientId,
          type,
          category,
          desc,
          value,
          obs,
          futuro: isFuturo,
          vencimento: vencimento || ""
        };
        const after = JSON.parse(JSON.stringify(db.launches[idx]));
        saveDB(db);
        logHistory("EDIT", before, after);
      }else{
        const newItem = {
          id:crypto.randomUUID(),
          date,
          clientId,
          type,
          category,
          desc,
          value,
          obs,
          futuro: isFuturo,
          vencimento: vencimento || ""
        };
        db.launches.push(newItem);
        saveDB(db);
        logHistory("ADD", null, newItem);
      }

      refreshCategoryFilter();
      refreshMonthYearSelectors();
      render();

      state.editingLaunchId = null;
      el.launchModalTitle.textContent = "Novo Lançamento";
      el.btnSaveLaunch.textContent = "Salvar";

      el.fCategory.value = "";
      el.fDesc.value = "";
      el.fValue.value = "";
      el.fObs.value = "";
      setTimeout(()=>el.fCategory.focus(), 50);
    };

    el.btnAutozirarFuturos.onclick = ()=>{
      if(state.adminLocked){
        alert("Administrador bloqueado. Desbloqueie com PIN para autozirar lançamentos futuros.");
        return;
      }

      const list = filterLaunches().filter(l => l.futuro === true);
      if(!list.length){
        alert("Não há lançamentos futuros visíveis com o filtro atual.");
        return;
      }

      if(!confirm(`Converter ${list.length} lançamento(s) futuro(s) em realizados agora?`)){
        return;
      }

      const hoje = ymd(new Date());

      list.forEach(lItem=>{
        const idx = db.launches.findIndex(x=>x.id === lItem.id);
        if(idx < 0) return;
        const before = JSON.parse(JSON.stringify(db.launches[idx]));

        db.launches[idx] = {
          ...db.launches[idx],
          futuro: false,
          date: db.launches[idx].vencimento || hoje
        };

        const after = JSON.parse(JSON.stringify(db.launches[idx]));
        logHistory("EDIT", before, after);
      });

      saveDB(db);
      refreshMonthYearSelectors();
      refreshCategoryFilter();
      render();

      alert("Lançamentos futuros convertidos em realizados com sucesso.");
    };

    el.btnNewClient.onclick = ()=> openClient(null);
    el.btnCloseClient.onclick = closeClient;
    el.modalClient.addEventListener("click", (e)=>{ if(e.target === el.modalClient) closeClient(); });

    el.btnSaveClient.onclick = ()=>{
      const name = el.cName.value.trim();
      if(!name){ alert("Informe o nome do cliente."); return; }

      const doc = el.cDoc.value.trim();
      const contact = el.cContact.value.trim();

      if(state.editingClientId){
        const idx = db.clients.findIndex(x=>x.id===state.editingClientId);
        if(idx<0){ alert("Cliente não encontrado."); return; }
        db.clients[idx] = { ...db.clients[idx], name, doc, contact };
        saveDB(db);

        refreshClientSelectors();
        render();
        closeClient();
        return;
      }

      const id = crypto.randomUUID();
      db.clients.push({id, name, doc, contact});
      saveDB(db);
      closeClient();
      refreshClientSelectors();
      render();
    };

    el.btnExportExcel.onclick = exportExcel;

    el.btnBackup.onclick = ()=>{
      const payload = JSON.stringify(db, null, 2);
      const blob = new Blob([payload], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup_eaxis_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);

      localStorage.setItem(KEY_LAST_BACKUP, String(Date.now()));
      refreshBackupImportUI();
    };

    el.fileImport.onchange = async ()=>{
      const f = el.fileImport.files[0];
      if(!f) return;
      try{
        const txt = await f.text();
        const obj = JSON.parse(txt);
        if(!obj || !Array.isArray(obj.clients) || !Array.isArray(obj.launches)){
          alert("JSON inválido. Precisa ter clients[] e launches[].");
          return;
        }
        if(!obj.history) obj.history = [];
        obj.launches = obj.launches.map(l => ({
          ...l,
          futuro: l.futuro === true,
          vencimento: l.vencimento || ""
        }));
        db = obj;
        saveDB(db);

        refreshMonthYearSelectors();
        refreshClientSelectors();
        refreshCategoryFilter();

        localStorage.setItem(KEY_LAST_IMPORT, String(Date.now()));
        render();
        alert("Importado com sucesso.");
      }catch(e){
        alert("Falha ao importar: " + e.message);
      }finally{
        el.fileImport.value = "";
      }
    };

    el.btnReset.onclick = ()=>{
      if(state.adminLocked){
        alert("Reset bloqueado. Desbloqueie com PIN.");
        return;
      }
      if(!confirm("Resetar tudo? Isso apaga clientes e lançamentos locais.")) return;

      localStorage.removeItem(KEY);
      db = baseDB();
      db.launches = db.launches.map(l=>({ ...l, clientId: db.clients[0]?.id || null, futuro:false, vencimento:"" }));
      saveDB(db);

      state.clientId = "ALL";
      state.category = "ALL";
      state.type = "ALL";
      state.month = now.getMonth()+1;
      state.year = now.getFullYear();
      state.dateFrom = "";
      state.dateTo = "";
      state.futureMode = "INCLUIR";

      refreshMonthYearSelectors();
      refreshClientSelectors();
      refreshCategoryFilter();

      el.typeSelect.value = state.type;
      el.dateFrom.value = "";
      el.dateTo.value = "";
      el.futureSelect.value = state.futureMode;

      render();
    };

    el.btnLock.onclick = ()=>{
      el.pinInput.value = "";
      el.modalPin.classList.add("open");
      setTimeout(()=>el.pinInput.focus(), 50);
    };
    el.btnClosePin.onclick = ()=> el.modalPin.classList.remove("open");
    el.btnPinOk.onclick = ()=>{
      const pin = el.pinInput.value.trim();
      if(pin !== getPin()){
        alert("PIN incorreto.");
        return;
      }
      state.adminLocked = !state.adminLocked;
      applyLockUI();
      el.modalPin.classList.remove("open");
      render();
    };
    el.modalPin.addEventListener("click", (e)=>{ if(e.target === el.modalPin) el.modalPin.classList.remove("open"); });
    el.pinInput.addEventListener("keydown", (e)=>{ if(e.key==="Enter") el.btnPinOk.click(); });

    el.btnChangePin.onclick = ()=>{
      const current = prompt("Digite o PIN atual:");
      if(current !== getPin()){
        alert("PIN atual incorreto.");
        return;
      }
      const next = prompt("Digite o novo PIN (4 a 8 caracteres):");
      if(!next || next.trim().length < 4 || next.trim().length > 8){
        alert("PIN inválido.");
        return;
      }
      setPin(next.trim());
      alert("PIN atualizado com sucesso.");
    };

    el.btnLayout.onclick = ()=>{
      if(state.adminLocked){
        alert("Administrador bloqueado. Desbloqueie com PIN para configurar layout.");
        return;
      }
      setLayoutMode(!document.body.classList.contains("layout-mode"));
    };
    el.btnExitLayout.onclick = ()=> setLayoutMode(false);
    el.btnResetLayout.onclick = ()=>{
      if(state.adminLocked) return;
      if(!confirm("Resetar layout (grid, sidebar, tamanhos e ordem)?")) return;
      resetLayoutAll();
    };
    el.selCols.onchange = ()=>{
      state.mainCols = Number(el.selCols.value || "2");
      applyLayoutVars();
    };
    el.selSidebarPos.onchange = ()=>{
      state.sidebarPos = el.selSidebarPos.value || "left";
      applyLayoutVars();
    };
    el.rngSidebar.oninput = ()=>{
      state.sidebarW = Number(el.rngSidebar.value || "300");
      applyLayoutVars();
    };

    el.btnHistory.onclick = openHistory;
    el.btnCloseHistory.onclick = closeHistory;
    el.modalHistory.addEventListener("click", (e)=>{ if(e.target === el.modalHistory) closeHistory(); });
    el.hFrom.onchange = renderHistory;
    el.hTo.onchange = renderHistory;
    el.hAction.onchange = renderHistory;
    el.hClient.onchange = renderHistory;
    el.btnClearHistoryFilter.onclick = ()=>{
      el.hFrom.value = "";
      el.hTo.value = "";
      el.hAction.value = "ALL";
      el.hClient.value = "ALL";
      renderHistory();
    };

    function applyThemeInit(){
      document.body.setAttribute("data-theme", state.theme);
      el.btnTheme.textContent = state.theme === "light" ? "Fundo Escuro" : "Fundo Branco";
      localStorage.setItem(KEY_THEME, state.theme);
    }

    function initLayout(){
      try{
        const raw = localStorage.getItem(KEY_LAYOUT_SIDEBAR);
        if(raw){
          const obj = JSON.parse(raw);
          if(obj && typeof obj==="object"){
            if([1,2,3].includes(obj.mainCols)) state.mainCols = obj.mainCols;
            if(obj.sidebarW>=240 && obj.sidebarW<=420) state.sidebarW = obj.sidebarW;
            if(["left","right"].includes(obj.sidebarPos)) state.sidebarPos = obj.sidebarPos;
          }
        }
      }catch(e){}

      const lm = localStorage.getItem(KEY_LAYOUT_MODE);
      if(lm) state.layoutMode = true;

      applyLayoutVars();
      if(state.layoutMode){
        document.body.classList.add("layout-mode");
        el.layoutBar.style.display = "flex";
      }

      applyOrder(KEY_LAYOUT_KPI_ORDER, el.cardsRoot, ".card[data-kpi]", "data-kpi");
      applyOrder(KEY_LAYOUT_PANEL_ORDER, el.mainRoot, ".panel[data-panel]", "data-panel");
      applyPanelSizes();

      bindDnD();
    }

    function init(){
      db = loadDB();

      applyThemeInit();
      initCharts();

      refreshMonthYearSelectors();
      refreshClientSelectors();
      refreshCategoryFilter();

      el.typeSelect.value = state.type;
      el.dateFrom.value = state.dateFrom;
      el.dateTo.value = state.dateTo;
      el.futureSelect.value = state.futureMode;

      applyLockUI();
      refreshBackupImportUI();
      applyView();
      initLayout();
      render();
    }
    
   // limpeza preventiva (evita lixo antigo)
    (function(){
      try{
    const raw = localStorage.getItem(KEY_LAYOUT_PANEL_SIZE);
    if(!raw) return;

    const map = JSON.parse(raw);
    let changed = false;

    Object.keys(map).forEach(k=>{
      if(k === "trend-dashboard" || k === "category-dashboard" || map[k] > 600 || map[k] < 200){
        delete map[k];
        changed = true;
      }
    });

    if(changed){
      localStorage.setItem(KEY_LAYOUT_PANEL_SIZE, JSON.stringify(map));
    }
  }catch(e){}
 })();

    init();
