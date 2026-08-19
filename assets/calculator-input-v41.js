/* Partner Hub calculator input v41 — remove preset herd count and let user type it. */
(function(){
  if(window.__partnerCalcInputV41)return;window.__partnerCalcInputV41=true;

  function normalizeInput(input){
    if(!input || input.dataset.manualHerdV41==='1')return;
    input.dataset.manualHerdV41='1';
    input.setAttribute('placeholder','Введите количество голов');
    input.setAttribute('inputmode','numeric');
    input.setAttribute('autocomplete','off');

    // Existing calculator creates farms with 500 by default. Clear only that untouched preset.
    if(String(input.value).trim()==='500'){
      input.value='';
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }

    const farm=input.closest('.farm-card');
    const hint=farm?.querySelector('.farm-herd small');
    if(hint)hint.textContent='Укажите фактическое количество дойного поголовья';
  }

  function scan(){
    document.querySelectorAll('.calculator-page [data-farm-heads]').forEach(normalizeInput);
  }

  const mo=new MutationObserver(()=>scan());
  mo.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('input',e=>{
    if(e.target.matches?.('[data-farm-heads]'))e.target.dataset.manualHerdV41='1';
  },true);
  scan();
  setTimeout(scan,500);
  setTimeout(scan,1500);
})();