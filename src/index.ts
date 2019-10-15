import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import rough from 'roughjs';

function walk(srcDir: string, dstDir: string) {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const filePathIn = path.join(srcDir, file);
    const filePathOut = path.join(dstDir, file);
    const stats = fs.statSync(filePathIn);
    if (stats.isDirectory()) {
      if (!fs.existsSync(filePathOut)) {
        fs.mkdirSync(filePathOut);
      }
      walk(filePathIn, filePathOut);
    } else if (stats.isFile()) {
      if (filePathIn.endsWith('24px.svg')) {
        processFile(filePathIn, filePathOut);
      }
    }
  }
}

function processFile(path: string, pathOut: string) {
  const window = new JSDOM(fs.readFileSync(path)).window;
  const doc = window.document;
  const svg = doc.querySelector('svg');
  if (svg) {
    const rc = rough.svg(svg, {
      options: {
        roughness: 0.2,
        bowing: 0.2
      }
    });
    const paths = svg.querySelectorAll('path');
    for (const path of paths) {
      const d = path.getAttribute('d');
      if (d) {
        const roughElement = rc.path(d);
        path.replaceWith(roughElement);
      }
    }
    const svgOut = svg.outerHTML;
    console.log(`Writing: ${pathOut}`);
    fs.writeFileSync(pathOut, svgOut, {
      encoding: 'utf8'
    });
  }
}

walk('./src-icons', './dst-icons');