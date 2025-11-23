import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.aiCallLog.findMany({
        where: {
            task: 'scan',
            status: 'SUCCESS'
        },
        orderBy: { createdAt: 'desc' },
        take: 1
    });

    if (logs.length === 0) {
        console.log('No scan logs found');
        return;
    }

    const log = logs[0];
    console.log('=== AI Call Log ===');
    console.log('Task:', log.task);
    console.log('Provider:', log.provider);
    console.log('Model:', log.model);
    console.log('Status:', log.status);
    console.log('\n=== Response Parsed ===');
    console.log(JSON.stringify(log.responseParsed, null, 2));
    console.log('\n=== Raw Response (first 500 chars) ===');
    const raw = typeof log.responseRaw === 'string'
        ? log.responseRaw
        : JSON.stringify(log.responseRaw, null, 2);
    console.log(raw.substring(0, 500));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
