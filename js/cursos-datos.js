import { db } from './firebase-config.js';
import { collection, query, where, getDocsFromServer, doc, getDocFromServer } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
export async function obtenerCursosHabilitados() {
  const resultado = await getDocsFromServer(query(collection(db, 'cursos'), where('habilitado', '==', true)));
  return resultado.docs.map(documento => ({...documento.data(), id:documento.id}))
    .sort((a,b) => (a.orden ?? 999) - (b.orden ?? 999) || String(a.titulo).localeCompare(String(b.titulo), 'es'));
}
export async function obtenerCursoFirestore(id) {
  const documento = await getDocFromServer(doc(db, 'cursos', id));
  return documento.exists() && documento.data().habilitado === true ? {...documento.data(),id:documento.id} : null;
}
