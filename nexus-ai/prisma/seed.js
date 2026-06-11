const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12)
  const demoPassword = await bcrypt.hash("demo123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexus.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nexus.com",
      password: adminPassword,
      role: "admin",
      digitalSelf: {
        create: {
          knowledgeScore: 42,
          careerScore: 68,
          opportunityScore: 55,
          confidenceScore: 85,
          consistencyScore: 72,
          growthScore: 60,
        },
      },
    },
  })

  const demo = await prisma.user.upsert({
    where: { email: "demo@nexus.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@nexus.com",
      password: demoPassword,
      role: "demo",
      digitalSelf: {
        create: {
          knowledgeScore: 18,
          careerScore: 12,
          opportunityScore: 8,
          confidenceScore: 25,
          consistencyScore: 15,
          growthScore: 20,
        },
      },
    },
  })

  console.log("Seeded users:")
  console.log(`  Admin: ${admin.email} (role: ${admin.role})`)
  console.log(`  Demo:  ${demo.email} (role: ${demo.role})`)

  // Seed sample opportunities
  const opportunities = [
    { title: "AI Global Hackathon 2026", description: "Build something amazing with AI in 48 hours. Open to all skill levels.", type: "hackathon", url: "https://example.com/ai-hackathon", matchScore: 94, matchReason: "AI learning goal detected · Python skills detected · Student profile" },
    { title: "ML Engineering Internship", description: "Summer internship at a top tech company working on production ML systems.", type: "internship", url: "https://example.com/ml-internship", matchScore: 87, matchReason: "Career path alignment · ML skills detected · Active roadmap" },
    { title: "Women in Tech Scholarship", description: "Full scholarship for underrepresented groups in technology. Includes mentorship.", type: "scholarship", url: "https://example.com/scholarship", matchScore: 76, matchReason: "Profile match · Community participation · Growth potential" },
    { title: "Open Source AI Conference", description: "Three-day conference covering the latest in open source AI tools and research.", type: "event", url: "https://example.com/osai-conf", matchScore: null, matchReason: null },
    { title: "Data Science Competition", description: "Kaggle-style competition with $50k prize pool. Teams of up to 4 people.", type: "competition", url: "https://example.com/ds-competition", matchScore: 82, matchReason: "Data skills alignment · Competition history · Team collaboration" },
  ]

  for (const opp of opportunities) {
    await prisma.opportunity.create({ data: { ...opp, createdBy: admin.id } })
  }

  console.log(`Seeded ${opportunities.length} opportunities`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
