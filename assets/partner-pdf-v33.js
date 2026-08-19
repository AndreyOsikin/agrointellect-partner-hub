/* Partner Hub commercial PDF v33 — reference-aligned, desktop + mobile, jsPDF only. */
(function(){
  if(window.__partnerHubPdfV33)return; window.__partnerHubPdfV33=true;
  const FONT_URL='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  const LOGO_URL='./assets/agrointellect-logo-tile.webp';
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
  const FALLBACK={name:'Осокин Андрей',role:'Руководитель коммерческого отдела',phone:'+7 911 854-34-23',email:'osokin@agrointellect.ru'};
  const PRODUCTS={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  let fontP=null,logoP=null,cached=null,stamp=0,building=null; const MAX_AGE=300000;
  function b64(buf){const bytes=new Uint8Array(buf);let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+32768,bytes.length)));return btoa(s)}
  async function font(){if(fontP)return fontP;fontP=fetch(FONT_URL,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('PDF font');return r.arrayBuffer()}).then(b64);return fontP}
  async function logo(){if(logoP)return logoP;logoP=fetch(LOGO_URL,{cache:'force-cache'}).then(r=>r.ok?r.arrayBuffer():null).then(x=>x?'data:image/webp;base64,'+b64(x):null).catch(()=>null);return logoP}
  function money(v){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽'}
  function contact(){try{return (window.CONTACTS||[]).find(x=>/коммерческого отдела/i.test(x.role||''))||(window.CONTACTS||[])[0]||FALLBACK}catch(e){return FALLBACK}}
  function period(){try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}}
  function fitText(pdf,text,max,base,min=7){let size=base;pdf.setFontSize(size);while(size>min&&pdf.getTextWidth(text)>max){size-=.4;pdf.setFontSize(size)}return size}

  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF)||typeof window.v9Summary!=='function')throw Error('PDF data unavailable');
    const [{jsPDF},fb,lg]=await Promise.all([Promise.resolve(window.jspdf),font(),logo()]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.addFileToVFS('Play.ttf',fb);pdf.addFont('Play.ttf','Play','normal');pdf.setFont('Play','normal');
    const s=window.v9Summary(),c=contact(); const W=210,H=297,L=14,R=14,CW=182;
    const ink=[25,48,77],text=[43,68,94],muted=[103,123,145],blue=[67,139,232],blue2=[128,193,244],line=[218,229,239],soft=[248,251,254],softBlue=[240,247,253],white=[255,255,255];
    const tc=x=>pdf.setTextColor(...x),fc=x=>pdf.setFillColor(...x),dc=x=>pdf.setDrawColor(...x);
    const card=(x,y,w,h,fill=white,border=line,r=4)=>{fc(fill);dc(border);pdf.roundedRect(x,y,w,h,r,r,'FD')};
    const brand=(x,y,scale=1)=>{if(lg)try{pdf.addImage(lg,'WEBP',x,y,11*scale,11*scale,undefined,'FAST')}catch(e){};pdf.setFontSize(10.5*scale);tc(ink);pdf.text('Агроинтеллект',x+14*scale,y+6.5*scale);pdf.setFontSize(6.6*scale);tc(muted);pdf.text('Цифровые решения для животноводства',x+14*scale,y+11.8*scale)};
    const metric=(x,y,w,label,value)=>{card(x,y,w,22,white,line,4);fc(softBlue);pdf.circle(x+10,y+11,5,'F');pdf.setFontSize(7.3);tc(muted);pdf.text(label,x+18,y+8);fitText(pdf,value,w-23,10.5,8);tc(ink);pdf.text(value,x+18,y+16)};

    // Header — like approved reference: open white area, no dark slab.
    brand(L,14,1.02);
    pdf.setFontSize(7.8);tc(muted);pdf.text('Дата расчёта',W-R-37,17);pdf.setFontSize(10.4);tc(ink);pdf.text(new Date().toLocaleDateString('ru-RU'),W-R,24,{align:'right'});
    fc(blue);pdf.roundedRect(L,42,1.2,22,.6,.6,'F');
    pdf.setFontSize(25);tc(ink);pdf.text('Расчёт стоимости лицензии',L+7,51);
    pdf.setFontSize(10.3);tc(muted);pdf.text('Коммерческий расчёт по выбранным продуктам и параметрам',L+7,59);
    dc(line);pdf.line(L,70,W-R,70);

    let y=78; const gap=6,mw=(CW-gap*2)/3;
    metric(L,y,mw,'Период',period());metric(L+mw+gap,y,mw,'Хозяйств',String(s.farms.length));metric(L+(mw+gap)*2,y,mw,'Стоимость в месяц',money(s.monthly));
    y=108;

    // Main content uses two-column composition from the approved reference when one farm fits.
    const leftW=116,rightW=60,colGap=6;
    const farms=s.farms||[];
    if(farms.length===1){
      const f=farms[0]; const rows=2+Math.max(1,(f.selected||[]).length); const boxH=Math.max(66,24+rows*8);
      card(L,y,leftW,boxH,white,line,5);
      fc(softBlue);pdf.roundedRect(L+6,y+7,9,9,2,2,'F');pdf.setFontSize(12);tc(blue);pdf.text('⌂',L+8.2,y+13.5);
      pdf.setFontSize(13);tc(ink);pdf.text(f.name||'Хозяйство №1',L+20,y+14);
      let ry=y+25;
      const row=(name,val,strong=false)=>{pdf.setFontSize(strong?9.4:8.8);tc(strong?blue:text);pdf.text(name,L+8,ry);pdf.setFontSize(strong?9.6:8.9);tc(strong?blue:ink);pdf.text(val,L+leftW-8,ry,{align:'right'});ry+=8;dc(line);pdf.line(L+8,ry-3,L+leftW-8,ry-3)};
      row('Поголовье',`${f.heads} голов`);
      if((f.selected||[]).length)(f.selected||[]).forEach(k=>{let p=0;try{p=window.v9ProductPrice(k,f.heads)}catch(e){};row(PRODUCTS[k]||k,`${money(p)} / мес.`)});else row('Продукты','Не выбраны');
      row('Итого по хозяйству',`${money(f.monthly)} / мес.`,true);

      card(L+leftW+colGap,y,rightW,boxH,[250,252,254],[211,226,239],5);
      fc(softBlue);pdf.circle(L+leftW+colGap+12,y+13,7,'F');pdf.setFontSize(9);tc(blue);pdf.text('Итоговый расчёт',L+leftW+colGap+23,y+11);
      let tx=L+leftW+colGap+7, tv=W-R-7;
      pdf.setFontSize(8.4);tc(muted);pdf.text('Стоимость до скидки',tx,y+28);tc(ink);pdf.text(money(s.gross),tv,y+28,{align:'right'});
      tc(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,tx,y+38);tc(ink);pdf.text('− '+money(s.discountAmount),tv,y+38,{align:'right'});
      dc(line);pdf.line(tx,y+45,tv,y+45);pdf.setFontSize(10.2);tc(ink);pdf.text('Итого к оплате',tx,y+57);fitText(pdf,money(s.final),rightW-15,18,13);tc(blue);pdf.text(money(s.final),tv,y+58,{align:'right'});
      y+=boxH+10;
    }else{
      // Multiple farms stay readable; compact stacked cards, then total.
      farms.forEach((f,i)=>{const count=Math.max(1,(f.selected||[]).length);const h=24+(count+2)*7; if(y+h>220){pdf.addPage();brand(L,13,.85);dc(line);pdf.line(L,29,W-R,29);y=38} card(L,y,CW,h,white,line,5);pdf.setFontSize(12);tc(ink);pdf.text(f.name||`Хозяйство №${i+1}`,L+8,y+12);let ry=y+23;const row=(a,b,strong=false)=>{pdf.setFontSize(8.6);tc(strong?blue:text);pdf.text(a,L+8,ry);tc(strong?blue:ink);pdf.text(b,W-R-8,ry,{align:'right'});ry+=7};row('Поголовье',`${f.heads} голов`);(f.selected||[]).forEach(k=>{let p=0;try{p=window.v9ProductPrice(k,f.heads)}catch(e){};row(PRODUCTS[k]||k,`${money(p)} / мес.`)});row('Итого по хозяйству',`${money(f.monthly)} / мес.`,true);y+=h+6});
      card(L,y,CW,40,softBlue,[205,226,244],5);pdf.setFontSize(9);tc(blue);pdf.text('Итоговый расчёт',L+8,y+10);pdf.setFontSize(8.5);tc(muted);pdf.text('Стоимость до скидки',L+8,y+20);tc(ink);pdf.text(money(s.gross),W-R-8,y+20,{align:'right'});tc(muted);pdf.text(`Скидка ${s.disc}%`,L+8,y+28);tc(ink);pdf.text('− '+money(s.discountAmount),W-R-8,y+28,{align:'right'});pdf.setFontSize(12);tc(ink);pdf.text('Итого к оплате',L+8,y+36);pdf.setFontSize(16);tc(blue);pdf.text(money(s.final),W-R-8,y+36,{align:'right'});y+=48;
    }

    // Friendly handoff — visually meaningful, not giant.
    if(y>226){pdf.addPage();brand(L,13,.85);dc(line);pdf.line(L,29,W-R,29);y=38}
    card(L,y,CW,28,[250,252,254],line,5);fc(softBlue);pdf.circle(L+11,y+14,6,'F');pdf.setFontSize(10.5);tc(ink);pdf.text('Добрый день!',L+23,y+10);pdf.setFontSize(8.8);tc(text);pdf.text('Направляю Вам расчёт стоимости лицензии Агроинтеллект.',L+23,y+17);pdf.setFontSize(8);tc(muted);pdf.text('Буду рад ответить на дополнительные вопросы.',L+23,y+23);y+=38;

    // Footer anchored near page bottom so a 1-farm proposal remains one strong page.
    const fy=Math.max(y,258);dc(line);pdf.line(L,fy,W-R,fy);brand(L,fy+7,.85);pdf.setFontSize(8.2);tc(text);pdf.text(c.phone||FALLBACK.phone,L+95,fy+10);pdf.text(c.email||FALLBACK.email,L+95,fy+16);tc(blue);pdf.text('agrointellect.ru',L+95,fy+22);pdf.setFontSize(7.2);tc(muted);pdf.text('Расчёт сформирован в партнёрском кабинете Агроинтеллект.',L,fy+27);

    const blob=pdf.output('blob');if(!blob||blob.size<1000)throw Error('PDF empty');return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };

  function canShare(f){return !!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[f]})))}
  async function build(){if(cached&&Date.now()-stamp<MAX_AGE)return cached;if(building)return building;building=window.v9BuildPdfFile().then(f=>(cached=f,stamp=Date.now(),f));try{return await building}finally{building=null}}
  function invalidate(){cached=null;stamp=0}
  function download(f){const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
  function open(f){const u=URL.createObjectURL(f),w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)}
  function sheet(f){let s=document.getElementById('partnerPdfSheetV33');if(!s){s=document.createElement('div');s.id='partnerPdfSheetV33';s.innerHTML='<div class="v33shade" data-close></div><div class="v33card"><button class="v33x" data-close>×</button><div class="v33ico">PDF</div><h3>Расчёт готов</h3><p>Файл готов к отправке клиенту.</p><button id="v33share" class="v33primary">Поделиться расчётом</button><button id="v33open" class="v33secondary">Открыть PDF</button><button id="v33save" class="v33secondary">Скачать PDF</button></div>';document.body.appendChild(s);s.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>s.classList.remove('show'))}const sh=s.querySelector('#v33share');sh.style.display=canShare(f)?'flex':'none';sh.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[f]}).catch(()=>{});s.querySelector('#v33open').onclick=()=>open(f);s.querySelector('#v33save').onclick=()=>download(f);s.classList.add('show')}
  window.v9ShareCalculation=async function(){const b=document.getElementById('v9Share'),o=b?.textContent;try{if(b){b.disabled=true;b.textContent='Готовим расчёт…'}sheet(await build())}catch(e){console.error(e);alert('Не удалось подготовить PDF. Попробуйте ещё раз.')}finally{if(b){b.disabled=false;b.textContent=o||'Поделиться'}}};
  window.v9PrintCalculation=async function(){const b=document.getElementById('v9Print'),o=b?.textContent;try{if(b){b.disabled=true;b.textContent='Готовим PDF…'}sheet(await build())}finally{if(b){b.disabled=false;b.textContent=o||'PDF / Печать'}}};
  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  const st=document.createElement('style');st.textContent='#partnerPdfSheetV33{position:fixed;inset:0;z-index:14000;display:none;align-items:flex-end;justify-content:center}#partnerPdfSheetV33.show{display:flex}.v33shade{position:absolute;inset:0;background:rgba(31,55,81,.28);backdrop-filter:blur(5px)}.v33card{position:relative;width:calc(100% - 24px);max-width:500px;margin:12px;padding:22px 18px 18px;border-radius:22px;background:#fff;border:1px solid #dce7f0;box-shadow:0 22px 60px rgba(30,60,90,.16);text-align:center;color:#1c3048}.v33x{position:absolute;right:12px;top:10px;width:38px;height:38px;border:0;border-radius:12px;background:#f2f6f9;font-size:24px;color:#62778c}.v33ico{width:54px;height:54px;margin:0 auto 12px;display:grid;place-items:center;border-radius:16px;background:#edf6ff;color:#438be8;font-weight:800}.v33card h3{margin:0 0 7px;font-size:21px}.v33card p{margin:0 0 18px;color:#6b7e92}.v33primary,.v33secondary{width:100%;min-height:46px;border-radius:13px;font:inherit;font-weight:650;margin-top:8px}.v33primary{border:0;background:linear-gradient(135deg,#5a9bea,#82c1f2);color:#fff}.v33secondary{border:1px solid #d7e3ed;background:#fff;color:#314b66}';document.head.appendChild(st);
})();