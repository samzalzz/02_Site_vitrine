import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.newsletterSubscriber.deleteMany();
    await prisma.contactSubmission.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.project.deleteMany();

    // Seed Projects
    const project1 = await prisma.project.create({
      data: {
        title: 'E-Commerce Platform',
        description:
          'A full-stack e-commerce platform built with React, Node.js, and PostgreSQL. Features include product catalog, shopping cart, order management, and payment integration with Stripe.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Express'],
        images: [
          'https://via.placeholder.com/600x400?text=ECommerce+1',
          'https://via.placeholder.com/600x400?text=ECommerce+2',
        ],
        deployedUrl: 'https://ecommerce-demo.example.com',
        githubUrl: 'https://github.com/yourname/ecommerce-platform',
        order: 1,
      },
    });

    const project2 = await prisma.project.create({
      data: {
        title: 'Task Management Application',
        description:
          'A collaborative task management tool with real-time updates, team collaboration features, and progress tracking. Built with TypeScript and React for the frontend and Express.js for the backend.',
        technologies: ['TypeScript', 'React', 'Express.js', 'WebSocket', 'MongoDB'],
        images: [
          'https://via.placeholder.com/600x400?text=TaskApp+1',
          'https://via.placeholder.com/600x400?text=TaskApp+2',
        ],
        deployedUrl: 'https://taskapp-demo.example.com',
        githubUrl: 'https://github.com/yourname/task-management',
        order: 2,
      },
    });

    // Seed Experience
    const experience1 = await prisma.experience.create({
      data: {
        title: 'Senior Full Stack Developer',
        company: 'Tech Solutions Inc.',
        startDate: new Date('2021-01-15'),
        endDate: new Date('2023-12-31'),
        description:
          'Led development of multiple full-stack applications. Mentored junior developers and established best practices for code quality and testing. Implemented CI/CD pipelines and improved application performance by 40%.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        order: 1,
      },
    });

    // Seed Skills
    const skill1 = await prisma.skill.create({
      data: {
        name: 'React',
        category: 'Frontend',
        level: 'Expert',
        order: 1,
      },
    });

    const skill2 = await prisma.skill.create({
      data: {
        name: 'Node.js',
        category: 'Backend',
        level: 'Expert',
        order: 2,
      },
    });

    console.log('✅ Database seeded successfully');
    console.log(`  - Created 2 projects`);
    console.log(`  - Created 1 experience entry`);
    console.log(`  - Created 2 skills`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
