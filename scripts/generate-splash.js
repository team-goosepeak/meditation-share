const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../ic_launcher/1024.png');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');

// Android 스플래시 화면 크기 (Portrait)
const portraitSizes = {
  mdpi: { width: 320, height: 470 },
  hdpi: { width: 480, height: 640 },
  xhdpi: { width: 720, height: 960 },
  xxhdpi: { width: 1080, height: 1440 },
  xxxhdpi: { width: 1440, height: 1920 },
};

// Android 스플래시 화면 크기 (Landscape)
const landscapeSizes = {
  mdpi: { width: 470, height: 320 },
  hdpi: { width: 640, height: 480 },
  xhdpi: { width: 960, height: 720 },
  xxhdpi: { width: 1440, height: 1080 },
  xxxhdpi: { width: 1920, height: 1440 },
};

async function generateSplash() {
  console.log('📋 스플래시 화면 생성 스크립트');
  console.log('==================================');
  console.log(`원본 이미지: ${SOURCE_IMAGE}`);
  console.log('');

  // 이미지 존재 확인
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ 오류: ${SOURCE_IMAGE} 파일을 찾을 수 없습니다.`);
    process.exit(1);
  }

  console.log('✅ 원본 이미지 확인 완료');
  console.log('');

  // Portrait 스플래시 생성
  console.log('📱 Portrait 스플래시 화면 생성 중...');
  console.log('');

  for (const [density, size] of Object.entries(portraitSizes)) {
    const outputDir = path.join(ANDROID_RES_DIR, `drawable-port-${density}`);
    const outputPath = path.join(outputDir, 'splash.png');

    // 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      // 스플래시 화면은 배경이 흰색이므로, 로고를 중앙에 배치하고 흰색 배경 추가
      await sharp(SOURCE_IMAGE)
        .resize(
          Math.min(size.width, size.height) * 0.6, // 로고를 화면의 60% 크기로
          Math.min(size.width, size.height) * 0.6,
          {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          }
        )
        .extend({
          top: Math.floor((size.height - Math.min(size.width, size.height) * 0.6) / 2),
          bottom: Math.ceil((size.height - Math.min(size.width, size.height) * 0.6) / 2),
          left: Math.floor((size.width - Math.min(size.width, size.height) * 0.6) / 2),
          right: Math.ceil((size.width - Math.min(size.width, size.height) * 0.6) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // 흰색 배경
        })
        .toFile(outputPath);

      console.log(
        `  ✅ drawable-port-${density}/splash.png (${size.width}x${size.height})`
      );
    } catch (error) {
      console.error(`  ❌ ${density} Portrait 생성 실패:`, error.message);
    }
  }

  console.log('');

  // Landscape 스플래시 생성
  console.log('📱 Landscape 스플래시 화면 생성 중...');
  console.log('');

  for (const [density, size] of Object.entries(landscapeSizes)) {
    const outputDir = path.join(ANDROID_RES_DIR, `drawable-land-${density}`);
    const outputPath = path.join(outputDir, 'splash.png');

    // 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      // 로고를 중앙에 배치하고 흰색 배경 추가
      await sharp(SOURCE_IMAGE)
        .resize(
          Math.min(size.width, size.height) * 0.6, // 로고를 화면의 60% 크기로
          Math.min(size.width, size.height) * 0.6,
          {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          }
        )
        .extend({
          top: Math.floor((size.height - Math.min(size.width, size.height) * 0.6) / 2),
          bottom: Math.ceil((size.height - Math.min(size.width, size.height) * 0.6) / 2),
          left: Math.floor((size.width - Math.min(size.width, size.height) * 0.6) / 2),
          right: Math.ceil((size.width - Math.min(size.width, size.height) * 0.6) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // 흰색 배경
        })
        .toFile(outputPath);

      console.log(
        `  ✅ drawable-land-${density}/splash.png (${size.width}x${size.height})`
      );
    } catch (error) {
      console.error(`  ❌ ${density} Landscape 생성 실패:`, error.message);
    }
  }

  console.log('');
  console.log('✅ 스플래시 화면 생성 완료!');
  console.log('');
  console.log('📝 다음 단계:');
  console.log('1. android/app/src/main/res/drawable-*/splash.png 파일 확인');
  console.log('2. 필요시 로고 크기 조정 (스크립트 내 0.6 값 수정)');
  console.log('3. npm run sync:android 실행');
  console.log('');
}

generateSplash().catch((error) => {
  console.error('❌ 오류 발생:', error);
  process.exit(1);
});

