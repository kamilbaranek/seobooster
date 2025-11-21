import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting image generation limits...');
    const result = await prisma.subscription.updateMany({
        data: {
            imageGenerationLimit: 3,
        },
    });
    console.log(`Updated ${result.count} subscriptions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
