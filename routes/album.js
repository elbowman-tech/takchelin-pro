// ===================================================================================
//  FILE: /routes/album.js (동호회 앨범 라우터)
// ===================================================================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { isLoggedIn } = require('../middleware/authMiddleware');

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/album/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 앨범 목록
router.get('/', (req, res) => {
    const sql = "SELECT * FROM album ORDER BY createdAt DESC";
    db.all(sql, [], (err, photos) => {
        if (err) throw err;
        res.render('album/index', { title: '동호회 앨범', photos });
    });
});

// 사진/동영상 업로드
router.post('/upload', isLoggedIn, upload.single('mediaFile'), (req, res) => {
    const { caption } = req.body;
    const { id: uploader_id, nickname: uploader_nickname } = req.session.user;
    const filePath = req.file.filename;
    const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'video';

    const sql = `INSERT INTO album (caption, filePath, fileType, uploader_id, uploader_nickname)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [caption, filePath, fileType, uploader_id, uploader_nickname], (err) => {
        if (err) throw err;
        res.redirect('/album');
    });
});

// 사진/동영상 삭제
router.post('/delete/:id', isLoggedIn, (req, res) => {
    const fileId = req.params.id;
    const userId = req.session.user.id;
    const isAdmin = req.session.user.isAdmin;

    const sql = "SELECT * FROM album WHERE id = ?";
    db.get(sql, [fileId], (err, file) => {
        if (err) throw err;
        if (!file) return res.status(404).send('Not Found');

        if (isAdmin || file.uploader_id === userId) {
            const deleteSql = "DELETE FROM album WHERE id = ?";
            db.run(deleteSql, [fileId], (err) => {
                if (err) throw err;
                // TODO: 실제 파일도 삭제하는 로직 추가
                res.redirect('/album');
            });
        } else {
            res.status(403).send('삭제 권한이 없습니다.');
        }
    });
});

module.exports = router;