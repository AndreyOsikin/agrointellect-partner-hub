/* PDF multifarm v40 — keeps v36 for one farm, adds readable multi-farm PDF. */
(function(){
  if(window.__partnerPdfMultiV40)return;window.__partnerPdfMultiV40=true;
  const originalBuild=window.v9BuildPdfFile;
  const FONT='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  const ASSETS={brand:'./assets/agrointellect-logo-full.webp',onlinefarm:'./assets/product-onlinefarm.webp',milk:'./assets/product-milk.webp',musoft:'./assets/product-musoft.webp'};
  const NAMES={onlinefarm:'Онлайн-ферма',milk:'Учёт молока',musoft:'Мусофт'};
  const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽';
  const period=()=>{try{return typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`}catch(e){return '12 мес.'}};
  const b64=b=>{let s='',a=new Uint8Array(b);for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,Math.min(i+32768,a.length)));return btoa(s)};
  async function dataUrl(url){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)return null;const b=await r.arrayBuffer();return 'data:image/webp;base64,'+b64(b)}catch(e){return null}}
  function fit(pdf,t,max,base,min=6.5){let z=base;pdf.setFontSize(z);while(z>min&&pdf.getTextWidth(String(t))>max){z-=.3;pdf.setFontSize(z)}return z}
  function rounded(pdf,x,y,w,h,fill,border,r=4){pdf.setFillColor(...fill);pdf.setDrawColor(...border);pdf.roundedRect(x,y,w,h,r,r,'FD')}

  window.v9BuildPdfFile=async function(){
    const s=typeof window.v9Summary==='function'?window.v9Summary():null;
    if(!s)throw new Error('PDF data unavailable');
    const farms=s.farms||[];
    if(farms.length<=1&&typeof originalBuild==='function')return originalBuild();
    if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('jsPDF unavailable');

    const [{jsPDF},font,...imgs]=await Promise.all([
      Promise.resolve(window.jspdf),fetch(FONT).then(r=>r.arrayBuffer()).then(b64),...Object.values(ASSETS).map(dataUrl)
    ]);
    const img={};Object.keys(ASSETS).forEach((k,i)=>img[k]=imgs[i]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.addFileToVFS('Play.ttf',font);pdf.addFont('Play.ttf','Play','normal');pdf.setFont('Play','normal');

    const W=210,L=12,R=12,CW=186;
    const ink=[15,39,68],text=[48,72,95],muted=[104,124,143],blue=[58,135,215],line=[216,228,238],soft=[249,252,254],softBlue=[240,247,252],white=[255,255,255];
    const tc=x=>pdf.setTextColor(...x),fc=x=>pdf.setFillColor(...x),dc=x=>pdf.setDrawColor(...x);

    function header(pageNo,totalPages){
      fc(white);pdf.rect(0,0,210,297,'F');
      if(img.brand)try{pdf.addImage(img.brand,'WEBP',L,10,48,14,undefined,'FAST')}catch(e){}
      pdf.setFontSize(7);tc(muted);pdf.text(`Страница ${pageNo} из ${totalPages}`,W-R,14,{align:'right'});
      pdf.setFontSize(20);tc(ink);pdf.text('Расчёт стоимости лицензии',L,34);
      pdf.setFontSize(8.8);tc(muted);pdf.text('Расчёт по нескольким хозяйствам',L,41);
      dc(line);pdf.line(L,47,W-R,47);
    }

    function metrics(y){
      const gap=4,mw=(CW-gap*2)/3;
      const arr=[['Период',period()],['Хозяйств',String(farms.length)],['В месяц',money(s.monthly)]];
      arr.forEach((m,i)=>{const x=L+i*(mw+gap);rounded(pdf,x,y,mw,21,white,line,3.5);pdf.setFontSize(6.8);tc(muted);pdf.text(m[0],x+6,y+7);fit(pdf,m[1],mw-12,10.5,8);tc(ink);pdf.text(m[1],x+6,y+15)});
    }

    function farmCard(f,index,y){
      const sel=f.selected||[];
      const h=31+Math.max(1,sel.length)*11+18;
      rounded(pdf,L,y,CW,h,white,line,4.5);
      fc(softBlue);pdf.circle(L+8,y+10,5,'F');pdf.setFontSize(8);tc(blue);pdf.text(String(index+1),L+8,y+12.7,{align:'center'});
      fit(pdf,f.name||`Хозяйство №${index+1}`,112,12.5,9);tc(ink);pdf.text(f.name||`Хозяйство №${index+1}`,L+17,y+12);
      pdf.setFontSize(7.5);tc(muted);pdf.text(`${f.heads} голов`,W-R-7,y+12,{align:'right'});
      let ry=y+24;
      if(sel.length===0){pdf.setFontSize(8.4);tc(muted);pdf.text('Продукты не выбраны',L+8,ry);ry+=11}
      sel.forEach(k=>{
        let p=0;try{p=window.v9ProductPrice(k,f.heads)}catch(e){}
        if(img[k])try{pdf.addImage(img[k],'WEBP',L+8,ry-6.5,8,8,undefined,'FAST')}catch(e){}
        pdf.setFontSize(8.5);tc(text);pdf.text(NAMES[k]||k,L+20,ry);
        tc(ink);pdf.text(`${money(p)} / мес.`,W-R-8,ry,{align:'right'});dc(line);pdf.line(L+20,ry+3,W-R-8,ry+3);ry+=11;
      });
      fc(softBlue);pdf.roundedRect(L+4,y+h-15,CW-8,11,2.5,2.5,'F');pdf.setFontSize(8.7);tc(blue);pdf.text('Итого по хозяйству',L+8,y+h-8);pdf.text(`${money(f.monthly)} / мес.`,W-R-8,y+h-8,{align:'right'});
      return h;
    }

    const perPage=2,totalPages=Math.max(1,Math.ceil(farms.length/perPage));
    for(let p=0;p<totalPages;p++){
      if(p>0)pdf.addPage();header(p+1,totalPages);metrics(54);
      let y=82;
      farms.slice(p*perPage,p*perPage+perPage).forEach((f,j)=>{const h=farmCard(f,p*perPage+j,y);y+=h+8});
      if(p===totalPages-1){
        const ty=Math.max(y+2,205);rounded(pdf,L,ty,CW,48,soft,line,4.5);
        pdf.setFontSize(9);tc(blue);pdf.text('ИТОГОВЫЙ РАСЧЁТ',L+8,ty+11);
        pdf.setFontSize(8);tc(muted);pdf.text('Стоимость до скидки',L+8,ty+23);tc(ink);pdf.text(money(s.gross),W-R-8,ty+23,{align:'right'});
        tc(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,L+8,ty+32);tc(ink);pdf.text('− '+money(s.discountAmount),W-R-8,ty+32,{align:'right'});
        dc(line);pdf.line(L+8,ty+36,W-R-8,ty+36);pdf.setFontSize(10.5);tc(ink);pdf.text('Итого к оплате',L+8,ty+44);fit(pdf,money(s.final),70,17,12);tc(blue);pdf.text(money(s.final),W-R-8,ty+44,{align:'right'});
      }
      dc(line);pdf.line(L,282,W-R,282);pdf.setFontSize(7.2);tc(muted);pdf.text('Расчёт сформирован в партнёрском кабинете Агроинтеллект',L,288);tc(blue);pdf.text('agrointellect.ru',W-R,288,{align:'right'});
    }
    const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF empty');
    return new File([blob],`Agrointellect-raschet-${farms.length}-hoz-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };
})();
