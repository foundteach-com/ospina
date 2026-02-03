-- Script SQL para crear el usuario administrador
-- Ejecutar esto en Railway -> Postgres -> Data -> Query

-- Primero, verificar si el usuario ya existe
SELECT * FROM "User" WHERE email = 'almacen@ospinacomercializadoraysuministros.com';

-- Si no existe, crear el usuario
-- NOTA: Este hash corresponde a la contraseña 'admin123'
-- Generado con bcrypt, 10 rounds: $2b$10$OVeF9fUOajxhs1c/B31dZuDvDYiLB2z7rfhjJ90/cq0pgNXJeBXCu
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'cm5h8x9y0000008l6h8x9y0z1',
  'almacen@ospinacomercializadoraysuministros.com',
  '$2b$10$OVeF9fUOajxhs1c/B31dZuDvDYiLB2z7rfhjJ90/cq0pgNXJeBXCu',
  'Administrador Principal',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó correctamente
SELECT id, email, name, role, "createdAt" FROM "User" WHERE email = 'almacen@ospinacomercializadoraysuministros.com';

