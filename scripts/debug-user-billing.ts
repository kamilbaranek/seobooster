
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'baranek.kamil@gmail.com';
    console.log(`Checking data for user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            subscriptions: true,
            webs: true
        }
    });

    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log('User found:', user.id);
    console.log('Stripe Customer ID:', user.stripeCustomerId);

    console.log('--- Subscriptions ---');
    if (user.subscriptions.length === 0) {
        console.log('No subscriptions found.');
    } else {
        user.subscriptions.forEach(sub => {
            console.log(`ID: ${sub.id}, Plan: ${sub.planId}, Status: ${sub.status}, Start: ${sub.currentPeriodStart}, End: ${sub.currentPeriodEnd}`);
        });
    }

    console.log('--- Webs ---');
    if (user.webs.length === 0) {
        console.log('No webs found.');
    } else {
        user.webs.forEach(web => {
            console.log(`ID: ${web.id}, URL: ${web.url}, Status: ${web.status}`);
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
