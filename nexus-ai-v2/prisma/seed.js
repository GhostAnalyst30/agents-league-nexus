const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const demoPassword = await bcrypt.hash("demo123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexus.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nexus.com",
      password: adminPassword,
      role: "admin",
      digitalSelf: {
        create: { knowledge: 75, career: 60, opportunity: 80 },
      },
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@nexus.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@nexus.com",
      password: demoPassword,
      digitalSelf: {
        create: { knowledge: 30, career: 20, opportunity: 40 },
      },
    },
  });

  const opportunities = [
    {
      title: "AI Hackathon 2026",
      description: "Build an AI-powered solution for social impact. Prizes up to $10,000.",
      type: "hackathon",
      url: "https://example.com/ai-hackathon",
      createdBy: admin.id,
    },
    {
      title: "Machine Learning Internship",
      description: "Remote ML internship at a fast-growing startup. 3 months duration.",
      type: "internship",
      url: "https://example.com/ml-internship",
      createdBy: admin.id,
    },
    {
      title: "Tech Scholarship Program",
      description: "Full scholarship for underrepresented groups in technology.",
      type: "scholarship",
      url: "https://example.com/tech-scholarship",
      createdBy: admin.id,
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.upsert({
      where: { id: opp.title },
      update: {},
      create: opp,
    });
  }

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
