# Auditoría de Entrega 3

Revisión realizada el 21 de octubre de 2026 sobre la rama `develop`, la consigna de Schoology, los issues, los pull requests y el tablero Kanban.

## Estado general

La implementación presente en `develop` cubre los flujos principales exigidos para los Sprint 3 y 4. La limpieza de pull requests obsoletas y la matriz automatizada de seguridad ya están completas. Antes de la entrega todavía deben completarse las pruebas de aceptación, verificar los despliegues en el proyecto Firebase correcto, preparar las cuentas de demostración, resolver las tres issues abiertas, integrar `develop` en `main` y terminar el PDF.

| Requisito de la consigna | Evidencia en `develop` | Estado |
|---|---|---|
| Registro, inicio, cierre y recuperación de acceso | Firebase Authentication por correo y Google, cierre de sesión y recuperación por correo | Implementado; requiere prueba final |
| Perfil y roles | Perfil en `usuarios/{uid}` y menús/accesos diferenciados para estudiante, docente y administrador | Implementado; requiere prueba final por rol |
| Catálogo desde Firestore | Inicio, catálogo, filtros y detalle consultan la colección `cursos` | Implementado |
| Adquisición y pago simulado | Confirmación, importe, método simulado, validación de duplicados y persistencia | Implementado; requiere prueba final |
| Historial del estudiante | Consulta de adquisiciones por usuario y acceso a cursos adquiridos | Implementado; requiere prueba de persistencia |
| Contenidos y progreso | Aula, contenidos, reproducción y colección `progresos` | Implementado; requiere prueba completa |
| Gestión docente | Creación de cursos, estado, contenidos y vista previa como estudiante | Implementado |
| Panel administrativo | Gestión de usuarios, cursos y adquisiciones | Implementado; depende de reglas y Functions desplegadas |
| Información administrativa | Estadísticas generales por cursos, docentes y adquisiciones | Implementado para administración |
| Validaciones y errores | Mensajes visibles, controles de acceso y reglas de Firestore | Implementado; 13 pruebas automatizadas aprobadas |
| Adaptación responsive | Existen reglas responsive en CSS | Pendiente de comprobación manual |
| Publicación final | GitHub Pages publica desde `main` | Pendiente; `develop` aún no está integrada en `main` |

## Firebase canónico

El único proyecto Firebase usado por los archivos versionados es `eduy-d6421`:

- `.firebaserc` define `eduy-d6421` como proyecto predeterminado.
- `js/firebase-config.js` centraliza Authentication, Firestore y Functions en `eduy-d6421`.
- Todos los módulos del frontend importan esa configuración central.
- `scripts/importar-cursos.py` también apunta a `eduy-d6421`.
- No se encontraron referencias versionadas al proyecto Firebase anterior.

Las Cloud Functions usan `initializeApp()` sin un ID fijo, que es la configuración correcta dentro de Firebase. Por esa razón se debe indicar el proyecto al desplegarlas:

```sh
firebase deploy --only firestore:rules --project eduy-d6421
firebase deploy --only functions --project eduy-d6421
```

## Issues abiertas

- [#93 Unificar y adaptar los estilos de las páginas](https://github.com/marceloprofe/EDUY/issues/93): falta comprobar la presentación en escritorio y móvil y limitar el alcance a correcciones necesarias, sin rediseñar la identidad visual acordada por el equipo.
- [#95 Agregar estadísticas para docentes y administración](https://github.com/marceloprofe/EDUY/issues/95): las estadísticas administrativas están implementadas; falta la vista limitada para docentes.
- [#114 Avance de cursos](https://github.com/marceloprofe/EDUY/issues/114): el estudiante guarda su progreso, pero falta la consulta del avance por parte del docente y la prueba de certificado indicada en la issue.

## Pull requests

No quedan pull requests abiertas. Las PR obsoletas o conflictivas fueron reemplazadas por cambios actualizados sobre `develop` y cerradas con una referencia a su reemplazo.

## Kanban y milestone

Los issues y pull requests del repositorio ya reflejan mejor el estado real: las duplicadas fueron cerradas y no quedan PR abiertas. El tablero puede conservar tarjetas antiguas cerradas hasta que GitHub ejecute sus automatizaciones; deben comprobarse visualmente las columnas al finalizar. El milestone `Sprint 4 - Administración e integración final` sigue abierto y mantiene tres issues pendientes.

## Pendientes necesarios para entregar

1. Probar los flujos completos como visitante, estudiante, docente y administrador.
2. Comprobar responsive en computadora y móvil.
3. Desplegar y verificar reglas y Functions en `eduy-d6421` usando `--project`.
4. Preparar al menos dos cuentas de demostración con roles diferentes y compartir las contraseñas por un medio privado.
5. Resolver las issues #93, #95 y #114.
6. Revisar visualmente las columnas del Kanban y cerrar el milestone cuando corresponda.
7. Integrar la versión final de `develop` en `main` después de las pruebas.
8. Verificar la versión pública de GitHub Pages.
9. Completar y exportar el PDF con portada, enlaces, estado de milestones, distribución del trabajo, limitaciones y cuentas de prueba.

## Comprobaciones técnicas realizadas

- Todos los archivos JavaScript pasan la comprobación de sintaxis de Node.
- Las referencias locales de las páginas apuntan a archivos existentes; el único enlace no tratado como archivo por la comprobación es el enlace telefónico `tel:` del pie de página.
- La configuración Firebase se encuentra centralizada y no contiene referencias versionadas a la base anterior.
- La matriz de seguridad de Firestore pasó 13 de 13 pruebas en el emulador mediante la PR #148.

Estas comprobaciones no reemplazan las pruebas manuales con cuentas reales ni la verificación de los despliegues en Firebase.
