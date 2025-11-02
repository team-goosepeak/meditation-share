# Android 빌드 및 배포 가이드

## 📱 개요

이 가이드는 Worship Reflection 앱을 Android용으로 빌드하고 배포하는 방법을 설명합니다.

## 🔧 사전 요구사항

### 1. Android Studio 설치

Android Studio를 설치해야 합니다:
- [Android Studio 다운로드](https://developer.android.com/studio)
- 설치 시 Android SDK, Android SDK Platform-Tools 포함
- 최소 API Level 22 (Android 5.1) 이상 필요

### 2. Java Development Kit (JDK)

- JDK 17 이상 필요
- Android Studio에 포함되어 있지만, 별도 설치도 가능

### 3. 환경 변수 설정

**macOS/Linux:**
```bash
# ~/.zshrc 또는 ~/.bash_profile에 추가
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Windows:**
- 시스템 환경 변수에 `ANDROID_HOME`을 `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`로 설정
- Path에 `%ANDROID_HOME%\platform-tools` 추가

### 4. 필요한 SDK 구성요소

Android Studio의 SDK Manager에서 다음 항목 설치:
- Android SDK Platform (API 34 이상 권장)
- Android SDK Build-Tools
- Android Emulator (테스트용)
- Google Play services (선택사항)

## 🚀 개발 빌드

### 1. 웹 앱 빌드 및 동기화

```bash
# NextJS 앱을 빌드하고 Capacitor와 동기화
npm run build:android
```

이 명령어는 다음을 수행합니다:
1. NextJS 앱을 정적 파일로 빌드 (`out/` 폴더에 생성)
2. Capacitor Android 프로젝트와 동기화
3. 웹 파일을 Android 프로젝트로 복사

### 2. Android Studio에서 프로젝트 열기

```bash
# Android Studio 열기
npm run open:android
```

또는

```bash
npx cap open android
```

### 3. 에뮬레이터 또는 실제 기기에서 실행

**Android Studio에서:**
1. 도구바의 기기 선택 드롭다운에서 에뮬레이터 또는 연결된 기기 선택
2. ▶️ (Run) 버튼 클릭

**명령줄에서:**
```bash
# 기기/에뮬레이터가 연결되어 있으면 바로 실행
npm run cap:run:android
```

## 📦 프로덕션 빌드 (APK/AAB)

### 1. 앱 서명 키 생성

앱을 Google Play Store에 배포하려면 서명 키가 필요합니다:

```bash
keytool -genkey -v -keystore meditation-share-release.keystore \
  -alias meditation-share -keyalg RSA -keysize 2048 -validity 10000
```

**중요:** 
- 생성된 `.keystore` 파일과 비밀번호를 안전하게 보관하세요
- 이 파일을 잃어버리면 앱 업데이트가 불가능합니다
- **절대 Git에 커밋하지 마세요**

### 2. Gradle 서명 설정

`android/key.properties` 파일 생성:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=meditation-share
storeFile=../meditation-share-release.keystore
```

**주의:** 이 파일도 `.gitignore`에 추가되어 있으므로 Git에 커밋되지 않습니다.

`android/app/build.gradle` 파일에 서명 설정 추가:

```gradle
// 파일 최상단에 추가
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. APK 빌드 (테스트 배포용)

```bash
cd android
./gradlew assembleRelease
```

생성 위치: `android/app/build/outputs/apk/release/app-release.apk`

### 4. AAB 빌드 (Google Play Store용)

```bash
cd android
./gradlew bundleRelease
```

생성 위치: `android/app/build/outputs/bundle/release/app-release.aab`

**Android App Bundle (AAB) 권장 이유:**
- Google Play Store에서 요구하는 형식
- 사용자 기기에 최적화된 APK 생성
- 더 작은 다운로드 크기

## 🏪 Google Play Store 배포

### 1. Google Play Console 설정

1. [Google Play Console](https://play.google.com/console) 계정 생성
2. 개발자 등록비 $25 결제 (일회성)
3. "앱 만들기" 클릭

### 2. 앱 정보 입력

- **앱 이름:** Worship Reflection
- **기본 언어:** 한국어
- **앱 유형:** 앱
- **무료/유료:** 무료

### 3. 스토어 등록 정보 작성

필수 항목:
- 앱 제목
- 간단한 설명 (80자)
- 전체 설명 (4000자)
- 스크린샷 (최소 2개)
- 512x512 아이콘
- 1024x500 기능 그래픽

### 4. 콘텐츠 등급

- 설문 조사 완료
- 앱의 콘텐츠에 따라 등급 결정

### 5. 대상 고객 및 콘텐츠

- 대상 연령 설정
- 개인정보처리방침 URL 제공 (필수)

### 6. 앱 액세스

- 특별한 액세스 권한이 필요한지 명시

### 7. 프로덕션 트랙에 출시

1. "프로덕션" 트랙 선택
2. "새 출시 만들기" 클릭
3. AAB 파일 업로드
4. 출시 노트 작성
5. "검토" → "프로덕션으로 출시" 클릭

검토 과정은 보통 1-3일 소요됩니다.

## 🔄 앱 업데이트

### 1. 버전 업데이트

`android/app/build.gradle` 파일 수정:

```gradle
android {
    defaultConfig {
        versionCode 2  // 이전보다 1 증가
        versionName "1.0.1"  // 사용자에게 표시되는 버전
    }
}
```

### 2. 새 빌드 생성

```bash
# 웹 앱 빌드
npm run build:android

# AAB 빌드
cd android
./gradlew bundleRelease
```

### 3. Play Console에 업로드

1. Play Console에서 앱 선택
2. "프로덕션" → "새 출시 만들기"
3. 새 AAB 파일 업로드
4. 출시 노트 작성
5. 출시

## 🧪 테스트

### 내부 테스트

1. Play Console에서 "내부 테스트" 트랙 사용
2. 테스터 이메일 주소 추가
3. AAB 업로드
4. 테스터가 Play Store에서 다운로드 가능

### 비공개 테스트

1. "비공개 테스트" 트랙 사용
2. 최대 100명의 테스터 추가 가능
3. 피드백 수집

## 🛠️ 트러블슈팅

### Gradle 빌드 실패

```bash
# Gradle 캐시 정리
cd android
./gradlew clean

# Gradle 래퍼 재생성
./gradlew wrapper --gradle-version 8.0
```

### ANDROID_HOME 환경변수 오류

```bash
# 현재 설정 확인
echo $ANDROID_HOME

# 올바른 경로로 설정
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### 서명 오류

- `key.properties` 파일이 올바른 위치에 있는지 확인
- 비밀번호가 정확한지 확인
- `.keystore` 파일 경로가 올바른지 확인

### 앱이 실행되지 않음

```bash
# 로그 확인
adb logcat | grep -i capacitor

# 앱 재설치
adb uninstall com.meditationshare.app
npm run cap:run:android
```

## 📋 체크리스트

출시 전 확인사항:

- [ ] 모든 기능이 Android에서 정상 동작
- [ ] 다양한 화면 크기에서 테스트
- [ ] 네트워크 연결/해제 상황 테스트
- [ ] 앱 아이콘 및 스플래시 스크린 설정
- [ ] 앱 이름 및 버전 정보 확인
- [ ] 개인정보처리방침 준비
- [ ] 스크린샷 및 스토어 등록 정보 준비
- [ ] 서명 키 안전하게 백업

## 🔗 유용한 링크

- [Capacitor Android 문서](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console](https://play.google.com/console)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

## 🎯 다음 단계

1. **앱 아이콘 및 스플래시 스크린 설정**
   - `android/app/src/main/res/` 폴더의 아이콘 파일 교체
   - 또는 [Capacitor Assets](https://github.com/ionic-team/capacitor-assets) 사용

2. **푸시 알림 설정**
   - Firebase Cloud Messaging 통합
   - `@capacitor/push-notifications` 플러그인 사용

3. **앱 성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - 번들 크기 최소화

4. **Analytics 통합**
   - Google Analytics for Firebase
   - 사용자 행동 추적

## 📞 지원

문제가 발생하면 다음을 확인하세요:
- `TROUBLESHOOTING.md` 파일
- Capacitor 공식 문서
- Android Developer 문서

