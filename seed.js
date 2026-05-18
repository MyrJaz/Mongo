

require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "moviestream";

// ─── GÉNEROS ────────────────────────────────────────────────────────────────
const GENRES = [
  { genre_id: 1, name: "Action" },
  { genre_id: 2, name: "Comedy" },
  { genre_id: 3, name: "Drama" },
  { genre_id: 4, name: "Science Fiction" },
  { genre_id: 5, name: "Horror" },
  { genre_id: 6, name: "Thriller" },
  { genre_id: 7, name: "Animation" },
  { genre_id: 8, name: "Romance" },
];

// ─── ACTORES (para embeber en películas) ────────────────────────────────────
const ACTORS = [
  { actor_id: 1,  name: "Leonardo DiCaprio" },
  { actor_id: 2,  name: "Meryl Streep" },
  { actor_id: 3,  name: "Tom Hanks" },
  { actor_id: 4,  name: "Scarlett Johansson" },
  { actor_id: 5,  name: "Denzel Washington" },
  { actor_id: 6,  name: "Natalie Portman" },
  { actor_id: 7,  name: "Brad Pitt" },
  { actor_id: 8,  name: "Cate Blanchett" },
  { actor_id: 9,  name: "Robert Downey Jr." },
  { actor_id: 10, name: "Emma Stone" },
];

// ─── PELÍCULAS ───────────────────────────────────────────────────────────────
const MOVIES = [
  {
    movie_id: 1, title: "Inception", year: 2010, runtime_minutes: 148,
    summary: "Un ladrón que roba secretos corporativos mediante tecnología de sueños compartidos.",
    price: 4.99,
    genres: [GENRES[0], GENRES[3], GENRES[5]],
    cast: [{ ...ACTORS[0], role: "Cobb" }],
    awards: "Oscar Best Cinematography 2011",
  },
  {
    movie_id: 2, title: "The Dark Knight", year: 2008, runtime_minutes: 152,
    summary: "Batman enfrenta al caótico Joker en Gotham City.",
    price: 4.99,
    genres: [GENRES[0], GENRES[5]],
    cast: [{ ...ACTORS[8], role: "Batman" }],
    awards: "Oscar Best Supporting Actor 2009",
  },
  {
    movie_id: 3, title: "Forrest Gump", year: 1994, runtime_minutes: 142,
    summary: "La extraordinaria vida de un hombre con coeficiente bajo pero gran corazón.",
    price: 3.99,
    genres: [GENRES[2], GENRES[7]],
    cast: [{ ...ACTORS[2], role: "Forrest Gump" }],
    awards: "Oscar Best Picture 1995",
  },
  {
    movie_id: 4, title: "Her", year: 2013, runtime_minutes: 126,
    summary: "Un hombre solitario se enamora de un sistema operativo de inteligencia artificial.",
    price: 3.99,
    genres: [GENRES[3], GENRES[2], GENRES[7]],
    cast: [{ ...ACTORS[3], role: "Samantha (voz)" }],
    awards: "Oscar Best Original Screenplay 2014",
  },
  {
    movie_id: 5, title: "Get Out", year: 2017, runtime_minutes: 104,
    summary: "Un fotógrafo afroamericano visita a los padres de su novia con consecuencias aterradoras.",
    price: 3.49,
    genres: [GENRES[4], GENRES[5]],
    cast: [],
    awards: "Oscar Best Original Screenplay 2018",
  },
  {
    movie_id: 6, title: "The Grand Budapest Hotel", year: 2014, runtime_minutes: 100,
    summary: "Un conserje de hotel y su protegido se ven envueltos en el robo de una pintura.",
    price: 3.49,
    genres: [GENRES[1], GENRES[2]],
    cast: [{ ...ACTORS[6], role: "Gustav H." }],
    awards: "Oscar Best Production Design 2015",
  },
  {
    movie_id: 7, title: "Mad Max: Fury Road", year: 2015, runtime_minutes: 120,
    summary: "En un mundo post-apocalíptico, Max se une a Furiosa para escapar de un tirano.",
    price: 3.99,
    genres: [GENRES[0], GENRES[3]],
    cast: [],
    awards: "Oscar Best Film Editing 2016",
  },
  {
    movie_id: 8, title: "La La Land", year: 2016, runtime_minutes: 128,
    summary: "Un pianista de jazz y una actriz aspirante se enamoran en Los Ángeles.",
    price: 3.99,
    genres: [GENRES[2], GENRES[7]],
    cast: [{ ...ACTORS[9], role: "Mia" }],
    awards: "Oscar Best Director 2017",
  },
  {
    movie_id: 9, title: "Parasite", year: 2019, runtime_minutes: 132,
    summary: "Una familia pobre infiltra la vida de una familia adinerada de Seoul.",
    price: 4.49,
    genres: [GENRES[2], GENRES[5], GENRES[1]],
    cast: [],
    awards: "Oscar Best Picture 2020",
  },
  {
    movie_id: 10, title: "Interstellar", year: 2014, runtime_minutes: 169,
    summary: "Un equipo de exploradores viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.",
    price: 4.99,
    genres: [GENRES[3], GENRES[2]],
    cast: [{ ...ACTORS[2], role: "Cooper" }],
    awards: "Oscar Best Visual Effects 2015",
  },
  {
    movie_id: 11, title: "Black Swan", year: 2010, runtime_minutes: 108,
    summary: "Una bailarina busca la perfección en el Lago de los Cisnes con consecuencias perturbadoras.",
    price: 3.49,
    genres: [GENRES[4], GENRES[5], GENRES[2]],
    cast: [{ ...ACTORS[5], role: "Nina" }],
    awards: "Oscar Best Actress 2011",
  },
  {
    movie_id: 12, title: "The Matrix", year: 1999, runtime_minutes: 136,
    summary: "Un hacker descubre que la realidad es una simulación controlada por máquinas.",
    price: 3.99,
    genres: [GENRES[0], GENRES[3]],
    cast: [],
    awards: "Oscar Best Visual Effects 2000",
  },
  {
    movie_id: 13, title: "Knives Out", year: 2019, runtime_minutes: 130,
    summary: "Un detective investiga la muerte misteriosa del patriarca de una excéntrica familia.",
    price: 3.99,
    genres: [GENRES[5], GENRES[1]],
    cast: [{ ...ACTORS[6], role: "Benoit Blanc" }],
    awards: "Nominated Oscar Best Original Screenplay 2020",
  },
  {
    movie_id: 14, title: "The Revenant", year: 2015, runtime_minutes: 156,
    summary: "Un explorador busca venganza después de ser dado por muerto en la naturaleza salvaje.",
    price: 4.49,
    genres: [GENRES[0], GENRES[2]],
    cast: [{ ...ACTORS[0], role: "Hugh Glass" }],
    awards: "Oscar Best Director 2016",
  },
  {
    movie_id: 15, title: "Coco", year: 2017, runtime_minutes: 105,
    summary: "Un niño viaja accidentalmente a la Tierra de los Muertos y descubre el secreto de su familia.",
    price: 3.49,
    genres: [GENRES[6], GENRES[2]],
    cast: [],
    awards: "Oscar Best Animated Feature 2018",
  },
  {
    movie_id: 16, title: "Whiplash", year: 2014, runtime_minutes: 107,
    summary: "Un baterista aspira a la grandeza bajo la tutela de un instructor implacable.",
    price: 3.49,
    genres: [GENRES[2]],
    cast: [],
    awards: "Oscar Best Film Editing 2015",
  },
  {
    movie_id: 17, title: "Spider-Man: Into the Spider-Verse", year: 2018, runtime_minutes: 117,
    summary: "Miles Morales se convierte en Spider-Man y conoce a sus contrapartes del multiverso.",
    price: 3.99,
    genres: [GENRES[0], GENRES[6]],
    cast: [],
    awards: "Oscar Best Animated Feature 2019",
  },
  {
    movie_id: 18, title: "Gone Girl", year: 2014, runtime_minutes: 149,
    summary: "La desaparición de una mujer revela el oscuro secreto de un matrimonio aparentemente perfecto.",
    price: 3.99,
    genres: [GENRES[5], GENRES[2]],
    cast: [{ ...ACTORS[6], role: "Nick Dunne" }],
    awards: "Nominated Golden Globe Best Actress 2015",
  },
  {
    movie_id: 19, title: "Moonlight", year: 2016, runtime_minutes: 111,
    summary: "La historia de vida de un hombre afroamericano en tres capítulos de su vida.",
    price: 3.49,
    genres: [GENRES[2]],
    cast: [],
    awards: "Oscar Best Picture 2017",
  },
  {
    movie_id: 20, title: "1917", year: 2019, runtime_minutes: 119,
    summary: "Dos soldados británicos deben cruzar territorio enemigo para entregar un mensaje vital.",
    price: 4.49,
    genres: [GENRES[0], GENRES[2]],
    cast: [{ ...ACTORS[7], role: "General Erinmore" }],
    awards: "Oscar Best Cinematography 2020",
  },
];

// ─── USUARIOS ────────────────────────────────────────────────────────────────
const SEGMENTS = ["Premium", "Standard", "Basic", "Trial"];
const GENDERS = ["M", "F", "Non-binary"];
const EDUCATION = ["High School", "Bachelor's", "Master's", "PhD", "Some College"];
const COUNTRIES = [
  { country: "MX", city: "Monterrey", state: "NL" },
  { country: "MX", city: "CDMX", state: "CDMX" },
  { country: "US", city: "Austin", state: "TX" },
  { country: "US", city: "New York", state: "NY" },
  { country: "CA", city: "Toronto", state: "ON" },
];

function makeUser(i) {
  const loc = COUNTRIES[i % COUNTRIES.length];
  return {
    user_id: i + 1,
    username: `user${String(i + 1).padStart(3, "0")}`,
    contact: {
      email: `user${i + 1}@moviestream.mx`,
      phone: `+52-81-${String(1000 + i).padStart(4, "0")}-0000`,
      street_address: `Av. Siempre Viva ${100 + i}`,
      city: loc.city,
      state_province: loc.state,
      country: loc.country,
      postal_code: String(64000 + i),
    },
    demographics: {
      age: 20 + (i % 40),
      gender: GENDERS[i % GENDERS.length],
      education: EDUCATION[i % EDUCATION.length],
      income_level: ["30k-50k", "50k-75k", "75k-100k", "100k+"][i % 4],
      marital_status: ["Single", "Married", "Divorced"][i % 3],
    },
    segment: SEGMENTS[i % SEGMENTS.length],
    loyalty_id: `LYL-${String(i + 1).padStart(5, "0")}`,
    created_at: new Date(2023, i % 12, (i % 28) + 1),
  };
}

const USERS = Array.from({ length: 15 }, (_, i) => makeUser(i));

// ─── INTERACCIONES ────────────────────────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeInteractions() {
  const interactions = [];
  const types = ["purchase", "rental", "view"];
  
  // Cada usuario tiene entre 3 y 8 interacciones
  USERS.forEach((user) => {
    const count = randomInt(3, 8);
    const moviesUsed = new Set();
    
    for (let i = 0; i < count; i++) {
      let movieId;
      // Evitar duplicar película por usuario
      do {
        movieId = randomInt(1, MOVIES.length);
      } while (moviesUsed.has(movieId));
      moviesUsed.add(movieId);
      
      const movie = MOVIES.find(m => m.movie_id === movieId);
      const type = types[randomInt(0, 2)];
      
      interactions.push({
        user_id: user.user_id,
        movie_id: movieId,
        type,
        date: new Date(2024, randomInt(0, 11), randomInt(1, 28)),
        price_paid: type === "view" ? 0 : movie.price,
        rating: randomInt(1, 10) > 3 ? randomInt(3, 5) + Math.random() : null,
        completed: Math.random() > 0.2,
        watch_duration_minutes: randomInt(30, movie.runtime_minutes),
      });
    }
  });
  
  return interactions;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function seed() {
  const client = new MongoClient(URI);
  
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    
    const db = client.db(DB_NAME);
    
    // Borrar colecciones previas
    await db.collection("movies").drop().catch(() => {});
    await db.collection("users").drop().catch(() => {});
    await db.collection("interactions").drop().catch(() => {});
    console.log("Colecciones anteriores eliminadas");
    
    // Insertar películas
    await db.collection("movies").insertMany(
      MOVIES.map(m => ({ ...m, created_at: new Date() }))
    );
    console.log(`${MOVIES.length} películas insertadas`);
    
    // Insertar usuarios
    await db.collection("users").insertMany(USERS);
    console.log(`${USERS.length} usuarios insertados`);
    
    // Insertar interacciones
    const interactions = makeInteractions();
    await db.collection("interactions").insertMany(interactions);
    console.log(`${interactions.length} interacciones insertadas`);
    
    // Crear índices
    await db.collection("movies").createIndex({ "genres.name": 1 });
    await db.collection("movies").createIndex({ year: 1 });
    await db.collection("movies").createIndex({ title: "text" });
    await db.collection("users").createIndex({ "contact.email": 1 }, { unique: true });
    await db.collection("users").createIndex({ segment: 1 });
    await db.collection("interactions").createIndex({ user_id: 1, date: -1 });
    await db.collection("interactions").createIndex({ movie_id: 1 });
    console.log("Índices creados");
    
    // Resumen
    console.log("\nBase de datos lista:");
    console.log(`   DB: ${DB_NAME}`);
    console.log(`   Colecciones: movies, users, interactions`);
    console.log(`   Películas: ${MOVIES.length}`);
    console.log(`   Géneros únicos: ${GENRES.length}`);
    console.log(`   Actores únicos: ${ACTORS.length}`);
    console.log(`   Usuarios: ${USERS.length}`);
    console.log(`   Interacciones: ${interactions.length}`);
    
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
