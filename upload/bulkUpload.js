import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import sharp from "sharp"; // ✅ For local compression before upload

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: "dpel4hjvj",
  api_key: "667838714267769",
  api_secret: "6gvqkqgC_BkBM2jLD9Uceai7W60",
});

// ✅ Local Folders
const localFolder = "./public/gallery";
const cloudFolder = "formula-bharat-gallery";
const uploadFolder = "./upload";

// ✅ Ensure upload folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

async function uploadImages() {
  const files = fs.readdirSync(localFolder).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
  });

  let galleryData = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(localFolder, file);
    console.log(`[${i + 1}/${files.length}] Processing: ${file}`);

    try {
      let stats = fs.statSync(filePath);
      let finalPath = filePath;

      // ✅ If file >10MB, compress locally before upload
      if (stats.size > 10 * 1024 * 1024) {
        console.log(`⚠️  File too large (${(stats.size / 1024 / 1024).toFixed(2)} MB). Compressing...`);

        const compressedPath = path.join(localFolder, `compressed_${file}`);
        await sharp(filePath)
          .resize({ width: 2000, height: 2000, fit: "inside" }) // ✅ Resize if needed
          .jpeg({ quality: 80 }) // ✅ Compress to ~2-5MB
          .toFile(compressedPath);

        finalPath = compressedPath;
      }

      // ✅ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(finalPath, {
        folder: cloudFolder,
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });

      galleryData.push({
        name: file,
        url: result.secure_url,
      });

      console.log(`✅ Uploaded: ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Error uploading ${file}:`, err.message);
    }
  }

  fs.writeFileSync(`${uploadFolder}/gallery.json`, JSON.stringify(galleryData, null, 2));
  console.log(`✅ All done! URLs saved in ${uploadFolder}/gallery.json`);
}

uploadImages();
