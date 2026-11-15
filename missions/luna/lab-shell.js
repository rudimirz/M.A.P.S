/* MAPS · minijuegos: ajuste para laptops (menos scroll) + traducción de la interfaz común */
(function(){
  const css=`@media (min-width:821px) and (max-height:860px){
  :root{font-size:14.5px}
  .app{padding:6px clamp(8px,1.4vw,14px);gap:6px}
  .goal{font-size:.86rem!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .box{padding:8px 10px;gap:6px}.panel{gap:6px}
  .btn{min-height:36px}.note{font-size:.84rem!important;line-height:1.4}
  .state{font-size:.88rem!important}.feedback{font-size:.92rem!important}
  .main{grid-template-columns:minmax(0,1fr) clamp(280px,25vw,360px)}
}
@media (min-width:821px) and (max-height:720px){
  :root{font-size:13.5px}
  body.campaign .top{display:none}
  .box h2{font-size:.76rem!important}.seat{font-size:.68rem!important}
  .btn{min-height:32px}
}`;
  const s=document.createElement('style');s.textContent=css.replace(/;(?=[^{}]*\})/g,' !important;').replace(/([^;{}\s])\}/g,'$1 !important}');const put=()=>document.head.append(s);if(document.readyState==='loading')addEventListener('DOMContentLoaded',put);else put();
  const QS=new URLSearchParams(location.search),LG=QS.get('lang');if(LG!=='en'&&LG!=='pt')return;
  const LI=LG==='en'?1:2,D=new Map();(window.MG_I18N||[]).forEach(r=>{const k=r[0].trim(),v=r[LI];if(k&&v!=null&&!D.has(k))D.set(k,v.trim())});
  const eR=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),W=/^[\p{L}\p{N}]/u,WE=/[\p{L}\p{N}]$/u;
  const KS=[...D.keys()].filter(k=>k.length>2).sort((a,b)=>b.length-a.length),alt=a=>a.map(k=>eR(k)+(WE.test(k)?'(?![\\p{L}\\p{N}])':'')).join('|')||'(?!)',RE=new RegExp('('+alt(KS.filter(k=>!W.test(k)))+')|(^|[^\\p{L}\\p{N}])('+alt(KS.filter(k=>W.test(k)))+')','gu'),REf=(m,b,pre,a)=>b!=null?(D.has(b)?D.get(b):b):pre+(D.has(a)?D.get(a):a);
  const RL='(Vuelo|Instrumentos|Operaciones|Comunicaciones)';
  const rx=LG==='en'?[[/Récord (\d+)/g,'Record $1'],[/Faltan (\d+) votos?/g,'$1 votes missing'],[/Sin mayoría \((\d+) de (\d+)\)/g,'No majority ($1 of $2)'],[/Despegar · mayoría (\d+) a (\d+)/g,'Lift off · majority $1 to $2'],[/Despegar · la IA: (\d+) de (\d+) a favor/g,'Lift off · AI: $1 of $2 in favor'],[/\((\d)\/4 a favor\)/g,'($1/4 in favor)'],[/\(IA, recomendó sí\)/g,'(AI, recommended yes)'],[/\(IA, recomendó no\)/g,'(AI, recommended no)'],[/Tu voto: sí\./g,'Your vote: yes.'],[/Tu voto: no\./g,'Your vote: no.'],[new RegExp(RL+' sí(?![\\p{L}])','gu'),'$1 yes'],[/^(Saltar|Volver)([^:]*): de ([^.:]+?) a ([^.:]+)\.$/g,'$1$2: from $3 to $4.'],[/(\d),(\d)/g,'$1.$2']]
   :[[/Récord (\d+)/g,'Recorde $1'],[/Faltan (\d+) votos?/g,'Faltam $1 votos'],[/Sin mayoría \((\d+) de (\d+)\)/g,'Sem maioria ($1 de $2)'],[/Despegar · mayoría (\d+) a (\d+)/g,'Decolar · maioria $1 a $2'],[/Despegar · la IA: (\d+) de (\d+) a favor/g,'Decolar · a IA: $1 de $2 a favor'],[/\(IA, recomendó sí\)/g,'(IA, recomendou sim)'],[/\(IA, recomendó no\)/g,'(IA, recomendou não)'],[/Tu voto: sí\./g,'Seu voto: sim.'],[/Tu voto: no\./g,'Seu voto: não.'],[new RegExp(RL+' sí(?![\\p{L}])','gu'),'$1 sim'],[new RegExp(RL+' no(?![\\p{L}])','gu'),'$1 não'],[/^(Saltar|Volver)([^:]*): de ([^.:]+?) a ([^.:]+)\.$/g,'$1$2: de $3 para $4.']];
  const post=LG==='en'?[[/(\S) y (?=\S)/g,'$1 and '],[/(^|[^\p{L}])IA(?![\p{L}])/gu,'$1AI']]:[[/(\S) y (?=\S)/g,'$1 e ']];
  const C=new Map();
  const tr=v=>{if(typeof v!=='string'||!v.trim())return v;const c=C.get(v);if(c!==undefined)return c;const k=v.trim();let o;if(D.has(k))o=v.replace(k,()=>D.get(k));else{o=v;for(const [r,w] of rx)o=o.replace(r,w);o=o.replace(RE,REf);for(const [r,w] of post)o=o.replace(r,w)}if(C.size>5000)C.clear();C.set(v,o);C.set(o,o);if(QS.has('mgdebug')&&o===v&&/\p{L}{3}/u.test(o)&&!D.has(k))(window._mgM=window._mgM||new Set()).add(o);return o};
  if(QS.has('mgdebug'))setTimeout(()=>[...(window._mgM||[])].forEach(x=>console.log('MG| '+x)),2500);
  window.MAPS_TR=tr;
  {const P=CanvasRenderingContext2D.prototype,ft=P.fillText,mt=P.measureText,st=P.strokeText;P.fillText=function(t,...a){return ft.call(this,typeof t==='string'?tr(t):t,...a)};P.strokeText=function(t,...a){return st.call(this,typeof t==='string'?tr(t):t,...a)};P.measureText=function(t){return mt.call(this,typeof t==='string'?tr(t):t)}}
  const walk=n=>{if(n.nodeType===3){const v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v}else if(n.nodeType===1&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'){['aria-label','title','placeholder'].forEach(a=>{if(n.hasAttribute(a))n.setAttribute(a,tr(n.getAttribute(a)))});n.childNodes.forEach(walk)}};
  const start=()=>{document.title=tr(document.title);walk(document.body);new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='characterData'){const v=tr(m.target.nodeValue);if(v!==m.target.nodeValue)m.target.nodeValue=v}else m.addedNodes.forEach(walk)})).observe(document.body,{childList:true,subtree:true,characterData:true})};
  if(document.body)start();else addEventListener('DOMContentLoaded',start);
  document.documentElement.lang=LG;
})();
