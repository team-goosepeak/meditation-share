/**
 * 성경 API 테스트 예시
 * 
 * 이 파일은 성경 조회 API의 사용 예시를 보여줍니다.
 * 실제 프로젝트에서는 이 코드를 참고하여 구현하세요.
 */

import { 
  searchBible, 
  getBibleVerses, 
  parseBibleReference,
  formatBibleReference,
  formatBibleText,
  getAllBookNames,
  searchBookNames
} from '@/lib/api/bible'

// ============================================
// 예시 1: 문자열로 검색
// ============================================
async function example1() {
  console.log('=== 예시 1: 문자열로 검색 ===\n')
  
  const queries = [
    '요한복음 3:16',
    '창세기 1:1-3',
    '시편 23:1',
    '요 14:6',      // 약어 사용
    '창 1:1',       // 약어 + 단일 구절
  ]
  
  for (const query of queries) {
    const result = await searchBible(query)
    
    if (result) {
      console.log(`✅ 검색: "${query}"`)
      console.log(`   → ${formatBibleReference(result)}`)
      console.log(`   → "${formatBibleText(result).substring(0, 50)}..."`)
      console.log()
    } else {
      console.log(`❌ 검색 실패: "${query}"\n`)
    }
  }
}

// ============================================
// 예시 2: 직접 조회
// ============================================
async function example2() {
  console.log('=== 예시 2: 직접 조회 ===\n')
  
  const result = await getBibleVerses('요한복음', 3, 16, 17)
  
  console.log(`책: ${result.book}`)
  console.log(`장: ${result.chapter}`)
  console.log(`구절 범위: ${result.verseFrom}-${result.verseTo}`)
  console.log('\n구절 내용:')
  
  result.verses.forEach(verse => {
    console.log(`  ${verse.verse}. ${verse.text}`)
  })
  console.log()
}

// ============================================
// 예시 3: 검색어 파싱
// ============================================
function example3() {
  console.log('=== 예시 3: 검색어 파싱 ===\n')
  
  const queries = [
    '요한복음 3:16',
    '요 3:16-18',
    '창세기 1:1',
    '잘못된 형식',
  ]
  
  queries.forEach(query => {
    const parsed = parseBibleReference(query)
    
    if (parsed) {
      console.log(`✅ "${query}"`)
      console.log(`   → 책: ${parsed.book}`)
      console.log(`   → 장: ${parsed.chapter}`)
      console.log(`   → 절: ${parsed.verseFrom}${parsed.verseTo ? `-${parsed.verseTo}` : ''}`)
    } else {
      console.log(`❌ 파싱 실패: "${query}"`)
    }
    console.log()
  })
}

// ============================================
// 예시 4: 자동완성
// ============================================
function example4() {
  console.log('=== 예시 4: 자동완성 ===\n')
  
  const queries = ['요', '창', '시', '로마']
  
  queries.forEach(query => {
    const matches = searchBookNames(query)
    console.log(`검색어: "${query}"`)
    console.log(`결과: ${matches.slice(0, 5).join(', ')}`)
    console.log()
  })
}

// ============================================
// 예시 5: 전체 책 목록
// ============================================
function example5() {
  console.log('=== 예시 5: 전체 책 목록 ===\n')
  
  const books = getAllBookNames()
  console.log(`총 ${books.length}권`)
  console.log('\n구약 (처음 5권):')
  console.log(books.slice(0, 5).join(', '))
  console.log('\n신약 (처음 5권):')
  console.log(books.slice(39, 44).join(', '))
  console.log()
}

// ============================================
// 예시 6: 포스트 작성 시나리오
// ============================================
async function example6() {
  console.log('=== 예시 6: 포스트 작성 시나리오 ===\n')
  
  // 사용자가 "요한복음 3:16-17" 입력
  const userInput = '요한복음 3:16-17'
  console.log(`사용자 입력: "${userInput}"\n`)
  
  // 검색
  const reference = await searchBible(userInput)
  
  if (reference) {
    // 포스트에 저장할 데이터 생성
    const scriptureData = {
      book: reference.book,
      chapter: reference.chapter,
      verseFrom: reference.verseFrom,
      verseTo: reference.verseTo,
      text: formatBibleText(reference),
    }
    
    console.log('저장할 데이터:')
    console.log(JSON.stringify(scriptureData, null, 2))
    console.log()
    
    // 화면에 표시할 내용
    console.log('화면 표시:')
    console.log(`제목: 📖 ${formatBibleReference(reference)}`)
    console.log(`내용: "${scriptureData.text}"`)
  }
  console.log()
}

// ============================================
// 메인 실행
// ============================================
export async function runTests() {
  try {
    await example1()
    await example2()
    example3()
    example4()
    example5()
    await example6()
    
    console.log('✨ 모든 테스트 완료!')
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

// 직접 실행 시
if (require.main === module) {
  runTests()
}

