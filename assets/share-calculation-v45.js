/* Share calculation v45 — multi-farm messenger card and shared visual source for PDF. */
(function(){
  if(window.__partnerShareV45)return;window.__partnerShareV45=true;
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
  async function buildCanvas(){
    const s=summary(),farms=s.farms||[];
    const farmHeights=farms.map(f=>132+Math.max(1,(f.selected||[]).length)*58+72);
    const farmsH=farmHeights.reduce((a,b)=>a+b,0)+Math.max(0,farms.length-1)*18;
    const W=1080,P=60,CW=W-P*2,H=Math.max(1350,520+farmsH+360);
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d',{alpha:false});
    c.fillStyle='#F4F7FA';c.fillRect(0,0,W,H);
    const [logo,of,milk,musoft]=await Promise.all([load(LOGO),load(PRODUCT_IMAGES.onlinefarm),load(PRODUCT_IMAGES.milk),load(PRODUCT_IMAGES.musoft)]);const imgs={onlinefarm:of,milk,musoft};
    rr(c,28,28,W-56,H-56,34,'#FFFFFF','#E4EBF2');
    contain(c,logo,P,54,270,78);
    rr(c,W-P-205,58,205,72,19,'#F7FAFD','#E2EAF1');text(c,'Дата расчёта',W-P-180,86,17,'#7B8EA2',500);text(c,new Date().toLocaleDateString('ru-RU'),W-P-25,116,23,'#17324A',700,'right');
    text(c,'Расчёт стоимости лицензии',P,202,48,'#17324A',750);text(c,'Агроинтеллект',P,247,27,'#4C9FDA',700);text(c,'Коммерческий расчёт по выбранным продуктам',P,288,21,'#718399',500);
    let y=332,g=14,mw=(CW-g*2)/3;[['Период',period()],['Хозяйств',farms.length],['В месяц',money(s.monthly)]].forEach((m,i)=>{const x=P+i*(mw+g);rr(c,x,y,mw,100,22,'#F8FBFE','#DFE8F1');text(c,m[0],x+22,y+34,16,'#8193A6',500);text(c,m[1],x+22,y+72,27,'#17324A',700)});
    y+=126;
    farms.forEach((f,fi)=>{
      const sel=f.selected||[],h=farmHeights[fi];rr(c,P,y,CW,h,26,'#FFFFFF','#DDE7F0');
      rr(c,P+24,y+22,46,46,13,'#EFF7FC','#D7E8F2');text(c,String(fi+1),P+47,y+53,20,'#3D7EA7',700,'center');
      text(c,f.name||`Хозяйство №${fi+1}`,P+88,y+48,27,'#17324A',750);text(c,`${f.heads} голов`,P+CW-28,y+48,20,'#718399',600,'right');
      let ry=y+96;
      if(!sel.length){text(c,'Продукты не выбраны',P+28,ry+22,21,'#8295A7',500);ry+=58}else sel.forEach(k=>{rr(c,P+24,ry-10,48,48,13,'#F7FAFC','#E1EAF1');contain(c,imgs[k],P+30,ry-4,36,36);text(c,PRODUCT_NAMES[k]||k,P+88,ry+22,22,'#29445F',650);let price=0;try{price=window.v9ProductPrice(k,f.heads)}catch(e){}text(c,`${money(price)} / мес.`,P+CW-28,ry+22,21,'#17324A',650,'right');line(c,P+88,ry+43,P+CW-28,ry+43);ry+=58});
      rr(c,P+18,y+h-60,CW-36,44,14,'#F1F7FD',null);text(c,'Итого по хозяйству',P+30,y+h-31,20,'#4D91BC',700);text(c,`${money(f.monthly)} / мес.`,P+CW-28,y+h-31,22,'#286C99',750,'right');
      y+=h+18;
    });
    rr(c,P,y,CW,214,28,'#F4F9FD','#D5E6F4');text(c,'Итоговый расчёт',P+30,y+47,25,'#4B91BD',750);text(c,'Стоимость до скидки',P+30,y+92,19,'#75889B',500);text(c,money(s.gross),P+CW-30,y+92,22,'#17324A',650,'right');text(c,`Скидка ${s.disc}%`,P+30,y+130,19,'#75889B',500);text(c,'− '+money(s.discountAmount),P+CW-30,y+130,22,'#17324A',650,'right');line(c,P+30,y+151,P+CW-30,y+151,'#D5E3EE');text(c,'Итого к оплате',P+30,y+190,26,'#17324A',700);text(c,money(s.final),P+CW-30,y+193,42,'#438FC2',800,'right');
    y+=238;
    if(window.partnerNonstandardIntegration){rr(c,P,y,CW,82,20,'#FAFCFE','#E0E9F0');text(c,'Требуется нестандартная интеграция',P+26,y+34,20,'#29445F',700);text(c,'Стоимость согласовывается отдельно после оценки объёма работ',P+26,y+62,17,'#7B8EA2',500);y+=104}
    rr(c,P,y,CW,116,22,'#FAFCFE','#E2EAF1');text(c,'Добрый день!',P+28,y+40,24,'#17324A',750);text(c,'Направляю Вам расчёт стоимости лицензии Агроинтеллект.',P+28,y+73,19,'#4F6980',500);text(c,'Буду рад ответить на дополнительные вопросы.',P+28,y+100,17,'#7A8DA0',500);
    y+=148;line(c,P,y,P+CW,y);contain(c,logo,P,y+18,220,58);text(c,'agrointellect.ru',P+CW,y+52,18,'#438FC2',650,'right');text(c,'Расчёт сформирован в партнёрском кабинете',P,y+92,15,'#8A9BAD',500);
    return canvas;
  }
  window.v9BuildCalculationCanvas=buildCanvas;
  window.v9BuildCalculationImageFile=async function(){const canvas=await buildCanvas();const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('Не удалось создать изображение')),'image/png'));return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.png`,{type:'image/png'})};
  async function build(){if(cache.file&&Date.now()-cache.stamp<MAX_AGE)return cache.file;if(cache.promise)return cache.promise;cache.promise=window.v9BuildCalculationImageFile().then(f=>(cache.file=f,cache.stamp=Date.now(),f));try{return await cache.promise}finally{cache.promise=null}}
  function invalidate(){cache.file=null;cache.stamp=0}
  function openFile(f){const u=URL.createObjectURL(f),w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)}
  function saveFile(f){const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
  function sheet(f){let s=document.getElementById('shareCalcV45');if(!s){s=document.createElement('div');s.id='shareCalcV45';s.innerHTML=`<div class="sc45shade" data-close></div><div class="sc45card"><button class="sc45x" data-close>×</button><div class="sc45head"><div class="sc45mark">↗</div><div><h3>Расчёт готов</h3><p>Изображение удобно отправить клиенту в мессенджере.</p></div></div><button id="sc45share" class="sc45primary">Поделиться расчётом</button><div class="sc45actions"><button id="sc45open">Открыть</button><button id="sc45save">Сохранить</button></div></div>`;document.body.appendChild(s);s.querySelectorAll('[data-close]').forEach(el=>el.onclick=()=>s.classList.remove('show'))}const sh=s.querySelector('#sc45share');sh.style.display=canShare(f)?'flex':'none';sh.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[f]}).then(()=>s.classList.remove('show')).catch(e=>{if(e?.name!=='AbortError')console.warn(e)});s.querySelector('#sc45open').onclick=()=>openFile(f);s.querySelector('#sc45save').onclick=()=>saveFile(f);s.classList.add('show')}
  window.v9ShareCalculation=async()=>{const b=document.getElementById('v9Share'),o=b?.textContent||'Поделиться';try{if(b){b.disabled=true;b.textContent='Готовим расчёт…'}sheet(await build())}catch(e){console.error(e);alert('Не удалось подготовить изображение расчёта.')}finally{if(b){b.disabled=false;b.textContent=o}}};
  ['input','change'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest?.('.calculator-page'))invalidate()},true));document.addEventListener('partner:integration-change',invalidate);
  const st=document.createElement('style');st.textContent=`#shareCalcV45{position:fixed;inset:0;z-index:17000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}#shareCalcV45.show{display:flex}.sc45shade{position:absolute;inset:0;background:rgba(22,46,73,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.sc45card{position:relative;width:min(420px,calc(100% - 28px));margin:14px;padding:22px;border-radius:24px;background:#fff;border:1px solid #e1e8ef;box-shadow:0 24px 70px rgba(28,55,84,.15);color:#17324a}.sc45x{position:absolute;right:14px;top:14px;width:36px;height:36px;border:0;border-radius:11px;background:#f4f7fa;color:#60788e;font-size:22px}.sc45head{display:flex;gap:14px;align-items:center;padding-right:44px}.sc45mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:#edf6fd;color:#4a98ca;font-size:20px;font-weight:700}.sc45head h3{margin:0 0 4px;font-size:21px}.sc45head p{margin:0;color:#738699;font-size:13px;line-height:1.35}.sc45primary{width:100%;min-height:45px;margin-top:18px;border:0;border-radius:13px;background:linear-gradient(135deg,#69afe0,#81c5e9);color:#fff;font:inherit;font-weight:700}.sc45actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}.sc45actions button{min-height:42px;border:1px solid #dce5ed;border-radius:12px;background:#fff;color:#2b465f;font:inherit;font-weight:650}@media(min-width:700px){#shareCalcV45{align-items:center}.sc45card{margin:0}}`;document.head.appendChild(st);
})();
