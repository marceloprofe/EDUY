# EDUY – Plataforma Educativa

## 1. Descripción del proyecto

EDUY es una plataforma educativa orientada a facilitar el acceso a cursos y materiales de aprendizaje.

La aplicación permite explorar un catálogo de cursos, buscar propuestas por nombre, contenido o nivel, registrar usuarios, administrar cursos y realizar adquisiciones mediante un sistema de pago completamente simulado.

La plataforma utiliza roles diferenciados de estudiante, docente y administrador.

## 2. Pantallas principales

Actualmente, el proyecto incluye:

- Página de inicio.
- Catálogo de cursos.
- Detalle de los cursos.
- Registro de usuarios.
- Inicio de sesión.
- Perfil del usuario.
- Panel docente “Mis cursos”.
- Panel de administración de usuarios.
- Página de adquisición de cursos.
- Página de acceso denegado.
- Navegación adaptable para computadoras y dispositivos móviles.

## 3. Navegación

La barra de navegación permite acceder a las principales secciones de la plataforma.

Flujo general:

```text
Inicio → Cursos → Adquirir curso
```

La página de Inicio también incorpora una lupa que abre una ventana de búsqueda rápida.

Las opciones disponibles en la navegación dependen del rol del usuario:

- El estudiante puede consultar y adquirir cursos habilitados.
- El docente puede acceder a “Mis cursos”.
- El administrador puede acceder al panel de administración.
- Todos los usuarios autenticados pueden consultar su perfil y cerrar sesión.

## 4. Registro e inicio de sesión

EDUY utiliza Firebase Authentication para gestionar el acceso de los usuarios.

La plataforma permite:

- Registrarse mediante correo electrónico y contraseña.
- Registrarse mediante una cuenta de Google.
- Iniciar sesión con correo electrónico y contraseña.
- Mantener la sesión abierta mediante la opción “Recordarme”.
- Cerrar sesión desde la barra de navegación.

Durante el registro público, todas las cuentas se crean automáticamente con el rol `estudiante`.

Esta medida impide que un usuario pueda asignarse privilegios de docente o administrador desde el formulario de registro.

## 5. Roles de usuario

La plataforma diferencia tres roles.

### Estudiante

El estudiante:

- Puede registrarse públicamente.
- Puede iniciar y cerrar sesión.
- Puede consultar el catálogo.
- Solo puede visualizar cursos habilitados.
- Puede acceder a la página de adquisición.
- Puede realizar una adquisición mediante un pago simulado.
- No puede adquirir dos veces el mismo curso.
- No puede acceder al panel docente ni al panel administrativo.

### Docente

El docente:

- Puede acceder a la sección “Mis cursos”.
- Puede crear cursos nuevos.
- Guarda los cursos nuevos inicialmente como borradores.
- Puede habilitar un curso para publicarlo.
- Puede devolver un curso publicado al estado de borrador.
- Solo puede consultar y administrar sus propios cursos.
- No puede acceder al panel administrativo.

### Administrador

El administrador:

- Puede acceder al panel de administración.
- Puede consultar la lista de usuarios registrados.
- Puede crear usuarios con los roles `estudiante`, `docente` o `admin`.
- Puede modificar el nombre y el rol de usuarios que no sean administradores.
- Puede eliminar cuentas no administrativas que no tengan cursos asociados.
- No puede modificar su propio rol desde la plataforma.
- No necesita modificar manualmente cada usuario desde la consola de Firestore.

La primera cuenta administradora debe configurarse manualmente en Firestore. Después, el administrador puede gestionar las cuentas desde la propia plataforma.

## 6. Gestión de cursos

Los docentes pueden crear cursos ingresando:

- Título.
- Descripción.
- Nivel.

Los niveles disponibles son:

- Básico.
- Intermedio.
- Avanzado.

Todo curso nuevo se guarda con:

- Estado `borrador`.
- Campo `habilitado` con valor `false`.
- Identificación del docente que lo creó.
- Nombre del docente.
- Fecha de creación.

Cuando el docente habilita el curso, este aparece en el catálogo.

Si el docente vuelve a convertirlo en borrador, deja de mostrarse públicamente, aunque permanece guardado en Firestore.

## 7. Búsqueda y filtros de cursos

El catálogo incorpora las siguientes funcionalidades:

- Búsqueda por nombre, tema o contenido del curso.
- Filtro por nivel:
  - Básico.
  - Intermedio.
  - Avanzado.
- Contador de cursos encontrados.
- Botón para limpiar los filtros.
- Búsqueda rápida desde la lupa ubicada en la navegación de Inicio.
- Envío automático de la búsqueda desde Inicio hacia el catálogo.
- Carga de cursos habilitados almacenados en Firestore.

Estas funciones fueron desarrolladas con JavaScript y funcionan sin recargar completamente la página durante el filtrado del catálogo.

## 8. Adquisición de cursos

Los estudiantes autenticados pueden adquirir cursos habilitados.

El flujo de adquisición funciona de la siguiente manera:

1. El estudiante selecciona un curso habilitado desde el catálogo.
2. La plataforma abre la página de adquisición.
3. Se cargan el título, la descripción y el importe del curso.
4. El estudiante confirma la operación.
5. La plataforma simula el pago.
6. La adquisición queda almacenada en Firestore.
7. El sistema impide registrar nuevamente el mismo curso para el mismo estudiante.

La operación es completamente simulada:

- No genera cargos reales.
- No solicita datos de tarjetas.
- No solicita cuentas bancarias.
- No utiliza una pasarela de pago externa.

Los importes utilizados actualmente según el nivel son:

- Básico: `$ 1.200`.
- Intermedio: `$ 1.800`.
- Avanzado: `$ 2.400`.

Si el curso ya tiene un campo numérico `precio`, la plataforma utiliza ese valor.

Para evitar duplicados, cada adquisición utiliza un identificador compuesto por el UID del estudiante y el identificador del curso.

## 9. Firebase y Firestore

El proyecto utiliza Firebase para:

- Autenticación de usuarios.
- Inicio de sesión con Google.
- Persistencia de sesiones.
- Almacenamiento de perfiles y roles.
- Administración de permisos.
- Almacenamiento y publicación de cursos.
- Persistencia de adquisiciones.

### Colección `usuarios`

Cada documento utiliza como identificador el UID del usuario autenticado.

Campos principales:

- `nombre`
- `correo`
- `rol`
- `fechaCreacion`
- `fechaActualizacion`
- `actualizadoPor`

Los valores admitidos para `rol` son:

- `estudiante`
- `docente`
- `admin`

El rol `admin` no puede asignarse mediante el registro público. Solo un administrador autenticado puede asignarlo desde el panel.

### Colección `cursos`

Campos principales:

- `titulo`
- `descripcion`
- `nivel`
- `docenteId`
- `docenteNombre`
- `estado`
- `habilitado`
- `fechaCreacion`
- `fechaActualizacion`

### Colección `adquisiciones`

Campos principales:

- `usuarioId`
- `usuarioCorreo`
- `cursoId`
- `cursoTitulo`
- `importe`
- `estado`
- `pagoSimulado`
- `fechaAdquisicion`

El campo `estado` se guarda con el valor `confirmada` y `pagoSimulado` se guarda con el valor `true`.

## 10. Seguridad

Las reglas de Firestore controlan que:

- Los usuarios públicos se registren únicamente como estudiantes.
- Un usuario no pueda modificar su propio rol.
- Solo el administrador pueda crear cuentas y asignar los roles estudiante, docente o admin.
- El administrador pueda modificar nombre y rol de otros usuarios, excepto los perfiles administradores existentes.
- El administrador no pueda cambiar su propio rol.
- El registro público cree perfiles únicamente con el rol estudiante.
- Solo los docentes puedan crear y administrar cursos.
- Cada docente pueda administrar solamente sus propios cursos.
- Los cursos nuevos se creen como borradores.
- Los estudiantes y visitantes solo puedan consultar cursos habilitados.
- Solo un estudiante autenticado pueda registrar una adquisición.
- Solo puedan adquirirse cursos habilitados.
- Una adquisición confirmada no pueda modificarse ni eliminarse desde la aplicación.
- El estudiante pueda consultar únicamente sus propias adquisiciones.
- El administrador tenga autorización para consultar las adquisiciones.

Además, la aplicación verifica el rol antes de permitir el acceso a las páginas restringidas. Cuando un usuario intenta entrar en una sección sin autorización, es redirigido a la página de acceso denegado.

### Administración de usuarios

La pestaña Usuarios consulta `usuarios/{uid}`. El alta crea la cuenta con una instancia secundaria de Firebase Authentication y guarda el perfil en Firestore con el mismo UID, sin cerrar la sesión del administrador. Si Firestore rechaza el perfil, el panel intenta retirar la cuenta temporal. Las bajas usan una función callable de Cloud Functions y Firebase Admin SDK.

- Las modificaciones actualizan `nombre` y `rol` y verifican el resultado leyendo el documento desde el servidor.
- Las bajas eliminan el perfil y la cuenta de Authentication. No se permite eliminar administradores, la cuenta en uso ni docentes con cursos asociados.
- Las cuentas nuevas pueden recibir cualquiera de los tres roles. Los perfiles que ya son administradores permanecen protegidos frente a edición y eliminación.
- Las bajas requieren desplegar la función callable desde Firebase CLI; las reglas actuales deben estar publicadas para que funcionen las altas y modificaciones.

## 11. Tecnologías utilizadas

- HTML5.
- CSS3.
- Bootstrap 5.
- JavaScript.
- Firebase Authentication.
- Cloud Firestore.
- Cloud Functions.
- Git.
- GitHub.
- GitHub Projects.
- Metodología Scrum y tablero Kanban.

## 12. Organización de carpetas

```text
EDUY/
├── index.html
├── pages/
│   ├── acceso-denegado.html
│   ├── adquisicion.html
│   ├── cursos.html
│   ├── detalle.html
│   ├── login.html
│   ├── mis-cursos.html
│   ├── panel-admin.html
│   ├── perfil.html
│   └── registro.html
├── css/
│   └── estilo.css
├── js/
│   ├── adquisicion.js
│   ├── cursos-firestore.js
│   ├── detalle.js
│   ├── filtros.js
│   ├── firebase-config.js
│   ├── footer.js
│   ├── login.js
│   ├── mis-cursos.js
│   ├── panel-admin.js
│   ├── perfil.js
│   ├── registro.js
│   └── sesion.js
├── functions/
│   ├── index.js
│   └── package.json
├── firebase.json
├── .firebaserc
├── img/
├── firestore.rules
└── README.md
```

## 13. Estado actual

Actualmente se encuentran implementadas las siguientes funcionalidades:

- Catálogo y detalle de cursos.
- Búsqueda y filtrado por nivel.
- Registro e inicio de sesión con Firebase.
- Inicio de sesión con Google.
- Persistencia de la sesión.
- Roles de estudiante, docente y administrador.
- Panel de gestión de cursos para docentes.
- Creación de cursos como borradores.
- Publicación y despublicación de cursos.
- Visualización pública exclusiva de cursos habilitados.
- Panel administrativo de usuarios.
- Alta, modificación y baja de usuarios desde el panel administrativo.
- Asignación de los roles estudiante, docente y administrador.
- Restricción de acceso según el rol.
- Página de acceso denegado.
- Flujo de adquisición de cursos.
- Simulación de pago.
- Persistencia de adquisiciones en Firestore.
- Prevención de adquisiciones duplicadas.

## 14. Funcionalidades pendientes

Las próximas funcionalidades previstas son:

- Página “Mis adquisiciones” para el estudiante.
- Consulta de adquisiciones desde el panel administrador.
- Integración final de estilos y diseño adaptable.
- Pruebas completas con los tres roles.
- Publicación de la versión final.
- Actualización de la documentación final del proyecto.

## 15. Flujo de trabajo con Git y GitHub

El proyecto utiliza el siguiente flujo de ramas:

```text
feature/* → develop → main
```

- Cada funcionalidad se desarrolla en una rama `feature`.
- Las ramas de funcionalidades se integran mediante Pull Requests.
- La rama `develop` contiene la versión integrada en desarrollo.
- La rama `main` se reserva para la versión estable y final.
- Las actividades se organizan mediante issues, milestone y tablero Kanban.

## Catálogo centralizado en Firestore

El inicio, el catálogo, el detalle y la adquisición consultan la colección `cursos` de `eduy-d6421`. Las lecturas de cursos usan `getDocsFromServer` / `getDocFromServer`: un error de conexión se muestra al usuario y no activa un catálogo local. Los enlaces antiguos `detalle.html?id=...` siguen funcionando mediante el ID del documento.

Cada curso puede guardar `imagen` (string): URL HTTPS o ruta relativa a la raíz del sitio, por ejemplo `img/cursos/curso-python-eduy.jpg`. El formulario Mis cursos incluye este campo. La imagen se presenta en inicio, catálogo, detalle y Mis cursos; si falta o falla, se usa el logo de EDUY. Firestore almacena la referencia de la imagen; los archivos locales continúan en `img/`.

Otros campos del catálogo: `titulo`, `descripcion`, `nivel` (basico/intermedio/avanzado), `duracion`, `precio`, `habilitado`, `estado`, `docenteNombre`, `orden`, `destacado` y `modulos` (array de mapas con titulo/descripcion). Se conserva `docenteId` en los cursos creados por docentes. Los 15 cursos institucionales importados figuran como Equipo EDUY y se administran desde la consola, sin asignarlos a un docente individual.

### Importación de los cursos originales

`datos/cursos-iniciales.json` conserva los 15 cursos originales y sus módulos exclusivamente como archivo de migración: ninguna página lo carga como fuente alternativa. En Cloud Shell con una sesión autorizada, subir ese archivo y `scripts/importar-cursos.py`, y ejecutar:

```sh
python3 importar-cursos.py cursos-iniciales.json
```

El script crea únicamente IDs ausentes y agrega la imagen faltante a documentos existentes sin cambiar sus otros campos. Utiliza una escritura atómica con precondiciones; si un documento cambió durante la importación, falla para evitar sobrescribirlo. Al finalizar comprueba los 15 cursos con imagen y módulos. No cambia las reglas de seguridad.
