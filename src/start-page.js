// 처음 열었을 때의 예시 페이지와 왼쪽 블록 목록. 가게는 가상이다.

export const START_HTML = `
<header class="hero">
  <p class="eyebrow">성수동 골목 빵집(가상)</p>
  <h1>아침 7시, 오늘 구운 빵만 팝니다</h1>
  <p class="lead">전날 반죽을 하루 숙성해 굽습니다. 남은 빵은 저녁 8시에 근처 쉼터로 보냅니다.</p>
  <a class="cta" href="#menu">오늘 메뉴 보기</a>
</header>
<section class="cols" id="menu">
  <div><h3>캄파뉴</h3><p>통밀 30%, 천연 발효종. 오전 중 소진됩니다.</p></div>
  <div><h3>소금빵</h3><p>버터를 넣고 굽기 직전에 소금을 올립니다.</p></div>
  <div><h3>무화과 깜빠뉴</h3><p>금·토요일에만 굽습니다.</p></div>
</section>`

export const START_CSS = `
body{margin:0;font-family:'Pretendard Variable',-apple-system,sans-serif;color:#1d1d1f;background:#fff}
.hero{padding:72px 40px 56px;background:#faf6ef}
.eyebrow{margin:0;color:#9a6b2f;font-size:14px;font-weight:600}
.hero h1{margin:12px 0 0;font-size:44px;line-height:1.2;letter-spacing:-0.03em}
.lead{max-width:520px;margin:16px 0 0;font-size:17px;line-height:1.7;color:#4a4a4f}
.cta{display:inline-block;margin-top:24px;padding:12px 20px;border-radius:8px;background:#1d1d1f;color:#fff;text-decoration:none;font-weight:600}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:40px}
.cols h3{margin:0;font-size:20px}
.cols p{margin:8px 0 0;font-size:15px;line-height:1.6;color:#55555a}
@media (max-width:480px){.hero{padding:48px 20px 40px}.hero h1{font-size:32px}.cols{grid-template-columns:1fr;padding:24px 20px}}`

export const BLOCKS = [
  { id: 'heading', label: '제목', content: '<h2 style="font-size:32px;margin:24px 40px">새 제목</h2>' },
  { id: 'text', label: '문단', content: '<p style="font-size:16px;line-height:1.7;margin:12px 40px">여기에 문단을 쓰세요.</p>' },
  { id: 'button', label: '버튼', content: '<a href="#" style="display:inline-block;margin:12px 40px;padding:12px 20px;border-radius:8px;background:#1d1d1f;color:#fff;text-decoration:none">버튼</a>' },
  { id: 'image', label: '이미지', content: { type: 'image', style: { width: '100%', 'max-width': '640px', margin: '12px 40px' } }, activate: true },
  { id: 'two-col', label: '2단', content: '<section style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px 40px"><div><h3>왼쪽</h3><p>내용</p></div><div><h3>오른쪽</h3><p>내용</p></div></section>' },
  { id: 'divider', label: '구분선', content: '<hr style="margin:24px 40px;border:0;border-top:1px solid #e5e5e5">' },
]
