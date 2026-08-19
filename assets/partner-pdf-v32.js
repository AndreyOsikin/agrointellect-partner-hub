/* Partner Hub unified commercial PDF v32 — same generator for desktop and mobile. */
(function(){
  if(window.__partnerHubPdfV32)return;
  window.__partnerHubPdfV32=true;

  const FONT_URL='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  const LOGO_TILE_URL='./assets/agrointellect-logo-tile.webp';
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
  const WEBSITE='agrointellect.ru';
  const FALLBACK_CONTACT={name:'Осокин Андрей',role:'Руководитель коммерческого отдела',phone:'+7 911 854-34-23',email:'osokin@agrointellect.ru'};
  const PRODUCT_NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  const PRODUCT_TINTS={onlinefarm:[235,246,255],milk:[241,248,252],musoft:[242,244,253]};
  const MAX_AGE=5*60*1000;
  let fontPromise=null,logoPromise=null,cachedFile=null,cacheStamp=0,building=null,warmTimer=null;

  function toBase64(buffer){
    const bytes=new Uint8Array(buffer),chunk=0x8000;let binary='';
    for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(binary);
  }
  async function loadFont(){
    if(fontPromise)return fontPromise;
    fontPromise=(async()=>{const r=await fetch(FONT_URL,{cache:'force-cache'});if(!r.ok)throw new Error('Не удалось загрузить PDF-шрифт');return toBase64(await r.arrayBuffer())})();
    return fontPromise;
  }
  async function loadLogo(){
    if(logoPromise)return logoPromise;
    logoPromise=(async()=>{try{const r=await fetch(LOGO_TILE_URL,{cache:'force-cache'});if(!r.ok)return null;return 'data:image/webp;base64,'+toBase64(await r.arrayBuffer())}catch(e){return null}})();
    return logoPromise;
  }
  function money(v){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Math.round(((Number(v)||0)+Number.EPSILON)*100)/100)+' ₽'}
  function getContact(){
    try{
      if(Array.isArray(window.CONTACTS)&&window.CONTACTS.length){
        return window.CONTACTS.find(c=>/коммерческого отдела/i.test(c.role||''))||window.CONTACTS[0]||FALLBACK_CONTACT;
      }
    }catch(e){}
    return FALLBACK_CONTACT;
  }
  function periodLabel(){
    try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}
  }

  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF-библиотека не загрузилась');
    if(typeof window.v9Summary!=='function')throw new Error('Данные расчёта недоступны');

    const [{jsPDF},fontB64,logo]=await Promise.all([Promise.resolve(window.jspdf),loadFont(),loadLogo()]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.addFileToVFS('Play-Regular.ttf',fontB64);pdf.addFont('Play-Regular.ttf','Play','normal');pdf.setFont('Play','normal');

    const s=window.v9Summary(),contact=getContact();
    const W=210,H=297,L=14,R=14,CW=W-L-R;
    const text=[28,48,69],textStrong=[17,43,69],muted=[101,119,137],line=[222,231,239],blue=[38,127,232],blue2=[107,187,247],blueSoft=[240,247,253],soft=[248,250,252],white=[255,255,255];
    let y=13;
    const tc=c=>pdf.setTextColor(c[0],c[1],c[2]),fc=c=>pdf.setFillColor(c[0],c[1],c[2]),dc=c=>pdf.setDrawColor(c[0],c[1],c[2]);

    function ensure(h){if(y+h>H-19){pdf.addPage();drawPageHeader();}}
    function drawBrand(x,yy,small=false){
      if(logo){try{pdf.addImage(logo,'WEBP',x,yy,small?9:12,small?9:12,undefined,'FAST')}catch(e){}}
      pdf.setFontSize(small?9.8:11.5);tc(textStrong);pdf.text('Агроинтеллект',x+(small?12:16),yy+(small?6.2:7.6));
      if(!small){pdf.setFontSize(7.6);tc(muted);pdf.text('Цифровые решения для животноводства',x+16,yy+13)}
    }
    function drawPageHeader(){
      y=12;drawBrand(L,y,true);dc(line);pdf.line(L,25,W-R,25);y=32;
    }
    function roundedCard(x,yy,w,h,fillColor=white,borderColor=line,r=4){fc(fillColor);dc(borderColor);pdf.roundedRect(x,yy,w,h,r,r,'FD')}
    function metric(x,label,value,w){
      roundedCard(x,y,w,24,white,line,4);
      fc(blueSoft);pdf.circle(x+9,y+12,5.2,'F');
      pdf.setFontSize(7.8);tc(muted);pdf.text(label,x+18,y+9);
      pdf.setFontSize(11.6);tc(textStrong);pdf.text(value,x+18,y+17);
    }
    function productRow(name,value,tint){
      ensure(8);fc(tint);pdf.roundedRect(L+3,y-4.2,5.5,5.5,1.4,1.4,'F');
      pdf.setFontSize(8.9);tc(text);pdf.text(name,L+12,y);
      pdf.setFontSize(9.1);tc(textStrong);pdf.text(value,W-R-6,y,{align:'right'});
      y+=7;dc(line);pdf.line(L+12,y-2,W-R-6,y-2);
    }
    function basicRow(label,value,strong=false){
      ensure(8);pdf.setFontSize(strong?9.3:8.8);tc(strong?textStrong:muted);pdf.text(label,L+12,y);
      pdf.setFontSize(strong?9.8:9);tc(textStrong);pdf.text(value,W-R-6,y,{align:'right'});
      y+=7;dc(line);pdf.line(L+12,y-2,W-R-6,y-2);
    }

    /* Hero — global-brand style: white space, soft accent, no dark slab. */
    roundedCard(L,10,CW,58,white,line,6);
    fc([245,250,255]);pdf.ellipse(W-R-18,21,28,20,'F');
    fc([237,247,255]);pdf.ellipse(W-R-5,37,34,25,'F');
    drawBrand(L+8,18,false);
    fc(blue);pdf.roundedRect(L+8,39,1.2,18,.6,.6,'F');
    pdf.setFontSize(23);tc(textStrong);pdf.text('Расчёт стоимости лицензии',L+14,47);
    pdf.setFontSize(9.4);tc(muted);pdf.text('Коммерческий расчёт по выбранным продуктам и параметрам',L+14,54);
    pdf.setFontSize(8.3);pdf.text('Дата расчёта: '+new Date().toLocaleDateString('ru-RU'),L+14,61);
    y=77;

    const gap=5,mw=(CW-gap*2)/3;
    metric(L,'Период',periodLabel(),mw);
    metric(L+mw+gap,'Хозяйств',String(s.farms.length),mw);
    metric(L+(mw+gap)*2,'Стоимость в месяц',money(s.monthly),mw);
    y+=33;

    s.farms.forEach((f,i)=>{
      const count=Math.max(1,(f.selected||[]).length);
      ensure(24+count*7);
      roundedCard(L,y-5,CW,16+count*7+14,white,line,5);
      fc(blueSoft);pdf.roundedRect(L+5,y-1,8,8,2,2,'F');
      pdf.setFontSize(12.3);tc(textStrong);pdf.text(f.name||`Хозяйство №${i+1}`,L+17,y+5);
      y+=15;
      basicRow('Поголовье',`${f.heads} голов`);
      if((f.selected||[]).length){
        (f.selected||[]).forEach(k=>{
          let price=0;try{price=window.v9ProductPrice(k,f.heads)}catch(e){}
          productRow(PRODUCT_NAMES[k]||k,`${money(price)} / мес.`,PRODUCT_TINTS[k]||blueSoft);
        });
      }else basicRow('Продукты','Не выбраны');
      basicRow('Итого по хозяйству',`${money(f.monthly)} / мес.`,true);
      y+=9;
    });

    ensure(56);
    /* Total — attractive without a solid blue block. */
    roundedCard(L,y-4,CW,50,[247,251,255],[200,224,245],6);
    fc([232,244,255]);pdf.circle(L+14,y+10,8,'F');
    pdf.setFontSize(9.2);tc(blue);pdf.text('Итоговый расчёт',L+27,y+4);
    pdf.setFontSize(9.2);tc(muted);pdf.text('Стоимость до скидки',L+27,y+14);tc(textStrong);pdf.text(money(s.gross),W-R-8,y+14,{align:'right'});
    tc(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,L+27,y+22);tc(textStrong);pdf.text('− '+money(s.discountAmount),W-R-8,y+22,{align:'right'});
    dc([199,220,240]);pdf.line(L+27,y+28,W-R-8,y+28);
    pdf.setFontSize(11.8);tc(textStrong);pdf.text('Итого к оплате',L+27,y+38);
    pdf.setFontSize(19);tc(blue);pdf.text(money(s.final),W-R-8,y+39,{align:'right'});
    y+=57;

    ensure(35);
    /* Friendly handoff block */
    roundedCard(L,y-4,CW,29,[250,252,254],line,5);
    fc([235,246,255]);pdf.circle(L+11,y+8,6,'F');
    pdf.setFontSize(10.5);tc(textStrong);pdf.text('Добрый день!',L+22,y+5);
    pdf.setFontSize(8.8);tc(text);pdf.text('Направляю Вам расчёт стоимости лицензии Агроинтеллект.',L+22,y+12);
    pdf.setFontSize(8.2);tc(muted);pdf.text('Буду рад ответить на дополнительные вопросы.',L+22,y+19);
    y+=37;

    ensure(34);
    dc(line);pdf.line(L,y,W-R,y);y+=7;
    drawBrand(L,y,false);
    pdf.setFontSize(8.3);tc(text);pdf.text(contact.phone||FALLBACK_CONTACT.phone,L+88,y+3);
    pdf.text(contact.email||FALLBACK_CONTACT.email,L+88,y+9);
    tc(blue);pdf.text(WEBSITE,L+88,y+15);
    pdf.setFontSize(7.5);tc(muted);pdf.text('Расчёт сформирован в партнёрском кабинете Агроинтеллект.',L,y+23);
    pdf.text('Стоимость указана согласно выбранным параметрам расчёта.',L,y+28);

    const blob=pdf.output('blob');
    if(!blob||blob.size<1000)throw new Error('PDF-файл пустой');
    return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };

  function canFileShare(file){return !!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))}
  function fresh(){return cachedFile&&(Date.now()-cacheStamp<MAX_AGE)}
  function invalidate(){cachedFile=null;cacheStamp=0;clearTimeout(warmTimer);warmTimer=setTimeout(warm,900)}
  async function build(){
    if(fresh())return cachedFile;
    if(building)return building;
    building=(async()=>{const f=await window.v9BuildPdfFile();cachedFile=f;cacheStamp=Date.now();return f})();
    try{return await building}finally{building=null}
  }
  function warm(){if(document.hidden||!document.querySelector('.calculator-page')||fresh()||building)return;build().catch(()=>{})}
  function download(file){const u=URL.createObjectURL(file);const a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
  function openFile(file){const u=URL.createObjectURL(file);const w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)}

  function showSheet(file){
    let sheet=document.getElementById('partnerPdfSheetV32');
    if(!sheet){
      sheet=document.createElement('div');sheet.id='partnerPdfSheetV32';
      sheet.innerHTML=`<div class="v32-shade" data-v32-close></div><div class="v32-card"><button class="v32-x" data-v32-close>×</button><div class="v32-icon">PDF</div><h3>Расчёт готов</h3><p>Можно отправить клиенту, открыть или сохранить файл.</p><button class="v32-primary" id="v32Share">Поделиться расчётом</button><button class="v32-secondary" id="v32Open">Открыть PDF</button><button class="v32-secondary" id="v32Download">Скачать PDF</button></div>`;
      document.body.appendChild(sheet);
      sheet.querySelectorAll('[data-v32-close]').forEach(x=>x.onclick=()=>sheet.classList.remove('show'));
    }
    const share=sheet.querySelector('#v32Share'),open=sheet.querySelector('#v32Open'),save=sheet.querySelector('#v32Download');
    share.style.display=canFileShare(file)?'flex':'none';
    share.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[file]}).then(()=>sheet.classList.remove('show')).catch(e=>{if(e?.name!=='AbortError')console.warn(e)});
    open.onclick=()=>openFile(file);save.onclick=()=>download(file);sheet.classList.add('show');
  }

  window.v9ShareCalculation=async function(){
    const btn=document.getElementById('v9Share'),old=btn?.textContent||'Поделиться';
    try{
      if(btn){btn.disabled=true;btn.textContent='Готовим расчёт…'}
      const file=await build();
      if(canFileShare(file)&&/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))showSheet(file);else showSheet(file);
    }catch(e){if(e?.name!=='AbortError'){console.error(e);alert('Не удалось подготовить PDF. Попробуйте ещё раз.')}}finally{if(btn){btn.disabled=false;btn.textContent=old}}
  };
  window.v9PrintCalculation=async function(){
    const btn=document.getElementById('v9Print'),old=btn?.textContent||'PDF / Печать';
    try{if(btn){btn.disabled=true;btn.textContent='Готовим PDF…'}showSheet(await build())}catch(e){console.error(e);alert('Не удалось подготовить PDF. Попробуйте ещё раз.')}finally{if(btn){btn.disabled=false;btn.textContent=old}}
  };

  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('.calculator-page')&&!e.target.closest('#v9Share,#v9Print,#partnerPdfSheetV32'))invalidate()},true);

  const style=document.createElement('style');style.textContent=`
  #partnerPdfSheetV32{position:fixed;inset:0;z-index:14000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}#partnerPdfSheetV32.show{display:flex}
  .v32-shade{position:absolute;inset:0;background:rgba(33,55,76,.28);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
  .v32-card{position:relative;width:min(520px,calc(100% - 24px));margin:12px;padding:22px 18px 18px;border-radius:22px;background:#fff;border:1px solid #dde7f0;box-shadow:0 24px 70px rgba(38,67,96,.16);text-align:center;color:#1c3045}
  .v32-x{position:absolute;right:12px;top:10px;width:38px;height:38px;border:0;border-radius:12px;background:#f3f6f9;color:#64788b;font-size:24px}.v32-icon{width:54px;height:54px;margin:0 auto 12px;display:grid;place-items:center;border-radius:16px;background:#edf6ff;color:#267fe8;font-weight:800}
  .v32-card h3{margin:0 0 7px;font-size:21px}.v32-card p{margin:0 0 16px;color:#6b7f91}.v32-primary,.v32-secondary{width:100%;min-height:46px;border-radius:13px;font:inherit;font-weight:650;margin-top:8px}
  .v32-primary{border:0;background:linear-gradient(135deg,#3d91ee,#72bdf6);color:#fff}.v32-secondary{border:1px solid #d8e3ed;background:#fff;color:#314b66}
  @media(min-width:768px){#partnerPdfSheetV32{align-items:center}.v32-card{margin:auto}}
  `;document.head.appendChild(style);
  setTimeout(warm,900);
})();