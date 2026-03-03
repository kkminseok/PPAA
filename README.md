# PPAA - 평당가 아파트 분석

> 아파트 실거래가 데이터를 기반으로 지역별 평당가를 지도 위에 시각화하는 웹 서비스

## 주요 기능

- **카카오맵 기반 지도 시각화** - 아파트 위치를 지도 위 마커로 표시
- **실거래가 API 연동** - 국토교통부 아파트매매 실거래 상세 자료 (최근 1년치)
- **투자 유망 필터** - 지역 최고 평당가의 70% 이상 아파트를 빨간 마커로 구분
- **평당가 순위 리스트** - 사이드바에서 평당가 순으로 정렬된 전체 목록 확인
- **지역 드릴다운** - 시 → 구 단계별 선택 (현재 서울 25개 구 지원)

## 스크린샷

| 기능 | 설명 |
|---|---|
| 지도 마커 | 흰색: 일반, 빨간색: 투자유망 (평당가 70% 이상) |
| 인포윈도우 | 아파트명, 건축년도, 거래가격, 면적, 평당가, 거래일자 |
| 사이드바 | 지역 선택, 최고 평당가 통계, 평당가 순위 리스트 |

## 기술 스택

- **Frontend** - Nuxt.js 2, Vue 2, Vuetify 2
- **지도** - Kakao Maps JavaScript SDK
- **공공 API** - 국토교통부 아파트매매 실거래 상세 자료

## 실행 방법

### Docker (권장)

```bash
docker compose up --build
```

브라우저에서 `http://localhost:3000` 접속

### 로컬 실행

```bash
npm install
npm run dev
```

## API 키 설정

### 카카오맵

1. [Kakao Developers](https://developers.kakao.com) 접속 → 앱 생성
2. 플랫폼 → Web → `http://localhost:3000` 등록
3. JavaScript 키를 `nuxt.config.js`의 `appkey`에 입력

```js
// nuxt.config.js
script: [
  { src: '//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_KEY&libraries=services' }
]
```

### 공공데이터 포털 (아파트 실거래가)

1. [data.go.kr](https://www.data.go.kr) 접속 → 로그인
2. **"아파트매매 실거래 상세 자료"** 검색 → 활용신청
3. 발급된 인증키를 `constants/index.ts`에 입력

```ts
// constants/index.ts
export const serviceKey = 'YOUR_SERVICE_KEY'
```

## 프로젝트 구조

```
PPAA/
├── pages/
│   └── index.vue        # 지도 메인 페이지
├── layouts/
│   └── default.vue      # 사이드바, 앱바 레이아웃
├── store/
│   └── index.js         # Vuex 상태 관리 (마커, 인포윈도우, 순위 리스트)
├── constants/
│   └── index.ts         # API 키
├── utils/
│   └── date.ts          # 날짜 유틸
├── Dockerfile
└── docker-compose.yml
```

## 지원 지역

현재 **서울시 25개 구** 지원. 경기도, 부산 등 타 지역은 추후 추가 예정.

| 구 | 법정동 코드 |
|---|---|
| 강남구 | 11680 |
| 강동구 | 11740 |
| 서초구 | 11650 |
| 송파구 | 11710 |
| ... | ... |
