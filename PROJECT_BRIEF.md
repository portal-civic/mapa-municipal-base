# Project brief

## Objectiu
Crear una plataforma base reutilitzable per a mapes interactius municipals inspirats en la lògica del mapa de Catarroja, https://catarrojavanza.es/val/mapa-interactiu/ però amb arquitectura pròpia i modular.

## Tecnologia
- Leaflet
- HTML, CSS i JavaScript vanilla
- Dades separades en JSON i GeoJSON
- Sense frameworks

## Requisits base
- Base grisa amb noms de carrers
- Transició gradual a satèl·lit segons zoom
- Punts, línies i àrees
- Categories i subcategories
- Selector de capes
- Panell esquerre de detall
- Panell dret amb filtres/capes
- Header superior configurable
- Footer o barra inferior configurable
- Responsive real per a mòbil
- Multiidioma
- Imatges pròpies per projecte
- Sistema d’icones global + icones específiques de projecte

## Arquitectura desitjada
- Nucli fix de plataforma
- Carpeta /projects amb projectes separats
- Cada projecte amb:
  - config.json
  - categories.json
  - layers.json
  - points.geojson
  - lines.geojson
  - areas.geojson
  - i18n/ca.json
  - i18n/es.json
  - i18n/en.json
  - icons/
  - images/

## Requisits de UX
- Hover amb tooltip curt
- Clic amb panell de detall
- Filtrat per categoria i subcategoria
- Estats: prevista / en execució / finalitzat
- Bon comportament en escriptori i mòbil

## Restriccions
- Codi clar, modular i reutilitzable
- Sense copiar el codi d'altres webs
- La demo inicial ha de funcionar amb dades fictícies de mostra