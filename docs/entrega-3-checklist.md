# Entrega 3 — Lista de cierre

Esta lista complementa el README y se utiliza para reunir la evidencia antes de integrar `develop` en `main`.

## Enlaces de entrega

- Plataforma pública: https://marceloprofe.github.io/EDUY/
- Repositorio: https://github.com/marceloprofe/EDUY
- Kanban: https://github.com/users/marceloprofe/projects/2/views/1
- Milestone Sprint 4: https://github.com/marceloprofe/EDUY/milestone/10

## Pruebas funcionales

- [ ] Registro con correo y contraseña.
- [ ] Inicio y cierre de sesión.
- [ ] Recuperación de contraseña y recepción del correo.
- [ ] Consulta del perfil del usuario.
- [ ] Navegación y restricciones como visitante.
- [ ] Navegación y restricciones como estudiante.
- [ ] Navegación y restricciones como docente.
- [ ] Navegación y restricciones como administrador.
- [ ] Catálogo, búsqueda, filtros y detalle desde Firestore.
- [ ] Creación, edición, publicación y despublicación de un curso.
- [ ] Gestión y vista previa de contenidos.
- [ ] Favoritos y adquisición con pago simulado.
- [ ] Persistencia de la adquisición después de cerrar sesión.
- [ ] Historial visible únicamente para el estudiante propietario.
- [ ] Acceso al aula, reproducción de contenidos y progreso.
- [ ] Gestión administrativa de usuarios.
- [ ] Gestión administrativa de cursos.
- [ ] Gestión administrativa de adquisiciones.
- [ ] Estadísticas administrativas.
- [ ] Mensajes de validación y error.
- [ ] Presentación responsive en móvil y escritorio.

## Firebase e integraciones

- [x] Ejecutar la matriz automatizada de reglas por rol en el emulador (13 pruebas aprobadas).
- [ ] Ejecutar `firebase use` y confirmar que muestra `eduy-d6421`.
- [ ] Publicar y verificar `firestore.rules` en `eduy-d6421`.
- [ ] Desplegar y verificar la función callable `gestionarUsuario`.
- [ ] Confirmar que los dominios publicados estén autorizados en Firebase Authentication.
- [ ] Probar enlaces de YouTube y Google Drive.
- [ ] Probar una carga pequeña mediante el preset unsigned de Cloudinary.

Cloudinary se configura en `js/cloudinary-config.js`. El repositorio solo contiene el nombre público del cloud y el upload preset unsigned; no se deben agregar API secrets ni credenciales privadas.

Los despliegues deben indicar el proyecto de forma explícita:

```sh
firebase deploy --only firestore:rules --project eduy-d6421
firebase deploy --only functions --project eduy-d6421
```

## Evidencia de GitHub

- [ ] Cada trabajo tiene issue, responsable y rama asociada.
- [ ] Las issues terminadas están cerradas y en la columna Finalizado.
- [ ] Las tareas descartadas incluyen una explicación.
- [ ] Los pull requests abiertos fueron revisados, fusionados o cerrados.
- [ ] El milestone Sprint 4 refleja el estado real.
- [ ] Se revisaron los commits y la participación de cada integrante.
- [ ] Se creó y probó el pull request final de `develop` hacia `main`.

## Cuentas para la demostración

La entrega debe proporcionar al menos dos cuentas con roles diferentes. Los correos y contraseñas se incluirán en el PDF o mensaje privado al docente. **No deben publicarse contraseñas en GitHub.**

| Rol | Cuenta preparada | Acceso comprobado |
|---|---:|---:|
| Estudiante | [ ] | [ ] |
| Docente | [ ] | [ ] |
| Administrador | [ ] | [ ] |

## PDF final

- [ ] Portada: equipo, integrantes, unidad, docente y fecha.
- [ ] Descripción breve de la plataforma.
- [ ] URL pública.
- [ ] URL del repositorio.
- [ ] URL del Kanban.
- [ ] Estado final de los milestones.
- [ ] Distribución del trabajo y participación.
- [ ] Funcionalidades pendientes y limitaciones conocidas.
- [ ] Credenciales de las cuentas de demostración.

## Limitaciones conocidas que deben revisarse

- Los videos cargados a Cloudinary consumen la cuota del plan configurado.
- Los enlaces de Google Drive necesitan permiso de lectura mediante enlace para poder reproducirse.
- La administración completa de cuentas depende del despliegue de Cloud Functions.
- GitHub Pages publica desde `main`; los cambios de `develop` no son públicos hasta realizar la integración final.
