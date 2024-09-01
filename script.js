const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();

  // Log the folder to verify files are included
  console.log(query);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
