/* ===========================================================
   icons.js —— 手绘线性 SVG 图标库（全站零 emoji）
   用法：P5.icon('eye', 16) -> SVGElement
   笔画风格：24×24 网格 / stroke 1.5 / round cap / 无填充
   =========================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* 每条为该图标的内部标记（静态、由本文件作者编写，无外部输入） */
  var LIB = {
    /* ---- 身份 / 剧场 / 观众 ---- */
    theatre: '<path d="M4 6h7v7a3.5 3.5 0 0 1-7 0z"/><path d="M13 6h7v7a3.5 3.5 0 0 1-7 0z"/><path d="M6.4 9.4h.01M8.6 9.4h.01M15.4 9.4h.01M17.6 9.4h.01"/><path d="M5.8 11.6c.9.7 2.5.7 3.4 0M14.8 11.6c.9.7 2.5.7 3.4 0"/><path d="M3 20h18"/>',
    eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
    mask: '<path d="M5 5h14v6a7 7 0 0 1-14 0z"/><path d="M9 9h.01M15 9h.01"/><path d="M9.5 13c1.6 1.2 3.4 1.2 5 0"/><path d="M12 18v3"/>',
    person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5"/><path d="M16 5.4a3 3 0 0 1 0 5.6"/><path d="M17.6 14.6c2.1.6 3.4 2.2 3.4 4.4"/>',
    fingerprint: '<path d="M12 3a9 9 0 0 1 9 9"/><path d="M12 6.4a5.6 5.6 0 0 1 5.6 5.6c0 1.4-.2 2.7-.6 3.9"/><path d="M12 9.8a2.2 2.2 0 0 1 2.2 2.2c0 2.4-.5 4.6-1.4 6.6"/><path d="M8.6 12a3.4 3.4 0 0 1 .8-2.2"/><path d="M6.6 18.4c1-2 1.6-4.2 1.6-6.4"/><path d="M4 15.6c.5-1.2.8-2.4.8-3.6a7.2 7.2 0 0 1 1.6-4.5"/>',

    /* ---- 仪器 / 材质 ---- */
    mercury: '<path d="M10 4h4v9.2a4 4 0 1 1-4 0z"/><path d="M10 8h4M10 11h4"/><circle cx="12" cy="17" r="1.6"/>',
    gauge: '<circle cx="12" cy="12" r="8.4"/><path d="M12 12l3.6-3.2"/><path d="M12 4.2v1.6M19.8 12h-1.6M12 19.8v-1.6M4.2 12h1.6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8"/>',
    gears: '<circle cx="9" cy="9" r="2.4"/><circle cx="16.4" cy="16" r="2"/><path d="M9 4.4v1.8M9 11.8v1.8M4.4 9h1.8M11.8 9h1.8M6 6l1.2 1.2M10.8 10.8l1.2 1.2"/><path d="M16.4 12.6v1.2M16.4 18.2v1.2M12.8 16h1.2M18.8 16h1.2"/>',
    compass: '<circle cx="12" cy="12" r="8.4"/><path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4z"/>',
    astrolabe: '<circle cx="12" cy="12" r="8.4"/><ellipse cx="12" cy="12" rx="8.4" ry="3.4"/><path d="M12 3.6v16.8"/><path d="M6 6l12 12"/>',
    hourglass: '<path d="M7 3h10"/><path d="M7 21h10"/><path d="M8 3v3.4c0 2 4 3.6 4 5.6s-4 3.6-4 5.6V21"/><path d="M16 3v3.4c0 2-4 3.6-4 5.6s4 3.6 4 5.6V21"/>',
    valve: '<circle cx="12" cy="12" r="3.4"/><path d="M12 4v4.6M12 15.4V20M4 12h4.6M15.4 12H20"/><path d="M6.4 6.4l3.2 3.2M14.4 14.4l3.2 3.2"/>',
    pipe: '<path d="M3 8h6a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3h6"/><path d="M3 6v4M21 14v4"/>',

    /* ---- 神秘学 ---- */
    star: '<path d="M12 3.2l2.5 5.6 6.1.6-4.6 4 1.4 6-5.4-3.2-5.4 3.2 1.4-6-4.6-4 6.1-.6z"/>',
    constellation: '<path d="M5 6.5l5 3.5 4.5-3 4.5 6-6 4.5-4-3-4 1.5z"/><circle cx="5" cy="6.5" r="1.3"/><circle cx="10" cy="10" r="1.3"/><circle cx="14.5" cy="7" r="1.3"/><circle cx="19" cy="13" r="1.3"/><circle cx="13" cy="17.5" r="1.3"/><circle cx="9" cy="14.5" r="1.3"/>',
    moon: '<path d="M19 14.4A8 8 0 0 1 9.6 5 8.2 8.2 0 1 0 19 14.4z"/>',
    tarot: '<rect x="3.4" y="4" width="9" height="14" rx="1.2" transform="rotate(-8 8 11)"/><rect x="11.6" y="5.4" width="9" height="14" rx="1.2" transform="rotate(8 16 12)"/><path d="M16 10.4l.9 2 2 .2-1.5 1.4.4 2-1.8-1.1-1.8 1.1.4-2-1.5-1.4 2-.2z"/>',
    pendulum: '<path d="M12 3v8.4"/><path d="M12 3h.01"/><path d="M9.6 11.4h4.8L12 17z"/><path d="M6 20c2-1.4 10-1.4 12 0"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v5.2L5.6 17a2.6 2.6 0 0 0 2.3 4h8.2a2.6 2.6 0 0 0 2.3-4L14 8.2V3"/><path d="M7.4 14h9.2"/>',
    skull: '<path d="M12 3a7 7 0 0 0-7 7v3l1.6 1.6V18h10.8v-3.4L19 13v-3a7 7 0 0 0-7-7z"/><circle cx="9.4" cy="11" r="1.4"/><circle cx="14.6" cy="11" r="1.4"/><path d="M11 15h2"/>',
    candle: '<path d="M12 3c1.4 1.6 1.4 3-.1 3.9-1.5-.9-1.4-2.3.1-3.9z"/><rect x="8.6" y="8.4" width="6.8" height="12.2" rx="1"/><path d="M12 6.9v1.5"/>',
    wave: '<path d="M3 9c2-2.4 4-2.4 6 0s4 2.4 6 0 4-2.4 6 0"/><path d="M3 15c2-2.4 4-2.4 6 0s4 2.4 6 0 4-2.4 6 0"/>',
    mirror: '<ellipse cx="12" cy="10" rx="6.4" ry="7"/><path d="M12 17v4M8.6 21h6.8"/><path d="M9.6 6.4c-1.2 1-1.8 2.4-1.8 3.9"/>',
    door: '<path d="M5 3h14v18H5z"/><path d="M9 21V3"/><circle cx="12.4" cy="12" r="1"/>',
    lightbulb: '<path d="M9 17h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9V17h6.8v-3.1A6 6 0 0 0 12 3z"/>',
    thread: '<path d="M4 4c6 0 6 8 0 8s-6 8 0 8"/><path d="M20 4c-6 0-6 8 0 8s6 8 0 8"/>',

    /* ---- 文档 / 记忆 ---- */
    scroll: '<path d="M6 4h11a2 2 0 0 1 2 2v13a2 2 0 0 0 2-2V4"/><path d="M6 4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13"/><path d="M8 8h7M8 12h7M8 16h4"/>',
    book: '<path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H20v15.6H6.2A2.2 2.2 0 0 0 4 20.8z"/><path d="M4 5.2v15.6"/><path d="M8 7.6h7.4M8 11h7.4"/>',
    books: '<rect x="3" y="6" width="4.4" height="15" rx=".8"/><rect x="8.6" y="4" width="4.4" height="17" rx=".8"/><path d="M15.4 6.6l4 1.2-3.4 12.6-4-1.2z"/>',
    newspaper: '<path d="M3 5h13v15H4.6A1.6 1.6 0 0 1 3 18.4z"/><path d="M16 8h3.4A1.6 1.6 0 0 1 21 9.6v8.8A1.6 1.6 0 0 1 19.4 20H16z"/><path d="M5.6 8h7.8M5.6 11.4h7.8M5.6 14.8h5"/>',
    archive: '<rect x="3" y="4" width="18" height="4.4" rx=".8"/><path d="M4.6 8.4V19a1 1 0 0 0 1 1h12.8a1 1 0 0 0 1-1V8.4"/><path d="M9.6 12.4h4.8"/>',
    tree: '<path d="M6 4v14a2 2 0 0 0 2 2h3"/><path d="M6 10h5"/><circle cx="6" cy="3.4" r="1.4"/><circle cx="13" cy="10" r="1.6"/><circle cx="13" cy="20" r="1.6"/><path d="M14.6 10H19M14.6 20H19"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.4 2"/>',
    calendar: '<rect x="3.6" y="5" width="16.8" height="15.4" rx="1.6"/><path d="M3.6 9.6h16.8M8.4 3v4M15.6 3v4"/><path d="M8 13.4h2M14 13.4h2M8 17h2M14 17h2"/>',
    brain: '<path d="M9.6 4.4A3.4 3.4 0 0 0 6.4 9c-1.6.6-2.4 2-2 3.6.4 1.5-.2 2.2.4 3.4.7 1.4 2.2 1.9 3.6 1.5.5 1.4 2 2.3 3.6 1.9V4.6a3 3 0 0 0-2.4-.2z"/><path d="M14.4 4.4A3.4 3.4 0 0 1 17.6 9c1.6.6 2.4 2 2 3.6-.4 1.5.2 2.2-.4 3.4-.7 1.4-2.2 1.9-3.6 1.5-.5 1.4-2 2.3-3.6 1.9"/>',
    database: '<ellipse cx="12" cy="6" rx="7.4" ry="3"/><path d="M4.6 6v12c0 1.6 3.3 3 7.4 3s7.4-1.4 7.4-3V6"/><path d="M4.6 12c0 1.6 3.3 3 7.4 3s7.4-1.4 7.4-3"/>',
    layers: '<path d="M12 3.4l8.4 4.2-8.4 4.2L3.6 7.6z"/><path d="M3.6 12.4l8.4 4.2 8.4-4.2"/><path d="M3.6 16.8l8.4 4.2 8.4-4.2"/>',

    /* ---- 世界 ---- */
    map: '<path d="M3 6.6l6-2.6 6 2.6 6-2.6v13l-6 2.6-6-2.6-6 2.6z"/><path d="M9 4v13M15 6.6v13"/>',
    pin: '<path d="M12 21s6.4-6.2 6.4-11A6.4 6.4 0 0 0 5.6 10c0 4.8 6.4 11 6.4 11z"/><circle cx="12" cy="10" r="2.2"/>',
    crown: '<path d="M3.6 8l3.2 3.4L12 5l5.2 6.4L20.4 8l-1.4 10.6H5z"/><path d="M5 18.6h14"/>',
    shield: '<path d="M12 3l7.4 2.6v6c0 5-3.2 8.4-7.4 10.2C7.8 20 4.6 16.6 4.6 11.6v-6z"/><path d="M9.2 12l2 2 3.6-3.8"/>',
    sword: '<path d="M20 4l-9.4 9.4"/><path d="M14.6 4H20v5.4"/><path d="M9.2 12l2.8 2.8"/><path d="M4 20l4.4-4.4"/><path d="M3 17l4 4"/>',
    flag: '<path d="M5.6 3v18"/><path d="M5.6 4.6h11l-1.8 3.6 1.8 3.6h-11z"/>',
    coins: '<ellipse cx="9" cy="7" rx="5.4" ry="2.6"/><path d="M3.6 7v3.4c0 1.4 2.4 2.6 5.4 2.6s5.4-1.2 5.4-2.6V7"/><ellipse cx="15" cy="15" rx="5.4" ry="2.6"/><path d="M9.6 15v3.4c0 1.4 2.4 2.6 5.4 2.6s5.4-1.2 5.4-2.6V15"/>',
    bag: '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    board: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.4"/><path d="M9.2 3.6v16.8M14.8 3.6v16.8M3.6 9.2h16.8M3.6 14.8h16.8"/>',
    magnifier: '<circle cx="10.6" cy="10.6" r="6.4"/><path d="M15.4 15.4L21 21"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1"/>',

    /* ---- 操作 ---- */
    send: '<path d="M21 3L10.4 13.6"/><path d="M21 3l-7 18-3.6-7.4L3 10z"/>',
    feather: '<path d="M19.6 4.4a5 5 0 0 0-7 0L4 13v6.6h6.6l8.6-8.6a5 5 0 0 0 .4-6.6z"/><path d="M17 7L7 17"/><path d="M12 8.4h3.4M9 11.4h3.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M4.6 12.4l4.8 4.8L19.4 7"/>',
    chevronRight: '<path d="M9 5l7 7-7 7"/>',
    chevronDown: '<path d="M5 9l7 7 7-7"/>',
    chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
    chevronUp: '<path d="M5 15l7-7 7 7"/>',
    expand: '<path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5"/>',
    collapse: '<path d="M9 4v5H4M15 20v-5h5M15 4v5h5M9 20v-5H4"/>',
    pinIcon: '<path d="M12 17v4"/><path d="M8.4 3h7.2l-1 5.6 2.8 3.4H5.6l2.8-3.4z"/>',
    trash: '<path d="M4.6 7h14.8"/><path d="M9.6 7V4.6h4.8V7"/><path d="M6.6 7l1 13.4h8.8L17.4 7"/><path d="M10.4 11v6M13.6 11v6"/>',
    copy: '<rect x="8.6" y="8.6" width="11.8" height="11.8" rx="1.4"/><path d="M15.4 5.6H5.6a1.4 1.4 0 0 0-1.4 1.4v9.8"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14.6 4.4l4 4"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.4h-4.4"/>',
    undo: '<path d="M4 10h9.4a4.6 4.6 0 0 1 0 9.2H8"/><path d="M4 10l4-4M4 10l4 4"/>',
    redo: '<path d="M20 10h-9.4a4.6 4.6 0 0 0 0 9.2H16"/><path d="M20 10l-4-4M20 10l-4 4"/>',
    download: '<path d="M12 3.6v11.8"/><path d="M7.6 11l4.4 4.4L16.4 11"/><path d="M4 19.4h16"/>',
    upload: '<path d="M12 15.4V3.6"/><path d="M7.6 8l4.4-4.4L16.4 8"/><path d="M4 19.4h16"/>',
    save: '<path d="M5.6 4h10L20 8.4v11.6H5.6A1.6 1.6 0 0 1 4 18.4V5.6A1.6 1.6 0 0 1 5.6 4z"/><path d="M8 4v5.4h7V4"/><rect x="8" y="13" width="8" height="7"/>',
    filter: '<path d="M3.6 5h16.8l-6.6 7.8V20l-3.6-2v-5.2z"/>',
    list: '<path d="M8 6.6h12M8 12h12M8 17.4h12"/><path d="M4.2 6.6h.01M4.2 12h.01M4.2 17.4h.01"/>',
    grid: '<rect x="4" y="4" width="6.4" height="6.4" rx=".8"/><rect x="13.6" y="4" width="6.4" height="6.4" rx=".8"/><rect x="4" y="13.6" width="6.4" height="6.4" rx=".8"/><rect x="13.6" y="13.6" width="6.4" height="6.4" rx=".8"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0"/><circle cx="16" cy="7" r="1.8"/><circle cx="10" cy="12" r="1.8"/><circle cx="18" cy="17" r="1.8"/>',
    lock: '<rect x="5" y="10.6" width="14" height="10" rx="1.6"/><path d="M8.4 10.6V7.8a3.6 3.6 0 0 1 7.2 0v2.8"/><path d="M12 14.4v2.6"/>',
    unlock: '<rect x="5" y="10.6" width="14" height="10" rx="1.6"/><path d="M8.4 10.6V7.8a3.6 3.6 0 0 1 6.6-2"/>',
    key: '<circle cx="8" cy="8" r="4"/><path d="M10.9 10.9L20 20"/><path d="M16.4 16.4l2-2M18.6 18.6l2-2"/>',
    link: '<path d="M9.6 14.4l4.8-4.8"/><path d="M12.4 7.4l1.6-1.6a3.6 3.6 0 0 1 5.1 5.1l-1.6 1.6"/><path d="M11.6 16.6L10 18.2a3.6 3.6 0 0 1-5.1-5.1l1.6-1.6"/>',
    plug: '<path d="M9 3v5M15 3v5"/><path d="M6.6 8h10.8v3a5.4 5.4 0 0 1-10.8 0z"/><path d="M12 16.4V21"/>',
    signal: '<path d="M4 18v-3M9 18v-7M14 18v-11M19 18V4"/>',
    alert: '<path d="M12 3.6L21 19.4H3z"/><path d="M12 9v4.4M12 16.4h.01"/>',
    info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.4M12 7.8h.01"/>',
    image: '<rect x="3.6" y="4.6" width="16.8" height="14.8" rx="1.6"/><circle cx="8.8" cy="9.8" r="1.8"/><path d="M3.6 16.4l4.8-4.4 3.6 3.2 3.2-2.8 5.2 4.4"/>',
    camera: '<path d="M4 8h3.4L9 5.6h6L16.6 8H20a1.4 1.4 0 0 1 1.4 1.4v8.6a1.4 1.4 0 0 1-1.4 1.4H4a1.4 1.4 0 0 1-1.4-1.4V9.4A1.4 1.4 0 0 1 4 8z"/><circle cx="12" cy="13" r="3.4"/>',
    monitor: '<rect x="3" y="4.6" width="18" height="12" rx="1.4"/><path d="M8.6 20.4h6.8M12 16.6v3.8"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10.6 5.6h2.8"/><path d="M12 18h.01"/>',
    volume: '<path d="M4.6 9.6h3L12 5.6v12.8L7.6 14.4h-3z"/><path d="M15.6 9.4a3.6 3.6 0 0 1 0 5.2"/><path d="M18 7a7 7 0 0 1 0 10"/>',
    volumeOff: '<path d="M4.6 9.6h3L12 5.6v12.8L7.6 14.4h-3z"/><path d="M16 10l4 4M20 10l-4 4"/>',
    palette: '<path d="M12 3.4a8.6 8.6 0 0 0 0 17.2c1.4 0 2-1 2-2s-.8-2-.8-3 .8-1.6 2-1.6h2c2 0 3.4-1.4 3.4-3.6C20.6 6.4 16.8 3.4 12 3.4z"/><circle cx="8" cy="9" r="1.2"/><circle cx="12" cy="7.4" r="1.2"/><circle cx="15.6" cy="9.6" r="1.2"/>',
    zap: '<path d="M13.4 3L5 13.6h5l-1.4 7.4L18 10.4h-5z"/>',
    terminal: '<rect x="3" y="4.6" width="18" height="14.8" rx="1.6"/><path d="M7 10l2.4 2.4L7 14.8M12.4 15h4.4"/>',
    accessibility: '<circle cx="12" cy="4.6" r="1.8"/><path d="M5 9l7 1.4L19 9"/><path d="M12 10.4V15"/><path d="M9 20.4l3-5.4 3 5.4"/>',
    dot: '<circle cx="12" cy="12" r="3.4"/>',
    quill: '<path d="M20 4c-8 1.6-12.4 6-14 14"/><path d="M6 18l-2 2"/><path d="M14.6 4.6L20 4l-.6 5.4"/><path d="M9 15h5"/>',
    stamp: '<path d="M6 20h12"/><path d="M8.6 16.4h6.8v2H8.6z"/><path d="M9.6 16.4V13a3 3 0 0 1-1.2-2.4V7a3 3 0 0 1 3-3h1.2a3 3 0 0 1 3 3v3.6A3 3 0 0 1 14.4 13v3.4"/>',
    ledger: '<rect x="4" y="3.6" width="16" height="16.8" rx="1.4"/><path d="M8 3.6v16.8"/><path d="M11 8h6M11 12h6M11 16h4"/>',
    domain: '<path d="M3 20V10l4.4-3 4.6 3 4.6-3L21 10v10z"/><path d="M3 20h18"/><path d="M8.6 20v-4.4h6.8V20"/>',
    war: '<path d="M4 20l6-6M20 20l-6-6"/><path d="M6 4l12 12M18 4L6 16"/>',
    scale: '<path d="M12 3.6v16.8"/><path d="M6 20.4h12"/><path d="M4 8.4h16"/><path d="M4 8.4L6.6 14h-5.2z"/><path d="M20 8.4L22.6 14h-5.2z"/>',
    cards: '<rect x="3.6" y="6" width="9" height="13" rx="1.2"/><path d="M8 4.6h8.4A1.6 1.6 0 0 1 18 6.2v11"/><path d="M12.6 3.4h5.8A1.6 1.6 0 0 1 20 5v12.4"/>',
    fog: '<path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M4 13.4h16M6 17.4h12"/>',
    branch: '<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="12" r="2"/><path d="M7 7v10"/><path d="M7 12h8"/>',
    graph: '<path d="M4 19.4V4.6"/><path d="M4 19.4h16"/><path d="M7 16l3.6-5 3 2.6 4.4-7"/>',
    beaker: '<path d="M6 4h12"/><path d="M8 4v9.6a4 4 0 0 0 8 0V4"/><path d="M8 11h8"/>',
    heart: '<path d="M12 20.4C6.6 16.8 3.4 13.8 3.4 10.2A4.6 4.6 0 0 1 12 7.6a4.6 4.6 0 0 1 8.6 2.6c0 3.6-3.2 6.6-8.6 10.2z"/>',
    theatreSeat: '<path d="M5 20v-6.4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V20"/><path d="M7.6 11.6V6.4a2 2 0 0 1 2-2h4.8a2 2 0 0 1 2 2v5.2"/><path d="M3 20h18"/>',
    bell: '<path d="M9.4 19.4a2.6 2.6 0 0 0 5.2 0"/><path d="M6 16.4V11a6 6 0 0 1 12 0v5.4l1.6 2H4.4z"/>'
  };

  /* 别名 */
  LIB.settings = LIB.gear;
  LIB.spirit = LIB.wave;
  LIB.pinned = LIB.pinIcon;

  var SIZE_STROKE = function (size) {
    if (size <= 14) return 1.7;
    if (size <= 18) return 1.55;
    if (size <= 24) return 1.45;
    return 1.3;
  };

  function icon(name, size, cls) {
    var body = LIB[name] || LIB.dot;
    var s = size || 16;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(s));
    svg.setAttribute('height', String(s));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', String(SIZE_STROKE(s)));
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'icon-line' + (cls ? ' ' + cls : ''));
    svg.innerHTML = body;
    return svg;
  }

  function has(name) { return Object.prototype.hasOwnProperty.call(LIB, name); }
  function names() { return Object.keys(LIB); }

  global.P5 = global.P5 || {};
  global.P5.icon = icon;
  global.P5.iconHas = has;
  global.P5.iconNames = names;
})(window);
