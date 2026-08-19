/* Partner Hub mobile PDF reliability patch v25.
   Problem solved: Web Share requires transient user activation. Building a PDF first
   may consume that activation, so navigator.share() can fail on iPhone/Android.
   This patch pre-builds a fresh PDF in the background and, when needed, uses a
   second explicit tap after generation. Embedded calculator logic remains fallback. */
(function(){
  if(window.__partnerHubPdfV25)return;
  window.__partnerHubPdfV25=true;

  let cachedFile=null;
  let cacheStamp=0;
  let building=null;
  let warmTimer=null;
  const MAX_AGE=5*60*1000;
  const SHARE_TITLE='Расчёт стоимости лицензии АГРОИНТЕЛЛЕКТ';
  const SHARE_TEXT='Добрый день! Направляю Вам расчёт стоимости лицензии АГРОИНТЕЛЛЕКТ.';

  const isMobile=()=>/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||window.matchMedia('(max-width:767px)').matches;
  const canFileShare=file=>!!(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]})));
  const fresh=()=>cachedFile && (Date.now()-cacheStamp<MAX_AGE);

  function invalidate(){
    cachedFile=null;cacheStamp=0;
    clearTimeout(warmTimer);
    warmTimer=setTimeout(()=>warm(),1400);
  }

  async function build(){
    if(fresh())return cachedFile;
    if(building)return building;
    if(typeof window.v9BuildPdfFile!=='function')throw new Error('PDF builder unavailable');
    building=(async()=>{
      const file=await window.v9BuildPdfFile();
      if(!(file instanceof File))throw new Error('PDF file was not created');
      cachedFile=file;cacheStamp=Date.now();
      return file;
    })();
    try{return await building}finally{building=null}
  }

  function warm(){
    if(document.hidden || !document.querySelector('.calculator-page') || fresh() || building)return;
    build().catch(err=>console.warn('PDF prewarm skipped:',err));
  }

  function ensureSheet(){
    let sheet=document.getElementById('mobilePdfSheetV25');
    if(sheet)return sheet;
    sheet=document.createElement('div');
    sheet.id='mobilePdfSheetV25';
    sheet.innerHTML=`
      <div class="v25-pdf-shade" data-v25-close></div>
      <div class="v25-pdf-card" role="dialog" aria-modal="true" aria-labelledby="v25PdfTitle">
        <button class="v25-pdf-x" type="button" data-v25-close aria-label="Закрыть">×</button>
        <div class="v25-pdf-icon">PDF</div>
        <h3 id="v25PdfTitle">Расчёт готов</h3>
        <p id="v25PdfText">Нажмите «Поделиться PDF» — откроется системное меню телефона.</p>
        <div class="v25-pdf-actions">
          <button class="btn blue" id="v25PdfShare" type="button">Поделиться PDF</button>
          <button class="btn" id="v25PdfOpen" type="button">Открыть PDF</button>
        </div>
      </div>`;
    document.body.appendChild(sheet);
    sheet.querySelectorAll('[data-v25-close]').forEach(el=>el.addEventListener('click',()=>sheet.classList.remove('show')));
    return sheet;
  }

  function showReady(file,mode='share'){
    const sheet=ensureSheet();
    const text=sheet.querySelector('#v25PdfText');
    const shareBtn=sheet.querySelector('#v25PdfShare');
    const openBtn=sheet.querySelector('#v25PdfOpen');
    text.textContent=canFileShare(file)
      ? 'Файл готов. Нажмите «Поделиться PDF» и выберите нужный мессенджер или почту.'
      : 'На этом устройстве системная отправка файла недоступна. Откройте PDF и используйте кнопку «Поделиться» браузера.';
    shareBtn.style.display=canFileShare(file)?'inline-flex':'none';
    shareBtn.onclick=()=>{
      const p=navigator.share({title:SHARE_TITLE,text:SHARE_TEXT,files:[file]});
      Promise.resolve(p).then(()=>sheet.classList.remove('show')).catch(err=>{
        if(err?.name!=='AbortError')console.warn('System share failed:',err);
      });
    };
    openBtn.onclick=()=>{
      const url=URL.createObjectURL(file);
      const win=window.open(url,'_blank');
      if(!win)location.href=url;
      setTimeout(()=>URL.revokeObjectURL(url),180000);
    };
    sheet.classList.add('show');
    if(mode==='open'&&!canFileShare(file))openBtn.focus();else (canFileShare(file)?shareBtn:openBtn).focus();
  }

  async function getOrPrepare(btn,label){
    if(fresh())return cachedFile;
    const old=btn?.textContent||label;
    if(btn){btn.disabled=true;btn.textContent='Готовим PDF…';}
    try{return await build();}
    finally{if(btn){btn.disabled=false;btn.textContent=old;}}
  }

  window.v9ShareCalculation=async function(){
    const btn=document.getElementById('v9Share');
    try{
      if(fresh() && canFileShare(cachedFile)){
        await navigator.share({title:SHARE_TITLE,text:SHARE_TEXT,files:[cachedFile]});
        return;
      }
      const file=await getOrPrepare(btn,'↗ Поделиться');
      if(isMobile()){showReady(file,'share');return;}
      const url=URL.createObjectURL(file);
      const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000);
    }catch(err){
      console.error('PDF share v25 error:',err);
      if(err?.name!=='AbortError')alert('Не удалось подготовить PDF. Обновите страницу и повторите. Если ошибка повторится — используйте «PDF / Печать».');
    }
  };

  window.v9PrintCalculation=async function(){
    const btn=document.getElementById('v9Print');
    try{
      const file=await getOrPrepare(btn,'PDF / Печать');
      if(isMobile()){showReady(file,'open');return;}
      const url=URL.createObjectURL(file);
      const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000);
    }catch(err){
      console.error('PDF print v25 error:',err);
      if(err?.name!=='AbortError')window.print();
    }
  };

  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))invalidate();},true);
  document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))invalidate();},true);
  document.addEventListener('click',e=>{
    if(!e.target.closest?.('.calculator-page'))return;
    if(e.target.closest('#v9Share,#v9Print,#mobilePdfSheetV25'))return;
    const actionable=e.target.closest('button,.period-chip,.farm-product,.v15-discount-trigger');
    if(actionable)invalidate();
  },true);

  const observer=new MutationObserver(()=>{
    if(document.querySelector('.calculator-page')&&!fresh()&&!building){
      clearTimeout(warmTimer);warmTimer=setTimeout(warm,1800);
    }
  });
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});

  const style=document.createElement('style');
  style.id='mobilePdfV25Style';
  style.textContent=`
  #mobilePdfSheetV25{position:fixed;inset:0;z-index:12000;display:none;align-items:flex-end;justify-content:center;font-family:inherit}
  #mobilePdfSheetV25.show{display:flex}
  .v25-pdf-shade{position:absolute;inset:0;background:rgba(10,31,51,.42);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
  .v25-pdf-card{position:relative;width:min(520px,calc(100% - 24px));margin:12px;padding:26px;border:1px solid #dce5ed;border-radius:24px;background:#fff;box-shadow:0 24px 70px rgba(15,39,66,.22);text-align:center;color:#17324a}
  .v25-pdf-x{position:absolute;right:12px;top:10px;width:38px;height:38px;border:0;border-radius:12px;background:#f1f5f8;color:#587086;font-size:24px;cursor:pointer}
  .v25-pdf-icon{width:56px;height:56px;margin:0 auto 14px;display:grid;place-items:center;border-radius:16px;background:#e9f4ff;color:#1678d1;font-size:14px;font-weight:800;letter-spacing:.04em}
  .v25-pdf-card h3{margin:0 0 8px;font-size:22px}.v25-pdf-card p{margin:0 auto 20px;max-width:400px;color:#64788b;line-height:1.5}
  .v25-pdf-actions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}.v25-pdf-actions .btn{min-width:150px;justify-content:center}
  @media(min-width:768px){#mobilePdfSheetV25{align-items:center}.v25-pdf-card{margin:auto}}
  `;
  document.head.appendChild(style);

  setTimeout(warm,2200);
})();