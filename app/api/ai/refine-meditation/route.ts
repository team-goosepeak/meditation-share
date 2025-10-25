import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { notes, scriptures, previousVersion } = await request.json()

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json(
        { error: '메모 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 성경 구절 정보 포맷팅
    let scriptureContext = ''
    if (scriptures && scriptures.length > 0) {
      scriptureContext = '\n\n관련 성경 구절:\n'
      scriptures.forEach((scripture: any) => {
        scriptureContext += `- ${scripture.book} ${scripture.chapter}:${scripture.verseFrom}`
        if (scripture.verseTo) {
          scriptureContext += `-${scripture.verseTo}`
        }
        if (scripture.text) {
          scriptureContext += `\n  "${scripture.text}"\n`
        } else if (scripture.verses) {
          scriptureContext += '\n'
          scripture.verses.forEach((v: any) => {
            scriptureContext += `  ${scripture.chapter}:${v.verse} "${v.text}"\n`
          })
        }
      })
    }

    // AI에게 제공할 프롬프트 생성
    const systemPrompt = `당신은 기독교 신앙 생활을 돕는 묵상 작성 도우미입니다. 
사용자가 설교를 듣고 간략하게 메모한 내용을 바탕으로, 다른 성도들과 공유할 수 있는 완성도 높은 묵상 글로 다듬어주세요.

작성 가이드라인:
1. 사용자의 핵심 메시지와 의도를 유지하면서 문장을 자연스럽게 다듬습니다
2. 성경적 표현과 기독교 용어를 적절히 사용합니다
3. 개인적인 깨달음과 적용점이 잘 드러나도록 합니다
4. 과도한 꾸밈이나 형식적인 표현은 피하고, 진정성 있는 톤을 유지합니다
5. 단락을 적절히 나누어 가독성을 높입니다
6. 전체 길이는 200-500자 정도로 적절하게 조절합니다
7. 사용자의 원래 메모 톤과 스타일을 최대한 유지합니다

반환 형식: 다듬어진 묵상 글만 반환하세요. 추가 설명이나 메타 정보는 포함하지 마세요.`

    let userPrompt = `다음 메모를 묵상 글로 다듬어주세요:\n\n${notes}`
    
    if (scriptureContext) {
      userPrompt += scriptureContext
    }

    if (previousVersion) {
      userPrompt += `\n\n이전 버전:\n${previousVersion}\n\n위 이전 버전을 참고하여 더 개선된 버전을 작성해주세요.`
    }

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 또는 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const refinedText = completion.choices[0]?.message?.content || ''

    if (!refinedText) {
      return NextResponse.json(
        { error: 'AI 응답을 받지 못했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      refinedText,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('AI refinement error:', error)
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 유효하지 않습니다.' },
        { status: 401 }
      )
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'AI 검수 중 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

