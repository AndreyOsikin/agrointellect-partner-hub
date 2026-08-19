/* Unified final PDF generator — single and multi-farm */
(function(){
 if(window.__partnerPdfFinal)return;window.__partnerPdfFinal=true;
 const FONT='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
 const ASSETS={brand:'./assets/agrointellect-logo-full.webp',onlinefarm:'./assets/product-onlinefarm.webp',milk:'./assets/product-milk.webp',musoft:'./assets/product-musoft.webp'};
 const NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
 const FALLBACK={phone:'+7 911 854-34-23',email:'osokin@agrointellect.ru'};
 const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽';
 const period=()=>{try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}};
 const contact=()=>{try{return (window.CONTACTS||[]).find(x=>/коммерческого отдела/i.test(x.role||''))||(window.CONTACTS||[])[0]||FALLBACK}catch(e){return FALLBACK}};
 const b64=b=>{let s='',a=new Uint8Array(b);for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,Math.min(i+32768,a.length)));return btoa(s)};
 async function dataUrl(url){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)return null;const b=await r.arrayBuffer();return 'data:image/webp;base64,'+b64(b)}catch(e){return null}}
 function fit(pdf,t,max,base,min=6.5){let z=base;pdf.setFontSize(z);while(z>min&&pdf.getTextWidth(String(t))>max){z-=.3;pdf.setFontSize(z)}return z}
 function rounded(pdf,x,y,w,h,fill,border,r=4){pdf.setFillColor(...fill);pdf.setDrawColor(...border);pdf.roundedRect(x,y,w,h,r,r,'FD')}
 window.v9BuildPdfFile=async function(){
   if(!(window.jspdf&&window.jspdf.jsPDF)||typeof window.v9Summary!=='function')throw new Error('PDF data unavailable');
   const [{jsPDF},font,...imgs]=await Promise.all([Promise.resolve(window.jspdf),fetch(FONT).then(r=>r.arrayBuffer()).then(b64),...Object.values(ASSETS).map(dataUrl)]);
   const img={};Object.keys(ASSETS).forEach((k,i)=>img[k]=imgs[i]);
   const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.addFileToVFS('Play.ttf',font);pdf.addFont('Play.ttf','Play','normal');pdf.setFont('Play','normal');
   const s=window.v9Summary(),farms=s.farms||[],c=contact();
   const W=210,L=12,R=12,CW=186,ink=[20,54,83],text=[42,74,101],muted=[117,140,159],blue=[70,158,220],line=[218,231,240],soft=[249,252,254],softBlue=[240,248,253],white=[255,255,255];
   const tc=x=>pdf.setTextColor(...x),fc=x=>pdf.setFillColor(...x),dc=x=>pdf.setDrawColor(...x);
   function header(){fc(white);pdf.rect(0,0,W,297,'F');if(img.brand)try{pdf.addImage(img.brand,'WEBP',L,10,48,14,undefined,'FAST')}catch(e){};pdf.setFontSize(6.8);tc(muted);pdf.text('Дата расчёта',W-R-42,14);pdf.setFontSize(9.4);tc(ink);pdf.text(new Date().toLocaleDateString('ru-RU'),W-R,21,{align:'right'});pdf.setFontSize(22);tc(ink);pdf.text('Расчёт стоимости лицензии',L,39);pdf.setFontSize(8.8);tc(muted);pdf.text('Коммерческий расчёт по выбранным продуктам и параметрам',L,47);dc(line);pdf.line(L,53,W-R,53)}
   function metrics(y){const gap=4,mw=(CW-gap*2)/3;[['Период',period()],['Хозяйств',String(farms.length)],['Стоимость в месяц',money(s.monthly)]].forEach((m,i)=>{const x=L+i*(mw+gap);rounded(pdf,x,y,mw,22,white,line,3.5);pdf.setFontSize(6.8);tc(muted);pdf.text(m[0],x+6,y+7);fit(pdf,m[1],mw-12,10.7,8);tc(ink);pdf.text(m[1],x+6,y+16)})}
   function farmHeight(f){return 24+Math.max(1,(f.selected||[]).length)*10+14}
   function farmCard(f,index,y){const h=farmHeight(f);rounded(pdf,L,y,CW,h,white,line,4);pdf.setFontSize(11.5);tc(ink);pdf.text(f.name||`Хозяйство №${index+1}`,L+8,y+11);pdf.setFontSize(7.2);tc(muted);pdf.text(`${f.heads} голов`,W-R-8,y+11,{align:'right'});let ry=y+22;const sel=f.selected||[];if(!sel.length){pdf.setFontSize(8);tc(muted);pdf.text('Продукты не выбраны',L+8,ry);ry+=10}else sel.forEach(k=>{let p=0;try{p=window.v9ProductPrice(k,f.heads)}catch(e){};if(img[k])try{pdf.addImage(img[k],'WEBP',L+8,ry-5.7,7.5,7.5,undefined,'FAST')}catch(e){};pdf.setFontSize(8.4);tc(text);pdf.text(NAMES[k]||k,L+19,ry);tc(ink);pdf.text(`${money(p)} / мес.`,W-R-8,ry,{align:'right'});dc(line);pdf.line(L+19,ry+2.7,W-R-8,ry+2.7);ry+=10});fc(softBlue);pdf.roundedRect(L+4,y+h-11,CW-8,8,2,2,'F');pdf.setFontSize(8.3);tc(blue);pdf.text('Итого по хозяйству',L+8,y+h-5.5);pdf.text(`${money(f.monthly)} / мес.`,W-R-8,y+h-5.5,{align:'right'});return h}
   function totalBlock(y){const h=51;rounded(pdf,L,y,CW,h,soft,line,4);pdf.setFontSize(9.5);tc(blue);pdf.text('ИТОГОВЫЙ РАСЧЁТ',L+8,y+10);pdf.setFontSize(8);tc(muted);pdf.text('Стоимость до скидки',L+8,y+22);tc(ink);pdf.text(money(s.gross),W-R-8,y+22,{align:'right'});tc(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,L+8,y+31);tc(ink);pdf.text('− '+money(s.discountAmount),W-R-8,y+31,{align:'right'});dc(line);pdf.line(L+8,y+36,W-R-8,y+36);pdf.setFontSize(10.5);tc(ink);pdf.text('Итого к оплате',L+8,y+46);fit(pdf,money(s.final),75,17,12);tc(blue);pdf.text(money(s.final),W-R-8,y+46,{align:'right'});return h}
   function footer(){dc(line);pdf.line(L,280,W-R,280);if(img.brand)try{pdf.addImage(img.brand,'WEBP',L,284,38,11,undefined,'FAST')}catch(e){};pdf.setFontSize(7);tc(text);pdf.text(c.phone||FALLBACK.phone,80,287);pdf.text(c.email||FALLBACK.email,80,293);tc(blue);pdf.text('agrointellect.ru',W-R,293,{align:'right'})}
   header();metrics(60);let y=89,page=1;
   for(let i=0;i<farms.length;i++){
     const need=farmHeight(farms[i])+8;
     if(y+need>245){footer();pdf.addPage();page++;header();metrics(60);y=89}
     y+=farmCard(farms[i],i,y)+7;
   }
   if(y+58>245){footer();pdf.addPage();header();metrics(60);y=89}
   totalBlock(y);
   if(window.partnerNonstandardIntegration){rounded(pdf,L,y+57,CW,18,softBlue,line,3.5);pdf.setFontSize(8.4);tc(ink);pdf.text('Требуется нестандартная интеграция',L+7,y+65);pdf.setFontSize(7);tc(muted);pdf.text('Стоимость согласовывается отдельно после оценки объёма работ',L+7,y+71)}
   footer();
   const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF empty');return new File([blob],`Agrointellect-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
 };
})();
