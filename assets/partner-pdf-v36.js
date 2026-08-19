/* Partner Hub PDF v36 — approved branded one-page layout, official assets. */
(function(){
if(window.__partnerHubPdfV36)return;window.__partnerHubPdfV36=true;
const FONT='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
const ASSETS={brand:'./assets/agrointellect-logo-full.webp',onlinefarm:'./assets/product-onlinefarm.webp',milk:'./assets/product-milk.webp',musoft:'./assets/product-musoft.webp'};
const NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии Агроинтеллект.';
const FALLBACK={phone:'+7 911 854-34-23',email:'osokin@agrointellect.ru'};
let cache=null,cacheAt=0,building=null;const MAX=300000;
const b64=b=>{let s='',a=new Uint8Array(b);for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,Math.min(i+32768,a.length)));return btoa(s)};
async function dataUrl(url){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)return null;const b=await r.arrayBuffer();return 'data:image/webp;base64,'+b64(b)}catch(e){return null}}
const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽';
const period=()=>{try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}};
const contact=()=>{try{return (window.CONTACTS||[]).find(x=>/коммерческого отдела/i.test(x.role||''))||(window.CONTACTS||[])[0]||FALLBACK}catch(e){return FALLBACK}};
function fit(pdf,t,max,base,min=6.5){let z=base;pdf.setFontSize(z);while(z>min&&pdf.getTextWidth(String(t))>max){z-=.3;pdf.setFontSize(z)}return z}
function rounded(pdf,x,y,w,h,fill,border,r=4){pdf.setFillColor(...fill);pdf.setDrawColor(...border);pdf.roundedRect(x,y,w,h,r,r,'FD')}
window.v9BuildPdfFile=async function(){
 if(!(window.jspdf&&window.jspdf.jsPDF)||typeof window.v9Summary!=='function')throw Error('PDF data unavailable');
 const [{jsPDF},font,...imgs]=await Promise.all([Promise.resolve(window.jspdf),fetch(FONT).then(r=>r.arrayBuffer()).then(b64),...Object.values(ASSETS).map(dataUrl)]);
 const img={};Object.keys(ASSETS).forEach((k,i)=>img[k]=imgs[i]);
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.addFileToVFS('Play.ttf',font);pdf.addFont('Play.ttf','Play','normal');pdf.setFont('Play','normal');
 const s=window.v9Summary(),c=contact(),farm=(s.farms||[])[0]||{name:'Хозяйство №1',heads:0,selected:[],monthly:0};
 const W=210,L=10,R=10,CW=190;const ink=[12,31,66],text=[38,61,96],muted=[96,119,151],blue=[38,113,239],line=[210,226,245],soft=[248,251,255],softBlue=[239,246,255],white=[255,255,255];
 const tc=x=>pdf.setTextColor(...x),fc=x=>pdf.setFillColor(...x),dc=x=>pdf.setDrawColor(...x);
 // background + subtle top-right visual
 fc(white);pdf.rect(0,0,210,297,'F');fc([245,249,255]);pdf.ellipse(181,23,48,30,'F');fc([235,245,255]);pdf.ellipse(194,47,42,27,'F');
 // official brand logo — preserve aspect ratio
 if(img.brand)try{pdf.addImage(img.brand,'WEBP',L+3,11,50,15,undefined,'FAST')}catch(e){}
 // date card
 rounded(pdf,161,11,39,18,white,line,3);pdf.setFontSize(6.8);tc(muted);pdf.text('Дата расчёта',168,17);pdf.setFontSize(10.2);tc(ink);pdf.text(new Date().toLocaleDateString('ru-RU'),195,24,{align:'right'});
 // hero title
 fc(blue);pdf.roundedRect(L+3,37,1.2,27,.6,.6,'F');pdf.setFontSize(24);tc(ink);pdf.text('Расчёт стоимости',L+10,47);pdf.text('лицензии',L+10,58);pdf.setFontSize(9.4);tc(muted);pdf.text('Коммерческий расчёт по выбранным продуктам и параметрам',L+10,67);
 // metrics
 const my=79,g=4,mw=(CW-g*2)/3;function metric(x,label,value,symbol){rounded(pdf,x,my,mw,27,white,line,4);fc(softBlue);pdf.circle(x+11,my+13.5,6.4,'F');pdf.setFontSize(10);tc(blue);pdf.text(symbol,x+11,my+16.5,{align:'center'});pdf.setFontSize(7.3);tc(muted);pdf.text(label,x+23,my+10);fit(pdf,value,mw-28,11.4,8.5);tc(ink);pdf.text(value,x+23,my+19)}
 metric(L,'Период',period(),'□');metric(L+mw+g,'Хозяйств',String((s.farms||[]).length),'●');metric(L+(mw+g)*2,'Стоимость в месяц',money(s.monthly),'₽');
 // main grid
 const y=112,leftW=116,gap=4,rightW=70,h=86;rounded(pdf,L,y,leftW,h,white,line,4.5);rounded(pdf,L+leftW+gap,y,rightW,h,soft,line,4.5);
 pdf.setFontSize(14);tc(ink);pdf.text(farm.name||'Хозяйство №1',L+12,y+17);
 let ry=y+31;const logoSize=9;for(const k of (farm.selected||[])){let p=0;try{p=window.v9ProductPrice(k,farm.heads)}catch(e){};if(img[k])try{pdf.addImage(img[k],'WEBP',L+8,ry-6.5,logoSize,logoSize,undefined,'FAST')}catch(e){};pdf.setFontSize(9.2);tc(ink);pdf.text(NAMES[k]||k,L+21,ry);pdf.setFontSize(9);tc(text);pdf.text(`${money(p)} / мес.`,L+leftW-8,ry,{align:'right'});dc(line);pdf.line(L+21,ry+4,L+leftW-8,ry+4);ry+=14}
 if(ry>y+h-20)ry=y+h-20;pdf.setFontSize(9.2);tc(text);pdf.text('Поголовье',L+8,ry);tc(ink);pdf.text(`${farm.heads} голов`,L+leftW-8,ry,{align:'right'});ry+=11;fc(softBlue);pdf.roundedRect(L+1,ry-7,leftW-2,14,2,2,'F');pdf.setFontSize(9.4);tc(blue);pdf.text('Итого по хозяйству',L+8,ry+1);pdf.text(`${money(farm.monthly)} / мес.`,L+leftW-8,ry+1,{align:'right'});
 // total
 const tx=L+leftW+gap+8,tv=W-R-8;fc(softBlue);pdf.circle(tx+6,y+14,7,'F');pdf.setFontSize(11);tc(blue);pdf.text('₽',tx+6,y+17.5,{align:'center'});pdf.setFontSize(10.2);pdf.text('ИТОГОВЫЙ РАСЧЁТ',tx+17,y+17);
 pdf.setFontSize(8.5);tc(muted);pdf.text('Стоимость до скидки',tx,y+38);tc(ink);pdf.text(money(s.gross),tv,y+38,{align:'right'});tc(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,tx,y+51);tc(ink);pdf.text('− '+money(s.discountAmount),tv,y+51,{align:'right'});dc(line);pdf.line(tx,y+60,tv,y+60);pdf.setFontSize(11);tc(ink);pdf.text('Итого к оплате',tx,y+72);fit(pdf,money(s.final),rightW-16,20,13);tc(blue);pdf.text(money(s.final),tv,y+74,{align:'right'});
 // greeting
 const gy=207;rounded(pdf,L,gy,CW,34,soft,line,4.5);fc(softBlue);pdf.circle(L+13,gy+17,8,'F');pdf.setFontSize(13);tc(blue);pdf.text('↗',L+13,gy+21,{align:'center'});pdf.setFontSize(11.5);tc(ink);pdf.text('Добрый день!',L+28,gy+12);pdf.setFontSize(8.8);tc(text);pdf.text('Направляю Вам расчёт стоимости лицензии Агроинтеллект.',L+28,gy+21);pdf.setFontSize(8);tc(muted);pdf.text('Буду рад ответить на дополнительные вопросы.',L+28,gy+28);
 // footer
 const fy=254;dc(line);pdf.line(L,fy,W-R,fy);if(img.brand)try{pdf.addImage(img.brand,'WEBP',L,fy+8,48,14,undefined,'FAST')}catch(e){};pdf.setFontSize(8.2);tc(text);pdf.text(c.phone||FALLBACK.phone,86,fy+10);pdf.text(c.email||FALLBACK.email,86,fy+17);tc(blue);pdf.text('agrointellect.ru',86,fy+24);pdf.setFontSize(7.2);tc(muted);pdf.text('Расчёт сформирован в партнёрском',145,fy+10);pdf.text('кабинете Агроинтеллект.',145,fy+16);pdf.text('Стоимость указана согласно',145,fy+23);pdf.text('выбранным параметрам расчёта.',145,fy+29);fc(blue);pdf.rect(0,295,210,2,'F');
 const blob=pdf.output('blob');if(!blob||blob.size<1000)throw Error('PDF empty');return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
};
const canShare=f=>!!(navigator.share&&(!navigator.canShare||navigator.canShare({files:[f]})));const open=f=>{const u=URL.createObjectURL(f),w=window.open(u,'_blank');if(!w)location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)};const save=f=>{const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)};
async function build(){if(cache&&Date.now()-cacheAt<MAX)return cache;if(building)return building;building=window.v9BuildPdfFile().then(f=>(cache=f,cacheAt=Date.now(),f));try{return await building}finally{building=null}}
function sheet(f){let el=document.getElementById('partnerPdfSheetV36');if(!el){el=document.createElement('div');el.id='partnerPdfSheetV36';el.innerHTML='<div class="p36shade" data-close></div><div class="p36card"><button class="p36x" data-close>×</button><div class="p36badge">PDF</div><h3>Расчёт готов</h3><p>Проверьте файл или сразу отправьте его клиенту.</p><button class="p36primary" id="p36share">Поделиться расчётом</button><div class="p36row"><button id="p36open">Открыть</button><button id="p36save">Скачать</button></div></div>';document.body.appendChild(el);el.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>el.classList.remove('show'))}const sh=el.querySelector('#p36share');sh.style.display=canShare(f)?'block':'none';sh.onclick=()=>navigator.share({title:'Расчёт стоимости лицензии Агроинтеллект',text:SHARE_TEXT,files:[f]}).then(()=>el.classList.remove('show')).catch(()=>{});el.querySelector('#p36open').onclick=()=>open(f);el.querySelector('#p36save').onclick=()=>save(f);el.classList.add('show')}
window.v9ShareCalculation=async()=>{const b=document.getElementById('v9Share'),old=b?.textContent;try{if(b){b.disabled=true;b.textContent='Готовим расчёт…'}sheet(await build())}catch(e){console.error(e);alert('Не удалось подготовить PDF. Попробуйте ещё раз.')}finally{if(b){b.disabled=false;b.textContent=old||'Поделиться'}}};
const st=document.createElement('style');st.textContent=`#partnerPdfSheetV36{position:fixed;inset:0;z-index:2147483647;display:none;align-items:flex-end;justify-content:center;font-family:Inter,"Segoe UI",Arial,sans-serif}#partnerPdfSheetV36.show{display:flex}.p36shade{position:absolute;inset:0;background:rgba(17,38,63,.32);backdrop-filter:blur(7px)}.p36card{position:relative;width:min(430px,calc(100% - 28px));margin:0 14px calc(14px + env(safe-area-inset-bottom));padding:24px;border:1px solid #dce8f5;border-radius:24px;background:#fff;box-shadow:0 24px 70px rgba(29,61,96,.18);box-sizing:border-box}.p36x{position:absolute;right:16px;top:16px;width:38px;height:38px;border:0;border-radius:12px;background:#f3f7fb;color:#60758b;font-size:24px}.p36badge{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:#edf5ff;color:#2771ef;font-weight:800;font-size:14px}.p36card h3{margin:16px 0 5px;color:#17324d;font-size:24px;line-height:1.15}.p36card p{margin:0 0 20px;color:#718399;font-size:14px;line-height:1.45}.p36primary{width:100%;height:50px;border:0;border-radius:15px;background:linear-gradient(135deg,#5aa9ee,#78c4ef);color:#fff;font-size:16px;font-weight:700}.p36row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.p36row button{height:46px;border:1px solid #dbe5ef;border-radius:14px;background:#fff;color:#29445f;font-size:15px;font-weight:650}@media(min-width:700px){#partnerPdfSheetV36{align-items:center}.p36card{margin:0}}`;document.head.appendChild(st);
})();