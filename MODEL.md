# MovieStream — Modelo Documental en MongoDB

## El modelo relacional original

MovieStream en su versión relacional tiene estas tablas: `movie`, `genre`, `movie_genre` (tabla pivot), `customer`, `customer_contact`, `customer_demographics`, `customer_segment`, `custsales` y `activity`.

---

## Colecciones resultantes

Al traducir ese modelo a MongoDB quedaron **3 colecciones**: `movies`, `users` e `interactions`.

---

## Decisión 1: movie + genre → colección `movies`

**Embeber.** Los géneros van dentro del documento de cada película como un array. La razón es simple: cada vez que consultas una película, siempre quieres saber sus géneros al mismo tiempo. Separarlos en otra colección solo añadiría un `$lookup` innecesario. Además, cada película tiene entre 1 y 5 géneros como máximo — nunca crece sin control — y un género es solo un id y un nombre, no tiene atributos complejos propios. Si mañana renombras un género, haces un `updateMany` y listo.

```json
{
  "title": "Inception",
  "year": 2010,
  "genres": [
    { "genre_id": 3, "name": "Action" },
    { "genre_id": 7, "name": "Science Fiction" }
  ]
}
```

---

## Decisión 2: customer + contact + demographics + segment → colección `users`

**Embeber.** En el modelo relacional estas son cuatro tablas distintas, pero todas describen a la misma persona. No tiene sentido separarlas en MongoDB porque siempre las lees juntas: cuando cargas el perfil de un usuario, quieres su email, su edad y su segmento en una sola operación. La relación es 1:1 estricta — un usuario tiene exactamente un contacto y un perfil demográfico — así que no hay riesgo de arrays que crezcan sin control. Embeber aquí es la decisión obvia.

```json
{
  "username": "user001",
  "contact": {
    "email": "user1@moviestream.mx",
    "city": "Monterrey",
    "country": "MX"
  },
  "demographics": {
    "age": 28,
    "gender": "F",
    "education": "Bachelor's"
  },
  "segment": "Premium"
}
```

---

## Decisión 3: custsales / activity → colección `interactions`

**Referenciar, en colección separada.** Las interacciones (compras, rentas, vistas) conectan a un usuario con una película, y un usuario puede tener cientos o miles de ellas a lo largo del tiempo. Si las embebieras dentro del usuario, ese documento crecería indefinidamente — eso es un anti-patrón en MongoDB llamado "unbounded array". La solución es tener `interactions` como su propia colección, donde cada documento guarda el `user_id` y el `movie_id` como referencias. Cuando necesitas el historial de un usuario haces `find({ user_id: 42 })`, y cuando necesitas enriquecer con el título de la película usas `$lookup`. La referencia va solo en la dirección de `interactions → users` e `interactions → movies`, no al revés.

```json
{
  "user_id": 1,
  "movie_id": 5,
  "type": "purchase",
  "date": "2024-11-20T21:15:00Z",
  "price_paid": 4.99,
  "rating": 4.5
}
```

---

## ¿Qué consultas se vuelven más fáciles?

Mostrar el catálogo completo con géneros es una sola query sin joins. Filtrar películas por género es directo con `{ "genres.name": "Action" }`. Ver el perfil completo de un usuario es `findOne` y ya tienes todo. Obtener el historial de un usuario ordenado por fecha es trivial con un índice en `interactions`.

## ¿Qué consultas se vuelven más difíciles?

Listar todos los géneros únicos del catálogo requiere un `$unwind` + `$group` sobre la colección de películas. Ver el perfil del usuario junto con su historial en una sola operación requiere `$lookup`. Renombrar un género en toda la base de datos requiere un `updateMany` con `$set` en el array embebido.
