"use strict";

const fs = require("fs");
const path = require("path");

const staticFiles = [
    "About.css",
    "About.html",
    "Admin.html",
    "Cart.css",
    "Cart.html",
    "Cart.js",
    "Checkout.css",
    "Checkout.html",
    "Checkout.js",
    "Contact.css",
    "Contact.html",
    "Index.css",
    "Index.html",
    "Index.js",
    "Product-details.css",
    "Product-details.html",
    "Product-details.js",
    "Shop.html",
    "shop.css",
    "shop.js",
    "global-search.js",
    "homepageProducts.js",
    "loadProducts.js",
    "products.js",
    "demo-product-cards.js"
];

const outputDirectory = path.join(process.cwd(), "dist");
const apiBaseUrl = process.env.API_BASE_URL;

if (!apiBaseUrl) {
    throw new Error("API_BASE_URL is required to build the deployed frontend.");
}

let normalizedApiBaseUrl;
try {
    const parsedUrl = new URL(apiBaseUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("The API URL must use http or https.");
    }
    normalizedApiBaseUrl = parsedUrl.toString().replace(/\/+$/, "");
} catch (error) {
    throw new Error(`API_BASE_URL is invalid: ${error.message}`);
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const fileName of staticFiles) {
    fs.copyFileSync(fileName, path.join(outputDirectory, fileName));
}

fs.copyFileSync("Index.html", path.join(outputDirectory, "index.html"));
fs.cpSync("images.html", path.join(outputDirectory, "images.html"), { recursive: true });

const apiConfigPath = "api-config.js";
const localApiUrl = "http://localhost:5000";
const apiConfig = fs.readFileSync(apiConfigPath, "utf8");
const deployedApiConfig = apiConfig.replace(
    JSON.stringify(localApiUrl),
    JSON.stringify(normalizedApiBaseUrl)
);

if (deployedApiConfig === apiConfig) {
    throw new Error("Could not inject API_BASE_URL into api-config.js.");
}

fs.writeFileSync(
    path.join(outputDirectory, apiConfigPath),
    deployedApiConfig
);
