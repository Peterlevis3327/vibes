import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This requires the GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to a valid service account key JSON file, OR passing the credential directly.
// e.g. export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

const seedData = async () => {
  console.log("Starting seeding...");

  // Seed Services
  const services = [
    {
      id: "web-development",
      title: "Web Development",
      shortDescription: "Custom, high-performance web applications tailored to your business needs.",
      content: "We build fast, scalable, and secure web applications using modern technologies like Next.js, React, and Node.js.",
      status: "Published",
      order: 1,
      timeline: "4-12 weeks",
      idealFor: "Startups, SaaS companies, and established businesses.",
      includes: ["Custom Design", "Frontend & Backend Development", "API Integration", "SEO Optimization", "Performance Tuning"],
      screenshotImage: { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600", alt: "Web Development" }
    },
    {
      id: "ui-ux-design",
      title: "UI/UX Design",
      shortDescription: "Intuitive, user-centered design that elevates your brand and drives engagement.",
      content: "Our design process focuses on user research, wireframing, prototyping, and creating pixel-perfect interfaces that delight your users.",
      status: "Published",
      order: 2,
      timeline: "2-6 weeks",
      idealFor: "New product launches, redesigns, and improving conversion rates.",
      includes: ["User Research", "Wireframing", "Prototyping", "Visual Design", "Design Systems"],
      screenshotImage: { url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600", alt: "UI/UX Design" }
    }
  ];

  for (const service of services) {
    await db.collection("services").doc(service.id).set({
      ...service,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Seeded service: ${service.title}`);
  }

  // Seed Portfolio Projects
  const projects = [
    {
      id: "fintech-dashboard",
      title: "Fintech Analytics Dashboard",
      description: "A comprehensive analytics dashboard for a leading fintech company, providing real-time insights into user transactions and portfolio performance.",
      content: "We redesigned and rebuilt the core analytics platform, improving data load times by 60% and increasing user engagement.",
      category: "Web Development",
      year: "2024",
      status: "Published",
      client: "Finova Inc.",
      role: "Lead Agency",
      technologies: ["Next.js", "React", "Tailwind CSS", "Firebase"],
      liveUrl: "https://example.com",
      images: [{ url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800", alt: "Dashboard" }]
    },
    {
      id: "ecommerce-platform",
      title: "Modern E-Commerce Platform",
      description: "A high-converting, headless e-commerce storefront for a premium lifestyle brand.",
      content: "Leveraging headless architecture, we built a lightning-fast shopping experience that resulted in a 35% increase in conversion rate.",
      category: "Full Stack",
      year: "2023",
      status: "Published",
      client: "Lumina",
      role: "Design & Development",
      technologies: ["Shopify", "Next.js", "GraphQL"],
      images: [{ url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", alt: "E-commerce" }]
    }
  ];

  for (const project of projects) {
    await db.collection("portfolio").doc(project.id).set({
      ...project,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Seeded project: ${project.title}`);
  }

  // Seed Testimonials
  const testimonials = [
    {
      id: "testim-1",
      quote: "Agency delivered our project on time and exceeded all our expectations. The new platform has transformed how we do business.",
      author: "Jane Doe",
      title: "CEO, Finova Inc.",
      status: "Published",
      relatedProjectId: "fintech-dashboard",
      avatarImage: { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", alt: "Jane Doe" }
    }
  ];

  for (const testimonial of testimonials) {
    await db.collection("testimonials").doc(testimonial.id).set({
      ...testimonial,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Seeded testimonial: ${testimonial.author}`);
  }

  // Seed Team
  const team = [
    {
      id: "team-1",
      name: "Alex Rivera",
      role: "Lead Developer",
      bio: "With over 10 years of experience, Alex leads our engineering efforts with a focus on scalable architecture.",
      status: "Published",
      order: 1,
      photo: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300", alt: "Alex Rivera" }
    },
    {
      id: "team-2",
      name: "Sam Chen",
      role: "Design Director",
      bio: "Sam brings a user-first approach to every project, ensuring beautiful and functional digital experiences.",
      status: "Published",
      order: 2,
      photo: { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300", alt: "Sam Chen" }
    }
  ];

  for (const member of team) {
    await db.collection("team").doc(member.id).set({
      ...member,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Seeded team member: ${member.name}`);
  }

  // Seed Posts
  const posts = [
    {
      id: "post-1",
      title: "The Future of Web Development in 2024",
      slug: "future-of-web-development-2024",
      excerpt: "Exploring the latest trends, frameworks, and architectural patterns shaping the next generation of web applications.",
      content: "<p>The web development landscape is evolving faster than ever. In this post, we explore the rise of server components, the edge computing revolution, and how AI is changing the way we write code.</p>",
      status: "Published",
      authorId: "team-1",
      publishedAt: new Date().toISOString(),
      seoTitle: "Future of Web Dev 2024 | Agency.",
      seoDescription: "Exploring the latest trends in web development for 2024.",
      coverImage: { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800", alt: "Code on screen" }
    }
  ];

  for (const post of posts) {
    await db.collection("posts").doc(post.id).set({
      ...post,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Seeded post: ${post.title}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
};

seedData().catch(console.error);
