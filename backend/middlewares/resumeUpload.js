import multer from "multer";

const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error("Upload a PDF or DOCX resume"));
    }
    return callback(null, true);
  },
});

const resumeUpload = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Resume file must be 5 MB or smaller" });
    }
    return res.status(400).json({ message: error.message || "Invalid resume upload" });
  });
};

export default resumeUpload;
