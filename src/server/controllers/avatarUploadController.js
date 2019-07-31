const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}` + path.extname(file.originalname));
  }
});

const upload = multer({ storage }).single('avatar');

exports.postNewAvatar = (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(404).send({ status: 0, ...err });
    }
    return res.send({ status: 1, msg: 'New image uploaded', filename: req.file.filename });
  });
};

exports.deleteAvatar = (req, res) => {
  try {
    fs.unlinkSync('public/uploads/' + req.params.filename);
  } catch (err) {
    return res.status(404).send({ status: 0, ...err });
  }
  return res.send({ status: 1, msg: 'Image deleted' });
};
