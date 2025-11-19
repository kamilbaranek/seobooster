
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env vars
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
    const oldBase = 'http://localhost:3333';
    const newBase = process.env.ASSET_PUBLIC_BASE_URL;

    if (!newBase || newBase.includes('localhost')) {
        console.error('Error: ASSET_PUBLIC_BASE_URL is not set to a production URL in your environment.');
        console.error('Current value:', newBase);
        console.error('Please set it in .env or .env.local before running this script.');
        process.exit(1);
    }

    console.log(`Replacing "${oldBase}" with "${newBase}" in database...`);

    // Fix Article.featuredImageUrl
    const articles = await prisma.article.findMany({
        where: {
            featuredImageUrl: {
                startsWith: oldBase
            }
        }
    });

    console.log(`Found ${articles.length} articles with localhost images.`);

    for (const article of articles) {
        if (!article.featuredImageUrl) continue;
        const newUrl = article.featuredImageUrl.replace(oldBase, newBase);
        await prisma.article.update({
            where: { id: article.id },
            data: { featuredImageUrl: newUrl }
        });
        console.log(`Updated article ${article.id}: ${newUrl}`);
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
