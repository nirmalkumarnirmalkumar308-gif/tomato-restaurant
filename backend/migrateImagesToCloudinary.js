require("dotenv").config();

const fs = require("fs");
const path = require("path");
const cloudinary = require("./config/cloudinary");

const imagesFolder = path.join(
  __dirname,
  "../frontend/src/assets/assets/frontend_assets"
);

async function uploadImage(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "tomato-food-app/old-food-images",
      public_id: publicId,
      resource_type: "image",
      overwrite: true,
    });

    return result;
  } catch (error) {
    throw error;
  }
}

async function migrateFoodImages() {
  try {
    console.log("\n☁️ Starting FOOD image migration...\n");

    if (!fs.existsSync(imagesFolder)) {
      console.log("❌ Images folder not found:");
      console.log(imagesFolder);
      return;
    }

    const files = fs
      .readdirSync(imagesFolder)
      .filter((file) => /^food_\d+\.(png|jpg|jpeg|webp)$/i.test(file))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });

    console.log(`📸 Found ${files.length} food images.\n`);

    for (const file of files) {
      const filePath = path.join(imagesFolder, file);

      const publicId = path.parse(file).name;

      console.log(`⬆️ Uploading: ${file}`);

      try {
        const result = await uploadImage(
          filePath,
          publicId
        );

        console.log(`✅ ${file}`);
        console.log(`🔗 ${result.secure_url}`);
        console.log("");
      } catch (error) {
        console.log(`❌ Failed: ${file}`);
        console.log(error.message);
        console.log("");
      }
    }

    console.log("🎉 FOOD image migration completed.");
  } catch (error) {
    console.error("❌ Migration error:", error);
  }
}

migrateFoodImages();

