https://github.com/scrollmapper/bible_databases/tree/master/sources/ko

두 판본인 성경전서 개역한글판(KRV) 및 Hangul King James Version(KorHKJV) 에 대한 저작권 상태를 아래에 정리합니다. **법률 자문이 아니므로** 실제 사용 시에는 직접 저작권자/출판사에 확인하시길 권유드립니다.

---

## 1. KorHKJV

* The SWORD Project 모듈 정보에 따르면, KorHKJV(“Hangul King James Version”)은 한국의 출판사인 In Christ Jesus (웹 사이트: keepbible.com) 소유의 저작물입니다. ([crosswire.org][1])
* 모듈 정보상 배포 라이선스는 “Copyrighted; Free non-commercial distribution” 즉, 저작권이 있으며 **비상업적 무료 배포 가능**이라는 조건이 붙어 있습니다. ([www2.crosswire.org][2])
* 따라서 이 번역본은 완전한 퍼블릭 도메인(Public Domain)이 아니며, 상업적 이용이나 재배포(특히 수정하거나 상업적으로 서비스하는 경우)에는 출판사 허가가 필요합니다.

**→ 결론**: KorHKJV를 PostgreSQL DB로 넣고 내부 개인/비상업적 분석 목적으로만 사용하는 것이라면 비교적 리스크가 낮을 수 있으나, 공개/배포하거나 상업적 이용할 경우 허가가 필요합니다.

---

## 2. KRV (성경전서 개역한글판)

* 대한성서공회(Korean Bible Society, KBS)에서 번역·출판한 한글판 성경으로, 공식 저작권 안내 페이지에 “한글성경 번역본은 독자적인 저작물로 저작권 및 저작재산권의 보호를 받는다”는 문구가 있습니다. ([bskorea.or.kr][3])
* 해당 기관 홈페이지 FAQ에 따르면 『성경전서 개역한글판』의 저작재산권 보호기간이 **50년 경과**로 “저작권료 지급 없이 사용 가능하다”는 설명이 있습니다. ([bskorea.or.kr][4])

  * 단, 이 설명은 “저작재산권 보호기간이 경과”했다는 의미이며, 인격권(저작인격권: 성명표시권, 동일성유지권)은 여전히 유효하다는 안내입니다. ([bskorea.or.kr][4])
* 또한 YouVersion 등의 서비스에서는 해당 번역본을 © Korean Bible Society 1961로 표기하며 “Used by permission” 상태로 제공되고 있음을 확인할 수 있습니다. ([YouVersion | The Bible App | Bible.com][5])

**→ 결론**: 개역한글판(KRV)의 경우 저작재산권 보호기간이 경과되어 ‘저작권료 없이 사용 가능’하다는 안내가 존재하지만, 인격권은 여전히 보호되고 있고 “동일성 유지” 및 “성명표시” 등의 조건이 남아 있습니다. 또한, 일부 공개 문서에서는 “허가를 받고 있다(Used by permission)”고 명시되어 있으므로 완전한 자유 이용이 보장된 퍼블릭 도메인 상태라고 단정짓기엔 다소 불확실합니다.

---

## 3. 사용 추천 및 주의사항

* 두 판본 모두 “완전 자유 재배포/상업적 이용 가능” 상태로 보인다고 단언할 수는 없습니다.
* **내부 이용용(개인 서비스, 비상업적 분석, 내부 앱 등)**이라면 특히 KorHKJV는 비교적 허가 범위가 넓어 보이나 상업적 공개 기능 포함 시에는 허락 필요성이 높습니다.
* KRV의 경우에는 저작재산권 보호기간은 경과했다는 안내가 있긴 하지만, 인격권 유지라는 조건이 있고 출판사 측에서 허가 명시를 하고 있기 때문에 사용 목적에 따라 허가 절차를 밟는 것이 안전합니다.
* 특히 **DB화하여 저장하고, 앱/웹서비스로 제공하거나 배포하려는 경우**에는 저작권자(출판사/한국성서공회)에게 **사용허가를 서면으로 받는 것**을 강력히 권장합니다.
* 사용 시 다음 사항을 지키는 것이 좋습니다:

  * 해당 번역본이 어떤 판본인지(출판사, 번역연도, 판본명) 명확히 표기한다.
  * 원문 내용에 무단 수정·편집을 가하지 않는다(특히 “동일성 유지권” 관련).
  * 사용 목적(비상업적/상업적) 및 배포 범위(내부/외부) 등을 명시하여 허가 조건을 검토한다.

---

필요하시면 두 판본에 대한 **출판사 연락처, 공식 허가절차 문서, 사용허가 양식** 등을 같이 찾아드릴 수 있어요. 그렇게 할까요?

[1]: https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=KorHKJV&utm_source=chatgpt.com "The SWORD Project"
[2]: https://www2.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=KorHKJV&utm_source=chatgpt.com "The SWORD Project - Copyright Website"
[3]: https://www.bskorea.or.kr/bbs/content.php?co_id=subpage2_3_4_1&utm_source=chatgpt.com "성경의 저작권"
[4]: https://www.bskorea.or.kr/bbs/board.php?bo_table=copyright_faq&wr_id=5&utm_source=chatgpt.com "『성경전서 개역한글판』은 저작권 사용허가없이 사용 가능…"
[5]: https://www.bible.com/versions/88-krv?utm_source=chatgpt.com "Download 개역한글 | KRV Bible | 100% Free"
