/* Partner Hub CMS loader. The site keeps its embedded data as a fallback. */
window.PARTNER_HUB_CMS_URL = window.PARTNER_HUB_CMS_URL || '';

(function(){
  const url = window.PARTNER_HUB_CMS_URL || localStorage.getItem('partnerHubCmsUrl') || '';
  if (!url) {
    console.info('Partner Hub CMS: endpoint is not configured; embedded data is active.');
    return;
  }

  const text = v => String(v == null ? '' : v).trim();
  const bool = v => !['false','ложь','0','нет','off'].includes(text(v).toLowerCase());
  const split = v => text(v).split('|').map(x=>x.trim()).filter(Boolean);

  function materialFromRow(r){
    return {
      id:text(r['ID']),
      product:text(r['Продукт']) || 'all',
      cat:text(r['Категория']),
      type:text(r['Тип']) || 'LINK',
      title:text(r['Название']),
      desc:text(r['Описание']),
      purpose:text(r['Назначение']),
      url:text(r['Ссылка']),
      embed:text(r['Открытие']) || 'frame'
    };
  }
  function documentFromRow(r){
    return {
      id:text(r['ID']),
      group:text(r['Категория']) || 'Материалы',
      type:text(r['Тип']) || 'LINK',
      title:text(r['Название']),
      desc:text(r['Описание']),
      url:text(r['Ссылка']),
      embed:text(r['Открытие']) || 'frame'
    };
  }

  function applyCms(data){
    if (!data || !data.ok) throw new Error(data && data.error || 'CMS returned no data');

    if (Array.isArray(data.materials) && typeof MATERIALS !== 'undefined' && typeof DOCUMENTS !== 'undefined') {
      const active = data.materials.filter(r=>bool(r['Активно']));
      const mats = active.filter(r=>text(r['Раздел']).toLowerCase() !== 'документ').map(materialFromRow).filter(x=>x.id&&x.title&&x.url);
      const docs = active.filter(r=>text(r['Раздел']).toLowerCase() === 'документ').map(documentFromRow).filter(x=>x.id&&x.title&&x.url);
      MATERIALS.splice(0, MATERIALS.length, ...mats);
      DOCUMENTS.splice(0, DOCUMENTS.length, ...docs);
    }

    if (Array.isArray(data.contacts) && typeof CONTACTS !== 'undefined') {
      const contacts = data.contacts.filter(r=>bool(r['Активно'])).map(r=>({
        photo:text(r['Фото']), name:text(r['ФИО']), role:text(r['Должность']), phone:text(r['Телефон']), email:text(r['Email'])
      })).filter(x=>x.name);
      CONTACTS.splice(0, CONTACTS.length, ...contacts);
    }

    if (Array.isArray(data.integrations) && typeof INTEGRATIONS !== 'undefined') {
      const groups = new Map();
      data.integrations.filter(r=>bool(r['Активно'])).forEach(r=>{
        const group=text(r['Группа']); if(!group)return;
        if(!groups.has(group))groups.set(group,{group,desc:text(r['Описание']),items:[]});
        const system=text(r['Система']); if(system)groups.get(group).items.push(system);
      });
      INTEGRATIONS.splice(0, INTEGRATIONS.length, ...Array.from(groups.values()));
    }

    if (Array.isArray(data.products) && typeof PRODUCTS !== 'undefined') {
      data.products.filter(r=>bool(r['Активно'])).forEach(r=>{
        const id=text(r['ID']); if(!id)return;
        const old=PRODUCTS[id] || {};
        PRODUCTS[id]={
          ...old,
          name:text(r['Название'])||old.name||id,
          css:old.css||'online',
          tag:text(r['Тег'])||old.tag||'',
          subtitle:text(r['Подзаголовок'])||old.subtitle||'',
          site:text(r['Сайт'])||old.site||'',
          audience:split(r['Для кого']).length?split(r['Для кого']):(old.audience||[]),
          pain:text(r['Боль клиента'])||old.pain||'',
          what:text(r['Описание'])||old.what||'',
          benefits:old.benefits||[['Материалы','Откройте материалы продукта в партнёрском кабинете.']],
          demo:{url:text(r['Демо URL'])||old.demo?.url||'',login:text(r['Логин'])||old.demo?.login||'',password:text(r['Пароль'])||old.demo?.password||''}
        };
      });
    }

    window.PARTNER_HUB_CMS_STATUS={ok:true,version:data.version,generatedAt:data.generatedAt};
    if (typeof route === 'function' && typeof current !== 'undefined') route(current.route,current.product,current.tab);
    if (typeof showToast === 'function') showToast('Материалы обновлены из Google Таблицы');
  }

  fetch(url + (url.includes('?')?'&':'?') + 't=' + Date.now(), {cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(applyCms)
    .catch(err=>{
      window.PARTNER_HUB_CMS_STATUS={ok:false,error:String(err)};
      console.warn('Partner Hub CMS unavailable; embedded data kept:',err);
    });
})();
