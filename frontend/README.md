# Frontend - Sistema INEA (Gestión de Educandos)

## 1. Instalar dependencias

```
npm install
```

## 2. Configurar variables de entorno

1. Copia `.env.example` a `.env`
2. Deja `VITE_API_URL=http://localhost:4000/api` mientras desarrollas en local
   (o pon la URL de Render si ya quieres probar contra producción)

## 3. Levantar en modo desarrollo

```
npm run dev
```

Abre `http://localhost:5173`

## 4. Primer inicio de sesión

Usa el correo y contraseña del usuario admin que ya creaste en Compass.

## Estructura del proyecto

```
inea-frontend/
├── src/
│   ├── views/          # Login, Dashboard, Educandos, Usuarios, Historial, Recuperar
│   ├── router/          # rutas y guardas de sesion/rol
│   ├── store/auth.js    # estado de sesion (Pinia)
│   ├── services/api.js  # instancia de Axios con el JWT
│   └── assets/main.css  # Tailwind + estilos de tabla
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## IMPORTANTE: parche pendiente en el backend

Los botones de "Exportar Excel/PDF/Gráficas" en el Dashboard usan enlaces
`<a href>` para que el navegador descargue el archivo directamente. Como un
enlace no puede mandar el header `Authorization`, el frontend manda el token
como `?token=...` en la URL.

Tu backend actual **todavía no acepta el token de esa forma** (solo lo lee del
header). Te dejo el archivo ya corregido: reemplaza tu
`backend/middlewares/auth.js` con el que está en la carpeta
`inea-backend-patch/middlewares/auth.js` de este mismo mensaje, y vuelve a
desplegar en Render (o reinicia tu servidor local).

## Pendiente / mejoras futuras

- Falta un endpoint en el backend para **listar y desactivar usuarios**
  (por ahora `UsuariosView.vue` solo permite crearlos). Si lo necesitas para
  tu residencia, dime y lo agregamos.
- Falta paginación en la tabla de Educandos si el listado crece mucho.
