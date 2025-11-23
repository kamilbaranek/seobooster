import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const projectRoot = process.cwd();
['.env', '.env.local'].forEach((envFile, index) => {
    const fullPath = resolve(projectRoot, envFile);
    if (existsSync(fullPath)) {
        loadEnv({ path: fullPath, override: index > 0 });
    }
});

import { PrismaClient, Prisma } from '@prisma/client';
import { buildAiProviderFromEnv } from '@seobooster/ai-providers';
import { BusinessProfile, ScanResult } from '@seobooster/ai-types';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting backfill of WebProducts...');

    const analyses = await prisma.webAnalysis.findMany({
        where: {
            scanResult: { not: Prisma.DbNull }
        },
        include: {
            web: true
        }
    });

    console.log(`Found ${analyses.length} analyses to process.`);

    const { provider } = buildAiProviderFromEnv({});

    for (const analysis of analyses) {
        console.log(`Processing web: ${analysis.web.url} (${analysis.webId})`);

        const existingProducts = await prisma.webProduct.count({
            where: { webId: analysis.webId }
        });

        if (existingProducts > 0) {
            console.log('  Products already exist. Skipping.');
            continue;
        }

        const scanResult = analysis.scanResult as unknown as ScanResult;
        if (!scanResult) {
            console.log('  No scan result. Skipping.');
            continue;
        }

        // Construct prompt
        const prompt = `
Scan Result: ${JSON.stringify(scanResult).slice(0, 15000)}

Extract the main products or services offered by this business.
Return a JSON object with a single key "main_products_or_services" which is an array of objects.
Each object must have:
- name: string
- url: string (optional, full URL if found)
- price: string (optional, if found)

Example:
{
  "main_products_or_services": [
    { "name": "SEO Audit", "url": "https://example.com/audit", "price": "$500" }
  ]
}
`;

        try {
            const result = await provider.chat([
                { role: 'system', content: 'You are a helpful assistant that extracts structured data from website scans. Return only JSON.' },
                { role: 'user', content: prompt }
            ], {
                responseFormat: 'json_object'
            });

            const content = result.content;
            // Parse JSON
            let data: any;
            try {
                const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
                data = JSON.parse(clean);
            } catch (e) {
                console.error('  Failed to parse JSON:', content);
                continue;
            }

            const products = data.main_products_or_services;
            if (Array.isArray(products)) {
                console.log(`  Found ${products.length} products.`);
                for (const p of products) {
                    if (p.name) {
                        await prisma.webProduct.create({
                            data: {
                                webId: analysis.webId,
                                name: p.name,
                                url: p.url,
                                price: p.price,
                                source: 'backfill_script'
                            }
                        });
                    }
                }

                // Update businessProfile
                if (analysis.businessProfile && typeof analysis.businessProfile === 'object') {
                    const profile = analysis.businessProfile as unknown as BusinessProfile;
                    profile.main_products_or_services = products;
                    await prisma.webAnalysis.update({
                        where: { id: analysis.id },
                        data: { businessProfile: profile as any }
                    });
                    console.log('  Updated businessProfile.');
                }
            } else {
                console.log('  No products array found in response.');
            }

        } catch (error) {
            console.error('  Error processing:', error);
        }
    }

    console.log('Backfill complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
