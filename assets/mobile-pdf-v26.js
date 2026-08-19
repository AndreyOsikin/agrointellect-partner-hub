/* Partner Hub iPhone PDF rendering reliability patch v26.
   Fixes html2canvas failures on iOS Safari caused by rendering a 900px clone at left:-10000px
   and by excessive canvas memory pressure. Loaded after legacy calculator code and v25 share UX. */
(function(){
  if(window.__partnerHubPdfV26)return;
  window.__partnerHubPdfV26=true;

  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isMobile=()=>isiOS||/Android/i.test(navigator.userAgent)||window.matchMedia('(max-width:767px)').matches;

  window.v18CloneForPdf=function(){
    const source=document.querySelector('.calculator-page');
    if(!source)throw new Error('Расчёт не найден');

    const host=document.createElement('div');
    host.id='v18PdfHost';
    // IMPORTANT FOR IOS: keep the capture tree inside a normal renderable coordinate space.
    // z-index puts it behind the app instead of moving it thousands of pixels off-screen.
    host.style.cssText='position:absolute;left:0;top:0;width:820px;background:#f7fafc;z-index:-9999;pointer-events:none;overflow:visible;';

    const clone=source.cloneNode(true);
    clone.classList.add('pdf-capture-mode','v18-pdf-mode','v26-pdf-mode');
    clone.style.cssText='width:820px!important;max-width:820px!important;margin:0!important;padding:14px!important;background:#f7fafc!important;transform:none!important;';

    clone.querySelectorAll('.calc-share-bar,#v9AddFarmTop,#v9AddFarmWide,.farm-delete,.v15-discount-trigger,.calc-help,#mobilePdfSheetV25').forEach(el=>el.remove());

    // iOS html2canvas is considerably more stable without decorative product images.
    // The text labels remain in the calculation, so no commercial information is lost.
    if(isiOS){
      clone.querySelectorAll('img').forEach(img=>{
        const ph=document.createElement('span');
        ph.className='v26-pdf-img-placeholder';
        ph.setAttribute('aria-hidden','true');
        ph.style.cssText='display:inline-block;width:28px;height:28px;border-radius:8px;background:#eef4f8;border:1px solid #dbe5ed;vertical-align:middle;';
        img.replaceWith(ph);
      });
    }

    host.appendChild(clone);
    document.body.appendChild(host);
    return {host,clone};
  };

  window.v18CanvasSection=async function(el,scale){
    if(!window.html2canvas)throw new Error('html2canvas не загрузился');
    const mobileScale=isMobile()?1:Math.min(Number(scale)||1.4,1.5);
    const timeoutMs=isiOS?18000:12000;
    const capture=window.html2canvas(el,{
      scale:mobileScale,
      backgroundColor:'#f7fafc',
      useCORS:false,
      allowTaint:false,
      logging:false,
      imageTimeout:1200,
      scrollX:0,
      scrollY:0,
      windowWidth:820,
      windowHeight:Math.max(900,Math.ceil(el.scrollHeight||el.getBoundingClientRect().height||900)),
      removeContainer:true,
      foreignObjectRendering:false,
      onclone:(doc)=>{
        doc.documentElement.style.setProperty('scroll-behavior','auto');
        doc.body.style.setProperty('overflow','visible','important');
        doc.querySelectorAll('*').forEach(n=>{
          n.style.animation='none';
          n.style.transition='none';
          n.style.caretColor='transparent';
        });
      }
    });
    if(typeof window.v18WithTimeout==='function')return window.v18WithTimeout(capture,timeoutMs,'Не удалось подготовить блок PDF');
    return capture;
  };

  // iOS-specific PDF builder: same commercial content, less memory and safer JPEG sizes.
  window.v9BuildPdfFile=async function(){
    if(!(window.html2canvas&&window.jspdf&&window.jspdf.jsPDF))throw new Error('PDF-библиотеки не загрузились');
    const {host,clone}=window.v18CloneForPdf();
    try{
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(r,40))));
      const sections=[
        clone.querySelector('.calc-hero-v9'),
        clone.querySelector('.calc-period-card'),
        ...clone.querySelectorAll('.farm-card'),
        clone.querySelector('.calc-summary-v9')
      ].filter(Boolean);
      if(!sections.length)throw new Error('Не найдены блоки расчёта');

      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
      const pageW=210,pageH=297,margin=8,gap=3,usableW=194,usableH=281;
      let y=margin;
      let hasContent=false;

      for(const section of sections){
        const canvas=await window.v18CanvasSection(section,1);
        if(!canvas||!canvas.width||!canvas.height)throw new Error('Пустой блок PDF');
        const pxPerMm=canvas.width/usableW;
        const hMm=canvas.height/pxPerMm;

        if(hMm>usableH){
          const pagePx=Math.max(1,Math.floor(usableH*pxPerMm));
          for(let sy=0;sy<canvas.height;sy+=pagePx){
            const sh=Math.min(pagePx,canvas.height-sy);
            const slice=document.createElement('canvas');
            slice.width=canvas.width; slice.height=sh;
            const ctx=slice.getContext('2d',{alpha:false});
            if(!ctx)throw new Error('Не удалось создать страницу PDF');
            ctx.fillStyle='#f7fafc';ctx.fillRect(0,0,slice.width,slice.height);
            ctx.drawImage(canvas,0,sy,canvas.width,sh,0,0,canvas.width,sh);
            if(hasContent)pdf.addPage();
            pdf.addImage(slice.toDataURL('image/jpeg',isiOS?0.72:0.84),'JPEG',margin,margin,usableW,sh/pxPerMm,undefined,'FAST');
            hasContent=true;
            slice.width=1;slice.height=1;
          }
          y=margin;
          canvas.width=1;canvas.height=1;
          continue;
        }

        if(hasContent&&y+hMm>pageH-margin){pdf.addPage();y=margin;}
        pdf.addImage(canvas.toDataURL('image/jpeg',isiOS?0.74:0.86),'JPEG',margin,y,usableW,hMm,undefined,'FAST');
        hasContent=true;
        y+=hMm+gap;
        canvas.width=1;canvas.height=1;
      }

      if(!hasContent)throw new Error('PDF не содержит данных');
      const blob=pdf.output('blob');
      if(!blob||blob.size<1000)throw new Error('PDF-файл получился пустым');
      return new File([blob],`AGROINTELLECT-raschet-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
    }finally{
      host.remove();
    }
  };

  console.info('Partner Hub PDF renderer v26 active', {isiOS});
})();