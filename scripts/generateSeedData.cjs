/**
 * Generates realistic seed data for Ribha Solutions.
 * Run: node scripts/generateSeedData.cjs
 */

const fs = require('fs');
const path = require('path');

const SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Figma', 'Adobe XD', 'SEO', 'Content Writing',
  'Data Entry', 'Project Management', 'AWS', 'Docker', 'Vue.js', 'Angular', 'PHP',
  'Laravel', 'Java', 'Swift', 'Flutter', 'MongoDB', 'PostgreSQL', 'GraphQL',
  'Illustrator', 'Sketch', 'Photoshop', 'WordPress', 'Shopify', 'REST API',
  'Copywriting', 'Analytics', 'Google Ads', 'Social Media', 'Email Marketing',
  'Technical Writing', 'CI/CD', 'Testing', 'QA', 'Kubernetes'
];

const CATEGORIES = ['ai', 'development', 'design', 'marketing', 'writing', 'admin', 'finance', 'legal'];

const PROJECT_TITLES = [
  'Build a React dashboard for internal analytics',
  'Set up Shopify store with custom theme and payment integration',
  'Design mobile app UI in Figma — fintech product',
  'Write Python scripts to automate invoice processing',
  'SEO audit and on-page optimization for 50-page website',
  'Customize WordPress theme for coaching business',
  'Integrate Razorpay and Stripe into existing Node.js backend',
  'Create brand identity — logo, typography, colour system',
  'Write 10 SEO blog posts for SaaS company',
  'Build React Native app for delivery tracking',
  'Node.js REST API for e-commerce order management',
  'Convert Figma designs to responsive React components',
  'Migrate MySQL database to PostgreSQL without downtime',
  'Run Instagram and LinkedIn campaigns for product launch',
  'Write technical documentation for developer API',
  'Set up AWS infrastructure with auto-scaling and CloudFront',
  'Containerise monolith application using Docker and Kubernetes',
  'Build landing page with animations for upcoming app launch',
  'Data entry and cleanup for 10,000-row product catalogue',
  'Write email sequences for onboarding and re-engagement',
  'Full-stack web application for appointment booking',
  'Redesign UI/UX for B2B SaaS dashboard',
  'Train Python ML model for churn prediction',
  'Set up Mailchimp automation with segmentation',
  'Build and configure Shopify store from scratch',
  'Write API documentation using OpenAPI / Swagger',
  'Admin dashboard with charts and export functionality',
  'Build backend for mobile app — Firebase + Node.js',
  'Create brand guidelines document for new startup',
  'Monthly blog content — 8 articles, SEO-optimised',
  'Integrate payment gateway into Laravel application',
  'Build reusable React component library with Storybook',
  'Migrate Angular 8 app to React 18',
  'Laravel-based multi-vendor e-commerce platform',
  'Interactive Figma prototype for iOS banking app',
  'Write SEO content for 15 service pages',
  'Scrape and structure data from public job boards',
  'Integrate Salesforce CRM with internal tools',
  'Build Chrome extension for productivity tracking',
  'Edit and produce 5 marketing videos — reels format',
  'Create financial model and investor deck for seed round',
  'Review and redraft employment contracts (10 documents)',
  'Build AI chatbot for customer support using GPT-4',
  'Inventory management system with barcode scanning',
  'Online booking system for salon chain',
  'Multilingual website — English, Hindi, Tamil',
  'WCAG 2.1 accessibility audit with remediation plan',
  'Performance audit and optimisation for React app',
  'Security audit for fintech web application',
  'GraphQL API design and implementation',
  'Microservices refactor for monolith backend',
];

const JOB_DESCRIPTIONS = [
  'We are a bootstrapped startup and need reliable help to hit our next milestone. You will work directly with our CTO. Clear briefs, fast feedback, on-time payment — that is our commitment to you.',
  'Growing D2C brand looking for a specialist who has done this before. We do not have time for a learning curve. Share relevant work and we will move fast.',
  'Early-stage product team. We value clear communication and honest timelines more than anything else. If you see a problem, tell us — do not just deliver what was asked.',
  'Agency overflow project. We have a regular pipeline of similar work if this goes well. Looking for someone who can work independently with minimal supervision.',
  'Internal tool for our ops team. Not customer-facing, but needs to be solid. We have detailed specs ready to share after NDA is signed.',
  'We have been burned before by freelancers who disappeared mid-project. We run proper milestones and escrow — we just need someone who will actually deliver.',
  'Remote-first company. You can work whenever you want as long as you hit the milestones and respond to messages within 24 hours.',
  'Series A startup. Moving quickly. We will need someone who can adapt as requirements evolve — which they will.',
  'Non-technical founder here. I need someone who can translate business requirements into good technical decisions, not just code what I ask for.',
  'Second time posting this job. First freelancer we hired had a great profile but poor execution. Looking for someone with verifiable references.',
];

const BUDGETS = [
  '₹15,000–40,000', '₹40,000–80,000', '₹80,000–1,50,000',
  '₹1,50,000–3,00,000', '₹3,00,000–6,00,000',
  '₹1,500–3,000/hr', '₹3,000–6,000/hr', '₹6,000–12,000/hr',
];

const COMPANIES = [
  'Infoedge Solutions', 'Razorpay Partners', 'Growfast Digital', 'Buildwise Tech',
  'Kotak Ventures', 'Meesho Suppliers', 'Zolo Technologies', 'PhonePe Agency',
  'Swiggy Ops Team', 'CRED Fintech', 'Urban Company', 'Vedantu EdTech',
  'Practo Health', 'OYO Operations', 'Lenskart Digital', 'Cars24 Analytics',
  'Nykaa Commerce', 'Byju\'s Content', 'Paytm Partners', 'ShareChat Media',
];

const INDIAN_NAMES = [
  'Arjun Sharma', 'Priya Patel', 'Rahul Verma', 'Ananya Singh', 'Vikram Reddy',
  'Kavya Nair', 'Aditya Krishnan', 'Ishita Gupta', 'Rohan Mehta', 'Sneha Joshi',
  'Karan Malhotra', 'Diya Agarwal', 'Aarav Kapoor', 'Neha Desai', 'Rishabh Iyer',
  'Anjali Rao', 'Siddharth Pillai', 'Pooja Menon', 'Varun Choudhury', 'Meera Banerjee',
  'Arnav Saxena', 'Kritika Dubey', 'Vivek Trivedi', 'Shreya Mishra', 'Dev Sharma',
  'Nidhi Bhatia', 'Akash Sinha', 'Tanvi Agarwal', 'Rajat Khanna', 'Aisha Khan',
  'Manish Tiwari', 'Riya Oberoi', 'Nikhil Chopra', 'Swati Ghosh', 'Abhishek Dutta',
  'Preeti Venkatesh', 'Gaurav Mukherjee', 'Divya Srinivasan', 'Ankit Bansal', 'Simran Kaur',
  'Harsh Shah', 'Rhea Menon', 'Kunal Jain', 'Aarti Reddy', 'Sahil Bhat',
  'Vandana Nambiar', 'Ravi Sundaram', 'Deepika Krishnan', 'Manoj Iyengar', 'Lakshmi Venkat'
];

const BIOS = [
  'I spent 4 years at a product startup before going independent. I work with 3–4 clients at a time and treat every project like it\'s my own business.',
  'Full-stack engineer with a focus on React and Node.js. I have shipped products used by 500K+ users. I prefer fixed-scope projects with clear deliverables.',
  'Designer who codes. I can take a product from wireframes to working React components without needing a separate handoff phase.',
  'Former agency lead, now solo. I have managed projects up to ₹40L. I know how to scope, estimate, and deliver without drama.',
  'I specialise in early-stage products — MVP builds, proof-of-concepts, rapid iterations. I have worked with 12 funded startups in the last 3 years.',
  'Data engineer and ML practitioner. I work on pipelines, dashboards, and models. Not interested in trivial data-entry work — looking for projects with actual complexity.',
  'Content strategist and writer. I have written for SaaS, fintech, and healthtech companies. I do not do generic blog posts — everything I write is researched and has a point of view.',
  'UI/UX designer with 6 years of experience. My design process starts with user research, not aesthetics. I deliver Figma files that developers can actually build from.',
  'Backend-focused engineer. PostgreSQL, Redis, AWS, microservices. I am the person you call when your system is slow or your architecture is getting messy.',
  'Growth marketer with hands-on experience in Google Ads, Meta, and SEO. I have managed budgets from ₹50K to ₹1.5Cr per month.',
];

const TITLES = [
  'Senior React Developer', 'Full Stack Engineer', 'UI/UX Designer', 'Python Developer', 'SEO Specialist',
  'Content Strategist', 'Data Engineer', 'Figma Designer', 'Node.js Developer', 'Frontend Developer',
  'Backend Developer', 'Mobile App Developer', 'WordPress Developer', 'Growth Marketer',
  'Technical Writer', 'DevOps Engineer', 'ML Engineer', 'Brand Designer', 'Copywriter', 'QA Engineer',
];

const AVAILABILITY = [
  'Available now', 'Available from next week', 'Part-time (20 hrs/week)',
  'Full-time (40 hrs/week)', 'Available in 2 weeks',
];

const EXPERIENCE = ['entry', 'intermediate', 'expert'];
const SKILL_TEST_IDS = ['react', 'nodejs', 'figma', 'python', 'seo', 'content', 'dataentry'];

const COVER_LETTERS = [
  'I have built three similar products in the last 18 months — happy to share them. My approach is to clarify scope before writing a single line of code so we both know what done looks like.',
  'I noticed you mentioned clear communication matters. I send end-of-day updates, flag blockers immediately, and never go quiet. Let me know if you want to jump on a quick call before you decide.',
  'I have done this exact integration twice before — once for a fintech startup, once for a marketplace. I can share both case studies. Timeline estimate: 12 days.',
  'My rate is slightly above your budget, but I am open to a conversation. I can explain why and show you what you get for it. Happy to do a small paid trial if that helps.',
  'I read the full brief carefully. A few questions before I commit to a timeline: What does your current tech stack look like? Do you have existing designs, or is this greenfield?',
  'I am available to start Monday. I prefer milestone-based contracts — it keeps both sides accountable. My standard split is 30% upfront, 40% at midpoint, 30% on delivery.',
  'I have attached three work samples directly relevant to this project. No filler — just the closest match I have to what you need.',
  'I am a solo operator, not an agency. You will work with me directly from kickoff to delivery. No project managers, no handoffs, no surprises.',
  'I have done similar work for companies at your stage. The biggest thing I have learned is to over-document everything — requirements, decisions, and trade-offs. It saves time and builds trust.',
  'Straightforward proposal: I can deliver the scope as described in 3 weeks for the mid-range of your budget. If the requirements change, we renegotiate. Clear terms from day one.',
];

const REVIEW_COMMENTS = [
  'Delivered on time and exactly to spec. The code was clean, well-documented, and easy to hand off to our in-house team.',
  'Excellent communication throughout. Never had to chase for updates. Would hire again without hesitation.',
  'Came back with thoughtful questions at the start that saved us from a bad design decision. That kind of proactiveness is rare.',
  'Third time working with this person. Consistent quality, consistent communication. That is all I ask for.',
  'Finished 3 days ahead of schedule and flagged two bugs that were outside the original scope. Professional above and beyond.',
  'Very good quality work. Slightly slow to respond at times, but the output made up for it.',
  'Reasonable rates for the quality delivered. Would recommend to any startup on a tight budget.',
  'Honest about what was realistic and what was not. Pushed back on a couple of my requirements — and they were right to.',
  'The final product looked exactly like the Figma mock. No "close enough" compromises. Genuinely impressive.',
  'Strong technical skills. Communication could be more proactive, but zero issues with the deliverables.',
  'Helped us scope the project properly before starting. We ended up spending less than we budgeted and getting more than we expected.',
  'Fast, reliable, professional. Three words. Would hire again.',
];

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickMany(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }
function daysAgo(days) { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString(); }

// 20 client users
const clientIds = Array.from({ length: 20 }, () => uuid());

// 100 projects
const projects = [];
for (let i = 0; i < 100; i++) {
  const isHourly = Math.random() > 0.6;
  const skills = pickMany(SKILLS, 3 + Math.floor(Math.random() * 4));
  const title = PROJECT_TITLES[i % PROJECT_TITLES.length];
  const desc = pick(JOB_DESCRIPTIONS) + ` Key skills required: ${skills.slice(0, 3).join(', ')}.`;
  projects.push({
    id: uuid(),
    clientId: pick(clientIds),
    title,
    description: desc,
    budget: pick(BUDGETS),
    projectType: isHourly ? 'hourly' : 'fixed',
    skills,
    category: pick(CATEGORIES),
    createdAt: daysAgo(Math.floor(Math.random() * 21)),
    status: 'open',
    timeline: pick(['1–2 weeks', '2–4 weeks', '1–2 months', '2–3 months']),
    deadline: daysAgo(-Math.floor(Math.random() * 30 + 7)),
    experienceLevel: pick(EXPERIENCE),
    projectSize: pick(['small', 'medium', 'large']),
    companyName: pick(COMPANIES),
    featured: Math.random() > 0.88,
    promoted: Math.random() > 0.92,
    urgent: Math.random() > 0.88,
    responseTime: pick(['within_1h', 'within_24h', 'within_24_48h']),
    projectTags: pickMany(['Startup', 'Enterprise', 'SMB', 'Agency'], 1 + Math.floor(Math.random() * 2)),
  });
}

// 50 freelancers
const freelancers = [];
const usedEmails = new Set();
for (let i = 0; i < 50; i++) {
  const fullName = INDIAN_NAMES[i % INDIAN_NAMES.length];
  const nameParts = fullName.toLowerCase().replace(/\s+/g, '.');
  let email = `${nameParts}${i}@example.com`;
  while (usedEmails.has(email)) email = `${nameParts}${i + 100}@example.com`;
  usedEmails.add(email);
  const userId = uuid();
  const skillIds = pickMany(SKILL_TEST_IDS, 1 + Math.floor(Math.random() * 2));
  const skillBadges = skillIds.map((sid) => ({
    skillId: sid,
    skillName: sid.charAt(0).toUpperCase() + sid.slice(1),
    score: 72 + Math.floor(Math.random() * 28),
    passed: true,
    passedAt: daysAgo(Math.floor(Math.random() * 90)),
  }));
  const rate = 2500 + Math.floor(Math.random() * 9500);
  freelancers.push({
    user: { id: userId, name: fullName, email, password: 'demo123', role: 'freelancer', gender: pick(['male', 'female']) },
    profile: {
      userId,
      title: pick(TITLES),
      bio: BIOS[i % BIOS.length],
      hourlyRate: `₹${rate.toLocaleString('en-IN')}/hr`,
      skills: pickMany(SKILLS, 4 + Math.floor(Math.random() * 5)),
      availability: pick(AVAILABILITY),
      experience: pick(EXPERIENCE),
      updatedAt: new Date().toISOString(),
      emailVerified: Math.random() > 0.25,
      phoneVerified: Math.random() > 0.4,
      idVerified: Math.random() > 0.5,
      location: pick(['Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Chennai, India', 'Hyderabad, India', 'Pune, India', 'Kolkata, India', 'Ahmedabad, India', 'Remote']),
      skillBadges,
    },
  });
}

// 20 client users
const clientUsers = clientIds.map((id, i) => ({
  id,
  name: COMPANIES[i % COMPANIES.length] + ' Team',
  email: `client${i + 1}@${COMPANIES[i % COMPANIES.length].toLowerCase().replace(/[\s']/g, '')}.com`,
  password: 'demo123',
  role: 'client',
  gender: 'male',
}));

// Proposals
const proposals = [];
for (const job of projects) {
  const numApplicants = 3 + Math.floor(Math.random() * 12);
  const applicants = pickMany(freelancers, Math.min(numApplicants, freelancers.length));
  for (const f of applicants) {
    proposals.push({
      id: uuid(),
      jobId: job.id,
      freelancerId: f.user.id,
      freelancerName: f.user.name,
      coverLetter: pick(COVER_LETTERS),
      proposedRate: f.profile.hourlyRate,
      timeline: pick(['1–2 weeks', '2–4 weeks', '1 month', '2 months']),
      ndaSigned: Math.random() > 0.4,
      createdAt: daysAgo(Math.floor(Math.random() * 10)),
      status: pick(['new', 'new', 'new', 'viewed', 'viewed', 'shortlisted', 'declined']),
    });
  }
}

// Reviews
const reviews = [];
for (const f of freelancers) {
  const numReviews = 4 + Math.floor(Math.random() * 11);
  for (let r = 0; r < numReviews; r++) {
    reviews.push({
      id: uuid(),
      jobId: uuid(),
      reviewerId: pick(clientIds),
      revieweeId: f.user.id,
      rating: Math.random() > 0.2 ? 5 : 4,
      comment: pick(REVIEW_COMMENTS),
      role: 'client',
      createdAt: daysAgo(Math.floor(Math.random() * 180)),
    });
  }
}

const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, 'projects.json'), JSON.stringify(projects, null, 2));
fs.writeFileSync(path.join(outputDir, 'freelancers.json'), JSON.stringify(freelancers, null, 2));
fs.writeFileSync(path.join(outputDir, 'clients.json'), JSON.stringify(clientUsers, null, 2));
fs.writeFileSync(path.join(outputDir, 'reviews.json'), JSON.stringify(reviews, null, 2));
fs.writeFileSync(path.join(outputDir, 'proposals.json'), JSON.stringify(proposals, null, 2));

console.log('Seed data generated:');
console.log(`  projects.json   — ${projects.length} jobs`);
console.log(`  freelancers.json — ${freelancers.length} freelancers`);
console.log(`  clients.json    — ${clientUsers.length} clients`);
console.log(`  reviews.json    — ${reviews.length} reviews`);
console.log(`  proposals.json  — ${proposals.length} proposals`);
