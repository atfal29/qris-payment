console.log(">> server.js aktif");

const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Setup upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Pastikan folder tersedia
fs.ensureDirSync('uploads');
fs.ensureFileSync('data/transaksi.json');
if (!fs.readFileSync('data/transaksi.json').toString().trim()) {
  fs.writeJsonSync('data/transaksi.json', []);
}

// Endpoint upload bukti
app.post('/upload', upload.single('bukti'), async (req, res) => {
  const { name } = req.body;
  const timestamp = new Date().toISOString();
  const buktiFile = req.file.filename;

  const data = { name, bukti: buktiFile, time: timestamp };

  try {
    const filePath = 'data/transaksi.json';
    const transaksi = await fs.readJson(filePath);
    transaksi.push(data);
    await fs.writeJson(filePath, transaksi, { spaces: 2 });

    // ✅ Kirim filename ke frontend agar gambar bisa ditampilkan
    res.json({
      success: true,
      message: "Bukti pembayaran berhasil dikirim!",
      filename: buktiFile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan data."
    });
  }
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});