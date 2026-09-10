const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
const eventsDir = path.join(uploadDir, 'events');
const galleryDir = path.join(uploadDir, 'gallery');
const heroDir = path.join(uploadDir, 'hero');

[uploadDir, eventsDir, galleryDir, heroDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Route files to correct subdirectories
    if (file.fieldname === 'image' || file.fieldname === 'main') {
      cb(null, eventsDir);
    } else if (file.fieldname === 'gallery' || file.fieldname === 'gallery[]') {
      cb(null, galleryDir);
    } else if (file.fieldname === 'hero' || file.fieldname === 'hero[]') {
      cb(null, heroDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log(`📎 Saving file: ${filename} in ${file.fieldname} folder`);
    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: fileFilter
});

module.exports = upload;
