import sharp from "sharp";

const sizes = [192, 512];

for (const size of sizes) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#7c3aed"/>
      <text x="50%" y="54%" font-family="Arial, sans-serif" font-size="${size * 0.45}" font-weight="bold"
        fill="white" text-anchor="middle" dominant-baseline="middle">V</text>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(`public/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}
