# TRUE ASTRO POSITIONS :: PSICOANDINO

Un dashboard de astronomía brutalista e interactivo para visualizar las posiciones planetarias reales. A diferencia de la astrología clásica (Zodiaco Tropical) que divide el cielo en 12 zonas abstractas, este sistema despliega las posiciones basándose en los **Límites Físicos Oficiales de la IAU**, integrando las **13 Constelaciones Eclípticas** (incluyendo Ophiuchus).

## Arquitectura de Diseño
El dashboard utiliza un diseño asimétrico (`12 + 1 Grid`) estructurado por elementos clásicos:
* **Fuego** (Aries, Leo, Sagitario)
* **Tierra** (Tauro, Virgo, Capricornio)
* **Aire** (Géminis, Libra, Acuario)
* **Agua** (Cáncer, Escorpio, Piscis)
* **Base / Eslabón:** Ophiuchus

## Características
* Visualización en una sola pantalla (Single View / No Scroll).
* Jerarquía estricta de color (Colores reservados exclusivamente para Elementos y Tipos de Planetas).
* Agrupación automática de datos (Total, Personales, Transpersonales).
* **STATE LOGIC:** Sistema GHOST (solo lectura) / IDENTIFY (Escritura y Exportación).
* **Export Engine:** Descarga de la matriz a formato JPEG en alta resolución.

## Roadmap de Desarrollo
- [x] Maquetación y CSS Grid 13-Card Layout.
- [x] Paleta de colores semántica.
- [x] Lógica de interacción y cálculo de agrupamiento estadístico.
- [ ] **Integración de Motor Astronómico:** Reemplazar el generador algorítmico mock por una librería de efemérides en tiempo real (ej. `astronomy-engine`) para realizar el cálculo cruzado (*Point in Polygon*) con el set de datos JSON de fronteras oficiales de la IAU.

---
*Desarrollado para la suite TRUE SPACES.*