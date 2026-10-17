export const CURSO_HTML_CSS_ID = "html-css";

export const contenidosHtmlCss = [
  {
    id: "html-semantico",
    orden: 1,
    tipo: "leccion",
    titulo: "1. HTML semántico",
    descripcion: "Construí una página con estructura clara, títulos, navegación, contenido principal y pie de página.",
    duracion: "25 min",
    objetivos: [
      "Reconocer la estructura mínima de un documento HTML.",
      "Elegir etiquetas semánticas según la función del contenido.",
      "Crear enlaces e imágenes con información accesible."
    ],
    teoria: [
      "HTML describe la estructura y el significado del contenido. Las etiquetas semánticas ayudan al navegador, a los buscadores y a quienes utilizan lectores de pantalla.",
      "Una página suele organizarse con header, nav, main, section, article y footer. Los títulos deben mantener una jerarquía lógica: un h1 principal y subtítulos h2 o h3."
    ],
    codigo: `<header>\n  <h1>Club de tecnología</h1>\n  <nav aria-label="Navegación principal">\n    <a href="#proyectos">Proyectos</a>\n    <a href="#contacto">Contacto</a>\n  </nav>\n</header>\n<main>\n  <section id="proyectos">\n    <h2>Proyectos recientes</h2>\n    <article>\n      <h3>Robot seguidor de línea</h3>\n      <p>Construido por estudiantes de primer año.</p>\n    </article>\n  </section>\n</main>`,
    pregunta: "¿Qué elemento debe contener el contenido principal y único de la página?",
    opciones: ["<main>", "<aside>", "<footer>"],
    correcta: 0,
    explicacion: "<main> identifica el contenido principal. Debe existir una sola región main visible por documento."
  },
  {
    id: "css-fundamentos",
    orden: 2,
    tipo: "leccion",
    titulo: "2. Fundamentos de CSS",
    descripcion: "Aplicá colores, tipografía, espacio y el modelo de caja sin perder legibilidad.",
    duracion: "30 min",
    objetivos: [
      "Comprender selector, propiedad y valor.",
      "Diferenciar margin, border y padding.",
      "Definir una paleta reutilizable mediante variables."
    ],
    teoria: [
      "CSS controla la presentación. La cascada decide qué regla se aplica según el origen, la especificidad y el orden.",
      "El modelo de caja está formado por contenido, padding, borde y margin. Usar box-sizing: border-box facilita el cálculo de tamaños."
    ],
    codigo: `:root {\n  --color-principal: #1467d8;\n  --color-texto: #172033;\n}\n\n* { box-sizing: border-box; }\n\n.tarjeta {\n  padding: 1.5rem;\n  border: 1px solid #dbe4ef;\n  border-radius: 1rem;\n  color: var(--color-texto);\n  background: white;\n}`,
    pregunta: "¿Qué propiedad crea espacio entre el contenido y el borde?",
    opciones: ["margin", "padding", "gap"],
    correcta: 1,
    explicacion: "padding crea espacio interior; margin separa el elemento de los que lo rodean."
  },
  {
    id: "diseno-adaptable",
    orden: 3,
    tipo: "practica",
    titulo: "3. Diseño adaptable",
    descripcion: "Organizá componentes con Grid y adaptalos a distintos tamaños de pantalla.",
    duracion: "35 min",
    objetivos: [
      "Construir una cuadrícula flexible.",
      "Usar unidades relativas y minmax.",
      "Aplicar una media query solo cuando el contenido lo necesita."
    ],
    teoria: [
      "Un diseño adaptable responde al espacio disponible. La estrategia mobile first comienza con una columna y agrega complejidad en pantallas amplias.",
      "CSS Grid es ideal para distribuciones en filas y columnas. auto-fit y minmax permiten adaptar tarjetas con muy pocas reglas."
    ],
    codigo: `.lista-cursos {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));\n  gap: 1.5rem;\n}\n\n@media (min-width: 48rem) {\n  .encabezado {\n    display: flex;\n    justify-content: space-between;\n  }\n}`,
    pregunta: "¿Qué combinación crea columnas que se adaptan automáticamente?",
    opciones: ["float y clear", "auto-fit y minmax", "position y z-index"],
    correcta: 1,
    explicacion: "repeat(auto-fit, minmax(...)) crea tantas columnas como entren y conserva un ancho mínimo legible."
  },
  {
    id: "accesibilidad",
    orden: 4,
    tipo: "leccion",
    titulo: "4. Accesibilidad y calidad",
    descripcion: "Mejorá formularios, navegación por teclado, contraste y mensajes de estado.",
    duracion: "30 min",
    objetivos: [
      "Relacionar correctamente label e input.",
      "Conservar un foco visible para teclado.",
      "Escribir textos alternativos útiles."
    ],
    teoria: [
      "La accesibilidad permite que más personas utilicen el sitio. También mejora la claridad, la navegación con teclado y la calidad general del código.",
      "Los controles necesitan un nombre accesible, los colores deben alcanzar contraste suficiente y el foco nunca debe ocultarse sin una alternativa visible."
    ],
    codigo: `<label for="correo">Correo electrónico</label>\n<input id="correo" type="email" autocomplete="email" required>\n<p id="estado" role="status" aria-live="polite"></p>\n\n<style>\n  :focus-visible {\n    outline: 3px solid #2784f5;\n    outline-offset: 3px;\n  }\n</style>`,
    pregunta: "¿Cómo se relaciona un label con su campo?",
    opciones: ["Con colores iguales", "Con for en label e id en input", "Colocándolos en párrafos separados"],
    correcta: 1,
    explicacion: "El valor de for debe coincidir con el id del control para ampliar el área clicable y anunciar su nombre."
  },
  {
    id: "laboratorio-final",
    orden: 5,
    tipo: "proyecto",
    titulo: "5. Laboratorio: tu primera landing page",
    descripcion: "Editá HTML y CSS, observá el resultado inmediatamente y construí una página adaptable.",
    duracion: "45 min",
    objetivos: [
      "Integrar estructura semántica y estilos.",
      "Probar cambios en una vista previa segura.",
      "Revisar el resultado en distintos anchos."
    ],
    teoria: [
      "El proyecto reúne lo aprendido. Modificá el título, la descripción, los colores y el botón. La vista previa se ejecuta dentro de un espacio aislado.",
      "Antes de terminar, verificá jerarquía de títulos, contraste, foco visible y comportamiento en una pantalla pequeña."
    ],
    codigo: "",
    laboratorio: true,
    pregunta: "¿Cuál es la mejor forma de validar un diseño adaptable?",
    opciones: ["Probarlo solamente en una computadora", "Probar varios anchos y contenido real", "Usar siempre tamaños fijos"],
    correcta: 1,
    explicacion: "El diseño debe verificarse en varios anchos, con teclado y con contenido representativo."
  },
  {
    id: "evaluacion-final",
    orden: 6,
    tipo: "evaluacion",
    titulo: "6. Evaluación final",
    descripcion: "Comprobá los conceptos esenciales del curso y completá el recorrido.",
    duracion: "15 min",
    objetivos: [
      "Distinguir estructura y presentación.",
      "Elegir soluciones adaptables y accesibles.",
      "Interpretar la cascada y el modelo de caja."
    ],
    teoria: [
      "Respondé correctamente las cinco preguntas. Podés revisar tus respuestas y volver a intentarlo; el curso guarda la finalización cuando alcanzás el 80%.",
      "La evaluación busca comprobar decisiones prácticas, no memorizar sintaxis aislada."
    ],
    evaluacion: [
      { pregunta: "¿Qué lenguaje define la estructura de una página?", opciones: ["HTML", "CSS", "SQL"], correcta: 0 },
      { pregunta: "¿Qué sistema es adecuado para una cuadrícula bidimensional?", opciones: ["CSS Grid", "Texto plano", "Una imagen"], correcta: 0 },
      { pregunta: "¿Qué unidad suele adaptarse al tamaño de fuente raíz?", opciones: ["rem", "px únicamente", "dpi"], correcta: 0 },
      { pregunta: "¿Qué mejora la navegación con teclado?", opciones: ["Ocultar el foco", "Un foco visible", "Eliminar enlaces"], correcta: 1 },
      { pregunta: "¿Qué regla facilita calcular el tamaño total?", opciones: ["box-sizing: border-box", "position: fixed", "overflow: hidden"], correcta: 0 }
    ]
  }
];

export function buscarContenidoHtmlCss(id) {
  return contenidosHtmlCss.find((contenido) => contenido.id === id) || contenidosHtmlCss[0];
}
