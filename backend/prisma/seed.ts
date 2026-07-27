import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      name: 'superAdmin',
      email: 'vukosimohlabini16@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());