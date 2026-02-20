# 모임 (Moim) - 쉬운 일정 투표 앱

로그인 없이 링크 하나로 모임 일정과 장소를 투표로 결정하는 웹 애플리케이션입니다.

## 주요 기능

### 1. 모임 생성
- 모임 제목, 주최자 이름, 설명(선택) 입력
- 투표 유형 선택: 시간만 / 장소만 / 시간+장소
- 마감 시간 설정 (최소 10분 ~ 최대 30일)

### 2. 후보 등록
- **시간 후보**: 날짜 + 시작시간 + 종료시간(선택), 최대 20개
- **장소 후보**: 장소명 + 지도 링크(카카오/네이버/구글) + 메모, 최대 10개
- **세부 옵션**: 예상 비용, 이동시간, 분위기 태그

### 3. 초대 링크 공유
- 링크 하나로 참여 (로그인 불필요)
- 참여자는 닉네임만 입력
- 카카오톡 공유 버튼 / Web Share API / 클립보드 복사

### 4. 투표
- 가능한 시간/장소 복수 선택
- 투표 변경 가능
- 실시간 집계 표시 (5초 폴링)
- 후보별 득표율 막대 그래프 + 투표자 이름 표시

### 5. 자동 확정
- 마감 시 득표수 1위 후보 자동 확정
- 동점 발생 시 주최자에게 선택권 부여 (TIEBREAK)
- 24시간 내 미선택 시 선등록 후보로 자동 확정
- 주최자 수동 확정도 가능

### 6. 확정 결과 공유
- 확정 카드: 날짜/시간/장소 + 참석자 목록 + 지도 링크
- .ics 캘린더 파일 다운로드 (아이폰/기본 캘린더)
- 구글 캘린더 직접 추가 링크
- 카카오톡 / 링크 공유

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| Vue 3 | 3.5 | Composition API 기반 SPA |
| TypeScript | 5.9 | 타입 안전성 |
| Vite | 7.3 | 빌드 도구 |
| Pinia | 3.0 | 상태 관리 |
| Vue Router | 4.6 | SPA 라우팅 |
| TailwindCSS | 4.1 | 유틸리티 기반 스타일링 |
| Axios | 1.13 | HTTP 클라이언트 |
| dayjs | 1.11 | 날짜/시간 처리 |
| PWA | - | 오프라인 지원, 홈 화면 추가 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Spring Boot | 3.5 | REST API 서버 |
| Java | 17 | 언어 |
| Spring Data JPA | - | ORM |
| PostgreSQL | 15 | 데이터베이스 |
| Flyway | - | DB 마이그레이션 |
| Lombok | - | 보일러플레이트 제거 |
| Springdoc OpenAPI | 2.8 | Swagger UI |
| Bucket4j | 8.10 | Rate Limiting |

## 프로젝트 구조

```
moim-app/
├── moim-frontend/                 # Vue 3 SPA
│   └── src/
│       ├── api/                   # Axios API 클라이언트
│       ├── components/            # 공통 컴포넌트
│       ├── composables/           # 재사용 로직 (토큰, 카카오 공유)
│       ├── router/                # 라우트 정의
│       ├── stores/                # Pinia 스토어
│       ├── types/                 # TypeScript 타입
│       └── views/                 # 페이지 컴포넌트
│
├── moim-backend/                  # Spring Boot REST API
│   └── src/main/java/com/moim/
│       ├── common/                # 예외처리, 보안, 유틸리티
│       ├── config/                # CORS 설정
│       ├── gathering/             # 모임 도메인 (생성/조회)
│       ├── vote/                  # 투표 도메인 (참여/수정/집계)
│       └── confirm/               # 확정 도메인 (자동/수동/동점 처리)
│
└── README.md
```

## 실행 방법

### 사전 요구사항
- Node.js 18+
- Java 17+
- Docker

### 1. PostgreSQL 실행
```bash
cd moim-backend
docker-compose up -d
```

### 2. 백엔드 실행
```bash
cd moim-backend
./gradlew bootRun
```
> http://localhost:8080 에서 실행됩니다.
> Swagger UI: http://localhost:8080/swagger-ui.html

### 3. 프론트엔드 실행
```bash
cd moim-frontend
npm install
npm run dev
```
> http://localhost:3000 에서 실행됩니다.

### 4. 카카오톡 공유 설정 (선택)
```bash
# moim-frontend/.env 파일 생성
VITE_KAKAO_APP_KEY=your_kakao_javascript_app_key
```
> [Kakao Developers](https://developers.kakao.com/)에서 앱 키를 발급받아 설정합니다.
> 설정하지 않으면 카카오톡 공유 버튼이 자동으로 숨겨집니다.

## API 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/v1/gatherings` | 모임 생성 | - |
| `GET` | `/api/v1/gatherings/{shareCode}` | 모임 상세 조회 | - |
| `POST` | `/api/v1/gatherings/{shareCode}/participate` | 참여 + 투표 | - |
| `PUT` | `/api/v1/gatherings/{shareCode}/vote` | 투표 수정 | X-Session-Token |
| `GET` | `/api/v1/gatherings/{shareCode}/votes` | 투표 집계 조회 | - |
| `POST` | `/api/v1/gatherings/{shareCode}/confirm` | 수동 확정 | X-Admin-Token |
| `POST` | `/api/v1/gatherings/{shareCode}/tiebreak` | 동점 해소 | X-Admin-Token |
| `GET` | `/api/v1/gatherings/{shareCode}/result` | 확정 결과 조회 | - |
| `GET` | `/api/v1/gatherings/{shareCode}/result/ics` | .ics 파일 다운로드 | - |

## 사용자 흐름

```
주최자: 모임 생성 → 링크 공유
                        ↓
참여자: 링크 접속 → 닉네임 입력 → 투표 → 실시간 현황 확인
                                              ↓
                                         마감 도래
                                              ↓
                                    ┌─── 단독 1위 → 자동 확정
                                    ├─── 동점 → 주최자 선택 (24h)
                                    └─── 참여자 0명 → 만료
                                              ↓
전원: 확정 카드 확인 → 캘린더 추가 / 카카오톡 공유
```

## 보안

- **토큰 해싱**: 관리자/세션 토큰은 SHA-256 해시 후 DB 저장 (원본은 클라이언트만 보유)
- **공유 코드**: 6자리 랜덤 영숫자 (SecureRandom, 62^6 ≈ 568억 조합)
- **Rate Limiting**: Bucket4j 인메모리 방식으로 IP당 요청 제한
- **CORS**: 허용된 도메인만 접근 가능
