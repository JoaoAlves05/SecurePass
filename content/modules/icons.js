const shapes = {
  key: [['path', { d: 'M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z' }], ['circle', { cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor' }]],
  user: [['circle', { cx: '12', cy: '8', r: '4' }], ['path', { d: 'M20 21a8 8 0 0 0-16 0' }]],
  close: [['path', { d: 'm6 6 12 12M6 18 18 6' }]],
  copy: [['rect', { x: '8', y: '8', width: '12', height: '12', rx: '2' }], ['path', { d: 'M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3' }]],
  generate: [['path', { d: 'm12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3ZM19 3v4m-2-2h4' }]],
  save: [['path', { d: 'M5 3h12l4 4v14H3V3h2Zm2 0v6h10V3M7 21v-8h10v8' }]],
  arrow: [['path', { d: 'M5 12h14m-5-5 5 5-5 5' }]],
  eye: [['path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }], ['circle', { cx: '12', cy: '12', r: '3' }]],
  fingerprint: [['path', { d: 'M12 11a2 2 0 0 0-2 2c0 3.1-.4 5.6-1.3 8M14 13c0 3.5-.3 6.1-.9 8M7 17c.3-1.4.3-2.7.3-4a4.7 4.7 0 0 1 9.4 0c0 2.6-.1 5.1-.6 7.5M4 15v-2a8 8 0 0 1 16 0v3M5.7 5.5a10 10 0 0 1 12.6 0M4 19l.5-1.5M20 19v-1' }]]
};
export function icon(name, size = 18) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(key, value);
  for (const [tag, attributes] of shapes[name] || shapes.key) {
    const shape = document.createElementNS(svg.namespaceURI, tag);
    for (const [key, value] of Object.entries(attributes)) shape.setAttribute(key, value);
    svg.append(shape);
  }
  return svg;
}
