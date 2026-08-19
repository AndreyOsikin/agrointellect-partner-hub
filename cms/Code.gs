const SPREADSHEET_ID = '1qvrLJcVEeE9lsS5j3nGLzE_1niUQYCYTFtG8LgsR1og';
const CACHE_KEY = 'partner_hub_cms_v1';

function doGet(e) {
  const callbackRaw = String((e && e.parameter && e.parameter.callback) || '');
  const callback = /^[A-Za-z_$][0-9A-Za-z_$\.]{0,120}$/.test(callbackRaw) ? callbackRaw : '';
  let payload;
  try {
    const refresh = String((e && e.parameter && e.parameter.refresh) || '') === '1';
    const data = getCmsData_(refresh);
    payload = { ok: true, generatedAt: new Date().toISOString(), ...data };
  } catch (err) {
    payload = { ok: false, error: String(err && err.message || err) };
  }

  const json = JSON.stringify(payload);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function getCmsData_(refresh) {
  const cache = CacheService.getScriptCache();
  if (!refresh) {
    const cached = cache.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const settings = rowsToObjects_(ss.getSheetByName('Настройки'));
  const cacheSeconds = Math.max(30, Math.min(21600, Number(setting_(settings, 'cache_seconds', 300)) || 300));

  const data = {
    version: String(setting_(settings, 'cms_version', '1')),
    settings: Object.fromEntries(settings.filter(r => r['Ключ']).map(r => [String(r['Ключ']), r['Значение']])),
    products: rowsToObjects_(ss.getSheetByName('Продукты')).filter(active_).sort(order_),
    materials: rowsToObjects_(ss.getSheetByName('Материалы')).filter(active_).sort(order_),
    integrations: rowsToObjects_(ss.getSheetByName('Интеграции')).filter(active_).sort(order_),
    contacts: rowsToObjects_(ss.getSheetByName('Контакты')).filter(active_).sort(order_)
  };

  const json = JSON.stringify(data);
  if (json.length < 95000) cache.put(CACHE_KEY, json, cacheSeconds);
  return data;
}

function rowsToObjects_(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(v => String(v).trim());
  return values.slice(1)
    .filter(row => row.some(v => String(v).trim() !== ''))
    .map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function active_(row) {
  const value = String(row['Активно'] == null ? 'TRUE' : row['Активно']).trim().toLowerCase();
  return !['false', 'ложь', '0', 'нет', 'off'].includes(value);
}

function order_(a, b) {
  return (Number(a['Порядок']) || 999999) - (Number(b['Порядок']) || 999999);
}

function setting_(rows, key, fallback) {
  const row = rows.find(r => String(r['Ключ']).trim() === key);
  return row ? row['Значение'] : fallback;
}

function clearPartnerHubCache() {
  CacheService.getScriptCache().remove(CACHE_KEY);
  return 'OK';
}
