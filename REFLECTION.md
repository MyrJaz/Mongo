# REFLECTION.md

## 1. Volviendo a empezar

Lo que haría diferente sería separar el cast de las películas en su propia
colección. Lo embebí, pero luego tuve que hacer un $elemMatch sobre un array
embebido en lugar de un  find. También haría que interactions
guardara un snapshot del título de la película al momento de la interacción, para evitar
el $lookup cada vez que cargo el historial de un usuario. 

## 2. La conversación con el modelo

Lo que más se me dificulto fue mostrar el historial de un usuario con el título de cada
película. En SQL  es un JOIN de una línea, pero En MongoDB necesité un $lookup dentro
de un aggregate pipeline, y si el movie_id no coincidía exactamente (porque en algún
momento usé Date.now() como ID), el lookup  devolvía null. Tardé en darme
cuenta porque MongoDB no lanza error. 

## 3. La pregunta honesta

Para MovieStream específicamente, el modelo relacional original hubiera sido igual de
bueno o mejor. Creo que el dominio no tiene nada que justifique NoSQL. MongoDB fue
más fácil de levantar y desplegar rápido, y embeber géneros en películas sí acorto
el catálogo, pero no creo que sea suficiente para decir que fue la mejor opción. Si el 
dominio creciera con millones de interacciones por día lo vería más factible. 