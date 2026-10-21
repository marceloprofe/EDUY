const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require("@firebase/rules-unit-testing");

const {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} = require("firebase/firestore");

test("Seguridad de roles de EDUY", async (t) => {
  const entorno = await initializeTestEnvironment({
    projectId: "demo-eduy-seguridad",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync(
        join(__dirname, "..", "firestore.rules"),
        "utf8"
      )
    }
  });

  try {
    await entorno.clearFirestore();

    // Datos ficticios cargados solo en el emulador.
    await entorno.withSecurityRulesDisabled(async (contexto) => {
      const db = contexto.firestore();

      await Promise.all([
        setDoc(doc(db, "usuarios", "estudiante1"), {
          nombre: "Estudiante de prueba",
          rol: "estudiante"
        }),
        setDoc(doc(db, "usuarios", "docente1"), {
          nombre: "Docente propietario",
          rol: "docente"
        }),
        setDoc(doc(db, "usuarios", "docente2"), {
          nombre: "Otro docente",
          rol: "docente"
        }),
        setDoc(doc(db, "usuarios", "admin1"), {
          nombre: "Administrador de prueba",
          rol: "admin"
        }),
        setDoc(doc(db, "cursos", "curso1"), {
          titulo: "Curso de prueba",
          docenteId: "docente1",
          habilitado: false,
          estado: "borrador"
        }),
        setDoc(doc(db, "adquisiciones", "estudiante1_curso1"), {
          usuarioId: "estudiante1",
          usuarioCorreo: "estudiante@example.com",
          cursoId: "curso1",
          estado: "confirmada"
        }),
        setDoc(doc(db, "progresos", "estudiante1_curso1"), {
          usuarioId: "estudiante1",
          cursoId: "curso1",
          contenidosCompletados: ["contenido1"],
          porcentaje: 50
        })
      ]);
    });

    const visitante = entorno.unauthenticatedContext().firestore();
    const estudiante = entorno
      .authenticatedContext("estudiante1").firestore();
    const docente = entorno
      .authenticatedContext("docente1").firestore();
    const otroDocente = entorno
      .authenticatedContext("docente2").firestore();
    const admin = entorno
      .authenticatedContext("admin1").firestore();

    await t.test("Sin sesión: no puede listar usuarios", async () => {
      await assertFails(getDocs(collection(visitante, "usuarios")));
    });

    await t.test("Estudiante: puede leer su perfil", async () => {
      await assertSucceeds(
        getDoc(doc(estudiante, "usuarios", "estudiante1"))
      );
    });

    await t.test("Estudiante: no puede listar usuarios", async () => {
      await assertFails(getDocs(collection(estudiante, "usuarios")));
    });

    await t.test("Docente: no puede listar usuarios", async () => {
      await assertFails(getDocs(collection(docente, "usuarios")));
    });

    await t.test("Administrador: puede listar usuarios", async () => {
      await assertSucceeds(getDocs(collection(admin, "usuarios")));
    });

    await t.test("Estudiante: no puede convertirse en admin", async () => {
      await assertFails(
        updateDoc(doc(estudiante, "usuarios", "estudiante1"), {
          rol: "admin"
        })
      );
    });

    await t.test("Docente: no puede convertirse en admin", async () => {
      await assertFails(
        updateDoc(doc(docente, "usuarios", "docente1"), {
          rol: "admin"
        })
      );
    });

    await t.test("Sin sesión: no puede modificar un curso", async () => {
      await assertFails(
        updateDoc(doc(visitante, "cursos", "curso1"), {
          titulo: "Cambio sin permiso"
        })
      );
    });

    await t.test("Estudiante: no puede modificar un curso", async () => {
      await assertFails(
        updateDoc(doc(estudiante, "cursos", "curso1"), {
          titulo: "Cambio sin permiso"
        })
      );
    });

    await t.test("Docente: puede modificar su propio curso", async () => {
      await assertSucceeds(
        updateDoc(doc(docente, "cursos", "curso1"), {
          titulo: "Título actualizado"
        })
      );
    });

    await t.test("Otro docente: no puede modificar ese curso", async () => {
      await assertFails(
        updateDoc(doc(otroDocente, "cursos", "curso1"), {
          titulo: "Cambio de otro docente"
        })
      );
    });

    await t.test("Docente: no puede cambiar el propietario", async () => {
      await assertFails(
        updateDoc(doc(docente, "cursos", "curso1"), {
          docenteId: "docente2"
        })
      );
    });

    await t.test("Docente: consulta inscripciones de su curso", async () => {
      await assertSucceeds(
        getDocs(
          query(
            collection(docente, "adquisiciones"),
            where("cursoId", "==", "curso1")
          )
        )
      );
    });

    await t.test("Otro docente: no consulta esas inscripciones", async () => {
      await assertFails(
        getDocs(
          query(
            collection(otroDocente, "adquisiciones"),
            where("cursoId", "==", "curso1")
          )
        )
      );
    });

    await t.test("Docente: consulta el progreso de su curso", async () => {
      await assertSucceeds(
        getDocs(
          query(
            collection(docente, "progresos"),
            where("cursoId", "==", "curso1")
          )
        )
      );
    });

    await t.test("Otro docente: no consulta ese progreso", async () => {
      await assertFails(
        getDocs(
          query(
            collection(otroDocente, "progresos"),
            where("cursoId", "==", "curso1")
          )
        )
      );
    });
  } finally {
    await entorno.cleanup();
  }
});
