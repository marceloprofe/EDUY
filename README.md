# EDUY – Plataforma Educativa

## 1. Descripción del proyecto

EDUY es una plataforma educativa orientada a facilitar el acceso a cursos y materiales de aprendizaje.

La plataforma permite explorar un catálogo de cursos, buscar propuestas según su nombre, tema o nivel, registrar usuarios y gestionar cursos mediante roles diferenciados de estudiante y docente.

## 2. Pantallas principales

Actualmente, el proyecto incluye:

- Página de inicio.
- Catálogo de cursos.
- Detalle de los cursos.
- Registro de usuarios.
- Inicio de sesión.
- Panel docente “Mis cursos”.
- Navegación adaptable para computadoras y dispositivos móviles.

## 3. Navegación

La barra de navegación permite acceder a las principales secciones de la plataforma.

Flujo principal:

Inicio → Cursos → Detalle del curso

La página de Inicio también incorpora una lupa que abre una ventana de búsqueda rápida.

Cuando un docente inicia sesión, la navegación muestra el enlace **Mis cursos**, desde donde puede administrar sus propuestas.

## 4. Registro e inicio de sesión

EDUY utiliza Firebase Authentication para gestionar el acceso de los usuarios.

La plataforma permite:

- Registrarse mediante correo electrónico y contraseña.
- Registrarse mediante una cuenta de Google.
- Iniciar sesión con correo electrónico y contraseña.
- Mantener la sesión abierta mediante la opción “Recordarme”.
- Cerrar sesión desde la barra de navegación.

Durante el registro público, todas las cuentas se crean automáticamente con el rol `estudiante`.

## 5. Roles de usuario

La plataforma diferencia dos roles:

### Estudiante

- Puede registrarse públicamente.
- Puede iniciar y cerrar sesión.
- Puede consultar el catálogo.
- Solo puede visualizar los cursos habilitados.

### Docente

- Puede acceder a la sección **Mis cursos**.
- Puede crear cursos nuevos.
- Los cursos nuevos se guardan inicialmente como borradores.
- Puede habilitar un curso para publicarlo.
- Puede devolver un curso publicado al estado de borrador.
- Solo puede administrar sus propios cursos.

Por seguridad, un usuario no puede asignarse el rol docente desde el formulario de registro. La habilitación de docentes debe realizarse manualmente por el equipo administrador desde Firebase Firestore.

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
- Fecha de creación.

Cuando el docente habilita el curso, este aparece en el catálogo público. Si vuelve a convertirlo en borrador, deja de mostrarse.

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

Estas funciones fueron desarrolladas con JavaScript y funcionan sin recargar la página durante el filtrado del catálogo.

## 8. Firebase y Firestore

El proyecto utiliza Firebase para:

- Autenticación de usuarios.
- Inicio de sesión con Google.
- Persistencia de sesiones.
- Almacenamiento de perfiles y roles.
- Almacenamiento y publicación de cursos.

### Colección `usuarios`

Cada documento utiliza como identificador el UID del usuario autenticado.

Campos principales:

- `nombre`
- `correo`
- `rol`
- `fechaCreacion`

Los valores admitidos para `rol` son:

- `estudiante`
- `docente`

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

## 9. Seguridad

Las reglas de Firestore controlan que:

- Los usuarios públicos se registren únicamente como estudiantes.
- Un usuario no pueda modificar su propio rol.
- Solo los docentes puedan crear y administrar cursos.
- Cada docente pueda administrar solamente sus propios cursos.
- Los cursos nuevos se creen como borradores.
- Los estudiantes y visitantes solo puedan consultar cursos habilitados.

## 10. Tecnologías utilizadas

- HTML5.
- CSS3.
- Bootstrap 5.
- JavaScript.
- Firebase Authentication.
- Cloud Firestore.
- Git y GitHub.

## 11. Organización de carpetas

```text
EDUY/
├── index.html
├── pages/
│   ├── cursos.html
│   ├── login.html
│   ├── registro.html
│   ├── mis-cursos.html
│   └── detalles/
├── css/
│   └── estilo.css
├── js/
│   ├── cursos-firestore.js
│   ├── detalle.js
│   ├── filtros.js
│   ├── firebase-config.js
│   ├── footer.js
│   ├── login.js
│   ├── mis-cursos.js
│   ├── registro.js
│   └── sesion.js
├── img/
├── firestore.rules
└── README.md
```

## 12. Estado actual

Actualmente se encuentran implementadas las siguientes funcionalidades:

- Catálogo y detalle de cursos.
- Búsqueda y filtrado por nivel.
- Registro e inicio de sesión con Firebase.
- Inicio de sesión con Google.
- Roles de estudiante y docente.
- Panel de gestión de cursos para docentes.
- Creación de cursos como borradores.
- Publicación y despublicación de cursos.
- Visualización pública exclusiva de cursos habilitados.
