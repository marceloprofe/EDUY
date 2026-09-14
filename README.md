# EDUY – Plataforma Educativa

## Descripción

EDUY es una plataforma educativa orientada al aprendizaje de programación, robótica y tecnología. Permite explorar cursos, buscar propuestas por tema o nivel, consultar los detalles y crear una cuenta de usuario.

## Integrantes

- Marcelo Pando
- Alexander Llaguna
- Rubén Acuña

## Estado actual

El proyecto cuenta con un primer prototipo funcional desarrollado durante los Sprint 1 y 2.

### Funcionalidades implementadas

- Página de inicio adaptable.
- Catálogo de cursos.
- Búsqueda de cursos por nombre o tema.
- Filtro por nivel.
- Páginas de detalle de los cursos.
- Formulario de inicio de sesión.
- Inicio de sesión mediante Firebase Authentication.
- Formulario de registro.
- Creación de usuarios mediante Firebase Authentication.
- Validación de contraseñas.
- Almacenamiento del nombre del usuario.
- Navegación y footer compartidos.

### Funcionalidades pendientes

- Registro e ingreso mediante Google.
- Cierre de sesión.
- Perfil o panel del usuario.
- Diferenciación de roles.
- Almacenamiento de cursos y perfiles en Cloud Firestore.
- Publicación mediante GitHub Pages.

## Tecnologías utilizadas

- HTML5.
- CSS3.
- Bootstrap.
- JavaScript.
- Firebase Authentication.
- Git y GitHub.

## Organización del proyecto
```
EDUY/
├── index.html
├── pages/
│   ├── cursos.html
│   ├── login.html
│   ├── registro.html
│   ├── detalle.html
│   └── perfil.html
├── css/
│   └── estilo.css
├── js/
│   ├── detalle.js
│   ├── filtros.js
│   ├── firebase-config.js
│   ├── footer.js
│   ├── login.js
│   └── registro.js
├── img/
└── README.md
```
## Flujo de navegación

Inicio → Catálogo → Detalle del curso → Inscripción

Inicio → Registro o ingreso → Plataforma

## Repositorio

https://github.com/marceloprofe/EDUY