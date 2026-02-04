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

  // --- Crear Usuario Jefe (VIEWER) ---
  const bossEmail = 'grupoasesores777@gmail.com';
  const bossPassword = 'Osp1n4.2026';
  
  const existingBoss = await prisma.user.findUnique({
    where: { email: bossEmail },
  });

  if (existingBoss) {
    console.log(`⚠️ El usuario Jefe ${bossEmail} ya existe.`);
    if (existingBoss.role !== UserRole.VIEWER) {
      console.log('🔄 Actualizando rol a VIEWER...');
      await prisma.user.update({
        where: { email: bossEmail },
        data: { role: UserRole.VIEWER },
      });
      console.log('✅ Rol de Jefe actualizado correctamente.');
    }
  } else {
    console.log(`🆕 Creando usuario Jefe: ${bossEmail}`);
    const hashedBossPassword = await bcrypt.hash(bossPassword, 10);

    const bossUser = await prisma.user.create({
      data: {
        email: bossEmail,
        password: hashedBossPassword,
        name: 'LUIS FERNANDO OSPINA SUAREZ',
        role: UserRole.VIEWER,
      },
    });
    console.log(`✅ Usuario Jefe creado exitosamente con ID: ${bossUser.id}`);
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
