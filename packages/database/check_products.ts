import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:LUobjhbzcLnDeHnONoLdkRbAQLhiXAVm@turntable.proxy.rlwy.net:57784/railway"
      }
    }
  });

  try {
    const products = await prisma.product.findMany({
      where: {
        utilityPercent: 0
      },
      select: {
        code: true,
        name: true,
        utilityPercent: true
      }
    });

    console.log('--- PRODUCTOS CON MARGEN 0% ---');
    if (products.length === 0) {
      console.log('No se encontraron productos con margen de 0%.');
    } else {
      products.forEach(p => {
        console.log(`Código: ${p.code} | Nombre: ${p.name}`);
      });
    }
    console.log(`\nTotal: ${products.length} productos.`);
    console.log('-------------------------------');
  } catch (error) {
    console.error('Error al consultar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
