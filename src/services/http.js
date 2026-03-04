// src/services/api/http.js
// Лёгкий HTTP-хелпер с таймаутом и дружелюбными ошибками.

export async function httpGet(url, { timeout = 10000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  let res, json;

  try {
    res = await fetch(url, { signal: ctrl.signal, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`);
    }
    json = await res.json();
    return json;
  } catch (e) {
    // Нормализуем ошибку
    const msg = e?.message || 'Network error';
    throw new Error(`[httpGet] ${url} :: ${msg}`);
  } finally {
    clearTimeout(id);
  }
}
