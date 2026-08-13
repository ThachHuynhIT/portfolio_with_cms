import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin account."
    );
  }
  const adminPasswordHash = await hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Alex Rivera",
      tagline: "Full-stack developer & designer",
      heroHeadline: "I build products end-to-end.",
      heroSubtext:
        "Freelance developer focused on fast, accessible web apps.",
      bio: "I'm a full-stack developer with a focus on React, Next.js, and Node. I've spent the last few years helping startups ship their first product and scale it.",
      contactEmail: "alex@example.com",
      socialLinks: { github: "https://github.com/example", linkedin: "https://linkedin.com/in/example" },
      defaultSeoTitle: "Alex Rivera — Full-stack Developer",
      defaultSeoDescription: "Portfolio and case studies from Alex Rivera, a freelance full-stack developer.",
    },
  });

  const skills = [
    { name: "TypeScript", category: "Languages", order: 0 },
    { name: "React", category: "Frontend", order: 1 },
    { name: "Next.js", category: "Frontend", order: 2 },
    { name: "Node.js", category: "Backend", order: 3 },
    { name: "PostgreSQL", category: "Backend", order: 4 },
  ];
  for (const skill of skills) {
    const existing = await prisma.skill.findFirst({ where: { name: skill.name } });
    if (!existing) {
      await prisma.skill.create({ data: skill });
    }
  }

  const experienceEntries = [
    {
      type: "WORK" as const,
      title: "Freelance Full-stack Developer",
      organization: "Self-employed",
      location: "Remote",
      startDate: new Date("2023-01-01"),
      endDate: null,
      description: "Building web apps and CMS platforms for small businesses and startups.",
      order: 0,
    },
    {
      type: "EDUCATION" as const,
      title: "B.Sc. Computer Science",
      organization: "State University",
      location: "Remote",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2022-06-01"),
      description: "Focused on software engineering and databases.",
      order: 1,
    },
  ];
  for (const entry of experienceEntries) {
    const existing = await prisma.experienceEntry.findFirst({
      where: { title: entry.title, organization: entry.organization },
    });
    if (!existing) {
      await prisma.experienceEntry.create({ data: entry });
    }
  }

  const projects = [
    {
      title: "Recipe Sharing App",
      slug: "recipe-sharing-app",
      summary: "A community recipe platform with search and collections.",
      description: "Built with Next.js and PostgreSQL. Users can post recipes, save collections, and search by ingredient.",
      techTags: ["Next.js", "PostgreSQL", "Tailwind"],
      liveUrl: "https://example.com/recipe-app",
      repoUrl: "https://github.com/example/recipe-app",
      order: 0,
      featured: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-03-01"),
    },
    {
      title: "Team Task Tracker",
      slug: "team-task-tracker",
      summary: "A lightweight Kanban board for small teams.",
      description: "Realtime task tracker with drag-and-drop columns, built for a 5-person startup team.",
      techTags: ["React", "Node.js", "WebSockets"],
      liveUrl: "https://example.com/task-tracker",
      repoUrl: "https://github.com/example/task-tracker",
      order: 1,
      featured: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-07-15"),
    },
    {
      title: "Internal Analytics Dashboard",
      slug: "internal-analytics-dashboard",
      summary: "Work-in-progress dashboard for tracking product usage metrics.",
      description: "Not ready to publish yet — validates that draft content stays hidden from public routes.",
      techTags: ["Next.js", "Recharts"],
      order: 2,
      featured: false,
      status: "DRAFT" as const,
      publishedAt: null,
    },
  ];
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }

  const blogPosts = [
    {
      title: "Why I Switched to Server Components",
      slug: "why-i-switched-to-server-components",
      excerpt: "A few months into using React Server Components in production.",
      content: "Server Components changed how I think about data fetching. Here's what worked and what didn't.",
      tags: ["React", "Next.js"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-05-10"),
    },
    {
      title: "Designing a CMS You'll Actually Maintain",
      slug: "designing-a-cms-youll-actually-maintain",
      excerpt: "Notes from building a self-hosted admin panel from scratch.",
      content: "Fixed content models over a page builder, Markdown over a rich text editor — trade-offs that kept this project maintainable solo.",
      tags: ["Architecture", "CMS"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-08-20"),
    },
  ];
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  const testimonials = [
    {
      authorName: "Jamie Chen",
      authorRole: "Founder, Recipe Co.",
      quote: "Alex shipped our MVP in six weeks and it hasn't needed a rewrite since.",
      order: 0,
      status: "PUBLISHED" as const,
    },
    {
      authorName: "Priya Nair",
      authorRole: "Product Lead, TaskFlow",
      quote: "Clear communication and clean code — exactly what we needed for a fast-moving team.",
      order: 1,
      status: "PUBLISHED" as const,
    },
  ];
  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: testimonial.authorName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
