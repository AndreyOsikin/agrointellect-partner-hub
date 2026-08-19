/* PDF final v45 — same visual source as messenger image. */
(function(){
  if(window.__partnerPdfFinalV45)return;window.__partnerPdfFinalV45=true;
  async function waitCanvasBuilder(){
    for(let i=0;i<40;i++){
      if(typeof window.v9BuildCalculationCanvas==='function')return window.v9BuildCalculationCanvas;
      await new Promise(r=>setTimeout(r,50));
    }
    throw new Error('Calculation visual builder unavailable');
  }
  window.v9BuildPdfFile=async function(){
    if(!(window.jspdf&&window.jspdf.jsPDF))throw new Error('jsPDF unavailable');
    const buildCanvas=await waitCanvasBuilder();
    const canvas=await buildCanvas();
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    const pageW=210,pageH=297,marginX=10,marginY=10,usableW=190,usableH=277;
    const pxPerPage=Math.floor(canvas.width*(usableH/usableW));
    let sy=0,page=0;
    while(sy<canvas.height){
      if(page>0)pdf.addPage();
      const sliceH=Math.min(pxPerPage,canvas.height-sy);
      const part=document.createElement('canvas');part.width=canvas.width;part.height=sliceH;
      const pc=part.getContext('2d',{alpha:false});pc.fillStyle='#fff';pc.fillRect(0,0,part.width,part.height);pc.drawImage(canvas,0,sy,canvas.width,sliceH,0,0,canvas.width,sliceH);
      const img=part.toDataURL('image/jpeg',0.95);
      const drawH=usableW*(sliceH/canvas.width);
      pdf.addImage(img,'JPEG',marginX,marginY,usableW,drawH,undefined,'FAST');
      sy+=sliceH;page++;
    }
    const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF empty');
    const farms=(typeof window.v9Summary==='function'?(window.v9Summary().farms||[]).length:0);
    return new File([blob],`Agrointellect-raschet-${farms||1}-hoz-${new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
  };
})();
