/* Partner Hub iPhone PDF renderer v27.
   Builds a lightweight report from calculator data instead of screenshotting the live calculator UI. */
(function(){
  if(window.__partnerHubPdfV27)return;
  window.__partnerHubPdfV27=true;

  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS)return;

  function money(v){
    try{return v9Money(v)}catch(e){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Number(v)||0)+' ₽'}
  }
  function el(tag,text,css){
    const n=document.createElement(tag);
    if(text!=null)n.textContent=String(text);
    if(css)n.style.cssText=css;
    return n;
  }
  function line(label,value,strong=false){
    const row=el('div',null,'display:flex;justify-content:space-between;gap:24px;padding:9px 0;border-bottom:1px solid #e6edf3;font-size:17px;line-height:1.35;');
    const l=el('span',label,'color:#60758b;');
    const v=el(strong?'strong':'span',value,`color:#17324a;text-align:right;${strong?'font-weight:800;':''}`);
    row.append(l,v);return row;
  }
  function sectionTitle(text){return el('div',text,'font-size:21px;font-weight:800;color:#17324a;margin:0 0 12px;');}

  function buildReport(){
    if(typeof v9Summary!=='function')throw new Error('Данные расчёта недоступны');
    const s=v9Summary();
    const host=el('div');
    host.id='v27PdfHost';
    host.style.cssText='position:fixed;left:0;top:0;width:760px;background:#fff;z-index:-2147483000;pointer-events:none;padding:0;margin:0;font-family:Arial,"Helvetica Neue",sans-serif;color:#17324a;';

    const blocks=[];
    const header=el('section',null,'width:760px;background:#fff;padding:34px 40px 26px;border:1px solid #dfe7ee;box-sizing:border-box;');
    header.append(
      el('div','АГРОИНТЕЛЛЕКТ','font-size:15px;font-weight:800;letter-spacing:.12em;color:#1687f8;margin-bottom:12px;'),
      el('div','Расчёт стоимости','font-size:38px;font-weight:800;line-height:1.08;color:#17324a;margin-bottom:10px;'),
      el('div',new Date().toLocaleDateString('ru-RU'),'font-size:15px;color:#718398;margin-bottom:22px;')
    );
    header.append(line('Период',typeof v9PeriodLabel==='function'?v9PeriodLabel(calcV9.months):`${calcV9.months} мес.`));
    header.append(line('Хозяйств',s.farms.length));
    header.append(line('Ежемесячно',money(s.monthly),true));
    blocks.push(header);

    s.farms.forEach((f,i)=>{
      const box=el('section',null,'width:760px;background:#fff;padding:28px 40px;border:1px solid #dfe7ee;border-top:0;box-sizing:border-box;');
      box.append(sectionTitle(f.name||`Хозяйство №${i+1}`));
      box.append(line('Поголовье',`${f.heads} голов`));
      if(f.selected&&f.selected.length){
        f.selected.forEach(k=>{
          let price=0;
          try{price=v9ProductPrice(k,f.heads)}catch(e){}
          box.append(line(CALC_META?.[k]?.name||k,`${money(price)} / мес.`));
        });
      }else{
        box.append(el('div','Продукты не выбраны','padding:12px 0;color:#7b8c9e;font-size:16px;'));
      }
      box.append(line('Итого по хозяйству',`${money(f.monthly)} / мес.`,true));
      blocks.push(box);
    });

    const total=el('section',null,'width:760px;background:#f7fbff;padding:30px 40px 34px;border:1px solid #cfe1f2;border-top:0;box-sizing:border-box;');
    total.append(sectionTitle('Итоговый расчёт'));
    total.append(line('Стоимость за период до скидки',money(s.gross)));
    total.append(line(`${s.manualDiscount===null?'Стандартная':'Индивидуальная'} скидка`,`${s.disc}% · ${money(s.discountAmount)}`));
    total.append(line('ИТОГО К ОПЛАТЕ',money(s.final),true));
    total.append(el('div','Расчёт сформирован в партнёрском кабинете АГРОИНТЕЛЛЕКТ','font-size:13px;color:#7a8c9e;margin-top:18px;'));
    blocks.push(total);

    blocks.forEach(b=>host.appendChild(b));
    document.body.appendChild(host);
    return {host,blocks};
  }

  async function captureBlock(block){
    const p=window.html2canvas(block,{
      scale:1,
      backgroundColor:'#ffffff',
      useCORS:false,
      allowTaint:false,
      logging:false,
      imageTimeout:500,
      scrollX:0,
      scrollY:0,
      windowWidth:760,
      foreignObjectRendering:false,
      removeContainer:true
    });
    return typeof window.v18WithTimeout==='function'?window.v18WithTimeout(p,12000,'Не удалось сформировать страницу PDF'):p;
  }

  window.v9BuildPdfFile=async function(){
    if(!(window.html2canvas&&window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF-библиотеки не загрузились');
    const {host,blocks}=buildReport();
    try{
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(r,30))));
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
      const margin=9,usableW=192,pageH=297,bottom=9,gap=3;
      let y=margin,has=false;
      for(const block of blocks){
        const canvas=await captureBlock(block);
        if(!canvas||!canvas.width||!canvas.height)throw new Error('Пустая страница PDF');
        const h=canvas.height*(usableW/canvas.width);
        if(has && y+h>pageH-bottom){pdf.addPage();y=margin;}
        const data=canvas.toDataURL('image/jpeg',0.82);
        pdf.addImage(data,'JPEG',margin,y,usableW,h,undefined,'FAST');
        has=true;y+=h+gap;
        canvas.width=1;canvas.height=1;
      }
      if(!has)throw new Error('PDF не содержит данных');
      const blob=pdf.output('blob');
      if(!blob||blob.size<1000)throw new Error('PDF-файл пустой');
      return new File([blob],`AGROINTELLECT-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
    }finally{host.remove();}
  };

  console.info('Partner Hub lightweight iOS PDF renderer v27 active');
})();
