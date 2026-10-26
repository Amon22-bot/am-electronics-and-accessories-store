const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sourceUri = process.env.MONGO_URI;
const destinationUri = process.env.DESTINATION_MONGO_URI;

if (!sourceUri) {
    console.error('Source MONGO_URI is missing from server/.env.');
    process.exit(1);
}

if (!destinationUri) {
    console.error('Set DESTINATION_MONGO_URI to the hosted MongoDB connection string first.');
    process.exit(1);
}

// High-quality live placeholder image mappings
const placeholders = {
    phone: "https://unsplash.com",
    watch: "https://unsplash.com",
    speaker: "https://unsplash.com",
    headphone: "https://unsplash.com",
    tablet: "https://unsplash.com",
    generic: "https://unsplash.com"
};

async function copyDemoProducts() {
    const sourceClient = new MongoClient(sourceUri);
    const destinationClient = new MongoClient(destinationUri);

    try {
        await Promise.all([sourceClient.connect(), destinationClient.connect()]);

        const sourceProducts = sourceClient.db().collection('products');
        const destinationProducts = destinationClient.db().collection('products');
        const demoProducts = await sourceProducts.find({ isDemo: true }).toArray();

        if (demoProducts.length === 0) {
            console.log('No demo products found. Nothing was changed.');
            return;
        }

        // Intercept each product and fix the image string path before it gets uploaded
        const operations = demoProducts.map(product => {
            let selectedUrl = placeholders.generic;
            const productNameLower = (product.name || "").toLowerCase();

            if (productNameLower.includes('phone') || productNameLower.includes('cover')) {
                selectedUrl = placeholders.phone;
            } else if (productNameLower.includes('watch') || productNameLower.includes('smartwatch')) {
                selectedUrl = placeholders.watch;
            } else if (productNameLower.includes('speaker') || productNameLower.includes('bluetooth')) {
                selectedUrl = placeholders.speaker;
            } else if (productNameLower.includes('headphone') || productNameLower.includes('earbud')) {
                selectedUrl = placeholders.headphone;
            } else if (productNameLower.includes('tablet') || productNameLower.includes('kids')) {
                selectedUrl = placeholders.tablet;
            }

            // Swap out the broken string with the live CDN link
            product.image = selectedUrl;

            return {
                replaceOne: {
                    filter: { _id: product._id },
                    replacement: product,
                    upsert: true
                }
            };
        });

        const result = await destinationProducts.bulkWrite(operations, { ordered: false });
        console.log(`Copied ${demoProducts.length} demo products to the hosted database with live image URLs!`);
        console.log(`Inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`);
    } catch (error) {
        console.error('Demo product transfer failed:', error.message);
        process.exitCode = 1;
    } finally {
        await Promise.allSettled([sourceClient.close(), destinationClient.close()]);
    }
}

copyDemoProducts();

