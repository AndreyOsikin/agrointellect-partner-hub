/* Partner Hub share calculation v37 — direct canvas PNG, no html2canvas. */
(function(){
  if(window.__partnerShareV37)return;window.__partnerShareV37=true;
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
  const PRODUCT_NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  const PRODUCT_IMAGES={onlinefarm:'./assets/product-onlinefarm.webp',milk:'./assets/product-milk.webp',musoft:'./assets/product-musoft.webp'};
  const LOGO='./assets/agrointellect-logo-full.webp';
  const cache={file:null,stamp:0,promise:null};
  const MAX_AGE=5*60*1000;

  const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽';
  const period=()=>{try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}};
  const summary=()=>{if(typeof window.v9Summary!=='function')throw new Error('Данные расчёта недоступны');return window.v9Summary()};

  function rr(ctx,x,y,w,h,r,fill,stroke){
    r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}
  }
  function line(ctx,x1,y1,x2,y2,color='#E3EBF3',width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  function text(ctx,t,x,y,size=28,color='#17324A',weight=500,align='left'){
    ctx.font=`${weight} ${size}px -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(t),x,y)
  }
  function loadImg(src){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src})}
  function contain(ctx,img,x,y,w,h){if(!img)return;const r=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*r,dh=img.naturalHeight*r;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
  function canShare(file){return !!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))}

  async function buildImage(){
    const s=summary(),farms=s.farms||[];
    const extra=Math.max(0,farms.length-1)*270;
    const W=1080,H=1420+extra,px=54,cw=W-px*2;
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{alpha:false});
    ctx.fillStyle='#F6F8FA';ctx.fillRect(0,0,W,H);
    const [logo,...prodImgs]=await Promise.all([loadImg(LOGO),...Object.values(PRODUCT_IMAGES).map(loadImg)]);
    const imgMap={onlinefarm:prodImgs[0],milk:prodImgs[1],musoft:prodImgs[2]};

    // Main white sheet.
    rr(ctx,30,30,W-60,H-60,32,'#FFFFFF','#E4EBF2');
    let y=70;
    contain(ctx,logo,px,y,250,72);
    text(ctx,'Расчёт стоимости лицензии',px,y+126,48,'#17324A',700);
    text(ctx,'Коммерческий расчёт по выбранным продуктам и параметрам',px,y+170,23,'#718399',500);
    rr(ctx,W-px-215,y+5,215,76,20,'#F4F8FC','#DFE8F1');
    text(ctx,'Дата расчёта',W-px-190,y+34,18,'#8193A6',500);
    text(ctx,new Date().toLocaleDateString('ru-RU'),W-px-25,y+65,25,'#17324A',700,'right');
    y+=225;

    // Metrics.
    const gap=18,mw=(cw-gap*2)/3;
    const metrics=[['Период',period()],['Хозяйств',String(farms.length)],['Стоимость в месяц',money(s.monthly)]];
    metrics.forEach((m,i)=>{const x=px+i*(mw+gap);rr(ctx,x,y,mw,118,24,'#FFFFFF','#DDE7F0');ctx.beginPath();ctx.arc(x+48,y+59,27,0,Math.PI*2);ctx.fillStyle='#EEF6FD';ctx.fill();text(ctx,m[0],x+90,y+46,18,'#7A8EA3',500);text(ctx,m[1],x+90,y+82,27,'#17324A',700)});
    y+=148;

    // Farms.
    farms.forEach((f,fi)=>{
      const selected=f.selected||[];
      const cardH=120+selected.length*82+92;
      rr(ctx,px,y,cw,cardH,28,'#FFFFFF','#DDE7F0');
      text(ctx,f.name||`Хозяйство №${fi+1}`,px+34,y+58,30,'#17324A',700);
      let ry=y+96;
      selected.forEach(k=>{
        rr(ctx,px+28,ry-40,58,58,15,'#F5F8FB','#E1E8F0');contain(ctx,imgMap[k],px+34,ry-34,46,46);
        text(ctx,PRODUCT_NAMES[k]||k,px+104,ry,24,'#29445F',600);
        let price=0;try{price=window.v9ProductPrice(k,f.heads)}catch(e){}
        text(ctx,`${money(price)} / мес.`,px+cw-34,ry,24,'#17324A',600,'right');
        line(ctx,px+104,ry+27,px+cw-34,ry+27);ry+=82;
      });
      text(ctx,'Поголовье',px+34,ry,22,'#60778D',500);text(ctx,`${f.heads} голов`,px+cw-34,ry,23,'#17324A',600,'right');ry+=52;
      rr(ctx,px+18,ry-10,cw-36,62,17,'#F2F8FD',null);text(ctx,'Итого по хозяйству',px+34,ry+29,23,'#267FE8',700);text(ctx,`${money(f.monthly)} / мес.`,px+cw-34,ry+29,24,'#267FE8',700,'right');
      y+=cardH+22;
    });

    // Total.
    rr(ctx,px,y,cw,225,28,'#F4F9FD','#D5E6F4');
    text(ctx,'Итоговый расчёт',px+34,y+50,25,'#267FE8',700);
    text(ctx,'Стоимость до скидки',px+34,y+98,21,'#70859A',500);text(ctx,money(s.gross),px+cw-34,y+98,23,'#17324A',600,'right');
    text(ctx,`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,px+34,y+139,21,'#70859A',500);text(ctx,'− '+money(s.discountAmount),px+cw-34,y+139,23,'#17324A',600,'right');
    line(ctx,px+34,y+162,px+cw-34,y+162,'#D5E3EE');
    text(ctx,'Итого к оплате',px+34,y+204,27,'#17324A',700);text(ctx,money(s.final),px+cw-34,y+204,43,'#267FE8',750,'right');
    y+=255;

    // Friendly closing.
    rr(ctx,px,y,cw,126,24,'#FAFCFE','#E2EAF1');
    text(ctx,'Добрый день!',px+34,y+45,25,'#17324A',700);
    text(ctx,'Направляю Вам расчёт стоимости лицензии Агроинтеллект.',px+34,y+78,20,'#506A82',500);
    text(ctx,'Буду рад ответить на дополнительные вопросы.',px+34,y+107,18,'#7B8FA3',500);
    y+=164;
    line(ctx,px,y,px+cw,y);
    contain(ctx,logo,px,y+22,220,58);
    text(ctx,'agrointellect.ru',px+cw,y+58,19,'#267FE8',600,'right');

    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Не удалось создать изображение')),'image/png',0.96));
    return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.png`,{type:'image/png'});
  }

  async function build(){
    if(cache.file&&Date.now()-cache.stamp<MAX_AGE)return cache.file;
    if(cache.promise)return cache.promise;
    cache.promise=buildImage().then(f=>(cache.file=f,cache.stamp=Date.now(),f));
    try{return await cache.promise}finally{cache.promise=null}
  }
  function invalidate(){cache.file=null;cache.stamp=0;setTimeout(()=>{if(!document.hidden&&document.querySelector('.calculator-page'))build().catch(()=>{})},700)}
  function openFile(file){const u=URL.createObjectURL(file);const w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)}
  function saveFile(file){const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}

  function showSheet(file){
    let s=document.getElementById('shareCalcV37');
    if(!s){
      s=document.createElement('div');s.id='shareCalcV37';
      s.innerHTML=`<div class="sc37shade" data-close></div><div class="sc37card"><button class="sc37x" data-close>×</button><div class="sc37badge">Расчёт</div><h3>Готово к отправке</h3><p>Отправьте клиенту изображение расчёта — оно откроется прямо в сообщении.</p><button id="sc37share" class="sc37primary">Поделиться</button><div class="sc37actions"><button id="sc37open">Открыть</button><button id="sc37save">Сохранить</button></div></div>`;
      document.body.appendChild(s);s.querySelectorAll('[data-close]').forEach(el=>el.onclick=()=>s.classList.remove('show'));
    }
    const sh=s.querySelector('#sc37share');sh.style.display=canShare(file)?'flex':'none';
    sh.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[file]}).then(()=>s.classList.remove('show')).catch(e=>{if(e?.name!=='AbortError')console.warn(e)});
    s.querySelector('#sc37open').onclick=()=>openFile(file);s.querySelector('#sc37save').onclick=()=>saveFile(file);s.classList.add('show');
  }

  window.v9ShareCalculation=async function(){
    const b=document.getElementById('v9Share'),old=b?.textContent||'Поделиться';
    try{
      if(cache.file&&Date.now()-cache.stamp<MAX_AGE&&canShare(cache.file))return navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[cache.file]});
      if(b){b.disabled=true;b.textContent='Готовим изображение…'}
      showSheet(await build());
    }catch(e){if(e?.name!=='AbortError'){console.error(e);alert('Не удалось подготовить изображение расчёта. Попробуйте ещё раз.')}}finally{if(b){b.disabled=false;b.textContent=old}}
  };

  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  setTimeout(()=>{if(document.querySelector('.calculator-page'))build().catch(()=>{})},1000);

  const st=document.createElement('style');st.textContent=`
  #shareCalcV37{position:fixed;inset:0;z-index:16000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}#shareCalcV37.show{display:flex}.sc37shade{position:absolute;inset:0;background:rgba(22,46,73,.28);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}.sc37card{position:relative;width:min(430px,calc(100% - 28px));margin:14px;padding:24px;border-radius:24px;background:#fff;border:1px solid #e1e8ef;box-shadow:0 26px 80px rgba(28,55,84,.18);color:#17324a}.sc37x{position:absolute;right:14px;top:14px;width:38px;height:38px;border:0;border-radius:12px;background:#f4f7fa;color:#60788e;font-size:23px}.sc37badge{display:inline-flex;padding:7px 11px;border-radius:10px;background:#eef6fd;color:#267fe8;font-size:13px;font-weight:700}.sc37card h3{margin:14px 0 7px;font-size:23px;letter-spacing:-.02em}.sc37card p{margin:0 0 20px;color:#6f8294;font-size:14px;line-height:1.45}.sc37primary{width:100%;min-height:48px;border:0;border-radius:14px;background:linear-gradient(135deg,#4b9cf0,#71b9ed);color:#fff;font:inherit;font-weight:700}.sc37actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.sc37actions button{min-height:44px;border:1px solid #dce5ed;border-radius:13px;background:#fff;color:#2b465f;font:inherit;font-weight:650}@media(min-width:700px){#shareCalcV37{align-items:center}.sc37card{margin:0}}
  `;document.head.appendChild(st);
})();