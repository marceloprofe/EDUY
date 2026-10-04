import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { collection, query, where, getDocsFromServer, doc, getDocFromServer } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

function esperarUsuarioAutenticado() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const dejarDeObservar = onAuthStateChanged(auth, (usuario) => {
      dejarDeObservar();
      resolve(usuario);
    });
  });
}

export async function obtenerCursosHabilitados() {
  const resultado = await getDocsFromServer(query(collection(db, 'cursos'), where('habilitado', '==', true)));
  return resultado.docs.map(documento => ({...documento.data(), id:documento.id}))
    .sort((a,b) => (a.orden ?? 999) - (b.orden ?? 999) || String(a.titulo).localeCompare(String(b.titulo), 'es'));
}
export async function obtenerCursoFirestore(id) {
  const documento = await getDocFromServer(doc(db, 'cursos', id));
  if (!documento.exists()) return null;

  const curso = documento.data();
  if (curso.habilitado === true) return { ...curso, id: documento.id };

  const usuario = await esperarUsuarioAutenticado();
  if (!usuario) return null;

  const referenciaAdquisicion = doc(db, 'adquisiciones', `${usuario.uid}_${id}`);
  const adquisicion = await getDocFromServer(referenciaAdquisicion);
  return adquisicion.exists() && adquisicion.data().estado === 'confirmada'
    ? { ...curso, id: documento.id }
    : null;
}
