/* v43 — integration toggle inside final payment card */
(function(){
  if(window.__partnerCalcV43)return;window.__partnerCalcV43=true;
  if(typeof window.partnerNonstandardIntegration==='undefined')window.partnerNonstandardIntegration=false;
  function mount(){
    const final=document.querySelector('.summary-final');if(!final)return;
    let wrap=document.getElementById('v42IntegrationWrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='v42IntegrationWrap';
      wrap.innerHTML=`<div class="v42-integration"><div class="v42-integration-copy"><b>Требуется нестандартная интеграция</b><span>Стоимость согласовывается отдельно после оценки объёма работ</span></div><button type="button" class="v42-switch" id="v42IntegrationSwitch" aria-pressed="false" aria-label="Требуется нестандартная интеграция"></button></div>`;
    }
    if(wrap.parentElement!==final) final.appendChild(wrap);
    const sw=document.getElementById('v42IntegrationSwitch');if(!sw)return;
    const sync=()=>{const on=!!window.partnerNonstandardIntegration;sw.classList.toggle('on',on);sw.setAttribute('aria-pressed',String(on))};
    if(!sw.dataset.bound){sw.dataset.bound='1';sw.addEventListener('click',()=>{window.partnerNonstandardIntegration=!window.partnerNonstandardIntegration;sync();document.dispatchEvent(new CustomEvent('partner:integration-change',{detail:{enabled:window.partnerNonstandardIntegration}}))})}
    sync();
  }
  const obs=new MutationObserver(mount);obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',mount);setTimeout(mount,250);setTimeout(mount,1000);
})();
