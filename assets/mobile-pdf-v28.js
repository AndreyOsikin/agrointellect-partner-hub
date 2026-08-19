/* Partner Hub iPhone PDF renderer v28.
   Pure jsPDF path for iOS: no html2canvas / Canvas / DOM screenshotting.
   Loads an open-source Cyrillic TTF at runtime and draws the calculation directly into PDF. */
(function(){
  if(window.__partnerHubPdfV28)return;
  window.__partnerHubPdfV28=true;

  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS)return;

  const FONT_URL='https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Regular.ttf';
  let fontBase64Promise=null;

  function arrayBufferToBase64(buffer){
    const bytes=new Uint8Array(buffer);
    const chunk=0x8000;
    let binary='';
    for(let i=0;i<bytes.length;i+=chunk){
      binary+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    }
    return btoa(binary);
  }

  async function getFontBase64(){
    if(fontBase64Promise)return fontBase64Promise;
    fontBase64Promise=(async()=>{
      const res=await fetch(FONT_URL,{cache:'force-cache'});
      if(!res.ok)throw new Error('Не удалось загрузить PDF-шрифт');
      return arrayBufferToBase64(await res.arrayBuffer());
    })();
    return fontBase64Promise;
  }

  function money(v){
    const n=Math.round(((Number(v)||0)+Number.EPSILON)*100)/100;
    return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' ₽';
  }

  function safeText(v){return String(v==null?'':v);}

  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF-библиотека не загрузилась');
    if(typeof window.v9Summary!=='function')throw new Error('Данные расчёта недоступны');

    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});

    const fontB64=await getFontBase64();
    pdf.addFileToVFS('Play-Regular.ttf',fontB64);
    pdf.addFont('Play-Regular.ttf','Play','normal');
    pdf.setFont('Play','normal');

    const s=window.v9Summary();
    const pageW=210,pageH=297;
    const left=16,right=16,contentW=pageW-left-right;
    const navy=[23,50,74],blue=[22,135,248],muted=[98,117,139],line=[224,231,238],soft=[247,251,255];
    let y=18;

    function setColor(rgb){pdf.setTextColor(rgb[0],rgb[1],rgb[2]);}
    function ensureSpace(h){if(y+h>pageH-15){pdf.addPage();y=18;}}
    function text(txt,x,size=10,color=navy,opts){pdf.setFontSize(size);setColor(color);pdf.text(safeText(txt),x,y,opts||{});}
    function hr(){pdf.setDrawColor(line[0],line[1],line[2]);pdf.line(left,y, pageW-right,y);y+=4;}
    function row(label,value,boldValue=false){
      ensureSpace(10);
      pdf.setFontSize(9.5);setColor(muted);pdf.text(safeText(label),left,y);
      pdf.setFontSize(boldValue?10.5:9.5);setColor(navy);
      const v=safeText(value);
      pdf.text(v,pageW-right,y,{align:'right'});
      y+=6.5;
      pdf.setDrawColor(line[0],line[1],line[2]);pdf.line(left,y-2,pageW-right,y-2);
    }
    function sectionTitle(t){ensureSpace(13);pdf.setFontSize(13);setColor(navy);pdf.text(safeText(t),left,y);y+=7;}

    pdf.setFillColor(soft[0],soft[1],soft[2]);pdf.roundedRect(left,12,contentW,42,5,5,'F');
    y=22;pdf.setFontSize(9.5);setColor(blue);pdf.text('АГРОИНТЕЛЛЕКТ',left+8,y);
    y+=9;pdf.setFontSize(23);setColor(navy);pdf.text('Расчёт стоимости',left+8,y);
    y+=8;pdf.setFontSize(9);setColor(muted);pdf.text(new Date().toLocaleDateString('ru-RU'),left+8,y);
    y=64;

    row('Период',typeof window.v9PeriodLabel==='function'?window.v9PeriodLabel(window.calcV9?.months||12):`${window.calcV9?.months||12} мес.`);
    row('Хозяйств',s.farms.length);
    row('Ежемесячно',money(s.monthly),true);
    y+=4;

    s.farms.forEach((f,i)=>{
      ensureSpace(30);
      sectionTitle(f.name||`Хозяйство №${i+1}`);
      row('Поголовье',`${f.heads} голов`);
      if(f.selected&&f.selected.length){
        f.selected.forEach(k=>{
          let price=0;
          try{price=window.v9ProductPrice(k,f.heads)}catch(e){}
          const name=(window.CALC_META&&window.CALC_META[k]&&window.CALC_META[k].name)||k;
          row(name,`${money(price)} / мес.`);
        });
      }else{
        row('Продукты','Не выбраны');
      }
      row('Итого по хозяйству',`${money(f.monthly)} / мес.`,true);
      y+=5;
    });

    ensureSpace(38);
    pdf.setFillColor(soft[0],soft[1],soft[2]);
    pdf.roundedRect(left,y-4,contentW,32,4,4,'F');
    y+=4;pdf.setFontSize(13);setColor(navy);pdf.text('Итоговый расчёт',left+6,y);y+=7;
    pdf.setFontSize(9.5);setColor(muted);pdf.text('Стоимость за период до скидки',left+6,y);
    setColor(navy);pdf.text(money(s.gross),pageW-right-6,y,{align:'right'});y+=6;
    setColor(muted);pdf.text(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка`,left+6,y);
    setColor(navy);pdf.text(`${s.disc}% · ${money(s.discountAmount)}`,pageW-right-6,y,{align:'right'});y+=7;
    pdf.setFontSize(12.5);setColor(navy);pdf.text('ИТОГО К ОПЛАТЕ',left+6,y);
    pdf.setFontSize(14);setColor(blue);pdf.text(money(s.final),pageW-right-6,y,{align:'right'});y+=13;

    pdf.setFontSize(8.5);setColor(muted);
    pdf.text('Расчёт сформирован в партнёрском кабинете АГРОИНТЕЛЛЕКТ',left,y);

    const blob=pdf.output('blob');
    if(!blob||blob.size<1000)throw new Error('PDF-файл пустой');
    return new File([blob],`AGROINTELLECT-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };

  console.info('Partner Hub pure jsPDF iOS renderer v28 active');
})();
