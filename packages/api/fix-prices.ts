import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPrices() {
  console.log('Fetching all products...');
  const products = await prisma.product.findMany();
  
  let count = 0;
  for (const product of products) {
    if (product.basePrice && product.salesIvaPercent) {
      const currentBasePrice = Number(product.basePrice);
      const ivaPercent = Number(product.salesIvaPercent);
      
      const netPrice = currentBasePrice / (1 + (ivaPercent / 100));
      const roundedNetPrice = Math.round(netPrice * 100) / 100;
      
      console.log(`Updating product ${product.code}: old basePrice = ${currentBasePrice}, new net basePrice = ${roundedNetPrice}`);
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: roundedNetPrice,
        }
      });
      count++;
    }
  }
  
  console.log(`Updated ${count} products successfully.`);
}

fixPrices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
