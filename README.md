# 🎬 Anime Explorer

Aplicación web fullstack para explorar anime, consultar detalles, ver plataformas de streaming y trailers, con sistema de favoritos e historial de búsqueda.

---

## 🚀 Demo

👉 Backend: Alojado en Render
👉 Frontend: *(agregar link cuando lo deployes)*

---

## 🧠 Descripción

Anime Explorer es una aplicación que consume múltiples APIs para brindar información completa sobre anime, incluyendo:

* 🔍 Búsqueda de anime en tiempo real
* 📊 Detalles completos (episodios, estado, score, estudios)
* 🌍 Sinopsis en español
* 📺 Plataformas de streaming disponibles
* 🎬 Trailer desde YouTube
* ❤️ Sistema de favoritos (persistente)
* 🕓 Historial de búsquedas
* ⭐ Top anime automático al iniciar

---

## 🛠️ Tecnologías utilizadas

### Backend

* Node.js
* Express
* Axios
* Node Cache
* CORS
* Morgan

### Frontend

* HTML5
* CSS3 (responsive + UI moderna)
* JavaScript Vanilla

---

## 🔗 APIs utilizadas

* 📚 Jikan API (MyAnimeList)
* 🎥 YouTube Data API
* 🎬 TMDB API (sinopsis y streaming)

---

## 📦 Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/anime-server.git
cd anime-server
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env`:

```env
PORT=3000
TMDB_API_KEY=TU_API_KEY
YOUTUBE_API_KEY=TU_API_KEY
DEFAULT_REGION=AR
DEFAULT_LANGUAGE=es-ES
```

### 4. Ejecutar servidor

```bash
npm run dev
```

---

## 📡 Endpoints principales

### 🔍 Buscar anime

```
GET /api/search?q=naruto
```

### 📖 Obtener detalle

```
GET /api/anime/:id
```

---

## ✨ Características destacadas

* 🔄 Integración de múltiples APIs en un solo endpoint
* ⚡ Caché para optimizar rendimiento
* 🎯 UI moderna tipo streaming
* 📱 Diseño responsive
* 🧩 Arquitectura desacoplada (backend + frontend)

---

## 📸 Screenshots

*(agregar imágenes acá)*

---

## 📌 Próximas mejoras

* 🔐 Sistema de usuarios
* ☁️ Base de datos para favoritos
* 🎯 Filtros avanzados
* 🎨 UI estilo Netflix

---

## 👨‍💻 Autor

Desarrollado por **Mariano Monje Isleño** 
(Técnico en Desarrollo de Software)

---

## ⚠️ Nota

Este proyecto es de uso educativo y portfolio.
Las APIs utilizadas pertenecen a sus respectivos propietarios.

---
