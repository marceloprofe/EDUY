# Accesibilidad de EDUY

El alcance inicial de accesibilidad se concentra en compatibilidad con teclado y tecnologías de asistencia sin modificar la identidad visual del proyecto.

## Mejoras incorporadas

- Todos los documentos declaran el idioma español.
- Las imágenes informativas incluyen texto alternativo.
- Los formularios relacionan sus controles con etiquetas visibles.
- Los videos y contenidos incrustados tienen un título accesible.
- Los mensajes de carga y resultados dinámicos utilizan regiones de estado.
- Las regiones que consultan información indican cuándo están ocupadas.
- Las tablas administrativas incluyen una descripción para lectores de pantalla.
- Los títulos identifican las secciones de perfil y administración.

Estas mejoras no agregan widgets, dependencias ni cambios en `css/estilo.css`.

## Comprobación manual

1. Recorrer cada página utilizando `Tab`, `Shift + Tab`, `Enter` y `Espacio`.
2. Confirmar que formularios, pestañas, botones, enlaces y modales funcionan sin ratón.
3. Ejecutar Lighthouse en Inicio, Cursos, Login, Perfil, Mis cursos y Panel administrativo.
4. Ejecutar axe DevTools en las mismas páginas.
5. Revisar manualmente los elementos que las herramientas indiquen como incompletos.
6. Probar al menos una página con un lector de pantalla del sistema operativo.

Las herramientas automáticas ayudan a encontrar errores comunes, pero no sustituyen la revisión manual de navegación, orden de lectura y claridad del contenido.

## Trabajo posterior

- Corregir los problemas concretos encontrados por Lighthouse y axe.
- Registrar los resultados finales como evidencia del issue #89.
- Evaluar subtítulos o transcripciones cuando se incorporen videos propios sin texto alternativo equivalente.
