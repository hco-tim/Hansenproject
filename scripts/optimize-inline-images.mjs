import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const contentPath = path.resolve(process.cwd(), process.env.CONTENT_FILE || "content.json");
const outputDirectory = path.resolve(process.cwd(), "public/uploads/site");
const raw = await fs.readFile(contentPath, "utf8");
const content = JSON.parse(raw);
const converted = [];

function safeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "cms-image";
}

async function transform(value, keyPath = []) {
  if (typeof value === "string") {
    const match = value.match(/^data:image\/(png|jpe?g|webp);base64,([a-z0-9+/=]+)$/i);
    if (!match) return value;

    const original = Buffer.from(match[2], "base64");
    if (original.length < 32) throw new Error(`Invalid embedded image at ${keyPath.join(".")}`);

    const webp = await sharp(original, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76, effort: 5 })
      .toBuffer();

    const hash = crypto.createHash("sha256").update(original).digest("hex").slice(0, 12);
    const filename = `${safeName(keyPath.join("-"))}-${hash}.webp`;
    await fs.mkdir(outputDirectory, { recursive: true });
    await fs.writeFile(path.join(outputDirectory, filename), webp);

    converted.push({
      field: keyPath.join("."),
      originalBytes: original.length,
      optimizedBytes: webp.length,
      file: `/uploads/site/${filename}`,
    });
    return `/uploads/site/${filename}`;
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item, index) => transform(item, [...keyPath, String(index)])));
  }

  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await transform(item, [...keyPath, key])])
    );
    return Object.fromEntries(entries);
  }

  return value;
}

const optimized = await transform(content);
if (converted.length === 0) {
  console.log("No embedded Base64 images found; content.json is already migrated.");
  process.exit(0);
}

await fs.writeFile(contentPath, JSON.stringify(optimized, null, 2) + "\n", "utf8");
const before = Buffer.byteLength(raw);
const after = Buffer.byteLength(JSON.stringify(optimized));
console.log(JSON.stringify({
  convertedImages: converted.length,
  originalContentBytes: before,
  newContentBytes: after,
  contentReductionPercent: Number(((1 - after / before) * 100).toFixed(1)),
  images: converted,
}, null, 2));
