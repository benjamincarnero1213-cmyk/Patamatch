# PataMatch 🐾

**PataMatch** — *Donde cada pata encuentra su hogar*

PataMatch es una aplicación web diseñada para conectar mascotas con sus futuros hogares, facilitar el reporte de mascotas perdidas y ofrecer un espacio para compartir historias y gestionar carnets de mascotas.

## 🚀 Tecnologías

*   **Frontend**: HTML, CSS, JavaScript (Vanilla SPA)
*   **Backend**: Node.js, Express.js
*   **Base de Datos**: SQLite (usando `sql.js`)
*   **Autenticación**: JSON Web Tokens (JWT) & `bcryptjs`

## 📁 Estructura del Proyecto

*   `server.js`: Archivo principal del servidor Express.
*   `routes/`: Rutas de la API (autenticación, mascotas, posts, historias, favoritos, carnets, etc.).
*   `middleware/`: Middlewares de Express (ej. autenticación, manejo de errores).
*   `db/`: Configuración e inicialización de la base de datos.
*   `index.html`: Punto de entrada de la interfaz de usuario (Frontend).
*   `js/`: Archivos y lógica JavaScript del lado del cliente.
*   `Wireframes/`: Archivos de diseño visual del proyecto.

## 🛠️ Instalación y Configuración

1.  Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```
3.  Inicia el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```
    *O de forma estándar:*
    ```bash
    npm start
    ```
4.  Abre tu navegador web e ingresa a `http://localhost:3000`.

## 👥 Cuentas de Demo

Puedes acceder rápidamente a la aplicación usando estas cuentas preconfiguradas:

*   **Email**: `sarah@patamatch.com` | **Contraseña**: `demo123`
*   **Email**: `david@patamatch.com` | **Contraseña**: `demo123`
*   **Email**: `demo@patamatch.com` | **Contraseña**: `demo123`
