// 처음 열었을 때의 예시 페이지와 왼쪽 블록 목록. 공방은 가상이다.
import forgeHero from './assets/forge-hero.webp?inline'

export const START_HTML = [
  '<header class="hero">',
  '  <p class="eyebrow">연습용 대장간</p>',
  '  <h1>두드리고 다듬어<br>오래 쓰는 것</h1>',
  '  <p class="lead">쇠와 나무를 다루는 작은 공방입니다. 쓰임에 맞는 도구를 한 점씩 만듭니다.</p>',
  '  <a class="cta" href="#workshop">작업 살펴보기</a>',
  '</header>',
  '<section class="workshop" id="workshop">',
  '  <p class="section-label">연습용 공방</p>',
  '  <h2>손이 닿는 곳에서 하나씩.</h2>',
  '  <div class="items">',
  '    <article><h3>생활 도구</h3><p>매일 손이 가는 물건을 단단하게 만듭니다.</p></article>',
  '    <article><h3>맞춤 작업</h3><p>쓰는 사람과 쓰임에 맞춰 모양을 다듬습니다.</p></article>',
  '  </div>',
  '</section>',
].join(String.fromCharCode(10))

export const START_CSS = [
  'body{margin:0;font-family:Pretendard,system-ui,sans-serif;color:#eee9df;background:#f3efe7}',
  '.hero{min-height:430px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:56px clamp(24px,8vw,112px);background-image:linear-gradient(90deg,rgba(17,16,14,.88) 0%,rgba(17,16,14,.58) 62%,rgba(17,16,14,.2) 100%),url("' + forgeHero + '");background-position:center;background-size:cover}',
  '.eyebrow{margin:0;color:#d0a176;font-size:13px;font-weight:650;letter-spacing:.06em}',
  '.hero h1{max-width:620px;margin:14px 0 0;font-size:clamp(34px,5vw,52px);font-weight:600;line-height:1.22;letter-spacing:-.045em}',
  '.lead{max-width:480px;margin:15px 0 0;color:#e2ddd4;font-size:16px;line-height:1.75}',
  '.cta{display:inline-flex;align-items:center;min-height:44px;margin-top:23px;padding:0 17px;border-radius:999px;background:#eee9df;color:#211e1a;text-decoration:none;font-size:14px;font-weight:650}',
  '.workshop{padding:40px clamp(24px,8vw,112px) 52px;color:#24211d}',
  '.section-label{margin:0;color:#8a6244;font-size:12px;font-weight:650}',
  '.workshop h2{margin:11px 0 0;font-size:clamp(24px,3vw,34px);letter-spacing:-.04em}',
  '.items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px;margin-top:28px}',
  '.items article{padding-top:17px;border-top:1px solid #d8d0c4}',
  '.items h3{margin:0;font-size:17px}',
  '.items p{max-width:42ch;margin:8px 0 0;color:#625d55;font-size:14px;line-height:1.7}',
  '@media(max-width:520px){.hero{min-height:380px;padding:44px 23px}.items{grid-template-columns:1fr;gap:22px}.workshop{padding:32px 23px 40px}}',
].join(String.fromCharCode(10))

export const BLOCKS = [
  { id: 'heading', label: '제목', content: '<h2 style="font-size:32px;margin:24px 40px">새 제목</h2>' },
  { id: 'text', label: '문단', content: '<p style="font-size:16px;line-height:1.7;margin:12px 40px">여기에 문단을 쓰세요.</p>' },
  { id: 'button', label: '버튼', content: '<a href="#" style="display:inline-block;margin:12px 40px;padding:12px 20px;border-radius:8px;background:#1d1d1f;color:#fff;text-decoration:none">버튼</a>' },
  { id: 'image', label: '이미지', content: { type: 'image', style: { width: '100%', 'max-width': '640px', margin: '12px 40px' } }, activate: true },
  { id: 'cover', label: '배경 영역', content: '<section style="min-height:300px;display:flex;flex-direction:column;justify-content:center;padding:40px;background:#28241f;color:#f2eee6"><h2>배경 이미지가 들어갈 곳</h2><p>영역을 선택한 뒤 이미지 배경 버튼을 누르세요.</p></section>' },
  { id: 'two-col', label: '2단', content: '<section style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px 40px"><div><h3>왼쪽</h3><p>내용</p></div><div><h3>오른쪽</h3><p>내용</p></div></section>' },
  { id: 'divider', label: '구분선', content: '<hr style="margin:24px 40px;border:0;border-top:1px solid #e5e5e5">' },
]
