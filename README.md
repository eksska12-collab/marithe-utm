# 마리떼 UTM 생성기 (Marithe UTM Builder)

마리떼 광고팀을 위한 **통합 UTM 파라미터 생성 및 관리 도구**입니다.
최신 Vercel 스타일의 직관적인 UI/UX를 적용하여 복잡한 UTM 코드를 손쉽게 생성하고 관리할 수 있습니다.

## ✨ 주요 기능

### 1. 직관적인 사용자 인터페이스

- **2-Column 레이아웃**: 좌측 입력 폼과 우측 결과 패널(Sticky)로 구성되어 실시간으로 결과를 확인하며 입력 가능
- **카드형 섹션**: 기본 설정, 캠페인 상세, URL 설정이 명확하게 구분된 카드 디자인 적용
- **브랜드 퀵 토글**: 클릭 한 번으로 여러 브랜드를 손쉽게 선택/해제

### 2. 강력한 빌더 지원

- **DA 빌더**: 메타, 구글, 크리테오 등 디스플레이 광고용
- **SA 빌더**: 네이버 검색광고(PC/MO)용
- **BS 빌더**: 네이버 브랜드검색 전용 (8개 필수 영역 자동 생성)

### 3. 스마트 관리 시스템

- **템플릿 저장/로드**: 자주 사용하는 설정을 템플릿으로 저장하여 재사용
- **최근 기록**: 최근 생성한 5개의 설정을 즉시 불러오기
- **자동 URL 매핑**: 브랜드 선택 시 해당 공식몰/랜딩 페이지 자동 추천

### 4. 데이터 내보내기

- **CSV 다운로드**: UTF-8 BOM이 적용된 CSV 파일 생성 (엑셀 즉시 열기 가능)
- **엑셀용 복사**: 결과 테이블을 탭(Tab)으로 구분하여 복사, 엑셀에 바로 붙여넣기 가능

## 🚀 설치 및 실행 방법

이 프로젝트는 Next.js 기반으로 제작되었습니다.

### 1. 저장소 복제 (Clone)

\`\`\`bash
git clone <https://github.com/your-username/marithe-utm-builder.git>
cd marithe-utm-builder
\`\`\`

### 2. 의존성 설치

\`\`\`bash
npm install

# 또는

yarn install
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## 🛠 기술 스택

- **Framework**: Next.js 14, React
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

---
*Created by Antigravity*
