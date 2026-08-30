# Documentación inicial del proyecto EDUY

## 1. Descripción del proyecto

EDUY es una plataforma educativa orientada a facilitar el acceso a cursos y materiales de aprendizaje. Contará con diferentes roles de usuario y permitirá navegar por un catálogo de cursos, consultar información y realizar compras o inscripciones.

## 2. Pantallas principales

El prototipo inicial incluye las siguientes pantallas:

- Inicio.
- Autenticación: inicio de sesión y registro.
- Catálogo de cursos.
- Detalle de un curso.
- Compra o inscripción.
- Panel según el rol del usuario.

## 3. Navegación

La barra de navegación permite acceder a las principales secciones de la plataforma.

Flujo principal:

Inicio → Catálogo → Detalle del curso → Compra o inscripción

Para utilizar funciones personalizadas:

Inicio → Iniciar sesión → Panel correspondiente al rol

## 4. Arquitectura inicial

La plataforma tendrá una arquitectura dividida en las siguientes partes:

### Frontend

Es la parte visible para el usuario.

Tecnologías utilizadas:

- HTML.
- CSS.
- Bootstrap.
- JavaScript.

### Servicios y almacenamiento

En una etapa posterior se utilizará Firebase para:

- Autenticación de usuarios.
- Almacenamiento de información.
- Gestión de cursos.
- Registro de compras o inscripciones.

La integración con Firebase está prevista para el Sprint 2.

## 5. Organización de carpetas

```text
EDUY/
├── index.html
├── pages/
│   ├── cursos.html
│   ├── login.html
│   ├── registro.html
│   └── compra.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── img/
    └── imágenes del proyecto