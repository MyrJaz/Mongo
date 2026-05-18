require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "moviestream";

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Conexión DB ─────────────────────────────────────────────────────────────
let db;
MongoClient.connect(URI)
  .then((client) => {
    db = client.db(DB_NAME);
    console.log("MongoDB conectado");
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err);
    process.exit(1);
  });

// ─── HOME ─────────────────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
  const movieCount = await db.collection("movies").countDocuments();
  const userCount = await db.collection("users").countDocuments();
  const interactionCount = await db.collection("interactions").countDocuments();
  res.render("index", { movieCount, userCount, interactionCount });
});

// ════════════════════════════════════════════════════════════════════════════
// MOVIES CRUD
// ════════════════════════════════════════════════════════════════════════════

// Listar / buscar
app.get("/movies", async (req, res) => {
  const { q, genre, year } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (genre) filter["genres.name"] = genre;
  if (year) filter.year = parseInt(year);

  const movies = await db.collection("movies").find(filter).sort({ year: -1 }).toArray();
  const allGenres = ["Action","Comedy","Drama","Science Fiction","Horror","Thriller","Animation","Romance"];
  res.render("movies/index", { movies, allGenres, q, genre, year });
});

// Formulario nuevo
app.get("/movies/new", (req, res) => {
  const allGenres = ["Action","Comedy","Drama","Science Fiction","Horror","Thriller","Animation","Romance"];
  res.render("movies/new", { allGenres });
});

// Crear
app.post("/movies", async (req, res) => {
  const { title, year, runtime_minutes, summary, price, genres, awards } = req.body;
  const genreList = (Array.isArray(genres) ? genres : [genres]).filter(Boolean);
  const genreObjects = genreList.map((name, i) => ({ genre_id: i + 1, name }));

  await db.collection("movies").insertOne({
    movie_id: Date.now(),
    title, 
    year: parseInt(year),
    runtime_minutes: parseInt(runtime_minutes),
    summary,
    price: parseFloat(price),
    genres: genreObjects,
    cast: [],
    awards: awards || "",
    created_at: new Date(),
  });
  res.redirect("/movies");
});

// Ver detalle
app.get("/movies/:id", async (req, res) => {
  const movie = await db.collection("movies").findOne({ _id: new ObjectId(req.params.id) });
  if (!movie) return res.status(404).send("Película no encontrada");
  
  // Interacciones de esta película
  const interactions = await db.collection("interactions")
    .find({ movie_id: movie.movie_id })
    .sort({ date: -1 })
    .limit(10)
    .toArray();
  
  res.render("movies/show", { movie, interactions });
});

// Formulario editar
app.get("/movies/:id/edit", async (req, res) => {
  const movie = await db.collection("movies").findOne({ _id: new ObjectId(req.params.id) });
  if (!movie) return res.status(404).send("Película no encontrada");
  const allGenres = ["Action","Comedy","Drama","Science Fiction","Horror","Thriller","Animation","Romance"];
  res.render("movies/edit", { movie, allGenres });
});

// Actualizar
app.post("/movies/:id/update", async (req, res) => {
  const { title, year, runtime_minutes, summary, price, genres, awards } = req.body;
  const genreList = (Array.isArray(genres) ? genres : [genres]).filter(Boolean);
  const genreObjects = genreList.map((name, i) => ({ genre_id: i + 1, name }));

  await db.collection("movies").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { title, year: parseInt(year), runtime_minutes: parseInt(runtime_minutes), summary, price: parseFloat(price), genres: genreObjects, awards } }
  );
  res.redirect(`/movies/${req.params.id}`);
});

// Eliminar
app.post("/movies/:id/delete", async (req, res) => {
  const movie = await db.collection("movies").findOne({ _id: new ObjectId(req.params.id) });
  if (movie) {
    await db.collection("interactions").deleteMany({ movie_id: movie.movie_id });
  }
  await db.collection("movies").deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/movies");
});

// ════════════════════════════════════════════════════════════════════════════
// USERS CRUD
// ════════════════════════════════════════════════════════════════════════════

// Listar / buscar
app.get("/users", async (req, res) => {
  const { q, segment } = req.query;
  const filter = {};
  if (q) filter.$or = [
    { username: { $regex: q, $options: "i" } },
    { "contact.email": { $regex: q, $options: "i" } },
    { "contact.city": { $regex: q, $options: "i" } },
  ];
  if (segment) filter.segment = segment;

  const users = await db.collection("users").find(filter).sort({ user_id: 1 }).toArray();
  const segments = ["Premium", "Standard", "Basic", "Trial"];
  res.render("users/index", { users, segments, q, segment });
});

// Formulario nuevo
app.get("/users/new", (req, res) => {
  const segments = ["Premium", "Standard", "Basic", "Trial"];
  res.render("users/new", { segments });
});

// Crear
app.post("/users", async (req, res) => {
  const { username, email, phone, city, country, age, gender, segment } = req.body;
  await db.collection("users").insertOne({
    user_id: Date.now(),
    username,
    contact: { email, phone, city, country, street_address: "", state_province: "", postal_code: "" },
    demographics: { age: parseInt(age), gender, education: "Unknown", income_level: "Unknown", marital_status: "Unknown" },
    segment,
    loyalty_id: `LYL-${Date.now()}`,
    created_at: new Date(),
  });
  res.redirect("/users");
});

// Ver detalle
app.get("/users/:id", async (req, res) => {
  const user = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) });
  if (!user) return res.status(404).send("Usuario no encontrado");

  // Historial del usuario con lookup
  const history = await db.collection("interactions").aggregate([
    { $match: { user_id: user.user_id } },
    { $sort: { date: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: "movies",
        localField: "movie_id",
        foreignField: "movie_id",
        as: "movie",
      },
    },
    { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
  ]).toArray();

  res.render("users/show", { user, history });
});

// Formulario editar
app.get("/users/:id/edit", async (req, res) => {
  const user = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) });
  if (!user) return res.status(404).send("Usuario no encontrado");
  const segments = ["Premium", "Standard", "Basic", "Trial"];
  res.render("users/edit", { user, segments });
});

// Actualizar
app.post("/users/:id/update", async (req, res) => {
  const { username, email, phone, city, country, age, gender, segment } = req.body;
  await db.collection("users").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: {
      username,
      "contact.email": email,
      "contact.phone": phone,
      "contact.city": city,
      "contact.country": country,
      "demographics.age": parseInt(age),
      "demographics.gender": gender,
      segment,
    }}
  );
  res.redirect(`/users/${req.params.id}`);
});

// Eliminar
app.post("/users/:id/delete", async (req, res) => {
  const user = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) });
  if (user) {
    await db.collection("interactions").deleteMany({ user_id: user.user_id });
  }
  await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/users");
});
