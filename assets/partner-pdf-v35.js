/* Partner Hub commercial PDF v35 — dense A4 layout + refined share sheet. */
(function(){
  if(window.__partnerHubPdfV35)return;window.__partnerHubPdfV35=true;
  const FONT_URL='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  const LOGO_URL='./assets/agrointellect-logo-tile.webp';
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
  const FALLBACK={name:'Осокин Андрей',role:'Руководитель коммерческого отдела',phone:'+7 911 854-34-23',email:'osokin@agrointellect.ru'};
  const PRODUCTS={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  let fontP,logoP,cached,stamp=0,building;const MAX_AGE=300000;
  const b64=buf=>{const a=new Uint8Array(buf);let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,Math.min(i+32768,a.length)));return btoa(s)};
  const font=()=>fontP||(fontP=fetch(FONT_URL,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('font');return r.arrayBuffer()}).then(b64));
  const logo=()=>logoP||(logoP=fetch(LOGO_URL,{cache:'force-cache'}).then(r=>r.ok?r.arrayBuffer():null).then(x=>x?'data:image/webp;base64,'+b64(x):null).catch(()=>null));
  const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽';
  const contact=()=>{try{return (window.CONTACTS||[]).find(x=>/коммерческого отдела/i.test(x.role||''))||(window.CONTACTS||[])[0]||FALLBACK}catch(e){return FALLBACK}};
  const period=()=>{try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}};
  function fit(pdf,t,max,base,min=7){let z=base;pdf.setFontSize(z);while(z>min&&pdf.getTextWidth(t)>max){z-=.35;pdf.setFontSize(z)}return z}

  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF)||typeof window.v9Summary!=='function')throw Error('PDF data unavailable');
    const [{jsPDF},fb,lg]=await Promise.all([Promise.resolve(window.jspdf),font(),logo()]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.addFileToVFS('Play.ttf',fb);pdf.addFont('Play.ttf','Play','normal');pdf.setFont('Play','normal');
    const s=window.v9Summary(),c=contact(),W=210,H=297,L=11,R=11,CW=188;
    const ink=[19,44,74],text=[47,72,98],muted=[99,119,141],blue=[67,139,232],line=[215,227,238],soft=[247,250,253],softBlue=[238,246,253],white=[255,255,255],green=[67,180,120],violet=[123,91,210];
    const tc=x=>pdf.setTextColor(...x),fc=x=>pdf.setFillColor(...x),dc=x=>pdf.setDrawColor(...x),card=(x,y,w,h,fill=white,border=line,r=4)=>{fc(fill);dc(border);pdf.roundedRect(x,y,w,h,r,r,'FD')};
    const brand=(x,y,scale=1)=>{if(lg)try{pdf.addImage(lg,'WEBP',x,y,12*scale,12*scale,undefined,'FAST')}catch(e){};pdf.setFontSize(11.5*scale);tc(ink);pdf.text('Агроинтеллект',x+15*scale,y+7*scale);pdf.setFontSize(6.8*scale);tc(muted);pdf.text('Цифровые решения для животноводства',x+15*scale,y+12.2*scale)};
    const iconCircle=(x,y,ch,color=blue)=>{fc(softBlue);pdf.circle(x,y,6.3,'F');pdf.setFontSize(10);tc(color);pdf.text(ch,x,y+3,{align:'center'})};

    /* HERO: 78 mm, close to approved mockup proportions */
    card(L,9,CW,71,white,line,5);
    brand(L+7,16,1.02);
    pdf.setFontSize(7.5);tc(muted);pdf.text('Дата расчёта',W-R-40,18);pdf.setFontSize(10.5);tc(ink);pdf.text(new Date().toLocaleDateString('ru-RU'),W-R-7,25,{align:'right'});
    /* soft visual hero on the right, prepared for future farm photo */
    fc([246,250,254]);pdf.roundedRect(129,9,70,71,0,5,'F');
    fc([235,245,253]);pdf.ellipse(171,30,42,24,'F');fc([229,242,252]);pdf.ellipse(184,54,35,20,'F');
    dc([222,235,246]);for(let i=0;i<5;i++)pdf.line(142+i*10,59,159+i*7,36);
    fc(blue);pdf.roundedRect(L+7,44,1.3,21,.65,.65,'F');
    pdf.setFontSize(24.5);tc(ink);pdf.text('Расчёт стоимости лицензии',L+13,52);
    pdf.setFontSize(9.8);tc(muted);pdf.text('Коммерческий расчёт по выбранным продуктам и параметрам',L+13,60);

    /* METRICS */
    let y=86,g=4,mw=(CW-g*2)/3;
    function metric(x,label,value,icon){card(x,y,mw,27,white,line,4);iconCircle(x+11,y+13.5,icon);pdf.setFontSize(7.7);tc(muted);pdf.text(label,x+23,y+10);fit(pdf,value,mw-28,11.5,8.8);tc(ink);pdf.text(value,x+23,y+19)}
    metric(L,'Период',period(),'⌚');metric(L+mw+g,'Хозяйств',String(s.farms.length),'●');metric(L+(mw+g)*2,'Стоимость в месяц',money(s.monthly),'₽');
    y=119;

    const farms=s.farms||[];
    if(farms.length===1){
      const f=farms[0],leftW=121,gap=4,rightW=CW-leftW-gap,rows=Math.max(1,(f.selected||[]).length)+2,boxH=Math.max(74,29+rows*8.4);
      card(L,y,leftW,boxH,white,line,4.5);card(L+leftW+gap,y,rightW,boxH,[249,252,255],[210,225,239],4.5);
      iconCircle(L+12,y+14,'⌂');pdf.setFontSize(13.5);tc(ink);pdf.text(f.name||'Хозяйство №1',L+23,y+18);
      let ry=y+31;
      const prow=(label,val,color=null,strong=false)=>{if(color){fc(color);pdf.roundedRect(L+8,ry-4.8,6,6,1.4,1.4,'F')}pdf.setFontSize(strong?9.6:9);tc(strong?blue:text);pdf.text(label,L+(color?18:8),ry);pdf.setFontSize(strong?9.9:9.2);tc(strong?blue:ink);pdf.text(val,L+leftW-8,ry,{align:'right'});ry+=8.4;dc(line);pdf.line(L+8,ry-3,L+leftW-8,ry-3)};
      const colors={onlinefarm:blue,milk:green,musoft:violet};
      (f.selected||[]).forEach(k=>{let p=0;try{p=window.v9ProductPrice(k,f.heads)}catch(e){};prow(PRODUCTS[k]||k,`${money(p)} / мес.`,colors[k])});
      prow('Поголовье',`${f.heads} голов`);prow('Итого по хозяйству',`${money(f.monthly)} / мес.`,null,true);

      iconCircle(L+leftW+gap+13,y+15,'₽');pdf.setFontSize(9.3);tc(blue);pdf.text('ИТОГОВЫЙ РАСЧЁТ',L+leftW+gap+25,y+12);
      const tx=L+leftW+gap+8,tv=W-R-8;
      pdf.setFontSize(8.5);tc(muted);pdf.text('Стоимость до скидки',tx,y+34);tc(ink);pdf.text(money(s.gross),tv,y+34,{align:'right'});
      tc(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,tx,y+45);tc(ink);pdf.text('− '+money(s.discountAmount),tv,y+45,{align:'right'});
      dc(line);pdf.line(tx,y+54,tv,y+54);
      pdf.setFontSize(11.4);tc(ink);pdf.text('Итого к оплате',tx,y+67);fit(pdf,money(s.final),rightW-16,21,14);tc(blue);pdf.text(money(s.final),tv,y+68,{align:'right'});
      y+=boxH+8;
    }else{
      farms.forEach((f,i)=>{const h=26+(Math.max(1,(f.selected||[]).length)+2)*7.2;if(y+h>222){pdf.addPage();y=18}card(L,y,CW,h);pdf.setFontSize(12.5);tc(ink);pdf.text(f.name||`Хозяйство №${i+1}`,L+9,y+15);let ry=y+27;(f.selected||[]).forEach(k=>{let p=0;try{p=window.v9ProductPrice(k,f.heads)}catch(e){};pdf.setFontSize(8.8);tc(text);pdf.text(PRODUCTS[k]||k,L+9,ry);tc(ink);pdf.text(`${money(p)} / мес.`,W-R-9,ry,{align:'right'});ry+=7.2});pdf.text('Поголовье',L+9,ry);pdf.text(`${f.heads} голов`,W-R-9,ry,{align:'right'});ry+=7.2;tc(blue);pdf.text('Итого по хозяйству',L+9,ry);pdf.text(`${money(f.monthly)} / мес.`,W-R-9,ry,{align:'right'});y+=h+5});
      card(L,y,CW,42,softBlue,[205,225,242],5);pdf.setFontSize(9);tc(blue);pdf.text('ИТОГОВЫЙ РАСЧЁТ',L+9,y+11);pdf.setFontSize(9);tc(muted);pdf.text('Стоимость до скидки',L+9,y+22);tc(ink);pdf.text(money(s.gross),W-R-9,y+22,{align:'right'});tc(muted);pdf.text(`Скидка ${s.disc}%`,L+9,y+31);tc(ink);pdf.text('− '+money(s.discountAmount),W-R-9,y+31,{align:'right'});pdf.setFontSize(12);tc(ink);pdf.text('Итого к оплате',L+9,y+39);pdf.setFontSize(18);tc(blue);pdf.text(money(s.final),W-R-9,y+39,{align:'right'});y+=49;
    }

    /* HANDOFF */
    card(L,y,CW,31,[249,252,255],line,4.5);iconCircle(L+13,y+15,'↗');pdf.setFontSize(11);tc(ink);pdf.text('Добрый день!',L+27,y+11);pdf.setFontSize(9);tc(text);pdf.text('Направляю Вам расчёт стоимости лицензии Агроинтеллект.',L+27,y+19);pdf.setFontSize(8.2);tc(muted);pdf.text('Буду рад ответить на дополнительные вопросы.',L+27,y+26);

    /* FOOTER */
    const fy=262;dc(line);pdf.line(L,fy,W-R,fy);brand(L,fy+7,.9);pdf.setFontSize(8.4);tc(text);pdf.text(c.phone||FALLBACK.phone,L+91,fy+10);pdf.text(c.email||FALLBACK.email,L+91,fy+16);tc(blue);pdf.text('agrointellect.ru',L+91,fy+22);pdf.setFontSize(7.4);tc(muted);pdf.text('Расчёт сформирован в партнёрском кабинете Агроинтеллект.',L+138,fy+10);pdf.text('Стоимость указана согласно выбранным параметрам.',L+138,fy+16);

    const blob=pdf.output('blob');if(!blob||blob.size<1000)throw Error('PDF empty');return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };

  const canShare=f=>!!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[f]})));
  async function build(){if(cached&&Date.now()-stamp<MAX_AGE)return cached;if(building)return building;building=window.v9BuildPdfFile().then(f=>(cached=f,stamp=Date.now(),f));try{return await building}finally{building=null}}
  const invalidate=()=>{cached=null;stamp=0};
  const open=f=>{const u=URL.createObjectURL(f),w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)};
  const save=f=>{const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)};
  function sheet(f){let s=document.getElementById('partnerPdfSheetV35');if(!s){s=document.createElement('div');s.id='partnerPdfSheetV35';s.innerHTML=`<div class="v35shade" data-close></div><div class="v35card"><button class="v35x" data-close>×</button><div class="v35top"><div class="v35ico">PDF</div><div><h3>Расчёт готов</h3><p>Отправьте файл клиенту или откройте его для проверки.</p></div></div><button id="v35share" class="v35primary">Поделиться расчётом</button><div class="v35row"><button id="v35open" class="v35secondary">Открыть</button><button id="v35save" class="v35secondary">Скачать</button></div></div>`;document.body.appendChild(s);s.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>s.classList.remove('show'))}const sh=s.querySelector('#v35share');sh.style.display=canShare(f)?'flex':'none';sh.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[f]}).then(()=>s.classList.remove('show')).catch(()=>{});s.querySelector('#v35open').onclick=()=>open(f);s.querySelector('#v35save').onclick=()=>save(f);s.classList.add('show')}
  window.v9ShareCalculation=async()=>{const b=document.getElementById('v9Share'),o=b?.textContent;try{if(b){b.disabled=true;b.textContent='Готовим расчёт…'}sheet(await build())}catch(e){console.error(e);alert('Не удалось подготовить PDF. Попробуйте ещё раз.')}finally{if(b){b.disabled=false;b.textContent=o||'Поделиться'}}};
  window.v9PrintCalculation=async()=>{const b=document.getElementById('v9Print'),o=b?.textContent;try{if(b){b.disabled=true;b.textContent='Готовим PDF…'}sheet(await build())}finally{if(b){b.disabled=false;b.textContent=o||'PDF / Печать'}}};
  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  const st=document.createElement('style');st.textContent=`#partnerPdfSheetV35{position:fixed;inset:0;z-index:15000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}#partnerPdfSheetV35.show{display:flex}.v35shade{position:absolute;inset:0;background:rgba(25,48,74,.22);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}.v35card{position:relative;width:calc(100% - 28px);max-width:420px;margin:14px;padding:18px;border-radius:24px;background:rgba(255,255,255,.98);border:1px solid #e0e8f0;box-shadow:0 28px 70px rgba(32,58,86,.18);box-sizing:border-box}.v35x{position:absolute;right:12px;top:12px;width:36px;height:36px;border:0;border-radius:12px;background:#f4f7fa;color:#607386;font-size:22px}.v35top{display:flex;align-items:center;gap:13px;padding-right:42px;margin-bottom:16px}.v35ico{flex:0 0 46px;height:46px;border-radius:14px;background:#eef6fd;color:#4d94df;display:grid;place-items:center;font-weight:750;font-size:14px}.v35top h3{margin:0 0 4px;color:#183653;font-size:20px;line-height:1.1}.v35top p{margin:0;color:#708297;font-size:13px;line-height:1.4}.v35primary,.v35secondary{font:inherit;font-weight:650;min-height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;box-sizing:border-box}.v35primary{width:100%;border:0;background:linear-gradient(135deg,#5da4e8,#7ab9ee);color:#fff;box-shadow:0 8px 20px rgba(93,164,232,.2)}.v35row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.v35secondary{width:100%;border:1px solid #dce6ef;background:#fff;color:#29445f}@media(max-width:480px){.v35card{padding:16px;margin:10px;width:calc(100% - 20px);border-radius:22px}.v35top h3{font-size:19px}.v35top p{font-size:12.5px}.v35primary,.v35secondary{min-height:44px}}`;document.head.appendChild(st);
})();