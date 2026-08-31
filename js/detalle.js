const cursos = {
  "esp32-basico": {
    titulo: "ESP32: primeros proyectos", nivel: "Básico", imagen: "curso-esp32-eduy.jpg", duracion: "18 horas",
    descripcion: "Una introducción práctica al ESP32 para comprender la placa, programar entradas y salidas y construir prototipos electrónicos conectados.",
    modulos: [
      ["Conociendo el ESP32", "Entorno de desarrollo, arquitectura de la placa, alimentación segura, pines digitales y primer programa."],
      ["Entradas y salidas", "Lectura de pulsadores y sensores, control de LED, temporización y uso del monitor serial."],
      ["Sensores y actuadores", "Medición de temperatura, distancia y movimiento; control de servomotores y señales PWM."],
      ["Proyecto integrador", "Construcción, prueba y documentación de un dispositivo inteligente de monitoreo."],
    ],
  },
  "esp32-avanzado": {
    titulo: "ESP32: IoT y conectividad", nivel: "Avanzado", imagen: "curso-esp32-eduy.jpg", duracion: "24 horas",
    descripcion: "Desarrollo de dispositivos IoT capaces de comunicarse, publicar mediciones y responder a órdenes remotas mediante redes inalámbricas.",
    modulos: [
      ["Wi-Fi y Bluetooth", "Configuración de redes, conexión segura, Bluetooth Low Energy y diagnóstico de comunicaciones."],
      ["Protocolos IoT", "HTTP, APIs REST, MQTT, publicación de datos y suscripción a eventos."],
      ["Paneles y almacenamiento", "Registro de mediciones, tableros web, alertas y visualización en tiempo real."],
      ["Proyecto conectado", "Sistema IoT completo con sensores, control remoto, recuperación ante errores y documentación."],
    ],
  },
  "esp32-pro": {
    titulo: "ESP32: sistemas inteligentes", nivel: "Pro", imagen: "curso-esp32-eduy.jpg", duracion: "30 horas",
    descripcion: "Diseño profesional de soluciones embebidas robustas, seguras, eficientes y preparadas para operar de forma continua.",
    modulos: [
      ["Arquitectura avanzada", "FreeRTOS, tareas, interrupciones, concurrencia, memoria y organización mantenible del firmware."],
      ["Seguridad y actualización", "Cifrado, credenciales, arranque seguro y actualización remota OTA."],
      ["Eficiencia y confiabilidad", "Modos de bajo consumo, watchdog, registro de fallos y pruebas de larga duración."],
      ["Producto final", "Prototipo listo para producción con telemetría, seguridad, pruebas y memoria técnica."],
    ],
  },
  "raspberry-pi-basico": {
    titulo: "Raspberry Pi: fundamentos", nivel: "Básico", imagen: "curso-raspberry-pi-eduy.jpg", duracion: "20 horas",
    descripcion: "Aprendizaje inicial de Raspberry Pi, Linux y Python para controlar componentes electrónicos y crear proyectos físicos.",
    modulos: [
      ["Preparación del equipo", "Instalación del sistema, configuración, escritorio, terminal y conexión a la red."],
      ["Linux esencial", "Archivos, permisos, paquetes, procesos y comandos necesarios para administrar proyectos."],
      ["Python y GPIO", "Programación básica, lectura de botones y sensores, control de LED y buenas prácticas eléctricas."],
      ["Proyecto integrador", "Estación interactiva controlada con Python, registro de datos y presentación del resultado."],
    ],
  },
  "raspberry-pi-avanzado": {
    titulo: "Raspberry Pi: automatización", nivel: "Avanzado", imagen: "curso-raspberry-pi-eduy.jpg", duracion: "26 horas",
    descripcion: "Automatización de espacios y procesos mediante Python, cámaras, servicios web, sensores y tareas programadas.",
    modulos: [
      ["Python aplicado", "Entornos virtuales, módulos, manejo de errores, archivos de configuración y registros."],
      ["Sensores y cámara", "Captura de imágenes, interfaces GPIO, I2C y SPI, calibración y procesamiento básico."],
      ["Servicios automáticos", "APIs, tareas programadas, servicios del sistema, bases de datos y paneles de control."],
      ["Proyecto de automatización", "Sistema autónomo con reglas, alertas, historial y acceso desde la red local."],
    ],
  },
  "raspberry-pi-pro": {
    titulo: "Raspberry Pi: robótica avanzada", nivel: "Pro", imagen: "curso-raspberry-pi-eduy.jpg", duracion: "34 horas",
    descripcion: "Integración avanzada de visión artificial, navegación, comunicaciones y control para robots autónomos.",
    modulos: [
      ["Control de movimiento", "Motores, encoders, control PID, fuentes de alimentación y movimiento preciso."],
      ["Visión artificial", "Captura, procesamiento, detección de objetos y toma de decisiones a partir de imágenes."],
      ["Arquitectura robótica", "Procesos concurrentes, mensajería, telemetría, APIs y supervisión remota."],
      ["Robot autónomo", "Diseño y validación de un robot que percibe, decide, navega y registra su desempeño."],
    ],
  },
  "arduino-basico": {
    titulo: "Arduino: electrónica inicial", nivel: "Básico", imagen: "curso-arduino-eduy.jpg", duracion: "18 horas",
    descripcion: "Fundamentos de electrónica y programación con Arduino mediante experimentos guiados y circuitos seguros.",
    modulos: [
      ["Electricidad y protoboard", "Voltaje, corriente, resistencia, ley de Ohm y armado correcto de circuitos."],
      ["Programación Arduino", "Variables, condiciones, ciclos, funciones, monitor serial y estructura de un sketch."],
      ["Componentes esenciales", "LED, pulsadores, potenciómetros, sensores y control de servomotores."],
      ["Proyecto final", "Dispositivo interactivo completo con entradas, salidas, carcasa simple y documentación."],
    ],
  },
  "arduino-avanzado": {
    titulo: "Arduino: robots y sensores", nivel: "Avanzado", imagen: "curso-arduino-eduy.jpg", duracion: "24 horas",
    descripcion: "Construcción de robots móviles capaces de medir su entorno, controlar motores y ejecutar comportamientos autónomos.",
    modulos: [
      ["Sensores avanzados", "Ultrasonido, infrarrojos, unidades inerciales, filtrado y calibración de mediciones."],
      ["Motores y potencia", "Puentes H, motores DC, paso a paso, servos y separación segura de alimentación."],
      ["Comunicaciones", "I2C, SPI, serial, módulos inalámbricos y control desde dispositivos externos."],
      ["Robot móvil", "Montaje, programación y ajuste de un robot que evita obstáculos y completa una misión."],
    ],
  },
  "arduino-pro": {
    titulo: "Arduino: sistemas embebidos", nivel: "Pro", imagen: "curso-arduino-eduy.jpg", duracion: "30 horas",
    descripcion: "Diseño de firmware y hardware embebido eficiente, modular y confiable para aplicaciones exigentes.",
    modulos: [
      ["Firmware mantenible", "Máquinas de estado, programación no bloqueante, bibliotecas, eventos y arquitectura modular."],
      ["Tiempo real", "Temporizadores, interrupciones, adquisición precisa y control de tareas críticas."],
      ["Optimización", "Memoria, consumo, comunicación robusta, diagnóstico y recuperación frente a errores."],
      ["Sistema profesional", "Prototipo documentado con pruebas, esquema eléctrico y criterios de producción."],
    ],
  },
  "microbit-basico": {
    titulo: "micro:bit: programación creativa", nivel: "Básico", imagen: "curso-microbit-eduy.jpg", duracion: "14 horas",
    descripcion: "Introducción visual y divertida a la programación mediante animaciones, juegos y experimentos interactivos.",
    modulos: [
      ["Primeros bloques", "Entorno MakeCode, secuencias, eventos, botones y matriz de luces."],
      ["Variables y decisiones", "Datos, condiciones, ciclos, contadores y depuración de programas."],
      ["Sensores integrados", "Movimiento, temperatura, luz, brújula y creación de respuestas interactivas."],
      ["Proyecto creativo", "Diseño de un juego o dispositivo interactivo con reglas y presentación final."],
    ],
  },
  "microbit-avanzado": {
    titulo: "micro:bit: robótica y radio", nivel: "Avanzado", imagen: "curso-microbit-eduy.jpg", duracion: "20 horas",
    descripcion: "Programación de robots, motores y redes de placas micro:bit que colaboran mediante comunicación por radio.",
    modulos: [
      ["Pines y extensiones", "Conexión segura de sensores, servos, motores y placas de expansión."],
      ["Comunicación por radio", "Grupos, mensajes, protocolos simples y coordinación entre dispositivos."],
      ["Robótica móvil", "Movimiento, detección de obstáculos, control remoto y comportamientos automáticos."],
      ["Desafío colaborativo", "Construcción de varios dispositivos que se comunican para resolver una misión."],
    ],
  },
  "microbit-pro": {
    titulo: "micro:bit: laboratorio maker", nivel: "Pro", imagen: "curso-microbit-eduy.jpg", duracion: "26 horas",
    descripcion: "Creación de experiencias maker completas que combinan código, electrónica, diseño físico e interacción.",
    modulos: [
      ["Python en micro:bit", "MicroPython, módulos, funciones, estructuras de datos y control avanzado de hardware."],
      ["Prototipado maker", "Diseño iterativo, materiales, fabricación, pruebas con usuarios y mejora del prototipo."],
      ["Sistemas interactivos", "Redes de sensores, actuadores, sonido, luces y experiencias físicas conectadas."],
      ["Proyecto de laboratorio", "Producto educativo funcional con documentación, demostración y evaluación técnica."],
    ],
  },
  "html-css": {
    titulo: "HTML y CSS: desarrollo web", nivel: "Básico", imagen: "curso-html-css-eduy.jpg", duracion: "22 horas",
    descripcion: "Creación de sitios web modernos, semánticos, accesibles y adaptables a computadoras y dispositivos móviles.",
    modulos: [
      ["HTML semántico", "Estructura del documento, contenido, enlaces, imágenes, formularios y etiquetas semánticas."],
      ["Fundamentos de CSS", "Selectores, cascada, tipografía, colores, modelo de caja y unidades responsivas."],
      ["Diseño adaptable", "Flexbox, Grid, media queries, componentes Bootstrap y estrategia mobile first."],
      ["Proyecto de sitio web", "Planificación, construcción, accesibilidad, validación y publicación de un sitio completo."],
    ],
  },
  javascript: {
    titulo: "JavaScript: web interactiva", nivel: "Avanzado", imagen: "curso-javascript-eduy.jpg", duracion: "28 horas",
    descripcion: "Programación de experiencias web dinámicas mediante lógica, DOM, eventos, datos remotos y componentes interactivos.",
    modulos: [
      ["Lenguaje JavaScript", "Variables, tipos, funciones, objetos, arreglos, módulos y manejo de errores."],
      ["DOM y eventos", "Selección y creación de elementos, formularios, eventos y actualización eficiente de interfaces."],
      ["Programación asíncrona", "Promesas, async/await, Fetch API, JSON y comunicación con servicios web."],
      ["Aplicación interactiva", "Arquitectura, estado, almacenamiento local, pruebas y desarrollo de una aplicación final."],
    ],
  },
  python: {
    titulo: "Python: automatización y datos", nivel: "Pro", imagen: "curso-python-eduy.jpg", duracion: "32 horas",
    descripcion: "Desarrollo de programas claros y mantenibles para automatizar tareas, procesar información y generar resultados útiles.",
    modulos: [
      ["Python sólido", "Tipos, funciones, colecciones, comprensión, módulos, excepciones y organización de proyectos."],
      ["Archivos y automatización", "Lectura y escritura de datos, rutas, tareas repetitivas, registros y línea de comandos."],
      ["Análisis de datos", "Limpieza, transformación, estadísticas descriptivas y visualización de información."],
      ["Proyecto profesional", "Automatización completa con configuración, pruebas, documentación y entrega reproducible."],
    ],
  },
};

const curso = cursos[document.body.dataset.curso];

if (!curso) {
  document.querySelector("#app").innerHTML = '<main class="container py-5"><div class="alert alert-warning">Curso no encontrado.</div></main>';
} else {
  document.title = `${curso.titulo} | EDUY`;
  const modulos = curso.modulos.map(([titulo, descripcion], indice) => `
    <article class="modulo-curso card h-100">
      <div class="card-body">
        <span class="numero-modulo">${indice + 1}</span>
        <h2 class="h5 mt-3">Módulo ${indice + 1}: ${titulo}</h2>
        <p class="mb-0">${descripcion}</p>
      </div>
    </article>`).join("");

  document.querySelector("#app").innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="../../index.html">
          <img src="../../img/logo.png" class="logo-navbar" alt="Logo de EDUY" />
          <span class="h4 mb-0">Bienvenido a EDUY</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Mostrar navegación"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="menuPrincipal"><ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="../../index.html">Inicio</a></li>
          <li class="nav-item"><a class="nav-link active" href="../cursos.html">Cursos</a></li>
          <li class="nav-item"><a class="nav-link" href="../login.html">Ingresar</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Registrarse</a></li>
        </ul></div>
      </div>
    </nav>
    <main class="container py-5">
      <nav aria-label="Navegación secundaria"><ol class="breadcrumb detalle-breadcrumb">
        <li class="breadcrumb-item"><a href="../../index.html">Inicio</a></li>
        <li class="breadcrumb-item"><a href="../cursos.html">Cursos</a></li>
        <li class="breadcrumb-item active" aria-current="page">${curso.titulo}</li>
      </ol></nav>
      <section class="banner-curso position-relative overflow-hidden rounded-4 shadow-lg">
        <img src="../../img/cursos/${curso.imagen}" alt="${curso.titulo}" />
        <div class="banner-curso-contenido">
          <span class="badge nivel-${curso.nivel.toLowerCase().replace('á','a')} mb-3">${curso.nivel}</span>
          <h1 class="display-5 fw-bold">${curso.titulo}</h1>
          <p class="lead mb-0">${curso.descripcion}</p>
        </div>
      </section>
      <section class="row g-4 mt-4">
        <div class="col-lg-8">
          <h2 class="fw-bold mb-4">Módulos del curso</h2>
          <div class="row g-4">${modulos}</div>
        </div>
        <aside class="col-lg-4">
          <div class="card detalle-resumen sticky-lg-top">
            <div class="card-body p-4">
              <h2 class="h4">Información del curso</h2>
              <hr />
              <p><strong>Nivel:</strong> ${curso.nivel}</p>
              <p><strong>Duración:</strong> ${curso.duracion}</p>
              <p><strong>Modalidad:</strong> En línea y asincrónica</p>
              <p><strong>Instructor:</strong> Equipo EDUY</p>
              <a href="../login.html" class="btn btn-oro w-100 mb-2">Inscribirme</a>
              <a href="../cursos.html" class="btn btn-outline-secondary w-100">Volver al catálogo</a>
            </div>
          </div>
        </aside>
      </section>
    </main>
    <div data-footer-eduy data-raiz="../.."></div>`;
}
