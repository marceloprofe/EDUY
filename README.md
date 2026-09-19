# EDUY – Plataforma Educativa

## Descripción

EDUY es una plataforma educativa orientada al aprendizaje de programación, robótica y tecnología. Permite explorar cursos, buscar propuestas por tema o nivel, consultar sus detalles y crear una cuenta con perfil de estudiante o docente.

## Integrantes

- Marcelo Pando
- Alexander Llaguna
- Rubén Acuña

## Estado actual

El proyecto cuenta con un primer prototipo funcional desarrollado durante los Sprint 1 y 2. Las páginas principales están conectadas y la aplicación incorpora autenticación y perfiles mediante Firebase.

### Funcionalidades implementadas

- Página de inicio adaptable a diferentes tamaños de pantalla.
- Catálogo de cursos con búsqueda por nombre o tema y filtro por nivel.
- Página única de detalle que muestra dinámicamente el curso seleccionado mediante JavaScript.
- Registro de usuarios con correo y contraseña mediante Firebase Authentication.
- Selección de rol de estudiante o docente durante el registro.
- Almacenamiento de nombre, correo y rol en Cloud Firestore.
- Inicio y cierre de sesión.
- Persistencia de la sesión al navegar entre páginas.
- Perfil de usuario con nombre, correo y rol.
- Menú que muestra el perfil y la opción de cerrar sesión cuando hay una sesión activa.
- Navegación, estilos y pie de página compartidos.
- Publicación final mediante GitHub Pages.

### Funcionalidades pendientes

- Conectar el botón de acceso mediante Google con Firebase Authentication.
- Aplicar funciones diferentes según el rol del usuario.
- Almacenar y consultar el catálogo de cursos desde Cloud Firestore.

## Tecnologías utilizadas

- HTML5.
- CSS3.
- Bootstrap 5.
- JavaScript.
- Firebase Authentication.
- Cloud Firestore.
- Git y GitHub.

## Organización del proyecto

```text
EDUY/
├── index.html
├── pages/
│   ├── cursos.html
│   ├── detalle.html
│   ├── login.html
│   ├── perfil.html
│   └── registro.html
├── css/
│   └── estilo.css
├── js/
│   ├── detalle.js
│   ├── filtros.js
│   ├── firebase-config.js
│   ├── footer.js
│   ├── login.js
│   ├── perfil.js
│   ├── registro.js
│   └── sesion.js
├── img/
└── README.md
```

## Flujo de navegación

Inicio → Catálogo → Detalle del curso → Ingreso o registro

Inicio → Registro o ingreso → Perfil del usuario

## Flujo de trabajo

El equipo organiza el desarrollo mediante Issues, ramas de funcionalidades, commits y Pull Requests. Las funcionalidades se integran primero en `develop`, se prueban y posteriormente pasan a `main`.

## Enlaces

- Repositorio: https://github.com/marceloprofe/EDUY
- Sitio público: https://marceloprofe.github.io/EDUY/
