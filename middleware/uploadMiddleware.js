import multer from "multer";
import path from "path";

// ✅ Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // folder where files will be saved
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  },
});

// ✅ File filter to allow only images
function checkFileType(file, cb) {
  const allowedTypes = /jpg|jpeg|png/;
  const extMatches = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeMatches = allowedTypes.test(file.mimetype);

  if (extMatches && mimeMatches) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG images are allowed"));
  }
}

// ✅ Multer upload instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

export default upload;
