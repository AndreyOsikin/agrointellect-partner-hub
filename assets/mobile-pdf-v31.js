/* Partner Hub PDF + share UX v31 — light branded commercial proposal, iOS-safe, no html2canvas. */
(function(){
  if(window.__partnerHubPdfV31)return;
  window.__partnerHubPdfV31=true;

  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS)return;

  const FONT_URL='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  const LOGO_URL='./assets/agrointellect-logo-full.webp';
  const FALLBACK_LOGO_URL='./favicon.png';
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
  let fontPromise=null,logoPromise=null,cachedFile=null,cacheStamp=0,building=null,warmTimer=null;
  const MAX_AGE=5*60*1000;

  function toBase64(buffer){
    const bytes=new Uint8Array(buffer); let binary=''; const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(binary);
  }
  async function fetchData(url,mime){
    try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)return null;return `data:${mime};base64,`+toBase64(await r.arrayBuffer())}catch(e){return null}
  }
  async function loadFont(){
    if(fontPromise)return fontPromise;
    fontPromise=(async()=>{const r=await fetch(FONT_URL,{cache:'force-cache'});if(!r.ok)throw new Error('Не удалось загрузить PDF-шрифт');return toBase64(await r.arrayBuffer())})();
    return fontPromise;
  }
  async function loadLogo(){
    if(logoPromise)return logoPromise;
    logoPromise=(async()=>{
      const full=await fetchData(LOGO_URL,'image/webp');
      if(full)return {data:full,format:'WEBP',full:true};
      const fallback=await fetchData(FALLBACK_LOGO_URL,'image/png');
      return fallback?{data:fallback,format:'PNG',full:false}:null;
    })();
    return logoPromise;
  }
  const PRODUCT_NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Math.round(((Number(v)||0)+Number.EPSILON)*100)/100)+' ₽';
  const txt=v=>String(v==null?'':v);

  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF-библиотека не загрузилась');
    if(typeof window.v9Summary!=='function')throw new Error('Данные расчёта недоступны');

    const [{jsPDF},fontB64,logo]=await Promise.all([Promise.resolve(window.jspdf),loadFont(),loadLogo()]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.addFileToVFS('Play-Regular.ttf',fontB64);pdf.addFont('Play-Regular.ttf','Play','normal');pdf.setFont('Play','normal');

    const s=window.v9Summary();
    const W=210,H=297,L=15,R=15,CW=W-L-R;
    const navy=[20,50,78],text=[30,50,70],blue=[22,135,248],muted=[103,122,142],line=[222,231,239],soft=[247,250,253],blueSoft=[238,247,255],white=[255,255,255];
    let y=15;
    const setText=c=>pdf.setTextColor(c[0],c[1],c[2]);
    const setFill=c=>pdf.setFillColor(c[0],c[1],c[2]);
    const setDraw=c=>pdf.setDrawColor(c[0],c[1],c[2]);
    const ensure=h=>{if(y+h>H-18){pdf.addPage();y=17;drawPageHeader()}};

    function drawLogo(x,yy,maxW=42,maxH=14){
      if(!logo)return false;
      try{
        if(logo.full) pdf.addImage(logo.data,logo.format,x,yy,maxW,maxH,undefined,'FAST');
        else pdf.addImage(logo.data,logo.format,x,yy,12,12,undefined,'FAST');
        return true;
      }catch(e){return false}
    }
    function drawPageHeader(){
      drawLogo(L,9,34,10);
      setDraw(line);pdf.line(L,23,W-R,23);y=31;
    }
    function metric(x,label,value,w){
      setFill(white);setDraw(line);pdf.roundedRect(x,y,w,22,4,4,'FD');
      pdf.setFontSize(8.3);setText(muted);pdf.text(label,x+6,y+7);
      pdf.setFontSize(11.5);setText(navy);pdf.text(value,x+6,y+15);
    }
    function row(label,value,strong=false){
      ensure(9);
      pdf.setFontSize(9.2);setText(strong?text:muted);pdf.text(txt(label),L+6,y);
      pdf.setFontSize(strong?10.4:9.4);setText(text);pdf.text(txt(value),W-R-6,y,{align:'right'});
      y+=6.2;setDraw(line);pdf.line(L+6,y-1.8,W-R-6,y-1.8);
    }

    /* Header: light, airy, same language as Partner Hub */
    setFill(soft);setDraw(line);pdf.roundedRect(L,12,CW,52,6,6,'FD');
    const logoDrawn=drawLogo(L+8,20,46,13);
    if(!logoDrawn){pdf.setFontSize(11);setText(navy);pdf.text('Агроинтеллект',L+8,28)}
    pdf.setFontSize(22);setText(navy);pdf.text('Расчёт стоимости лицензии',L+8,43);
    pdf.setFontSize(9.2);setText(muted);pdf.text('Коммерческий расчёт по выбранным продуктам и параметрам',L+8,50);
    pdf.setFontSize(8.7);pdf.text('Дата расчёта: '+new Date().toLocaleDateString('ru-RU'),L+8,57);
    y=72;

    const gap=5,mw=(CW-gap*2)/3;
    metric(L,'ПЕРИОД',typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`,mw);
    metric(L+mw+gap,'ХОЗЯЙСТВ',String(s.farms.length),mw);
    metric(L+(mw+gap)*2,'В МЕСЯЦ',money(s.monthly),mw);
    y+=30;

    s.farms.forEach((f,i)=>{
      const linesCount=Math.max(1,(f.selected||[]).length)+2;
      ensure(18+linesCount*7);
      setFill(blueSoft);pdf.roundedRect(L,y-4,CW,11,3,3,'F');
      pdf.setFontSize(11.5);setText(navy);pdf.text(f.name||`Хозяйство №${i+1}`,L+6,y+3);
      y+=12;
      row('Поголовье',`${f.heads} голов`);
      if((f.selected||[]).length){
        (f.selected||[]).forEach(k=>{
          let price=0;try{price=window.v9ProductPrice(k,f.heads)}catch(e){}
          row(PRODUCT_NAMES[k]||k,`${money(price)} / мес.`);
        });
      }else row('Продукты','Не выбраны');
      row('Итого по хозяйству',`${money(f.monthly)} / мес.`,true);
      y+=7;
    });

    ensure(52);
    setFill(blueSoft);setDraw([203,226,246]);pdf.roundedRect(L,y-3,CW,44,6,6,'FD');
    pdf.setFontSize(9);setText(blue);pdf.text('ИТОГОВЫЙ РАСЧЁТ',L+7,y+5);
    pdf.setFontSize(9.5);setText(muted);pdf.text('Стоимость до скидки',L+7,y+14);
    setText(text);pdf.text(money(s.gross),W-R-7,y+14,{align:'right'});
    setText(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,L+7,y+22);
    setText(text);pdf.text('− '+money(s.discountAmount),W-R-7,y+22,{align:'right'});
    setDraw([195,218,239]);pdf.line(L+7,y+27,W-R-7,y+27);
    pdf.setFontSize(11.5);setText(navy);pdf.text('Итого к оплате',L+7,y+36);
    pdf.setFontSize(17);setText(blue);pdf.text(money(s.final),W-R-7,y+36,{align:'right'});
    y+=52;

    ensure(28);
    setDraw(line);pdf.line(L,y,W-R,y);y+=7;
    pdf.setFontSize(8.5);setText(muted);
    pdf.text('Расчёт сформирован в партнёрском кабинете Агроинтеллект.',L,y);y+=5;
    pdf.text('Стоимость указана согласно выбранным параметрам расчёта.',L,y);y+=7;
    pdf.setFontSize(8.5);setText(blue);pdf.text('agrointellect.ru',L,y);

    const blob=pdf.output('blob');
    if(!blob||blob.size<1000)throw new Error('PDF-файл пустой');
    return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };

  function canFileShare(file){return !!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))}
  function fresh(){return cachedFile&&(Date.now()-cacheStamp<MAX_AGE)}
  function invalidate(){cachedFile=null;cacheStamp=0;clearTimeout(warmTimer);warmTimer=setTimeout(warm,1000)}
  async function build(){
    if(fresh())return cachedFile;
    if(building)return building;
    building=(async()=>{const f=await window.v9BuildPdfFile();cachedFile=f;cacheStamp=Date.now();return f})();
    try{return await building}finally{building=null}
  }
  function warm(){if(document.hidden||!document.querySelector('.calculator-page')||fresh()||building)return;build().catch(()=>{})}

  function sheetFor(file){
    let sheet=document.getElementById('mobilePdfSheetV31');
    if(!sheet){
      sheet=document.createElement('div');sheet.id='mobilePdfSheetV31';
      sheet.innerHTML=`<div class="v31-shade" data-close></div><div class="v31-card"><button class="v31-x" data-close>×</button><div class="v31-icon">PDF</div><h3>Расчёт готов</h3><p>Файл готов к отправке клиенту.</p><button class="v31-primary" id="v31Share">Поделиться расчётом</button><button class="v31-secondary" id="v31Open">Открыть PDF</button></div>`;
      document.body.appendChild(sheet);
      sheet.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>sheet.classList.remove('show'));
    }
    const share=sheet.querySelector('#v31Share'),open=sheet.querySelector('#v31Open');
    share.style.display=canFileShare(file)?'flex':'none';
    share.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[file]}).then(()=>sheet.classList.remove('show')).catch(e=>{if(e?.name!=='AbortError')console.warn(e)});
    open.onclick=()=>{const u=URL.createObjectURL(file);const w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)};
    sheet.classList.add('show');
  }

  window.v9ShareCalculation=async function(){
    const btn=document.getElementById('v9Share');
    const old=btn?.textContent||'Поделиться';
    try{
      if(fresh()&&canFileShare(cachedFile))return await navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[cachedFile]});
      if(btn){btn.disabled=true;btn.textContent='Готовим расчёт…'}
      const file=await build();
      sheetFor(file);
    }catch(e){if(e?.name!=='AbortError'){console.error(e);alert('Не удалось подготовить PDF. Попробуйте ещё раз.')}}finally{if(btn){btn.disabled=false;btn.textContent=old}}
  };
  window.v9PrintCalculation=async function(){
    const btn=document.getElementById('v9Print');const old=btn?.textContent||'PDF / Печать';
    try{if(btn){btn.disabled=true;btn.textContent='Готовим PDF…'}const file=await build();sheetFor(file)}finally{if(btn){btn.disabled=false;btn.textContent=old}}
  };

  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('.calculator-page')&&!e.target.closest('#v9Share,#v9Print,#mobilePdfSheetV31'))invalidate()},true);

  const style=document.createElement('style');style.textContent=`
    #mobilePdfSheetV31{position:fixed;inset:0;z-index:13000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}
    #mobilePdfSheetV31.show{display:flex}.v31-shade{position:absolute;inset:0;background:rgba(15,39,66,.35);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
    .v31-card{position:relative;width:calc(100% - 24px);max-width:520px;margin:12px;padding:22px 18px 18px;border-radius:22px;background:#fff;border:1px solid #dfe7ef;box-shadow:0 24px 70px rgba(15,39,66,.2);text-align:center;color:#17324a}
    .v31-x{position:absolute;right:12px;top:10px;width:38px;height:38px;border:0;border-radius:12px;background:#f1f5f8;color:#587086;font-size:24px}.v31-icon{width:54px;height:54px;margin:0 auto 12px;display:grid;place-items:center;border-radius:16px;background:#e9f4ff;color:#1687f8;font-weight:800}
    .v31-card h3{margin:0 0 7px;font-size:21px}.v31-card p{margin:0 0 18px;color:#64748b}.v31-primary,.v31-secondary{width:100%;min-height:46px;border-radius:13px;font:inherit;font-weight:650;margin-top:8px}
    .v31-primary{border:0;background:#1687f8;color:#fff}.v31-secondary{border:1px solid #d8e3ed;background:#fff;color:#314b66}
  `;document.head.appendChild(style);
  setTimeout(warm,1000);
})();