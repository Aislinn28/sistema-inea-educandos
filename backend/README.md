# Backend - Sistema INEA (Gestión de Educandos)

## 1. Abrir el proyecto
Descomprime la carpeta `inea-backend` y ábrela en Visual Studio Code
(`File > Open Folder...`).

## 2. Instalar dependencias
Abre la terminal integrada de VS Code (`Ctrl + ñ` o `Terminal > New Terminal`) y ejecuta:

```
npm install
```

## 3. Configurar las variables de entorno
1. Copia el archivo `.env.example` y renómbralo a `.env`.
2. Llena `MONGO_URI` con tu cadena de conexión real de MongoDB Atlas
   (Atlas > Database > Connect > Drivers).
3. Cambia `JWT_SECRET` por una cadena larga y aleatoria (puedes generar una en
   https://www.uuidgenerator.net/ o simplemente escribir algo largo tú mismo).

## 4. Levantar el servidor en modo desarrollo

```
npm run dev
```

Si todo está bien configurado verás en la terminal:

```
Conexion a MongoDB Atlas exitosa
Servidor corriendo en http://localhost:4000
```

## 5. Probar que funciona
Abre tu navegador (o Postman) y visita:

```
http://localhost:4000/api/health
```

Debe responder: `{ "estado": "ok", "mensaje": "API del sistema INEA funcionando" }`

## 6. Crear tu primer usuario administrador
Como la ruta de crear usuarios requiere ya estar autenticado como admin, para el
PRIMER usuario admin necesitas insertarlo directo en MongoDB Compass (conéctate
con tu MONGO_URI, colección `usuarios`), o crear temporalmente una ruta sin
protección, insertar el usuario, y luego borrar esa ruta.

La contraseña debe guardarse ya hasheada. Puedes generarla rápido en una
terminal de Node:

```
node -e "console.log(require('bcryptjs').hashSync('tu_password', 10))"
```

Copia el resultado en el campo `password_hash` del documento que insertes en
Compass.

## 7. Siguientes pasos
- Probar todos los endpoints con Postman antes de conectar el frontend
  (POST /api/auth/login, POST /api/educandos, GET /api/educandos, etc.)
- Agregar: subida de documentos con Multer + Cloudinary, exportación a
  Excel/PDF, recuperación de contraseña por correo.
- Subir este repo a GitHub y conectar Render para el despliegue.

## Estructura del proyecto

```
inea-backend/
├── config/
│   └── db.js              # conexión a MongoDB Atlas
├── models/
│   ├── Usuario.js
│   ├── Educando.js
│   └── HistorialAuditoria.js
├── middlewares/
│   ├── auth.js             # verifica el JWT
│   └── checkRole.js        # verifica el rol (admin/capturista/lectura)
├── controllers/
│   ├── authController.js
│   └── educandoController.js
├── routes/
│   ├── authRoutes.js
│   └── educandoRoutes.js
├── server.js
├── .env.example
└── package.json
```
