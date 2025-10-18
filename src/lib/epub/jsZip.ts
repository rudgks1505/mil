import JSZip from 'jszip';
import { escapeXml, isFullHtmlDocument } from "./utils";
import { Epub } from "@/types/schemas";

// 제목 + 본문을 한 파일에 넣는 래퍼
const CHAPTER_WRAPPER = (title: string, body: string, withCssLink = true) => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <meta charset="utf-8"/>
    <title>${escapeXml(title)}</title>
    ${withCssLink ? `<link rel="stylesheet" type="text/css" href="styles.css"/>` : ""}
  </head>
  <body>
    <h1 class="chapter-title">${escapeXml(title)}</h1>
    ${body}
  </body>
</html>`;

export async function buildEpubArrayBuffer(bookData: Epub): Promise<ArrayBuffer> {
  const zip = new JSZip();

  // 1) mimetype (STORE) //epub리더가 읽기위한 규칙셋팅
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2) container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);//메인 파일이 어디있는지 알려주는 xml

  // 3) styles.css (제목은 새 페이지에서 시작, 제목 뒤로는 즉시 본문)
  const stylesCss = `
/* 챕터 제목은 항상 새 페이지에서 시작 */
.chapter-title {
  break-before: page;
  page-break-before: always; /* 구형 리더 호환 */
}

`;
  zip.file('OEBPS/styles.css', stylesCss);

  // 4) 챕터 파일, manifest/spine
  let opfManifest = `
    <item id="css" href="styles.css" media-type="text/css"/>`;
  let opfSpine = '';
  const chapterList: { title: string; href: string }[] = [];

  bookData.chapters.forEach((ch, i) => {
    const title = ch.title || `Chapter ${i + 1}`;
    const fname = `chapter${i + 1}.xhtml`;

    // 입력이 완전한 HTML 문서면 그대로 사용하되, 가능하면 styles.css 링크 유도
    // (완전 문서인 경우 head에 link가 없을 수 있으니 그대로 두고, 필요하면 후처리로 삽입)
    let chapterXhtml: string;
    if (isFullHtmlDocument(ch.xhtml)) {
      // 완전 문서라면 그대로 사용(이미 h1이 있다면 OK, 없다면 사용자가 넣어둔 걸 신뢰)
      chapterXhtml = ch.xhtml;
    } else {
      // 본문만 왔으면 우리가 제목+h1 포함한 완전 문서로 래핑
      chapterXhtml = CHAPTER_WRAPPER(title, ch.xhtml, true);
    }

    zip.file(`OEBPS/${fname}`, chapterXhtml);

    // manifest/spine 등록 (본문 파일만)
    opfManifest += `
      <item id="content_${i}" href="${fname}" media-type="application/xhtml+xml"/>`;
    opfSpine += `
      <itemref idref="content_${i}"/>`;

    chapterList.push({ title, href: fname });
  });

  // 5) nav.xhtml (TOC는 해당 챕터 파일로 링크)
  const navItems = chapterList
    .map(c => `<li><a href="${c.href}">${escapeXml(c.title)}</a></li>`)
    .join('\n');

  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko" xmlns:epub="http://www.idpf.org/2007/ops">
  <head><meta charset="utf-8"/><title>Table of Contents</title></head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Contents</h1>
      <ol>${navItems}</ol>
    </nav>
  </body>
</html>`;
  zip.file('OEBPS/nav.xhtml', navXhtml);
  opfManifest += `
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`;

  // 6) content.opf
  const now = new Date().toISOString();
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0" xml:lang="ko">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${escapeXml(bookData.metadata.identifier || `urn:uuid:${crypto.randomUUID()}`)}</dc:identifier>
    <dc:title>${escapeXml(bookData.metadata.title)}</dc:title>
    <dc:creator>${escapeXml(bookData.metadata.author)}</dc:creator>
    <dc:language>ko</dc:language>
    <meta property="dcterms:modified">${now}</meta>
  </metadata>
  <manifest>
    ${opfManifest}
  </manifest>
  <spine>
    ${opfSpine}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', contentOpf);

  // 7) ArrayBuffer로 생성
  return zip.generateAsync({ type: 'arraybuffer' }); //어레이버퍼 타입이란게 아닌, 이진데이터를 어레이버퍼로 담아서 이진데이터로 만들겠다.
}
