/* Partner Hub mobile UI normalizer v31 */
(function(){
  if(window.__partnerHubMobileUiV31)return;window.__partnerHubMobileUiV31=true;
  const labels=new Set(['О продукте','Материалы','Демо','Демо ↗']);
  function mark(){
    if(!window.matchMedia('(max-width:767px)').matches)return;
    document.querySelectorAll('button,a,[role="button"],div').forEach(el=>{
      const t=(el.textContent||'').trim().replace(/\s+/g,' ');
      if(labels.has(t)) el.classList.add('mobile-product-shortcut-v31');
    });
  }
  const obs=new MutationObserver(()=>requestAnimationFrame(mark));
  obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(mark,20),true);
  window.addEventListener('resize',mark,{passive:true});
  setTimeout(mark,0);setTimeout(mark,300);setTimeout(mark,900);
})();