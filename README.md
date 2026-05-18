
 App web para gestionar el catálogo y usuarios de una plataforma de streaming, construida sobre un modelo documental en MongoDB.

## Qué hace el proyecto

- Catálogo de películas con géneros embebidos: listar, buscar por título, filtrar por género y año, crear, editar y eliminar
- Gestión de usuarios con contacto y datos demográficos embebidos: listar, buscar, filtrar por segmento, crear, editar y eliminar
- Historial de interacciones (vistas, rentas, compras) visible en el perfil de cada usuario
- Al eliminar una película o usuario, sus interacciones se borran en cascada

## Cómo correrlo desde cero

**Requisitos:** Node.js 18+ y acceso a MongoDB (local o Atlas)

```bash
# 1. Clonar e instalar dependencias
git clone <url-del-repo>
cd moviestream-mongo
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y poner tu URI de MongoDB:
# MONGODB_URI=mongodb://localhost:27017   ← local

# 3. Poblar la base de datos
node seed.js

# 4. Iniciar el servidor
node server.js
# → http://localhost:3000
