require("dotenv").config();

const fs = require("fs");
const path = require("path");
const cloudinary = require("./config/cloudinary");

const imagesFolder = path.join(
  __dirname,
  "../frontend/src/assets/assets/frontend_assets"
);

const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

async function uploadImage(filePath, publicId) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "tomato-food-app/old-assets",
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
  });

  return result;
}

async function migrateAllAssets() {
  try {
    console.log("\n☁️ Starting remaining asset migration...\n");

    if (!fs.existsSync(imagesFolder)) {
      console.log("❌ Images folder not found:");
      console.log(imagesFolder);
      return;
    }

    const files = fs
      .readdirSync(imagesFolder)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();

        // Food images already migrated
        const isFoodImage = /^food_\d+\.(png|jpg|jpeg|webp)$/i.test(file);

        return allowedExtensions.includes(ext) && !isFoodImage;
      })
      .sort();

    console.log(`📸 Found ${files.length} remaining images.\n`);

    for (const file of files) {
      const filePath = path.join(imagesFolder, file);
      const publicId = path.parse(file).name;

      console.log(`⬆️ Uploading: ${file}`);

      try {
        const result = await uploadImage(filePath, publicId);

        console.log(`✅ ${file}`);
        console.log(`🔗 ${result.secure_url}`);
        console.log("");
      } catch (error) {
        console.log(`❌ Failed: ${file}`);
        console.log(error.message);
        console.log("");
      }
    }

    console.log("🎉 Remaining asset migration completed.");
  } catch (error) {
    console.error("❌ Migration error:", error);
  }
}

migrateAllAssets();