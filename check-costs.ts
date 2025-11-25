
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const costs = await prisma.aiCost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    console.log('Recent AiCosts:', JSON.stringify(costs, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
