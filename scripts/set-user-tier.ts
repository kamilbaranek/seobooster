import { PrismaClient, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'kamil.baranek@me.com';
    const targetPlanId = 'tier2';

    console.log(`Looking for user ${email}...`);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error('User not found!');
        process.exit(1);
    }

    console.log(`Found user ${user.id}. Setting plan to ${targetPlanId}...`);

    // Check if user already has a subscription
    const existingSub = await prisma.subscription.findFirst({
        where: { userId: user.id }
    });

    if (existingSub) {
        await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
                planId: targetPlanId,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });
        console.log(`Updated existing subscription ${existingSub.id} to ${targetPlanId}.`);
    } else {
        const stripeSubscriptionId = `manual_${Date.now()}`;
        await prisma.subscription.create({
            data: {
                userId: user.id,
                stripeSubscriptionId,
                planId: targetPlanId,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        console.log(`Created new subscription with plan ${targetPlanId}.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
