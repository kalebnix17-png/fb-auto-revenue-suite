// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client/scripts/default-index");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@fbrevenue.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@fbrevenue.com",
      password: adminPassword,
      role: "ADMIN",
      aiCredits: 999,
      subscription: {
        create: {
          plan: "AGENCY",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ── Demo user ───────────────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash("Demo123!", 12);
  const demo = await db.user.upsert({
    where: { email: "demo@fbrevenue.com" },
    update: {},
    create: {
      name: "Demo Business",
      email: "demo@fbrevenue.com",
      password: demoPassword,
      role: "USER",
      aiCredits: 50,
      subscription: {
        create: {
          plan: "PRO",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });
  console.log(`✅ Demo: ${demo.email}`);

  // ── Facebook Pages ──────────────────────────────────────────────────────────
  const page1 = await db.facebookPage.upsert({
    where: { pageId: "demo_page_001" },
    update: {},
    create: {
      userId: demo.id,
      pageId: "demo_page_001",
      name: "Demo Coffee Shop",
      accessToken: "demo_access_token_001",
      category: "Food & Beverage",
      followersCount: 4823,
      isActive: true,
    },
  });

  const page2 = await db.facebookPage.upsert({
    where: { pageId: "demo_page_002" },
    update: {},
    create: {
      userId: demo.id,
      pageId: "demo_page_002",
      name: "Demo Fitness Studio",
      accessToken: "demo_access_token_002",
      category: "Health & Wellness",
      followersCount: 2156,
      isActive: true,
    },
  });
  console.log(`✅ Pages: ${page1.name}, ${page2.name}`);

  // ── Posts ───────────────────────────────────────────────────────────────────
  const postData = [
    {
      userId: demo.id,
      pageId: page1.id,
      content: "☕ Start your morning right with our freshly brewed single-origin Ethiopian coffee! Stop by today and enjoy 20% off your first cup. #CoffeeLover #MorningCoffee",
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      aiGenerated: true,
      engagement: { likes: 47, comments: 8, shares: 3, reach: 892 },
    },
    {
      userId: demo.id,
      pageId: page1.id,
      content: "🎉 BIG NEWS! We're launching our new loyalty program this Saturday. Earn points with every purchase and redeem them for free drinks. Who's excited? Drop a ☕ in the comments!",
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      aiGenerated: false,
      engagement: { likes: 93, comments: 24, shares: 11, reach: 1420 },
    },
    {
      userId: demo.id,
      pageId: page1.id,
      content: "Weekend special: Buy any large coffee, get a pastry FREE! Valid Saturday and Sunday only. See you soon! 🥐",
      status: "SCHEDULED" as const,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      aiGenerated: true,
    },
    {
      userId: demo.id,
      pageId: page2.id,
      content: "💪 NEW CLASS ALERT! HIIT Cardio Blast — Tuesdays & Thursdays at 6:30 AM. Limited spots available. DM us to reserve your spot now! #Fitness #HIIT",
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      aiGenerated: false,
      engagement: { likes: 34, comments: 12, shares: 5, reach: 654 },
    },
    {
      userId: demo.id,
      pageId: page2.id,
      content: "Draft: Monthly transformation post with before/after testimonials...",
      status: "DRAFT" as const,
      aiGenerated: false,
    },
  ];

  for (const post of postData) {
    await db.post.create({ data: post });
  }
  console.log(`✅ Posts: ${postData.length} created`);

  // ── Leads ───────────────────────────────────────────────────────────────────
  const leadsData = [
    { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1-555-0101", source: "Facebook Ad", status: "CONVERTED" as const, revenue: 299, convertedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), notes: "Purchased 3-month membership" },
    { name: "Marcus Thompson", email: "m.thompson@email.com", phone: "+1-555-0102", source: "Facebook Messenger", status: "QUALIFIED" as const, notes: "Interested in catering service" },
    { name: "Emily Chen", email: "emily.c@email.com", source: "Facebook Ad", status: "CONTACTED" as const, notes: "Requested pricing info" },
    { name: "David Rodriguez", email: "d.rod@email.com", phone: "+1-555-0104", source: "Organic Post", status: "NEW" as const },
    { name: "Jessica Williams", email: "j.will@email.com", source: "Facebook Messenger", status: "CONVERTED" as const, revenue: 149, convertedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { name: "James Miller", email: "j.miller@email.com", phone: "+1-555-0106", source: "Facebook Ad", status: "LOST" as const, notes: "Went with competitor" },
    { name: "Aisha Patel", email: "aisha.p@email.com", source: "Organic Post", status: "NEW" as const },
    { name: "Tom Bradley", email: "t.brad@email.com", phone: "+1-555-0108", source: "Facebook Messenger", status: "QUALIFIED" as const, notes: "Wants group packages" },
    { name: "Nina Foster", email: "nina.f@email.com", source: "Facebook Ad", status: "CONTACTED" as const },
    { name: "Chris Lee", email: "c.lee@email.com", phone: "+1-555-0110", source: "Organic Post", status: "CONVERTED" as const, revenue: 89, convertedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  ];

  for (const lead of leadsData) {
    await db.lead.create({
      data: { ...lead, userId: demo.id, pageId: page1.id },
    });
  }
  console.log(`✅ Leads: ${leadsData.length} created`);

  // ── Analytics ───────────────────────────────────────────────────────────────
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    await db.pageAnalytics.upsert({
      where: { pageId_date: { pageId: page1.id, date } },
      update: {},
      create: {
        pageId: page1.id,
        date,
        impressions: Math.floor(Math.random() * 800) + 200,
        reach: Math.floor(Math.random() * 500) + 100,
        engagements: Math.floor(Math.random() * 80) + 10,
        newFollowers: Math.floor(Math.random() * 15),
        leadsCount: Math.floor(Math.random() * 4),
        postsCount: Math.random() > 0.6 ? 1 : 0,
      },
    });
  }
  console.log(`✅ Analytics: 30 days of data`);

  // ── Notifications ───────────────────────────────────────────────────────────
  await db.notification.createMany({
    data: [
      { userId: demo.id, title: "New Lead Captured", message: "Sarah Johnson just submitted a lead from your Facebook ad.", type: "lead", read: false },
      { userId: demo.id, title: "Post Published", message: "Your post on Demo Coffee Shop was published successfully.", type: "post", read: true },
      { userId: demo.id, title: "Subscription Active", message: "Your Pro subscription is now active. Enjoy all features!", type: "billing", read: true },
    ],
  });
  console.log(`✅ Notifications: 3 created`);

  console.log("\n🎉 Seed complete!\n");
  console.log("  Admin login:  admin@fbrevenue.com / Admin123!");
  console.log("  Demo login:   demo@fbrevenue.com  / Demo123!\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
