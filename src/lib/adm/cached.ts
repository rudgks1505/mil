// 'use client'

// //새로고침 시 초기화되기에 스토리지에 저장.
// type Entry = { url: string; exp: number };

// const g = globalThis as unknown as { __signedUrlCache?: Map<string, Entry> };
// export const signedUrlCache =
//     g.__signedUrlCache ?? (g.__signedUrlCache = new Map<string, Entry>());

// export function getCached(path: string) {
//     const e = signedUrlCache.get(path);
//     console.log(e);
//     const now = Math.floor(Date.now() / 1000);

//     // 1) 메모리 캐시 우선
//     if (e && e.exp > now + 30) return e.url;

//     // 2) 로컬스토리지에서 복원
//     const stored = localStorage.getItem(`signed:${path}`);
//     if (stored) {
//         const parsed = JSON.parse(stored) as { url: string; exp: number };
//         if (parsed.exp > now + 30) {
//             signedUrlCache.set(path, parsed);
//             return parsed.url;
//         }
//     }
//     return null;
// }

// export function setCached(path: string, url: string, ttlSec = 43200) {
//     const now = Math.floor(Date.now() / 1000);
//     const entry = { url, exp: now + ttlSec };
//     signedUrlCache.set(path, entry);
//     localStorage.setItem(`signed:${path}`, JSON.stringify(entry)); // ✅ 로컬 저장
// }