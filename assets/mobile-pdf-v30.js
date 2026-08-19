/* Partner Hub PDF design v30 — pure jsPDF, branded, iOS-safe. */
(function(){
  if(window.__partnerHubPdfV30)return;
  window.__partnerHubPdfV30=true;

  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS)return;

  const FONT_URL='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  const LOGO_URL='./favicon.png';
  let fontPromise=null,logoPromise=null;

  function toBase64(buffer){
    const bytes=new Uint8Array(buffer); let binary=''; const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    return btoa(binary);
  }
  async function loadFont(){
    if(fontPromise)return fontPromise;
    fontPromise=(async()=>{const r=await fetch(FONT_URL,{cache:'force-cache'});if(!r.ok)throw new Error('Не удалось загрузить PDF-шрифт');return toBase64(await r.arrayBuffer())})();
    return fontPromise;
  }
  async function loadLogo(){
    if(logoPromise)return logoPromise;
    logoPromise=(async()=>{try{const r=await fetch(LOGO_URL,{cache:'force-cache'});if(!r.ok)return null;return 'data:image/png;base64,'+toBase64(await r.arrayBuffer())}catch(e){return null}})();
    return logoPromise;
  }
  function money(v){const n=Math.round(((Number(v)||0)+Number.EPSILON)*100)/100;return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' ₽'}
  const txt=v=>String(v==null?'':v);

  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF-библиотека не загрузилась');
    if(typeof window.v9Summary!=='function')throw new Error('Данные расчёта недоступны');

    const [{jsPDF},fontB64,logo]=await Promise.all([Promise.resolve(window.jspdf),loadFont(),loadLogo()]);
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.addFileToVFS('Play-Regular.ttf',fontB64);pdf.addFont('Play-Regular.ttf','Play','normal');pdf.setFont('Play','normal');

    const s=window.v9Summary();
    const W=210,H=297,L=15,R=15,CW=W-L-R;
    const navy=[18,48,77],blue=[22,135,248],muted=[99,116,136],line=[222,230,238],soft=[246,249,252],blueSoft=[235,246,255];
    let y=16;
    const color=c=>pdf.setTextColor(c[0],c[1],c[2]);
    const fill=c=>pdf.setFillColor(c[0],c[1],c[2]);
    const ensure=h=>{if(y+h>H-15){pdf.addPage();y=16;drawMiniHeader()}};
    function drawMiniHeader(){
      if(logo){try{pdf.addImage(logo,'PNG',L,9,10,10)}catch(e){}}
      pdf.setFontSize(10);color(navy);pdf.text('АГРОИНТЕЛЛЕКТ',L+14,15.5);
      pdf.setDrawColor(line[0],line[1],line[2]);pdf.line(L,22,W-R,22);y=29;
    }
    function labelValue(label,value,emph=false){
      ensure(9);pdf.setFontSize(9.3);color(muted);pdf.text(txt(label),L,y);
      pdf.setFontSize(emph?10.8:9.6);color(navy);pdf.text(txt(value),W-R,y,{align:'right'});
      y+=6.2;pdf.setDrawColor(line[0],line[1],line[2]);pdf.line(L,y-1.8,W-R,y-1.8);
    }
    function sectionTitle(t){ensure(12);pdf.setFontSize(13);color(navy);pdf.text(txt(t),L,y);y+=7;}

    /* Cover / header */
    fill(navy);pdf.roundedRect(L,12,CW,48,6,6,'F');
    if(logo){try{pdf.addImage(logo,'PNG',L+8,20,18,18)}catch(e){}}
    pdf.setFontSize(10.5);pdf.setTextColor(255,255,255);pdf.text('АГРОИНТЕЛЛЕКТ',L+31,26);
    pdf.setFontSize(23);pdf.text('Расчёт стоимости лицензий',L+31,37);
    pdf.setFontSize(9.2);pdf.setTextColor(198,219,239);pdf.text('Коммерческий расчёт по выбранным продуктам',L+31,44);
    pdf.setFontSize(8.8);pdf.text(new Date().toLocaleDateString('ru-RU'),L+31,51);
    y=69;

    fill(blueSoft);pdf.roundedRect(L,y-3,CW,24,4,4,'F');
    pdf.setFontSize(9);color(muted);pdf.text('ПЕРИОД',L+6,y+4);pdf.text('ХОЗЯЙСТВ',L+66,y+4);pdf.text('В МЕСЯЦ',L+119,y+4);
    pdf.setFontSize(12);color(navy);
    pdf.text(typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`,L+6,y+12);
    pdf.text(String(s.farms.length),L+66,y+12);pdf.text(money(s.monthly),L+119,y+12);
    y+=31;

    s.farms.forEach((f,i)=>{
      ensure(31 + (f.selected?.length||1)*7);
      fill(soft);pdf.roundedRect(L,y-4,CW,10,3,3,'F');
      pdf.setFontSize(12.5);color(navy);pdf.text(f.name||`Хозяйство №${i+1}`,L+5,y+2);
      y+=10;
      labelValue('Поголовье',`${f.heads} голов`);
      (f.selected||[]).forEach(k=>{
        let price=0;try{price=window.v9ProductPrice(k,f.heads)}catch(e){}
        const name=(window.CALC_META&&window.CALC_META[k]&&window.CALC_META[k].name)||k;
        labelValue(name,`${money(price)} / мес.`);
      });
      if(!(f.selected||[]).length)labelValue('Продукты','Не выбраны');
      labelValue('Итого по хозяйству',`${money(f.monthly)} / мес.`,true);y+=5;
    });

    ensure(45);
    fill(navy);pdf.roundedRect(L,y-3,CW,38,5,5,'F');
    pdf.setTextColor(189,214,238);pdf.setFontSize(9);pdf.text('ИТОГОВЫЙ РАСЧЁТ',L+7,y+4);
    pdf.setTextColor(255,255,255);pdf.setFontSize(9.5);pdf.text('Стоимость до скидки',L+7,y+12);pdf.text(money(s.gross),W-R-7,y+12,{align:'right'});
    pdf.setTextColor(189,214,238);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка ${s.disc}%`,L+7,y+19);
    pdf.text('− '+money(s.discountAmount),W-R-7,y+19,{align:'right'});
    pdf.setFontSize(14);pdf.setTextColor(255,255,255);pdf.text('ИТОГО К ОПЛАТЕ',L+7,y+30);
    pdf.setFontSize(17);pdf.text(money(s.final),W-R-7,y+30,{align:'right'});
    y+=46;

    pdf.setDrawColor(line[0],line[1],line[2]);pdf.line(L,y,W-R,y);y+=7;
    pdf.setFontSize(8.5);color(muted);pdf.text('Расчёт сформирован в партнёрском кабинете АГРОИНТЕЛЛЕКТ',L,y);
    pdf.text('Стоимость указана согласно выбранным параметрам расчёта.',L,y+5);

    const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF-файл пустой');
    return new File([blob],`AGROINTELLECT-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };

  console.info('Partner Hub branded PDF v30 active');
})();