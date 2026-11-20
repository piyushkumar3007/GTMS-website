
const fs = require("fs");
const path = require("path");
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: "public_99r+krcWMmHPN8K0mv5uP89ucZ0=",
  privateKey: "private_DelEegUDCo5q8dk61CtL/ssyYH0=",
  urlEndpoint: "https://ik.imagekit.io/kgdfginfg"
});

const localFolder = "./gallery_new";
const files = fs.readdirSync(localFolder);

async function uploadAll() {
  // Load existing gallery.json or start with empty array
  let galleryPath = path.join(__dirname, 'gallery.json');
  let galleryData = [];
  try {
    if (fs.existsSync(galleryPath)) {
      const raw = fs.readFileSync(galleryPath, 'utf8');
      galleryData = raw ? JSON.parse(raw) : [];
    }
  } catch (e) {
    console.warn('Could not read gallery.json, starting fresh.');
  }
  const existingNames = new Set(galleryData.map(item => item.name));

  for (const file of files) {
    if (existingNames.has(file)) {
      console.log(`Skipping ${file} (already in gallery.json)`);
      continue;
    }
    const filePath = path.join(localFolder, file);
    const fileBuffer = fs.readFileSync(filePath);
    try {
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: file,
        folder: "/gallery_new"
      });
      console.log(`Uploaded: ${file} -> ${result.url}`);
      galleryData.push({ name: file, url: result.url });
      fs.writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2));
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err.message);
    }
  }
  console.log('All done! gallery.json updated.');
}

uploadAll();
