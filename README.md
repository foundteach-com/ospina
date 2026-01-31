# Ospina Comercializadora y Suministros

Aplicación web completa para Ospina Comercializadora y Suministros, organizada como monorepo.

## 🏗️ Estructura del Proyecto

```
ospina/
├── apps/
│   ├── web/              # Sitio web institucional
│   ├── tienda/           # Tienda virtual
│   └── admin/            # Plataforma administrativa interna
├── packages/
│   ├── api/              # Backend API (NestJS)
│   ├── database/         # Configuración de base de datos (Prisma)
│   └── shared/           # Tipos y utilidades compartidas
└── infrastructure/       # Configuración de despliegue
```

## 🌐 Dominios

- **Sitio institucional**: ospinacomercializadoraysuministros.com
- **Tienda virtual**: tienda.ospinacomercializadoraysuministros.com
- **Plataforma admin**: app.ospinacomercializadoraysuministros.com

## 🚀 Tecnologías

- **Frontend**: Next.js 15 (App Router)
- **Backend**: NestJS
- **Base de datos**: PostgreSQL con Prisma
- **Despliegue**: Railway
- **Monorepo**: Turborepo

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build
```

## 🔧 Desarrollo

Cada aplicación se puede ejecutar independientemente:

```bash
# Sitio web institucional
npm run dev:web

# Tienda virtual
npm run dev:tienda

# Admin
npm run dev:admin

# API
npm run dev:api
```

## 🚢 Despliegue en Railway

El proyecto está configurado para desplegarse en Railway con servicios separados para cada aplicación.
