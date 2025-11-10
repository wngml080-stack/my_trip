### 작업 계획

1. 좌표 변환 수정 (`lib/types/tour.ts`)
   - `convertCoordinates`에서 API가 제공하는 WGS84 좌표를 그대로 사용하도록 `parseFloat` 기반 변환으로 수정
   - 숫자로 변환되지 않으면 `null`을 반환하고 함수 주석에 좌표 형식을 명시

2. 지도 컴포넌트 보강
   - `components/naver-map.tsx`: `convertCoordinates` 결과가 없는 항목은 마커 생성·지도 이동에서 제외하고, 최초/선택 시에도 유효 좌표일 때만 이동
   - `components/tour-detail/detail-map.tsx`: 좌표가 없으면 지도가 아닌 안내 메시지를 노출

3. 회귀 테스트 작성
   - `tests/lib/coordinates.test.ts`를 새로 추가하여 다양한 좌표 문자열에 대한 변환 결과를 검증하고, NaN 처리 시 행동을 확인

