# EDUY – Plataforma Educativa

## 1. Descripción del proyecto

EDUY es una plataforma educativa orientada a facilitar el acceso a cursos y materiales de aprendizaje. Permite explorar un catálogo de cursos, consultar sus detalles y localizar propuestas según el nombre, el tema o el nivel.

## 2. Pantallas principales

Actualmente, el proyecto incluye:

- Página de inicio.
- Catálogo de cursos.
- Detalle de los cursos.
- Inicio de sesión.
- Navegación adaptable para computadoras y dispositivos móviles.

## 3. Navegación

La barra de navegación permite acceder a las principales secciones de la plataforma.

Flujo principal:

Inicio → Cursos → Detalle del curso

La página de Inicio también incorpora una lupa que abre una ventana de búsqueda rápida.

## 4. Búsqueda y filtros de cursos

El catálogo incorpora las siguientes funcionalidades:

- Búsqueda por nombre, tema o contenido del curso.
- Filtro por nivel:
  - Básico.
  - Intermedio.
  - Avanzado.
- Contador de cursos encontrados.
- Botón para limpiar los filtros.
- Búsqueda rápida desde la lupa ubicada en la navegación de Inicio.
- Envío automático de la búsqueda desde Inicio hacia el catálogo de cursos.

Estas funciones fueron desarrolladas con JavaScript y funcionan sin recargar la página durante el filtrado del catálogo.

## 5. Tecnologías utilizadas

- HTML5.
- CSS3.
- Bootstrap.
- JavaScript.
- Git y GitHub.

## 6. Organización de carpetas

```text
EDUY/
├── index.html
├── pages/
│   ├── cursos.html
│   ├── login.html
│   └── detalles/
├── css/
│   └── estilo.css
├── js/
│   ├── detalle.js
│   ├── filtros.js
│   └── footer.js
├── img/
└── README.md