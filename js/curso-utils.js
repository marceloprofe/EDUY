// Las rutas de imágenes locales se guardan relativas a la raíz del sitio.
const raiz = new URL('../', import.meta.url);
export function escaparHTML(valor = '') {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function resolverImagen(valor) {
  if (typeof valor !== 'string' || !valor.trim()) return new URL('img/logo.png', raiz).href;
  try {
    const url = new URL(valor.trim(), raiz);
    if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === raiz.origin)) return url.href;
  } catch {}
  return new URL('img/logo.png', raiz).href;
}
export function prepararImagenes(contenedor) {
  contenedor.querySelectorAll('img[data-imagen-curso]').forEach(imagen => {
    imagen.addEventListener('error', () => { imagen.src = resolverImagen(''); }, {once:true});
  });
}
export const nombresNivel = {basico:'Básico', intermedio:'Intermedio', avanzado:'Avanzado'};
