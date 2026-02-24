create table if not exists public.app_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create unique index if not exists app_admins_user_id_key on public.app_admins (user_id);

create table if not exists public.resume_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content_html text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null,
  status text not null default 'draft',
  published_at timestamptz,
  tags text[],
  featured boolean not null default false,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_resume_sections_updated_at on public.resume_sections;
create trigger set_resume_sections_updated_at
before update on public.resume_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.app_admins enable row level security;
alter table public.resume_sections enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Admins read own record" on public.app_admins;
create policy "Admins read own record"
on public.app_admins
for select
using (user_id = auth.uid());

drop policy if exists "Public resume sections" on public.resume_sections;
create policy "Public resume sections"
on public.resume_sections
for select
using (visible = true);

drop policy if exists "Admins manage resume sections" on public.resume_sections;
create policy "Admins manage resume sections"
on public.resume_sections
for all
using (exists (select 1 from public.app_admins where user_id = auth.uid()));

drop policy if exists "Public published posts" on public.blog_posts;
create policy "Public published posts"
on public.blog_posts
for select
using (status = 'published');

drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts"
on public.blog_posts
for all
using (exists (select 1 from public.app_admins where user_id = auth.uid()));

insert into public.resume_sections (slug, title, content_html, sort_order, visible)
values
  (
    'summary',
    'Professional Summary',
    $$<ul>
      <li>Senior Full Stack Developer with 11+ years of experience delivering scalable web applications.</li>
      <li>Background across finance, insurance, healthcare, and telecommunications.</li>
      <li>Expert in modern JavaScript frameworks, backend services, and cloud platforms (AWS, GCP).</li>
    </ul>$$,
    1,
    true
  ),
  (
    'expertise',
    'Technical Expertise',
    $$<h3>Frontend</h3>
    <ul>
      <li>React, Angular, Aurelia, TypeScript, HTML5, CSS3</li>
      <li>Testing: Jasmine, Protractor, Karma, Selenium</li>
    </ul>
    <h3>Backend</h3>
    <ul>
      <li>Node.js, Express, Java, Spring, Spring Boot, Spring Batch</li>
      <li>APIs: REST, SOAP</li>
      <li>Testing: JUnit, Cucumber</li>
    </ul>
    <h3>Data & Cloud</h3>
    <ul>
      <li>SQL: MySQL, PostgreSQL, Oracle, DB2, Sybase</li>
      <li>NoSQL: MongoDB, Firestore</li>
      <li>AWS, GCP, Firebase, Docker, CI/CD (Jenkins, Maven, Gradle)</li>
    </ul>$$,
    2,
    true
  ),
  (
    'experience',
    'Professional Experience',
    $$<h3>Full Stack Developer | X2OMedia (Feb 2025 - Mar 2025)</h3>
    <ul>
      <li>Built a web-based video conferencing product for remote training and classrooms.</li>
      <li>Developed responsive React + TypeScript UI and Node.js backend services.</li>
      <li>Collaborated in a 10-person Agile/Scrum team.</li>
    </ul>
    <h3>Full Stack Developer | Notarius (Feb 2024 - Nov 2024)</h3>
    <ul>
      <li>Delivered ISO-compliant electronic signature workflows.</li>
      <li>Built Aurelia + React UI features and Java backend services.</li>
      <li>Integrated MongoDB storage and JUnit test coverage.</li>
    </ul>
    <h3>Full Stack Developer (Consultant) | Alten Canada (Sep 2019 - Sep 2023)</h3>
    <ul>
      <li>Société Générale: React UI, REST services, performance optimization.</li>
      <li>Cogeco: Angular frontend, Java/Node APIs, GCP serverless + Firebase auth.</li>
      <li>SSQ Assurance: Java services, Angular components, unit + E2E testing.</li>
      <li>Morgan Stanley: Java services, Angular UI, ETL pipelines, BDD tests.</li>
    </ul>
    <h3>Full Stack Developer (Consultant) | SOAT (Sep 2018 - Aug 2019)</h3>
    <ul>
      <li>Crédit du Nord: Java services, Angular UI, KYC workflows, digital signatures.</li>
    </ul>
    <h3>SI Consultant | Capgemini France (Mar 2013 - Aug 2018)</h3>
    <ul>
      <li>Delivered system integration across insurance, banking, energy, and tech.</li>
      <li>Built Java and Angular applications with role-based access.</li>
      <li>Maintained enterprise platforms and automated data workflows.</li>
    </ul>$$,
    3,
    true
  ),
  (
    'projects',
    'Key Projects',
    $$<h3>GameHub (2025 - Present)</h3>
    <ul>
      <li>Unified platform hosting 15+ interactive games and full-stack modules.</li>
      <li>Shared UI library with 55+ reusable components and optimized bundles.</li>
      <li>Tech: Next.js, React, TypeScript, NestJS, PostgreSQL, Prisma, Docker.</li>
    </ul>
    <h3>StoryForge (2024 - Present)</h3>
    <ul>
      <li>Gamified writing platform with world-building tools and habit loops.</li>
      <li>Tech: Next.js, React, TypeScript, Prisma, PostgreSQL.</li>
    </ul>
    <h3>QuestHunt (2024 - Present)</h3>
    <ul>
      <li>Mobile-first geocaching experience with social quests and live maps.</li>
      <li>Tech: Next.js, React, TypeScript, Supabase.</li>
    </ul>
    <h3>LibraKeeper (2024 - Present)</h3>
    <ul>
      <li>Personal library manager with lending workflows and PWA support.</li>
      <li>Tech: Next.js, React, TypeScript, Prisma, PostgreSQL.</li>
    </ul>
    <h3>Velvet Galaxy (2024 - Present)</h3>
    <ul>
      <li>Customizable social network with granular interaction controls.</li>
      <li>Tech: Next.js, React, TypeScript, Supabase.</li>
    </ul>$$,
    4,
    true
  ),
  (
    'education',
    'Education',
    $$<ul>
      <li>Computer Science Engineering Degree (Human-Machine Interaction) — ENSIM (2010 - 2013)</li>
      <li>Preparatory Classes — ISTDI (2008 - 2010)</li>
      <li>L1 Mathematics — Douala University (2007 - 2008)</li>
    </ul>$$,
    5,
    true
  ),
  (
    'languages',
    'Languages',
    $$<ul>
      <li>French: Native/Fluent</li>
      <li>English: Fluent</li>
    </ul>$$,
    6,
    true
  ),
  (
    'interests',
    'Interests',
    $$<ul>
      <li>Video games, cinema, animation, music, dance, writing, drums, singing</li>
    </ul>$$,
    7,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  content_html = excluded.content_html,
  sort_order = excluded.sort_order,
  visible = excluded.visible;
