/* Partner Hub share calculation v38 — messenger-first 1080x1350 client card. */
(function(){
  if(window.__partnerShareV38)return;window.__partnerShareV38=true;
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
  const PRODUCT_NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  const PRODUCT_IMAGES={onlinefarm:'./assets/product-onlinefarm.webp',milk:'./assets/product-milk.webp',musoft:'./assets/product-musoft.webp'};
  const LOGO='./assets/agrointellect-logo-full.webp';
  const cache={file:null,stamp:0,promise:null};const MAX_AGE=300000;
  const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽';
  const period=()=>{try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}};
  const summary=()=>{if(typeof window.v9Summary!=='function')throw new Error('Данные расчёта недоступны');return window.v9Summary()};
  function rr(c,x,y,w,h,r,fill,stroke){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
  function line(c,x1,y1,x2,y2,color='#E3EBF3',width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
  function text(c,t,x,y,size=28,color='#17324A',weight=500,align='left'){c.font=`${weight} ${size}px -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(String(t),x,y)}
  function load(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
  function contain(c,img,x,y,w,h){if(!img)return;const k=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*k,dh=img.naturalHeight*k;c.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
  function canShare(f){return !!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[f]})))}
  async function buildImage(){
    const s=summary(),farms=s.farms||[],f=farms[0]||{selected:[],heads:0,monthly:0,name:'Хозяйство'};
    const W=1080,H=1350,P=64,CW=W-P*2,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d',{alpha:false});
    c.fillStyle='#F4F7FA';c.fillRect(0,0,W,H);
    const [logo,of,milk,musoft]=await Promise.all([load(LOGO),load(PRODUCT_IMAGES.onlinefarm),load(PRODUCT_IMAGES.milk),load(PRODUCT_IMAGES.musoft)]);const imgs={onlinefarm:of,milk,musoft};
    rr(c,28,28,W-56,H-56,34,'#FFFFFF','#E4EBF2');
    // Header
    contain(c,logo,P,58,280,84);
    rr(c,W-P-210,58,210,76,20,'#F7FAFD','#E2EAF1');text(c,'Дата расчёта',W-P-185,88,18,'#7B8EA2',500);text(c,new Date().toLocaleDateString('ru-RU'),W-P-28,120,24,'#17324A',700,'right');
    text(c,'Расчёт стоимости лицензии',P,210,50,'#17324A',750);text(c,'Агроинтеллект',P,258,28,'#267FE8',700);text(c,'Коммерческий расчёт по выбранным продуктам',P,302,22,'#718399',500);
    // Metrics compact
    let y=350,g=16,mw=(CW-g*2)/3;[['Период',period()],['Хозяйств',farms.length],['В месяц',money(s.monthly)]].forEach((m,i)=>{const x=P+i*(mw+g);rr(c,x,y,mw,112,24,'#F8FBFE','#DFE8F1');text(c,m[0],x+24,y+39,17,'#8193A6',500);text(c,m[1],x+24,y+79,29,'#17324A',700)});
    y=490;
    // Two main columns
    const leftW=590,rightX=P+612,rightW=CW-612;
    rr(c,P,y,leftW,500,28,'#FFFFFF','#DDE7F0');text(c,f.name||'Хозяйство №1',P+32,y+58,31,'#17324A',750);
    let ry=y+118;const selected=f.selected||[];
    selected.forEach(k=>{rr(c,P+28,ry-38,62,62,16,'#F6F9FC','#E2EAF1');contain(c,imgs[k],P+34,ry-32,50,50);text(c,PRODUCT_NAMES[k]||k,P+112,ry,25,'#29445F',650);let price=0;try{price=window.v9ProductPrice(k,f.heads)}catch(e){}text(c,`${money(price)} / мес.`,P+leftW-32,ry,24,'#17324A',650,'right');line(c,P+112,ry+30,P+leftW-32,ry+30);ry+=86});
    text(c,'Поголовье',P+32,ry+6,22,'#6F8396',500);text(c,`${f.heads} голов`,P+leftW-32,ry+6,23,'#17324A',650,'right');ry+=58;rr(c,P+20,ry-16,leftW-40,72,18,'#F1F7FD',null);text(c,'Итого по хозяйству',P+34,ry+29,23,'#267FE8',700);text(c,`${money(f.monthly)} / мес.`,P+leftW-32,ry+29,25,'#267FE8',750,'right');
    rr(c,rightX,y,rightW,500,28,'#F7FAFD','#D9E6F1');text(c,'Итоговый расчёт',rightX+30,y+58,27,'#267FE8',750);text(c,'До скидки',rightX+30,y+132,20,'#75889B',500);text(c,money(s.gross),rightX+rightW-30,y+132,23,'#17324A',650,'right');text(c,`Скидка ${s.disc}%`,rightX+30,y+188,20,'#75889B',500);text(c,'− '+money(s.discountAmount),rightX+rightW-30,y+188,23,'#17324A',650,'right');line(c,rightX+30,y+230,rightX+rightW-30,y+230,'#D5E3EE');text(c,'Итого к оплате',rightX+30,y+290,25,'#17324A',700);text(c,money(s.final),rightX+rightW-30,y+370,45,'#267FE8',800,'right');text(c,'за выбранный период',rightX+30,y+418,18,'#7B8EA2',500);
    // Closing and footer
    y=1020;rr(c,P,y,CW,150,26,'#F9FBFD','#E2EAF1');text(c,'Добрый день!',P+32,y+48,27,'#17324A',750);text(c,'Направляю Вам расчёт стоимости лицензии Агроинтеллект.',P+32,y+88,21,'#4F6980',500);text(c,'Буду рад ответить на дополнительные вопросы.',P+32,y+122,19,'#7A8DA0',500);
    y=1205;line(c,P,y,P+CW,y);contain(c,logo,P,y+26,250,66);text(c,'agrointellect.ru',P+CW,y+60,20,'#267FE8',650,'right');text(c,'Расчёт сформирован в партнёрском кабинете',P,y+106,16,'#8A9BAD',500);
    const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('Не удалось создать изображение')),'image/png'));return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.png`,{type:'image/png'});
  }
  async function build(){if(cache.file&&Date.now()-cache.stamp<MAX_AGE)return cache.file;if(cache.promise)return cache.promise;cache.promise=buildImage().then(f=>(cache.file=f,cache.stamp=Date.now(),f));try{return await cache.promise}finally{cache.promise=null}}
  function invalidate(){cache.file=null;cache.stamp=0}
  function openFile(f){const u=URL.createObjectURL(f),w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)}
  function saveFile(f){const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
  function sheet(f){let s=document.getElementById('shareCalcV38');if(!s){s=document.createElement('div');s.id='shareCalcV38';s.innerHTML=`<div class="sc38shade" data-close></div><div class="sc38card"><button class="sc38x" data-close>×</button><div class="sc38head"><div class="sc38mark">↗</div><div><h3>Расчёт готов</h3><p>Изображение удобно отправить клиенту в мессенджер.</p></div></div><button id="sc38share" class="sc38primary">Поделиться расчётом</button><div class="sc38actions"><button id="sc38open">Открыть</button><button id="sc38save">Сохранить</button></div></div>`;document.body.appendChild(s);s.querySelectorAll('[data-close]').forEach(el=>el.onclick=()=>s.classList.remove('show'))}const sh=s.querySelector('#sc38share');sh.style.display=canShare(f)?'flex':'none';sh.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[f]}).then(()=>s.classList.remove('show')).catch(e=>{if(e?.name!=='AbortError')console.warn(e)});s.querySelector('#sc38open').onclick=()=>openFile(f);s.querySelector('#sc38save').onclick=()=>saveFile(f);s.classList.add('show')}
  window.v9ShareCalculation=async()=>{const b=document.getElementById('v9Share'),o=b?.textContent||'Поделиться';try{if(b){b.disabled=true;b.textContent='Готовим расчёт…'}sheet(await build())}catch(e){console.error(e);alert('Не удалось подготовить изображение расчёта.')}finally{if(b){b.disabled=false;b.textContent=o}}};
  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true);
  const st=document.createElement('style');st.textContent=`#shareCalcV38{position:fixed;inset:0;z-index:17000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}#shareCalcV38.show{display:flex}.sc38shade{position:absolute;inset:0;background:rgba(22,46,73,.24);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.sc38card{position:relative;width:min(420px,calc(100% - 28px));margin:14px;padding:22px;border-radius:24px;background:#fff;border:1px solid #e1e8ef;box-shadow:0 24px 70px rgba(28,55,84,.16);color:#17324a}.sc38x{position:absolute;right:14px;top:14px;width:36px;height:36px;border:0;border-radius:11px;background:#f4f7fa;color:#60788e;font-size:22px}.sc38head{display:flex;gap:14px;align-items:center;padding-right:44px}.sc38mark{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:#edf6fd;color:#267fe8;font-size:22px;font-weight:700}.sc38head h3{margin:0 0 4px;font-size:21px}.sc38head p{margin:0;color:#738699;font-size:13px;line-height:1.35}.sc38primary{width:100%;min-height:47px;margin-top:18px;border:0;border-radius:14px;background:#4f9fe9;color:#fff;font:inherit;font-weight:700}.sc38actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.sc38actions button{min-height:43px;border:1px solid #dce5ed;border-radius:13px;background:#fff;color:#2b465f;font:inherit;font-weight:650}@media(min-width:700px){#shareCalcV38{align-items:center}.sc38card{margin:0}}`;document.head.appendChild(st);
})();