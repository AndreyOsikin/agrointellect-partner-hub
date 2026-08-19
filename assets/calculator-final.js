/* Final calculator behavior v45 — price labels, integration toggle, meaningful motion */
(function(){
  if(window.__partnerCalculatorFinalV45)return;window.__partnerCalculatorFinalV45=true;
  if(typeof window.partnerNonstandardIntegration==='undefined')window.partnerNonstandardIntegration=false;
  const money=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(Number(v)||0))+' ₽ / мес.';
  const last=new Map();
  function pulse(el,cls='calc-pulse'){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),430)}
  function updateProducts(){
    document.querySelectorAll('[data-farm-product]').forEach(btn=>{
      const parts=(btn.dataset.farmProduct||'').split(':');if(parts.length!==2)return;
      const id=Number(parts[0]),key=parts[1],farm=(window.calcV9?.farms||[]).find(f=>Number(f.id)===id);if(!farm)return;
      const span=btn.querySelector('span');if(!span)return;
      let price=0;try{price=window.v9ProductPrice(key,farm.heads)}catch(e){}
      span.textContent=money(price);
      const state=!!farm.products?.[key],memo=`${state}:${price}`;
      if(last.has(`p:${id}:${key}`)&&last.get(`p:${id}:${key}`)!==memo){pulse(btn,'calc-selected-pop')}
      last.set(`p:${id}:${key}`,memo);
    });
  }
  function animateValues(){
    ['v9Monthly','v9Gross','v9Discount','v9Final'].forEach(id=>{
      const el=document.getElementById(id);if(!el)return;const value=el.textContent;
      if(last.has(id)&&last.get(id)!==value){pulse(el);if(id==='v9Final')pulse(document.querySelector('.summary-final'),'calc-summary-glow')}
      last.set(id,value);
    });
    document.querySelectorAll('.farm-total strong,.summary-farm-price strong').forEach((el,i)=>{const k=`sum:${i}`,v=el.textContent;if(last.has(k)&&last.get(k)!==v)pulse(el);last.set(k,v)})
  }
  function mountIntegration(){
    const final=document.querySelector('.summary-final');if(!final)return;
    document.getElementById('v42IntegrationWrap')?.remove();
    let wrap=document.getElementById('calcFinalIntegration');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='calcFinalIntegration';
      wrap.innerHTML='<div class="calc-final-integration"><div><b>Требуется нестандартная интеграция</b><span>Стоимость согласовывается отдельно после оценки объёма работ</span></div><button type="button" class="calc-final-switch" aria-pressed="false" aria-label="Требуется нестандартная интеграция"></button></div>';
      final.appendChild(wrap);
    }else if(wrap.parentElement!==final){final.appendChild(wrap)}
    const sw=wrap.querySelector('.calc-final-switch');
    const sync=()=>{const on=!!window.partnerNonstandardIntegration;sw.classList.toggle('on',on);sw.setAttribute('aria-pressed',String(on))};
    if(!sw.dataset.bound){sw.dataset.bound='1';sw.addEventListener('click',()=>{window.partnerNonstandardIntegration=!window.partnerNonstandardIntegration;sync();pulse(wrap);document.dispatchEvent(new CustomEvent('partner:integration-change',{detail:{enabled:window.partnerNonstandardIntegration}}))})}
    sync();
  }
  function mount(){updateProducts();mountIntegration();animateValues()}
  const obs=new MutationObserver(()=>requestAnimationFrame(mount));obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  document.addEventListener('input',e=>{if(e.target.closest?.('.calculator-page'))requestAnimationFrame(mount)},true);
  document.addEventListener('change',e=>{if(e.target.closest?.('.calculator-page'))requestAnimationFrame(mount)},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-farm-product]'))setTimeout(mount,0)},true);
  document.addEventListener('DOMContentLoaded',mount);setTimeout(mount,250);setTimeout(mount,1000);
})();
