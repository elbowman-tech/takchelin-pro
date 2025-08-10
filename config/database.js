// ===================================================================================
//  FILE: /config/database.js
//  역할: 데이터베이스 연결 및 테이블 스키마를 정의합니다.
// ===================================================================================
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./takchelin_pro.db', (err) => {
    if (err) return console.error(err.message);
    console.log('데이터베이스에 성공적으로 연결되었습니다.');
});

// *** 오류 해결: 데이터베이스 연결 시 외래 키 제약 조건 활성화 ***
db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
        console.error("외래 키 활성화 실패:", err.message);
    } else {
        console.log("외래 키 제약 조건이 성공적으로 활성화되었습니다.");
    }
});
// **********************************************************

const dbSchema = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level TEXT,
    intro TEXT,
    isApproved INTEGER DEFAULT 0,
    isAdmin INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level TEXT,
    profile_pic TEXT,
    intro TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    filePath TEXT,
    fileType TEXT,
    author_id INTEGER,
    author_nickname TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_date TEXT NOT NULL,
    event_time TEXT,
    title TEXT NOT NULL,
    location TEXT,
    author_id INTEGER,
    author_nickname TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS album (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caption TEXT,
    filePath TEXT NOT NULL,
    fileType TEXT NOT NULL,
    uploader_id INTEGER,
    uploader_nickname TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    author_id INTEGER,
    author_nickname TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
);
`;

db.exec(dbSchema, (err) => {
    if (err) {
        console.error("테이블 생성 오류:", err.message);
    } else {
        console.log("테이블이 성공적으로 준비되었습니다.");
    }
});

module.exports = db;