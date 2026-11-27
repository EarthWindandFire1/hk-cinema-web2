(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const chapters = ['opening','changing','people','success','after'];
  const st = {lo:1950,hi:2020,genres:[],minVotes:0};
  const L = HKLogic, C = ['#b5222c','#d36b45','#ccaa67','#80516c','#98483d','#6f677b','#b87b83','#79666a'];
  const fmt = n => n == null ? '—' : n.toLocaleString('en-US');
  const config = {displayModeBar:false,responsive:true};
  const plots = new Set();
  let current = '', tablePage = 0, sortKey = 4, sortDir = -1;
  function layout(extra = {}) {
    return Object.assign({height:355,margin:{l:52,r:22,t:25,b:70},paper_bgcolor:'#fff',plot_bgcolor:'#fff',colorway:C,
      font:{family:'DM Sans, Segoe UI, Arial',size:12,color:'#706165'},
      xaxis:{gridcolor:'#f0e8e8',zeroline:false,automargin:true},yaxis:{gridcolor:'#f0e8e8',zeroline:false,automargin:true},
      legend:{orientation:'h',x:0,y:-.23,font:{size:11}},hoverlabel:{font:{size:13}}},extra);
  }
  function plot(id,data,l) { plots.add(id); return Plotly.react(id,data,l,config); }
  function drawSeries() {
    const d=L.byDecade(HK.films,st),x=d.decades.map(v=>v+'s');
    plot('g-series',[
      {type:'bar',x,y:d.films,name:'Films',marker:{color:'#c4575c'},hovertemplate:'%{x}: %{y} films<extra></extra>'},
      {type:'scatter',mode:'lines+markers',x,y:d.rating,yaxis:'y2',name:'Mean rating',line:{color:'#d36b45',width:3},hovertemplate:'%{x}: %{y:.2f}<extra></extra>'}
    ],layout({height:380,yaxis:{domain:[.53,1],title:'Films',gridcolor:'#f0e8e8',rangemode:'tozero'},yaxis2:{domain:[0,.30],title:'Rating',range:[4.5,8],gridcolor:'#f0e8e8'},annotations:[{xref:'paper',yref:'paper',x:0,y:.39,text:'Audience rating · separate scale',showarrow:false,xanchor:'left',font:{size:11,color:'#a05e4b'}}],bargap:.35}));
  }
  function drawGenre() {
    const all=L.subset(HK.films,st),decs=[];for(let d=st.lo;d<=st.hi;d+=10)decs.push(d);
    const names=['Drama','Action','Comedy','Crime','Romance','Horror','Thriller','Adventure'];
    const totals=decs.map(d=>all.filter(f=>Math.floor(f[1]/10)*10===d).reduce((a,f)=>a+f[2].split(',').filter(Boolean).length,0));
    const traces=names.map((g,i)=>({type:'scatter',mode:'lines',name:g,x:decs.map(d=>d+'s'),y:decs.map((d,k)=>totals[k]?100*all.filter(f=>Math.floor(f[1]/10)*10===d&&f[2].split(',').includes(g)).length/totals[k]:null),stackgroup:'genres',line:{width:.6,color:C[i]},fillcolor:C[i],hovertemplate:g+': %{y:.1f}%<extra></extra>'}));
    if(decs.length===1)traces.forEach(t=>{t.type='bar';t.marker={color:t.fillcolor};delete t.stackgroup;delete t.fillcolor;delete t.mode;});
    plot('g-genre',traces,layout({height:380,barmode:'stack',yaxis:{title:'Share of all genre tags (%)',range:[0,100],gridcolor:'#f0e8e8'}}));
  }
  function drawNetwork() {
    const n=HK.net;
    plot('g-network',[{type:'scattergl',mode:'markers',x:n.x,y:n.y,text:n.t,hovertemplate:'%{text}<extra></extra>',marker:{size:n.d.map(v=>2+.28*Math.pow(v,.85)),color:n.c.map(v=>C[Math.trunc(v)%C.length]),opacity:.78},showlegend:false}],layout({height:430,margin:{l:5,r:5,t:10,b:5},xaxis:{visible:false},yaxis:{visible:false}}));
  }
  function drawQuad() {
    const q=L.quadrant(HK.films,st);
    plot('g-quad',[{type:'scatter',mode:'markers',x:q.x,y:q.y,text:q.text,marker:{size:5,color:'#b5222c',opacity:.4},hovertemplate:'%{text}<br>Rating %{y} · %{x:,} votes<extra></extra>'}],layout({xaxis:{type:'log',title:'IMDb votes · log scale',gridcolor:'#f0e8e8'},yaxis:{title:'IMDb rating',gridcolor:'#f0e8e8'},showlegend:false,shapes:q.x.length?[{type:'line',xref:'x',yref:'paper',x0:Math.max(10,q.medVotes),x1:Math.max(10,q.medVotes),y0:0,y1:1,line:{color:'#c9aaa7',dash:'dash'}},{type:'line',xref:'paper',yref:'y',x0:0,x1:1,y0:q.medRating,y1:q.medRating,line:{color:'#c9aaa7',dash:'dash'}}]:[],annotations:q.x.length?[]:[{text:'No rated films match these filters',xref:'paper',yref:'paper',x:.5,y:.5,showarrow:false}]}));
  }
  function drawEvidence(i) {
    const e=HK.evidence[i];
    const data=structuredClone(e.data);
    data.forEach((t,k)=>{if(t.type==='heatmap'){t.colorscale=[[0,'#fff4f2'],[1,'#b5222c']];t.colorbar={thickness:10,tickfont:{size:10}};}else if(t.type==='bar'){t.marker={...t.marker,color:'#c4575c'};}else {if(t.marker)t.marker={...t.marker,color:C[k%C.length]};t.line={...t.line,color:C[k%C.length]};}});
    const l=layout({...structuredClone(e.layout),title:undefined,height:i===4?430:350,margin:{l:i===0?110:60,r:i===4?60:30,t:24,b:82},legend:{orientation:'h',x:0,y:-.27,font:{size:11}}});
    l.paper_bgcolor=l.plot_bgcolor='#fff';l.font={family:'DM Sans, Segoe UI, Arial',size:12,color:'#706165'};
    if(i===1)l.yaxis={...l.yaxis,title:'Index · 1990s = 100'};
    if(i===2){l.xaxis={...l.xaxis,title:'IMDb rating'};l.yaxis={...l.yaxis,title:'Gross percentile in year'};}
    if(i===3){l.xaxis={...l.xaxis,title:'Film release year'};l.yaxis={...l.yaxis,title:'Rating percentile in year'};}
    if (i === 4) {
      l.yaxis = {...l.yaxis, title:'Performers'};
      l.yaxis2 = {...l.yaxis2, title:'Modularity'};
      l.margin.t = 50;
      const shares = {1990:'97.8%', 2020:'84%'};
      const performers = data[0];
      performers.customdata = performers.x.map(decade => shares[decade] ?? 'Unavailable');
      performers.hovertemplate = '%{x}s<br>Performers: %{y:,}<br>Largest connected group: %{customdata}<extra></extra>';
      data[1].hovertemplate = '%{x}s<br>Modularity: %{y:.3f}<extra></extra>';
      l.annotations = performers.x.map(decade => ({
        x:decade, text:shares[decade] ? '<b>' + shares[decade] + '</b>' : '—',
        xref:'x', yref:'paper', y:1, yanchor:'bottom', yshift:5,
        showarrow:false, font:{size:11,color:shares[decade] ? '#861b25' : '#786c6e'},
        bgcolor:shares[decade] ? '#fbeeed' : '#fff', borderpad:2
      }));
    }
    if(i===5)l.yaxis={...l.yaxis,title:'Mentions per 1,000 words'};
    plot('ev-'+i,data,l);
  }
  function renderTable(){
    const rows=L.subset(HK.films,st).filter(f=>typeof f[3]==='number').sort((a,b)=>typeof a[sortKey]==='string'?sortDir*a[sortKey].localeCompare(b[sortKey]):sortDir*((a[sortKey]??-1)-(b[sortKey]??-1)));
    const pages=Math.max(1,Math.ceil(rows.length/8));tablePage=Math.max(0,Math.min(tablePage,pages-1));
    $('films-body').replaceChildren();
    rows.slice(tablePage*8,tablePage*8+8).forEach(f=>{const tr=document.createElement('tr');[f[0],f[1],f[2].replaceAll(',',', '),f[3]?.toFixed(1),fmt(f[4])].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});$('films-body').append(tr)});
    $('table-count').textContent=fmt(rows.length)+' rated titles';$('table-page').textContent=rows.length?`${tablePage+1} / ${pages}`:'0 / 0';$('prev').disabled=tablePage===0;$('next').disabled=tablePage>=pages-1;
  }
  function drawCurrent(){
    if(typeof Plotly==='undefined'){$('load-error').hidden=false;return;}
    if(current==='changing'){
      const k=L.kpis(HK.films,st);$('stats').replaceChildren();
      [[fmt(k.n),'films in this selection'],[fmt(k.rated),'with an IMDb rating'],[k.mean?.toFixed(2)??'—','mean audience rating'],[fmt(k.medVotes),'median IMDb votes']].forEach(([a,b])=>{const d=document.createElement('div');d.className='stat';const v=document.createElement('strong'),s=document.createElement('span');v.textContent=a;s.textContent=b;d.append(v,s);$('stats').append(d)});
      drawSeries();drawGenre();drawEvidence(5);
    }
    if(current==='people'){drawNetwork();drawEvidence(4);}
    if(current==='success'){drawQuad();drawEvidence(2);drawEvidence(3);}
    if(current==='after'){drawEvidence(1);drawEvidence(0);renderTable();}
  }
  function show(id,scroll=true){
    if(!chapters.includes(id))id='opening';current=id;
    document.querySelectorAll('.page').forEach(el=>el.hidden=el.id!==id);
    document.querySelectorAll('nav button').forEach(b=>{const on=b.dataset.page===id;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    $('chapter-count').textContent=`0${chapters.indexOf(id)+1} / 05`;
    $('chapter-prev').disabled=id==='opening';$('chapter-next').disabled=id==='after';
    if(scroll)window.scrollTo({top:0,behavior:'instant'});drawCurrent();
  }
  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>location.hash=b.dataset.page);
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.hash=b.dataset.go);
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
  $('chapter-prev').onclick=()=>location.hash=chapters[Math.max(0,chapters.indexOf(current)-1)];
  $('chapter-next').onclick=()=>location.hash=chapters[Math.min(4,chapters.indexOf(current)+1)];
  window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON','SUMMARY','TH'].includes(e.target.tagName)||e.altKey||e.metaKey||e.ctrlKey)return;if(e.key==='ArrowRight')$('chapter-next').click();if(e.key==='ArrowLeft')$('chapter-prev').click();});
  $('notes-toggle').onclick=()=>{const on=document.body.classList.toggle('show-cues');$('notes-toggle').setAttribute('aria-pressed',on);};
  $('present').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('present').textContent='Use browser fullscreen (F11)';}};
  document.addEventListener('fullscreenchange',()=>{$('present').textContent=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'});
  ['f-lo','f-hi'].forEach(id=>{for(let d=1950;d<=2020;d+=10){const o=document.createElement('option');o.value=d;o.textContent=d+'s';$(id).append(o)}});
  $('f-lo').value=1950;$('f-hi').value=2020;
  ['All genres',...HK.genres].forEach((g,i)=>{const o=document.createElement('option');o.value=i?g:'';o.textContent=g;$('f-genre').append(o)});
  function filter(){st.lo=+$('f-lo').value;st.hi=+$('f-hi').value;if(st.lo>st.hi){[st.lo,st.hi]=[st.hi,st.lo];$('f-lo').value=st.lo;$('f-hi').value=st.hi;}st.genres=$('f-genre').value?[$('f-genre').value]:[];st.minVotes=+$('f-votes').value;tablePage=0;drawCurrent();}
  ['f-lo','f-hi','f-genre','f-votes'].forEach(id=>$(id).onchange=filter);
  $('reset').onclick=()=>{$('f-lo').value=1950;$('f-hi').value=2020;$('f-genre').value='';$('f-votes').value=0;filter()};
  document.querySelectorAll('th[data-key]').forEach(th=>{const sort=()=>{const key=+th.dataset.key;sortDir=key===sortKey?-sortDir:key<3?1:-1;sortKey=key;document.querySelectorAll('th').forEach(h=>h.removeAttribute('aria-sort'));th.setAttribute('aria-sort',sortDir===1?'ascending':'descending');tablePage=0;renderTable();};th.onclick=sort;th.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sort()}};});
  $('prev').onclick=()=>{tablePage--;renderTable()};$('next').onclick=()=>{tablePage++;renderTable()};
  const full=L.kpis(HK.films,{lo:1950,hi:2020,genres:[],minVotes:0});
  $('data-audit').textContent=`The local Demo contains ${fmt(HK.films.length)} records; ${fmt(full.n)} fall in 1950–2026, including ${fmt(full.rated)} rated films. The accompanying report quotes 2,880 films: these are distinct source versions. This site preserves the local Demo data and calculates filtered totals from it. ${HK.films.length-full.n} records precede 1950. Recent-decade totals are incomplete.`;
  show(location.hash.slice(1),false);
})();
