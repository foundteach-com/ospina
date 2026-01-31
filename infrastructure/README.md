# Railway Deployment Configuration

Este directorio contiene las configuraciones necesarias para desplegar la aplicación en Railway.

## Servicios

### 1. Web (Sitio Institucional)

- **Dominio**: ospinacomercializadoraysuministros.com
- **Puerto**: 3000
- **Build Command**: `npm run build:web`
- **Start Command**: `npm run start --workspace=web`

### 2. Tienda (E-commerce)

- **Dominio**: tienda.ospinacomercializadoraysuministros.com
- **Puerto**: 3001
- **Build Command**: `npm run build:tienda`
- **Start Command**: `npm run start --workspace=tienda`

### 3. Admin (Plataforma Administrativa)

- **Dominio**: app.ospinacomercializadoraysuministros.com
- **Puerto**: 3002
- **Build Command**: `npm run build:admin`
- **Start Command**: `npm run start --workspace=admin`

### 4. API (Backend)

- **Puerto**: 4000
- **Build Command**: `npm run build:api`
- **Start Command**: `npm run start --workspace=api`

### 5. Database (PostgreSQL)

- Usar el plugin de PostgreSQL de Railway

## Variables de Entorno

Cada servicio necesita las siguientes variables de entorno:

### Todos los servicios

```
NODE_ENV=production
```

### API

```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=4000
```

### Frontend Apps (web, tienda, admin)

```
NEXT_PUBLIC_API_URL=https://api-url.railway.app
```
