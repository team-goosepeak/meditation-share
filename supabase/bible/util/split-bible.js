/**
 * 성경 JSON 파일을 책별로 분할하는 스크립트
 * 
 * 실행 방법:
 * cd supabase/bible/util
 * node split-bible.js
 */

const fs = require('fs');
const path = require('path');

console.log('📖 성경 JSON 분할 시작...\n');

// KorRV.json 읽기
const bibleData = JSON.parse(fs.readFileSync(path.join(__dirname, '../raw/KorRV.json'), 'utf8'));

// books 디렉토리 생성
const booksDir = path.join(__dirname, '../KorRV/books');
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// 각 책별로 파일 생성
bibleData.books.forEach((book, index) => {
  const bookNumber = String(index + 1).padStart(2, '0');
  const fileName = `${bookNumber}_${book.name}.json`;
  const filePath = path.join(booksDir, fileName);
  
  // 책 데이터 저장
  fs.writeFileSync(filePath, JSON.stringify(book, null, 2));
  
  console.log(`✅ ${fileName} (${book.chapters.length}장)`);
});

// 책 목록 인덱스 파일 생성
const booksIndex = bibleData.books.map((book, index) => ({
  id: index + 1,
  name: book.name,
  fileName: `${String(index + 1).padStart(2, '0')}_${book.name}.json`,
  chapters: book.chapters.length
}));

fs.writeFileSync(
  path.join(booksDir, 'index.json'),
  JSON.stringify({ books: booksIndex }, null, 2)
);

console.log(`\n✨ 완료! 총 ${bibleData.books.length}권의 책을 분할했습니다.`);
console.log(`📁 위치: ${booksDir}`);

