import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import { DEFAULT_PROMPTS, AI_TASKS } from '@seobooster/ai-prompts';

const projectRoot = resolve(__dirname, '..');
['.env', '.env.local'].forEach((file, index) => {
  const fullPath = resolve(projectRoot, file);
  if (existsSync(fullPath)) {
    loadEnv({ path: fullPath, override: index > 0 });
  }
});

const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;

if (!email || !password) {
  // eslint-disable-next-line no-console
  console.error('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in your environment.');
  process.exit(1);
}

const prisma = new PrismaClient();

const seedSuperadmin = async () => {
  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: UserRole.SUPERADMIN
      }
    });
    // eslint-disable-next-line no-console
    console.log(`Updated existing user ${email} to SUPERADMIN role.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.SUPERADMIN
      }
    });
    // eslint-disable-next-line no-console
    console.log(`Created new SUPERADMIN user ${email}.`);
  }
};

const seedPromptDefaults = async () => {
  for (const task of AI_TASKS) {
    const existing = await prisma.aiPromptConfig.findUnique({ where: { task } });
    if (existing) {
      continue;
    }
    const defaults = DEFAULT_PROMPTS[task];
    await prisma.aiPromptConfig.create({
      data: {
        task,
        systemPrompt: defaults.systemPrompt,
        userPrompt: defaults.userPrompt
      }
    });
    // eslint-disable-next-line no-console
    console.log(`Seeded default prompts for task ${task}.`);
  }
};

seedSuperadmin()
  .then(seedPromptDefaults)
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
