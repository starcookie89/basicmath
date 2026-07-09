// 이 숫자를 올리면(v1 -> v2) 학습자 태블릿에서 예전 캐시가 자동으로 지워지고
// 다음 접속 때 최신 파일을 새로 받아옵니다.
// -> 게임 내용을 수정해서 다시 배포할 때마다 이 버전을 1씩 올려주세요.
const CACHE_VERSION = 'basicmath-v8';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 설치: 핵심 파일을 캐시에 미리 저장 (오프라인 대비)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리: network-first (온라인이면 항상 최신 파일을 먼저 시도)
// 오프라인이거나 네트워크 실패 시에만 캐시된 버전을 보여줌
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
