import { PrismaClient, JobStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminEmail = 'admin@forcecraver.com';
  const passwordHash = await bcrypt.hash('Fcadmin@123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: 'System Administrator',
    },
    create: {
      email: adminEmail,
      name: 'System Administrator',
      passwordHash,
    },
  });

  console.log(`Admin account created / verified: ${admin.email}`);

  // 2. Clean existing jobs if any to prevent duplicate seeding
  await prisma.job.deleteMany({});

  const today = new Date();
  const subDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };

  // 3. Seed Realistic Job Descriptions
  const sampleJobs = [
    {
      companyName: 'Novigo',
      jobTitle: 'Senior Java Backend Developer',
      skills: 'Java 17, Spring Boot, Microservices, PostgreSQL, Kafka, Docker',
      experience: '5-8 years',
      location: 'Ahmedabad',
      salaryBudget: '16 - 24 LPA',
      jobDescription: `About the Role:
Novigo is seeking an experienced Senior Java Backend Developer to build scalable enterprise solutions. You will architect high-throughput microservices, design robust database schemas in PostgreSQL, and lead backend engineering practices.

Key Responsibilities:
• Design and implement mission-critical backend microservices using Java 17 and Spring Boot.
• Optimize PostgreSQL queries, indexing strategies, and database transaction throughput.
• Collaborate with frontend developers and product managers to deliver secure REST APIs.
• Implement CI/CD pipelines, containerized deployments via Docker and Kubernetes.
• Mentor junior engineers and perform rigorous code reviews.

Requirements:
• 5+ years of core Java & Spring Boot backend engineering experience.
• Strong hands-on expertise in relational databases, especially PostgreSQL.
• Experience with event streaming platforms (Kafka/RabbitMQ) and distributed systems.
• Solid grasp of REST API best practices, caching (Redis), and clean architecture.`,
      postedDate: today,
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Novigo',
      jobTitle: 'React Frontend Engineer',
      skills: 'React, TypeScript, Tailwind CSS, Next.js, Redux Toolkit',
      experience: '3-5 years',
      location: 'Ahmedabad',
      salaryBudget: '10 - 15 LPA',
      jobDescription: `About the Role:
Join the Novigo web team to build intuitive, fast, and responsive user interfaces. You will turn wireframes and UI designs into performant web applications using modern React and TypeScript.

Key Responsibilities:
• Develop scalable and accessible UI components with React, Next.js, and Tailwind CSS.
• Integrate backend REST APIs and manage complex client-side state with Redux Toolkit / React Query.
• Optimize client bundle sizes, rendering performance, and cross-browser responsiveness.
• Participate in design sprints and collaborate closely with product and UX teams.

Requirements:
• 3+ years of professional experience with React and TypeScript.
• Strong expertise in modern CSS architectures and responsive styling (Tailwind CSS).
• Experience with Next.js App Router, SSR, and API integration.`,
      postedDate: subDays(1),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Novigo',
      jobTitle: 'DevOps & Cloud Engineer',
      skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD, Linux',
      experience: '4-7 years',
      location: 'Ahmedabad',
      salaryBudget: '15 - 22 LPA',
      jobDescription: `About the Role:
We are looking for a DevOps Engineer to manage our cloud infrastructure on AWS and maintain high availability across our production Kubernetes clusters.

Key Responsibilities:
• Maintain and provision AWS cloud infrastructure using Terraform (Infrastructure as Code).
• Build and optimize automated CI/CD deployment pipelines using GitHub Actions / GitLab CI.
• Monitor production cluster health, logs, and telemetry using Prometheus, Grafana, and ELK.
• Implement security best practices, vulnerability scanning, and automated backup routines.

Requirements:
• 4+ years of DevOps/SRE experience with AWS and Kubernetes.
• Strong scripting skills in Bash or Python.
• In-depth knowledge of Docker containerization and networking.`,
      postedDate: subDays(2),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Novigo',
      jobTitle: 'Lead Full Stack Developer',
      skills: 'Node.js, React, PostgreSQL, GraphQL, TypeScript, Docker',
      experience: '7-10 years',
      location: 'Ahmedabad',
      salaryBudget: '22 - 30 LPA',
      jobDescription: `About the Role:
As Lead Full Stack Developer at Novigo, you will lead end-to-end technical deliverables spanning front-end web apps and scalable back-end microservices.

Key Responsibilities:
• Direct technical architecture across frontend (React/Next.js) and backend (Node.js/PostgreSQL).
• Define API contracts (REST / GraphQL) and ensure database schema integrity.
• Drive code quality, engineering standards, and sprint execution.

Requirements:
• 7+ years of full stack web development experience.
• High proficiency in Node.js, TypeScript, React, and relational database systems.
• Proven track record leading small to medium engineering squads.`,
      postedDate: subDays(4),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Novigo',
      jobTitle: 'QA Automation Specialist',
      skills: 'Selenium, Playwright, Jest, Python, CI/CD',
      experience: '3-6 years',
      location: 'Ahmedabad',
      salaryBudget: '8 - 14 LPA',
      jobDescription: `About the Role:
Responsible for developing end-to-end automated testing suites for web applications and backend APIs at Novigo.

Key Responsibilities:
• Write and maintain automated tests using Playwright and Selenium.
• Integrate automated test suites into CI/CD pipelines.
• Perform regression testing, load testing, and API verification.

Requirements:
• 3+ years experience in automated testing with TypeScript or Python.
• Strong knowledge of testing frameworks (Playwright, Jest, Postman).`,
      postedDate: subDays(5),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'ABC Technologies',
      jobTitle: 'Python / Django Developer',
      skills: 'Python, Django, FastAPI, PostgreSQL, Redis, Celery',
      experience: '3-6 years',
      location: 'Bengaluru',
      salaryBudget: '12 - 18 LPA',
      jobDescription: `About the Role:
ABC Technologies is looking for a skilled Python / Django Developer to build data-intensive backend web services and REST APIs.

Key Responsibilities:
• Develop backend services and asynchronous task workers with Django, FastAPI, and Celery.
• Optimize PostgreSQL queries and manage caching layers with Redis.
• Write comprehensive unit and integration tests.

Requirements:
• 3+ years of Python web development experience (Django or FastAPI).
• Strong relational database skills with PostgreSQL.
• Experience with asynchronous task processing using Celery and Redis.`,
      postedDate: today,
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'ABC Technologies',
      jobTitle: 'Data Engineer',
      skills: 'Python, SQL, Apache Spark, Airflow, PostgreSQL, Snowflake',
      experience: '4-7 years',
      location: 'Bengaluru',
      salaryBudget: '16 - 25 LPA',
      jobDescription: `About the Role:
Join ABC Technologies as a Data Engineer to design, construct, and maintain reliable data pipelines and analytics warehouses.

Key Responsibilities:
• Build ETL/ELT data pipelines using Apache Airflow and Python.
• Transform large datasets using Apache Spark and SQL.
• Maintain data warehouse schemas and ensure high data quality.

Requirements:
• 4+ years of data engineering experience with Python and SQL.
• Hands-on experience with Airflow, Spark, and cloud data warehouses.`,
      postedDate: subDays(3),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'ABC Technologies',
      jobTitle: 'UI/UX Designer & Prototyper',
      skills: 'Figma, Design Systems, Wireframing, User Research, Usability Testing',
      experience: '2-5 years',
      location: 'Remote',
      salaryBudget: '9 - 14 LPA',
      jobDescription: `About the Role:
Design intuitive user journeys, high-fidelity prototypes, and component design systems for web and mobile products at ABC Technologies.

Key Responsibilities:
• Create user flows, wireframes, and production-ready Figma prototypes.
• Maintain and expand the company design system and brand guidelines.
• Conduct usability tests and gather user feedback to iterate designs.

Requirements:
• 2+ years of UI/UX design experience for SaaS web products.
• Master of Figma, auto-layout, and design system components.`,
      postedDate: subDays(6),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'TechCorp Global',
      jobTitle: 'Java Developer',
      skills: 'Java, Spring Boot, REST APIs, Hibernate, PostgreSQL',
      experience: '2-4 years',
      location: 'Pune',
      salaryBudget: '8 - 13 LPA',
      jobDescription: `About the Role:
TechCorp Global is hiring a Java Developer to join our core product engineering group in Pune.

Key Responsibilities:
• Develop clean, testable Java code using Spring Boot framework.
• Integrate with PostgreSQL database using Hibernate/JPA.
• Write unit tests using JUnit and Mockito.

Requirements:
• 2+ years of Java backend development experience.
• Solid understanding of Object-Oriented Programming and Design Patterns.
• Proficiency with SQL and relational databases.`,
      postedDate: subDays(2),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'TechCorp Global',
      jobTitle: 'Senior System Architect',
      skills: 'Distributed Systems, Architecture, Microservices, Cloud, Security',
      experience: '10+ years',
      location: 'Mumbai',
      salaryBudget: '35 - 50 LPA',
      jobDescription: `About the Role:
Lead enterprise architecture strategy across all high-scale distributed applications at TechCorp Global.

Key Responsibilities:
• Define system architecture blueprints, scalability guidelines, and security frameworks.
• Guide engineering teams on microservice decomposition and event-driven patterns.
• Review technical proposals and ensure enterprise compliance.

Requirements:
• 10+ years in software engineering with 4+ years in architecture roles.
• Deep expertise in distributed systems, scalability, and cloud infrastructure.`,
      postedDate: subDays(8),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'TechCorp Global',
      jobTitle: 'Mobile App Developer (Flutter)',
      skills: 'Flutter, Dart, REST APIs, Mobile Architecture, State Management',
      experience: '3-5 years',
      location: 'Pune',
      salaryBudget: '10 - 15 LPA',
      jobDescription: `About the Role:
Develop cross-platform iOS and Android applications using Flutter and Dart.

Key Responsibilities:
• Build high-performance mobile UI with Flutter.
• Integrate REST APIs and push notification services.

Requirements:
• 3+ years in mobile development with 2+ years in Flutter/Dart.`,
      postedDate: subDays(15),
      status: JobStatus.CLOSED,
    },
    {
      companyName: 'Infosys',
      jobTitle: 'Full Stack Java Developer',
      skills: 'Java, Angular, Spring Boot, Oracle, Git, REST',
      experience: '4-6 years',
      location: 'Bengaluru',
      salaryBudget: '11 - 17 LPA',
      jobDescription: `About the Role:
Infosys is hiring Full Stack Java & Angular developers for enterprise digital transformation projects.

Key Responsibilities:
• Build Angular frontend modules and Spring Boot microservices.
• Work in agile sprints and deliver high-quality code.

Requirements:
• 4+ years of full stack experience with Java and Angular.
• Strong foundation in web security and database concepts.`,
      postedDate: subDays(1),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Infosys',
      jobTitle: 'Cloud Solutions Architect',
      skills: 'Azure, Microservices, Kubernetes, Enterprise Integration',
      experience: '8-12 years',
      location: 'Hyderabad',
      salaryBudget: '28 - 38 LPA',
      jobDescription: `About the Role:
Architect enterprise cloud solutions on Microsoft Azure for global Fortune 500 clients.

Key Responsibilities:
• Design multi-tenant cloud architectures on Azure.
• Migrate legacy workloads to containerized Azure Kubernetes Service (AKS).

Requirements:
• 8+ years experience with certified Azure Solutions Architect credentials.`,
      postedDate: subDays(5),
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Nexlify Solutions',
      jobTitle: 'Next.js & Node.js Developer',
      skills: 'Next.js, React, Node.js, Tailwind CSS, PostgreSQL, TypeScript',
      experience: '2-4 years',
      location: 'Ahmedabad',
      salaryBudget: '9 - 14 LPA',
      jobDescription: `About the Role:
We are looking for a motivated Next.js Developer to build blazing-fast web applications at Nexlify Solutions.

Key Responsibilities:
• Build modern web applications with Next.js App Router, SSR, and Tailwind CSS.
• Create REST APIs in Node.js and integrate PostgreSQL.

Requirements:
• 2+ years of React and Next.js experience.
• Strong CSS/Tailwind skills and understanding of full-stack TypeScript.`,
      postedDate: today,
      status: JobStatus.ACTIVE,
    },
    {
      companyName: 'Nexlify Solutions',
      jobTitle: 'Technical Support Engineer',
      skills: 'SQL, Troubleshooting, Linux, API Integration, Customer Service',
      experience: '1-3 years',
      location: 'Remote',
      salaryBudget: '5 - 8 LPA',
      jobDescription: `About the Role:
Provide tier-2 technical support, diagnose API integrations, and assist client technical teams.

Key Responsibilities:
• Analyze log files and debug application errors.
• Run database queries to investigate data issues.`,
      postedDate: subDays(20),
      status: JobStatus.CLOSED,
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.create({
      data: job,
    });
  }

  console.log(`Successfully seeded ${sampleJobs.length} jobs.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
