import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'almacen@ospinacomercializadoraysuministros.com';
  const password = 'admin123';

  console.log(`🔍 Verificando conexión a la base de datos...`);

  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');
  } catch (e) {
    console.error('❌ Error al conectar a la base de datos:', e);
    process.exit(1);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`⚠️ El usuario ${email} ya existe.`);
    // Asegurar que tenga rol de ADMIN
    if (existingUser.role !== UserRole.ADMIN) {
      console.log('🔄 Actualizando rol a ADMIN...');
      await prisma.user.update({
        where: { email },
        data: { role: UserRole.ADMIN },
      });
      console.log('✅ Rol actualizado correctamente.');
    } else {
      console.log('✅ El usuario ya tiene rol de ADMIN.');
    }
  } else {
    console.log(`🆕 Creando usuario administrador: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Administrador Principal',
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ Usuario administrador creado exitosamente con ID: ${user.id}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
