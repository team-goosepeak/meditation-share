/**
 * 성경 구절 조회 API
 * KorRV (개역한글판) JSON 파일 기반
 */

// 한글-영어 성경책 이름 매핑
export const BIBLE_BOOKS = {
  // 구약 (1-39)
  '창세기': { english: 'Genesis', id: 1 },
  '출애굽기': { english: 'Exodus', id: 2 },
  '레위기': { english: 'Leviticus', id: 3 },
  '민수기': { english: 'Numbers', id: 4 },
  '신명기': { english: 'Deuteronomy', id: 5 },
  '여호수아': { english: 'Joshua', id: 6 },
  '사사기': { english: 'Judges', id: 7 },
  '룻기': { english: 'Ruth', id: 8 },
  '사무엘상': { english: 'I Samuel', id: 9 },
  '사무엘하': { english: 'II Samuel', id: 10 },
  '열왕기상': { english: 'I Kings', id: 11 },
  '열왕기하': { english: 'II Kings', id: 12 },
  '역대상': { english: 'I Chronicles', id: 13 },
  '역대하': { english: 'II Chronicles', id: 14 },
  '에스라': { english: 'Ezra', id: 15 },
  '느헤미야': { english: 'Nehemiah', id: 16 },
  '에스더': { english: 'Esther', id: 17 },
  '욥기': { english: 'Job', id: 18 },
  '시편': { english: 'Psalms', id: 19 },
  '잠언': { english: 'Proverbs', id: 20 },
  '전도서': { english: 'Ecclesiastes', id: 21 },
  '아가': { english: 'Song of Solomon', id: 22 },
  '이사야': { english: 'Isaiah', id: 23 },
  '예레미야': { english: 'Jeremiah', id: 24 },
  '예레미야애가': { english: 'Lamentations', id: 25 },
  '에스겔': { english: 'Ezekiel', id: 26 },
  '다니엘': { english: 'Daniel', id: 27 },
  '호세아': { english: 'Hosea', id: 28 },
  '요엘': { english: 'Joel', id: 29 },
  '아모스': { english: 'Amos', id: 30 },
  '오바댜': { english: 'Obadiah', id: 31 },
  '요나': { english: 'Jonah', id: 32 },
  '미가': { english: 'Micah', id: 33 },
  '나훔': { english: 'Nahum', id: 34 },
  '하박국': { english: 'Habakkuk', id: 35 },
  '스바냐': { english: 'Zephaniah', id: 36 },
  '학개': { english: 'Haggai', id: 37 },
  '스가랴': { english: 'Zechariah', id: 38 },
  '말라기': { english: 'Malachi', id: 39 },
  
  // 신약 (40-66)
  '마태복음': { english: 'Matthew', id: 40 },
  '마가복음': { english: 'Mark', id: 41 },
  '누가복음': { english: 'Luke', id: 42 },
  '요한복음': { english: 'John', id: 43 },
  '사도행전': { english: 'Acts', id: 44 },
  '로마서': { english: 'Romans', id: 45 },
  '고린도전서': { english: 'I Corinthians', id: 46 },
  '고린도후서': { english: 'II Corinthians', id: 47 },
  '갈라디아서': { english: 'Galatians', id: 48 },
  '에베소서': { english: 'Ephesians', id: 49 },
  '빌립보서': { english: 'Philippians', id: 50 },
  '골로새서': { english: 'Colossians', id: 51 },
  '데살로니가전서': { english: 'I Thessalonians', id: 52 },
  '데살로니가후서': { english: 'II Thessalonians', id: 53 },
  '디모데전서': { english: 'I Timothy', id: 54 },
  '디모데후서': { english: 'II Timothy', id: 55 },
  '디도서': { english: 'Titus', id: 56 },
  '빌레몬서': { english: 'Philemon', id: 57 },
  '히브리서': { english: 'Hebrews', id: 58 },
  '야고보서': { english: 'James', id: 59 },
  '베드로전서': { english: 'I Peter', id: 60 },
  '베드로후서': { english: 'II Peter', id: 61 },
  '요한일서': { english: 'I John', id: 62 },
  '요한이서': { english: 'II John', id: 63 },
  '요한삼서': { english: 'III John', id: 64 },
  '유다서': { english: 'Jude', id: 65 },
  '요한계시록': { english: 'Revelation of John', id: 66 },
} as const;

// 약어 매핑 (검색 편의성)
export const BIBLE_BOOK_ALIASES = {
  '창': '창세기',
  '출': '출애굽기',
  '레': '레위기',
  '민': '민수기',
  '신': '신명기',
  '수': '여호수아',
  '삿': '사사기',
  '룻': '룻기',
  '삼상': '사무엘상',
  '삼하': '사무엘하',
  '왕상': '열왕기상',
  '왕하': '열왕기하',
  '대상': '역대상',
  '대하': '역대하',
  '스': '에스라',
  '느': '느헤미야',
  '에': '에스더',
  '욥': '욥기',
  '시': '시편',
  '잠': '잠언',
  '전': '전도서',
  '아': '아가',
  '사': '이사야',
  '렘': '예레미야',
  '애': '예레미야애가',
  '겔': '에스겔',
  '단': '다니엘',
  '호': '호세아',
  '욜': '요엘',
  '암': '아모스',
  '옵': '오바댜',
  '욘': '요나',
  '미': '미가',
  '나': '나훔',
  '합': '하박국',
  '습': '스바냐',
  '학': '학개',
  '슥': '스가랴',
  '말': '말라기',
  '마': '마태복음',
  '막': '마가복음',
  '눅': '누가복음',
  '요': '요한복음',
  '행': '사도행전',
  '롬': '로마서',
  '고전': '고린도전서',
  '고후': '고린도후서',
  '갈': '갈라디아서',
  '엡': '에베소서',
  '빌': '빌립보서',
  '골': '골로새서',
  '살전': '데살로니가전서',
  '살후': '데살로니가후서',
  '딤전': '디모데전서',
  '딤후': '디모데후서',
  '딛': '디도서',
  '몬': '빌레몬서',
  '히': '히브리서',
  '약': '야고보서',
  '벧전': '베드로전서',
  '벧후': '베드로후서',
  '요일': '요한일서',
  '요이': '요한이서',
  '요삼': '요한삼서',
  '유': '유다서',
  '계': '요한계시록',
} as const;

export type BibleBookName = keyof typeof BIBLE_BOOKS;

export interface BibleVerse {
  verse: number;
  chapter: number;
  name: string;
  text: string;
}

export interface BibleReference {
  book: BibleBookName;
  bookEnglish: string;
  chapter: number;
  verseFrom: number;
  verseTo?: number;
  verses: BibleVerse[];
}

/**
 * 성경 구절 검색 문자열 파싱
 * 예: "요한복음 3:16", "창세기 1:1-3", "시편 23:1"
 */
export function parseBibleReference(query: string): {
  book: BibleBookName;
  chapter: number;
  verseFrom: number;
  verseTo?: number;
} | null {
  // 패턴: "책이름 장:절" 또는 "책이름 장:절-절"
  const pattern = /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const match = query.trim().match(pattern);
  
  if (!match) {
    return null;
  }
  
  let bookName = match[1].trim();
  const chapter = parseInt(match[2]);
  const verseFrom = parseInt(match[3]);
  const verseTo = match[4] ? parseInt(match[4]) : undefined;
  
  // 약어 변환
  if (bookName in BIBLE_BOOK_ALIASES) {
    bookName = BIBLE_BOOK_ALIASES[bookName as keyof typeof BIBLE_BOOK_ALIASES];
  }
  
  // 책 이름 유효성 검사
  if (!(bookName in BIBLE_BOOKS)) {
    return null;
  }
  
  return {
    book: bookName as BibleBookName,
    chapter,
    verseFrom,
    verseTo,
  };
}

/**
 * 성경 책 전체 데이터 로드 (캐싱)
 */
const bookCache = new Map<string, any>();

async function loadBook(bookName: BibleBookName): Promise<any> {
  const bookInfo = BIBLE_BOOKS[bookName];
  const fileName = `${String(bookInfo.id).padStart(2, '0')}_${bookInfo.english}.json`;
  
  // 캐시 확인
  if (bookCache.has(fileName)) {
    return bookCache.get(fileName);
  }
  
  try {
    // 서버 환경에서 파일 읽기
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'supabase', 'bible', 'KorRV', 'books', fileName);
      const data = await fs.readFile(filePath, 'utf8');
      const book = JSON.parse(data);
      bookCache.set(fileName, book);
      return book;
    }
    
    // 클라이언트 환경에서 fetch
    const response = await fetch(`/api/bible/books/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load book: ${fileName}`);
    }
    const book = await response.json();
    bookCache.set(fileName, book);
    return book;
  } catch (error) {
    console.error(`Error loading book ${bookName}:`, error);
    throw new Error(`성경책을 불러올 수 없습니다: ${bookName}`);
  }
}

/**
 * 성경 구절 조회
 */
export async function getBibleVerses(
  bookName: BibleBookName,
  chapter: number,
  verseFrom: number,
  verseTo?: number
): Promise<BibleReference> {
  const book = await loadBook(bookName);
  const bookInfo = BIBLE_BOOKS[bookName];
  
  // 해당 장 찾기
  const chapterData = book.chapters.find((ch: any) => ch.chapter === chapter);
  
  if (!chapterData) {
    throw new Error(`${bookName} ${chapter}장을 찾을 수 없습니다.`);
  }
  
  // 구절 범위 설정
  const endVerse = verseTo || verseFrom;
  
  // 해당 구절들 필터링
  const verses = chapterData.verses.filter(
    (v: BibleVerse) => v.verse >= verseFrom && v.verse <= endVerse
  );
  
  if (verses.length === 0) {
    throw new Error(`${bookName} ${chapter}:${verseFrom}${verseTo ? `-${verseTo}` : ''} 구절을 찾을 수 없습니다.`);
  }
  
  return {
    book: bookName,
    bookEnglish: bookInfo.english,
    chapter,
    verseFrom,
    verseTo: verseTo || verseFrom,
    verses,
  };
}

/**
 * 문자열로 성경 구절 검색
 * 예: searchBible("요한복음 3:16")
 */
export async function searchBible(query: string): Promise<BibleReference | null> {
  const parsed = parseBibleReference(query);
  
  if (!parsed) {
    return null;
  }
  
  try {
    return await getBibleVerses(
      parsed.book,
      parsed.chapter,
      parsed.verseFrom,
      parsed.verseTo
    );
  } catch (error) {
    console.error('Bible search error:', error);
    return null;
  }
}

/**
 * 성경 구절 포맷팅 (표시용)
 */
export function formatBibleReference(ref: BibleReference): string {
  const verseRange = ref.verseTo && ref.verseTo !== ref.verseFrom
    ? `${ref.verseFrom}-${ref.verseTo}`
    : `${ref.verseFrom}`;
  
  return `${ref.book} ${ref.chapter}:${verseRange}`;
}

/**
 * 성경 구절 텍스트 결합
 */
export function formatBibleText(ref: BibleReference): string {
  return ref.verses.map(v => v.text.trim()).join(' ');
}

/**
 * 책 목록 가져오기 (자동완성용)
 */
export function getAllBookNames(): BibleBookName[] {
  return Object.keys(BIBLE_BOOKS) as BibleBookName[];
}

/**
 * 책 목록 검색 (자동완성용)
 */
export function searchBookNames(query: string): BibleBookName[] {
  const lowerQuery = query.toLowerCase();
  return getAllBookNames().filter(book => 
    book.includes(query) || 
    BIBLE_BOOKS[book].english.toLowerCase().includes(lowerQuery)
  );
}

