const { Client } = require('pg');

async function createAdminUser() {
  // URL de conexión a Railway
  const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:LUobjhbzcLnDeHnONoLdkRbAQLhiXAVm@turntable.proxy.rlwy.net:57784/railway';
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    console.log('✓ Conectado exitosamente');

    console.log('\nCreando usuario administrador...');
    const result = await client.query(`
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
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, name, role;
    `);

    if (result.rows.length > 0) {
      console.log('✓ Usuario creado exitosamente:');
      console.log(result.rows[0]);
    } else {
      console.log('⚠ El usuario ya existe');
    }

    // Verificar
    console.log('\nVerificando usuarios en la base de datos...');
    const users = await client.query('SELECT id, email, name, role FROM "User"');
    console.log(`Total de usuarios: ${users.rows.length}`);
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Desconectado de la base de datos');
  }
}

createAdminUser();
