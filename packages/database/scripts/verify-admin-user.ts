import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'almacen@ospinacomercializadoraysuministros.com';
  const password = 'admin123';
  
  console.log('Checking if user exists...');
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('User already exists:', existingUser.email);
    console.log('Updating password...');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    
    console.log('Password updated successfully!');
  } else {
    console.log('User does not exist. Creating new user...');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Administrador Principal',
        role: 'ADMIN',
      },
    });
    
    console.log('User created successfully:', user.email);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
