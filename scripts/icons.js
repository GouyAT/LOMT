/* ============================================================
   诡秘剧场 · 原型3 — SVG 图标精灵
   全站零 emoji；线性手绘风格，viewBox 24×24，stroke 由 CSS 控制
   用法：ICONS.svg('map')  /  ICONS.use('map', 'ico ico--lg')
   ============================================================ */
(function () {
  'use strict';

  var P = {
    /* ---------- 暗房器械 ---------- */
    safelight: '<path d="M12 3v2"/><path d="M6.5 9.5 12 5l5.5 4.5v1.5H6.5z"/><path d="M8 11v3a4 4 0 0 0 8 0v-3"/><path d="M12 18v3"/><path d="M9 21h6"/>',
    tray: '<path d="M3 9h18l-1.6 9.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8z"/><path d="M6 12.5c2 1.4 4 .3 6 1.2s4 .5 6-1.2"/><path d="M7 6h10"/>',
    filmstrip: '<rect x="2.5" y="6" width="19" height="12" rx="1"/><path d="M2.5 8.6h2M2.5 11.4h2M2.5 14.2h2M2.5 17h0M19.5 8.6h2M19.5 11.4h2M19.5 14.2h2"/><rect x="7" y="9" width="4.2" height="6"/><rect x="12.8" y="9" width="4.2" height="6"/>',
    negative: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9h16M4 15h16"/><path d="M9 9 15 15M15 9 9 15"/>',
    enlarger: '<path d="M5 21V4h2"/><path d="M7 7h7a2 2 0 0 1 2 2v1"/><path d="M13 12h6l-2 4h-2z"/><path d="M15.6 16.2 12 21h9z" opacity=".9"/>',
    loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15.2 15.2 21 21"/><path d="M8.2 8.2a3.2 3.2 0 0 1 3-1.4"/>',
    clip: '<path d="M8 3.5h8v5H8z"/><path d="M9 8.5 8 20.5h3l.6-8"/><path d="M15 8.5l1 12h-3"/>',
    timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 13V9"/><path d="M12 13l3 2.4"/><path d="M9.5 2.5h5"/><path d="M18.4 6.4 19.8 5"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v5.6L5.4 17A2.4 2.4 0 0 0 7.5 20.6h9A2.4 2.4 0 0 0 18.6 17L14 8.6V3"/><path d="M7.2 15h9.6"/>',
    dropper: '<path d="M14.5 3.5 20.5 9.5"/><path d="M17.5 6.5 9 15v3l-2.4 2.4a1.6 1.6 0 0 1-2.3-2.3L6.7 16h2.6"/><path d="M12.2 12.8 15 15.6"/>',
    thermometer: '<path d="M13.5 13.6V5a1.8 1.8 0 1 0-3.6 0v8.6a4 4 0 1 0 3.6 0z"/><path d="M15.6 7h2.4M15.6 10h1.8M15.6 13h2.4"/>',
    camera: '<path d="M3.5 8.5h3l1.4-2h7.2l1.4 2h3.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/>',
    projector: '<rect x="2.5" y="8" width="12" height="9" rx="1.5"/><circle cx="8.5" cy="12.5" r="2.2"/><path d="M14.5 10.5 21.5 7v11l-7-3.5z"/><path d="M4 20h9"/>',
    plate: '<rect x="4" y="3.5" width="16" height="17" rx="1"/><path d="M7 7.5h10M7 11h6"/><path d="M6.4 18.6 17.6 6.4" opacity=".7"/>',

    /* ---------- 面板 ---------- */
    map: '<path d="M9 4 3.5 6.2v13.6L9 17.6l6 2.4 5.5-2.2V4.2L15 6.4z"/><path d="M9 4v13.6M15 6.4V20"/>',
    codex: '<path d="M4 5.4c2.6-1.3 5.3-1.3 8 0v14c-2.7-1.3-5.4-1.3-8 0z"/><path d="M12 5.4c2.7-1.3 5.4-1.3 8 0v14c-2.6-1.3-5.3-1.3-8 0z"/><path d="M12 5.4v14"/>',
    chronicle: '<path d="M6 3.5h9l4 4v13H6z"/><path d="M15 3.5v4h4"/><path d="M9 12h7M9 15.5h7M9 8.5h3"/>',
    tarot: '<rect x="3" y="5" width="9" height="14" rx="1" transform="rotate(-8 7.5 12)"/><rect x="12" y="5" width="9" height="14" rx="1" transform="rotate(8 16.5 12)"/><path d="M16.4 10.6l.8 1.9 1.9.2-1.5 1.3.5 2-1.7-1.1-1.8 1 .5-2-1.4-1.4 2-.1z"/>',
    newspaper: '<path d="M3 6h13.5v14H4.4A1.4 1.4 0 0 1 3 18.6z"/><path d="M16.5 9H21v9.6A1.4 1.4 0 0 1 19.6 20h-3.1z"/><path d="M5.5 9h8M5.5 12h8M5.5 15h5"/>',
    relations: '<circle cx="12" cy="5.5" r="2.4"/><circle cx="5" cy="17" r="2.4"/><circle cx="19" cy="17" r="2.4"/><path d="M10.4 7.6 6.6 14.9M13.6 7.6l3.8 7.3M7.4 17h9.2"/>',
    board: '<rect x="3.5" y="3.5" width="17" height="17" rx="1"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/><circle cx="6.3" cy="6.3" r="1.2"/><circle cx="17.7" cy="17.7" r="1.2"/>',
    domain: '<path d="M3.5 20.5V10L12 4l8.5 6v10.5z"/><path d="M9.5 20.5v-6h5v6"/><path d="M6.5 12.5h2M15.5 12.5h2"/>',
    casefile: '<path d="M4 6.5a1.5 1.5 0 0 1 1.5-1.5H9l1.6 2h7.9A1.5 1.5 0 0 1 20 8.5v9.6a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 18.1z"/><circle cx="11.6" cy="13" r="2.6"/><path d="M13.6 15 16 17.4"/>',
    gate: '<path d="M12 2.6l2.3 5 5.4.6-4 3.7 1.1 5.4-4.8-2.7-4.8 2.7L8.3 11.9l-4-3.7 5.4-.6z"/><path d="M8 21h8"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.4"/><path d="M3.4 6.6 12 13l8.6-6.4"/><path d="M3.6 17.6 9.4 12M20.4 17.6 14.6 12"/>',
    trade: '<path d="M3.5 8.5h13L13 5"/><path d="M20.5 15.5h-13L11 19"/>',
    theatre: '<path d="M4 20V9.5C4 6 7.6 3.5 12 3.5S20 6 20 9.5V20"/><path d="M4 12h16"/><path d="M8.5 20v-5.5M15.5 20v-5.5"/><path d="M2.5 20h19"/>',
    sequence: '<path d="M12 2.8 19.5 7v10L12 21.2 4.5 17V7z"/><path d="M12 7.4 16 9.7v4.6L12 16.6 8 14.3V9.7z"/><circle cx="12" cy="12" r="1.4"/>',
    bag: '<path d="M4.6 8.5h14.8l-1.2 11a1.4 1.4 0 0 1-1.4 1.2H7.2a1.4 1.4 0 0 1-1.4-1.2z"/><path d="M8.6 8.5V6.2a3.4 3.4 0 0 1 6.8 0v2.3"/>',
    archive: '<path d="M12 3v3.5"/><circle cx="12" cy="8" r="1.6"/><path d="M12 9.6V13M12 13H6.5v2.4M12 13h5.5v2.4"/><rect x="4.5" y="15.6" width="4" height="4" rx="1"/><rect x="15.5" y="15.6" width="4" height="4" rx="1"/><rect x="10" y="15.6" width="4" height="4" rx="1"/><path d="M12 13v2.6"/>',
    worldbook: '<path d="M5 4.5h11.5A1.5 1.5 0 0 1 18 6v13.5H6.5A1.5 1.5 0 0 1 5 18z"/><path d="M18 8h1.5v11.5H6.5"/><path d="M8 8h6M8 11.2h6M8 14.4h4"/>',
    preset: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8.5" cy="6" r="1.9"/><circle cx="15" cy="12" r="1.9"/><circle cx="7" cy="18" r="1.9"/>',
    api: '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><circle cx="18.5" cy="12" r="2.5"/><path d="M8.4 7.6c3 1.2 5.2 2.2 7.8 3.6M8.4 16.4c3-1.2 5.2-2.2 7.8-3.6"/>',
    variable: '<path d="M9 4.5C6.6 6.6 5.4 9.2 5.4 12s1.2 5.4 3.6 7.5"/><path d="M15 4.5c2.4 2.1 3.6 4.7 3.6 7.5s-1.2 5.4-3.6 7.5"/><path d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"/>',
    distill: '<path d="M7 3.5h10"/><path d="M8.5 3.5v4.2L12 12l3.5-4.3V3.5"/><path d="M12 12v4"/><path d="M9 20.5h6"/><path d="M10.4 16h3.2l.8 4.5h-4.8z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M4.7 7.4l2.2 1.3M17.1 15.3l2.2 1.3M4.7 16.6l2.2-1.3M17.1 8.7l2.2-1.3"/>',
    dlc: '<path d="M12 3 20.5 7.5v9L12 21 3.5 16.5v-9z"/><path d="M3.8 7.7 12 12l8.2-4.3M12 12v9"/>',
    skin: '<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.6 0 2.4-1 2.4-2.2 0-1.6-1.6-2-1.6-3.2 0-1 .8-1.6 2-1.6h1.4A4.3 4.3 0 0 0 20.5 9c0-3.2-3.6-5.5-8.5-5.5z"/><circle cx="8.4" cy="9.2" r="1.1"/><circle cx="12" cy="7.4" r="1.1"/><circle cx="15.6" cy="9.4" r="1.1"/>',
    context: '<rect x="3.5" y="4" width="17" height="6" rx="1"/><rect x="3.5" y="14" width="17" height="6" rx="1"/><path d="M7 12h10"/><path d="M12 10.4v3.2"/>',

    /* ---------- 世界 / 玩法 ---------- */
    location: '<path d="M12 21c4-4.6 6-8 6-10.6A6 6 0 0 0 6 10.4C6 13 8 16.4 12 21z"/><circle cx="12" cy="10.2" r="2.3"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.2 2.2"/>',
    calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="1.4"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/><path d="M7.5 13.6h2M11 13.6h2M14.5 13.6h2M7.5 17h2M11 17h2"/>',
    user: '<circle cx="12" cy="8.2" r="3.6"/><path d="M4.8 20.5c.6-3.9 3.5-6 7.2-6s6.6 2.1 7.2 6"/>',
    users: '<circle cx="9.2" cy="8.4" r="3.2"/><path d="M3 20c.5-3.4 3-5.3 6.2-5.3S15 16.6 15.5 20"/><path d="M15.6 6.2a3.2 3.2 0 0 1 0 6.2"/><path d="M17.4 14.9c2 .7 3.2 2.4 3.5 5.1"/>',
    heart: '<path d="M12 20.2 5.4 13.8a4.3 4.3 0 0 1 6.6-5.4 4.3 4.3 0 0 1 6.6 5.4z"/>',
    sword: '<path d="M19.5 3.5 11 12l1.5 1.5L21 5z"/><path d="M9.5 13.5 4 19l1 1 5.5-5.5"/><path d="M8.4 12.4l3.2 3.2"/><path d="M4.8 16.2 7.8 19.2"/>',
    shield: '<path d="M12 3.2 5 6v5.4c0 4 2.8 7.4 7 9.4 4.2-2 7-5.4 7-9.4V6z"/><path d="M9.4 12.2 11.4 14.4 15 10.4"/>',
    spark: '<path d="M12 3v4.2M12 16.8V21M3 12h4.2M16.8 12H21"/><path d="M6.4 6.4l2.9 2.9M14.7 14.7l2.9 2.9M6.4 17.6l2.9-2.9M14.7 9.3l2.9-2.9"/><circle cx="12" cy="12" r="2.2"/>',
    flame: '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.4-4.6-6.2-4-12.4-3.2 1.6-5 5-5 7.6 0 1.4.6 2.4.6 2.4S8 12 7 13.4A5.6 5.6 0 0 0 6 15.4C6 18.6 8.4 21 12 21z"/>',
    drop: '<path d="M12 3.2C9 7 6.6 10 6.6 13.4A5.4 5.4 0 0 0 17.4 13.4C17.4 10 15 7 12 3.2z"/><path d="M9.6 14.6a2.6 2.6 0 0 0 2.4 2.4"/>',
    moon: '<path d="M19 14.6A8 8 0 0 1 9.4 5a8.2 8.2 0 1 0 9.6 9.6z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7"/>',
    eyeMystic: '<path d="M2.6 12S6.4 6 12 6s9.4 6 9.4 6-3.8 6-9.4 6-9.4-6-9.4-6z"/><circle cx="12" cy="12" r="3"/><path d="M12 6V3.4M8 6.8 6.8 4.4M16 6.8 17.2 4.4"/>',
    key: '<circle cx="8" cy="8" r="4"/><path d="M10.9 10.9 20 20"/><path d="M17 17l2-2M14.4 14.4l2-2"/>',
    scroll: '<path d="M6 4.5h10.5c1 0 1.5.7 1.5 1.6v11.8c0 1-.6 1.6-1.5 1.6H6"/><path d="M6 4.5c-1 0-1.6.7-1.6 1.6S5 7.7 6 7.7"/><path d="M6 19.5c-1 0-1.6-.7-1.6-1.6s.6-1.6 1.6-1.6"/><path d="M9 9.5h6M9 12.5h6M9 15.5h4"/>',
    feather: '<path d="M20 4c-4 0-8.4 2-11 4.6-2.2 2.2-2.6 5-2.6 7.4L4 18.4"/><path d="M20 4c0 4-2 8.4-4.6 11-1.6 1.6-3.6 2.2-5.4 2.4"/><path d="M8.6 12h5M10.6 9h4.6"/>',
    coin: '<ellipse cx="12" cy="7.6" rx="7" ry="3.2"/><path d="M5 7.6v8.8c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V7.6"/><path d="M5 12c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2"/>',
    cube: '<path d="M12 2.8 20.4 7v10L12 21.2 3.6 17V7z"/><path d="M3.9 7.2 12 11.6l8.1-4.4M12 11.6v9.6"/>',
    layers: '<path d="M12 3 3.6 7.2 12 11.4l8.4-4.2z"/><path d="M3.6 12 12 16.2 20.4 12"/><path d="M3.6 16.6 12 20.8l8.4-4.2"/>',
    grid: '<rect x="3.6" y="3.6" width="7" height="7" rx="1"/><rect x="13.4" y="3.6" width="7" height="7" rx="1"/><rect x="3.6" y="13.4" width="7" height="7" rx="1"/><rect x="13.4" y="13.4" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4.4" cy="6.5" r="1.2"/><circle cx="4.4" cy="12" r="1.2"/><circle cx="4.4" cy="17.5" r="1.2"/>',
    sliders: '<path d="M4 7.5h5M13 7.5h7M4 16.5h9M17 16.5h3"/><circle cx="11" cy="7.5" r="2.1"/><circle cx="15" cy="16.5" r="2.1"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M7.5 16.5v-5M11.5 16.5v-9M15.5 16.5v-6.4M19 16.5v-3"/>',
    star: '<path d="M12 3.4l2.6 5.5 6 .8-4.4 4.2 1.1 5.9L12 17l-5.3 2.8 1.1-5.9L3.4 9.7l6-.8z"/>',
    pinIcon: '<path d="M12 21v-7"/><path d="M8 4h8l-1 6.2 2.4 2.2H6.6L9 10.2z"/>',
    bookmark: '<path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/>',
    bell: '<path d="M18 16.5V11a6 6 0 1 0-12 0v5.5L4.4 18.6h15.2z"/><path d="M9.6 18.6a2.4 2.4 0 0 0 4.8 0"/>',
    link: '<path d="M10.4 13.6 13.6 10.4"/><path d="M9 15.4l-1.6 1.6a3.2 3.2 0 0 1-4.5-4.5L4.5 11"/><path d="M15 8.6l1.6-1.6a3.2 3.2 0 0 1 4.5 4.5L19.5 13"/>',
    external: '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 12 12"/><path d="M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10"/>',

    /* ---------- 通用控件 ---------- */
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
    chevronL: '<path d="M14.5 5 8 12l6.5 7"/>',
    chevronR: '<path d="M9.5 5 16 12l-6.5 7"/>',
    chevronU: '<path d="M5 14.5 12 8l7 6.5"/>',
    chevronD: '<path d="M5 9.5 12 16l7-6.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrowR: '<path d="M4 12h15"/><path d="M13.4 6.4 19.6 12l-6.2 5.6"/>',
    arrowL: '<path d="M20 12H5"/><path d="M10.6 6.4 4.4 12l6.2 5.6"/>',
    more: '<circle cx="5.4" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.6" cy="12" r="1.4"/>',
    search: '<circle cx="11" cy="11" r="6.4"/><path d="M15.6 15.6 20.5 20.5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 4v4h-4"/>',
    download: '<path d="M12 3.5v11"/><path d="M7.6 10.4 12 14.8l4.4-4.4"/><path d="M4.5 19.5h15"/>',
    upload: '<path d="M12 20.5V9.5"/><path d="M7.6 13.6 12 9.2l4.4 4.4"/><path d="M4.5 4.5h15"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.4"/><path d="M15.5 5.5H6a1.5 1.5 0 0 0-1.5 1.5v9.5"/>',
    trash: '<path d="M4.5 7h15"/><path d="M9.5 4.5h5"/><path d="M6.5 7 7.6 20a1 1 0 0 0 1 .9h6.8a1 1 0 0 0 1-.9L17.5 7"/><path d="M10.4 10.6v6.6M13.6 10.6v6.6"/>',
    edit: '<path d="M17 3.6 20.4 7 9.6 17.8 5 19l1.2-4.6z"/><path d="M14.6 6 18 9.4"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.6"/><path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5"/><path d="M12 14v3"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="10" rx="1.6"/><path d="M8.4 10.5V8a3.6 3.6 0 0 1 6.9-1.3"/>',
    eye: '<path d="M2.6 12S6.4 6.4 12 6.4 21.4 12 21.4 12 17.6 17.6 12 17.6 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M9.4 9.6A2.8 2.8 0 0 0 12 14.8"/><path d="M6.4 6.9C4.2 8.4 2.6 12 2.6 12s3.8 5.6 9.4 5.6a9 9 0 0 0 3.6-.8"/><path d="M17.8 15.1c2-1.5 3.6-3.1 3.6-3.1S17.6 6.4 12 6.4c-.6 0-1.2 0-1.7.2"/>',
    warning: '<path d="M12 3.6 21.4 20H2.6z"/><path d="M12 9.6v5"/><circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v6"/><circle cx="12" cy="7.9" r=".9" fill="currentColor" stroke="none"/>',
    question: '<circle cx="12" cy="12" r="8.6"/><path d="M9.4 9.4a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1 .9-1 1.7"/><circle cx="12" cy="16.5" r=".9" fill="currentColor" stroke="none"/>',
    play: '<path d="M7.5 4.8 19 12 7.5 19.2z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    skip: '<path d="M6 5.2 15 12 6 18.8z"/><path d="M18 5v14"/>',
    undo: '<path d="M4 10h9.4a5 5 0 0 1 0 10H8"/><path d="M7.6 6 3.6 10l4 4"/>',
    redo: '<path d="M20 10h-9.4a5 5 0 0 0 0 10H16"/><path d="M16.4 6l4 4-4 4"/>',
    save: '<path d="M5 4.5h11L19.5 8v11.5H5z"/><path d="M8.5 4.5v5h7v-5"/><rect x="8.5" y="13" width="7" height="6.5"/>',
    folder: '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l1.6 2H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
    file: '<path d="M6 3.5h8l4.5 4.5v12.5H6z"/><path d="M14 3.5V8h4.5"/>',
    send: '<path d="M3.6 12 20.8 4.4 14.6 20.6 12 13.4z"/><path d="M12 13.4 20.8 4.4"/>',
    volume: '<path d="M4.5 9.5h3l4-3.4v11.8l-4-3.4h-3z"/><path d="M15 9.4a3.6 3.6 0 0 1 0 5.2"/><path d="M17.4 7a7 7 0 0 1 0 10"/>',
    volumeOff: '<path d="M4.5 9.5h3l4-3.4v11.8l-4-3.4h-3z"/><path d="M15.4 10 20 14.6M20 10l-4.6 4.6"/>',
    expand: '<path d="M9 4.5H4.5V9M15 4.5h4.5V9M9 19.5H4.5V15M15 19.5h4.5V15"/>',
    collapse: '<path d="M4.5 9H9V4.5M19.5 9H15V4.5M4.5 15H9v4.5M19.5 15H15v4.5"/>',
    device: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10.4 5.6h3.2"/><path d="M10.8 18.4h2.4"/>',
    desktop: '<rect x="2.8" y="4.5" width="18.4" height="11.6" rx="1.4"/><path d="M8.5 19.5h7"/><path d="M12 16.1v3.4"/>',
    fog: '<path d="M3.5 9.5h11M16.5 9.5h4"/><path d="M4.5 13h6M12.5 13h7"/><path d="M6.5 16.5h9M17.5 16.5h2"/>',
    tag: '<path d="M12.6 3.6H20V11l-8.6 8.6a1.4 1.4 0 0 1-2 0L3.9 13.6a1.4 1.4 0 0 1 0-2z"/><circle cx="16.4" cy="7.2" r="1.3"/>',
    hash: '<path d="M9.4 4 7.6 20M16.4 4l-1.8 16M4.5 9h15M3.8 15h15"/>',
    filter: '<path d="M3.5 5.5h17l-6.4 7.6v6.4l-4.2-2.4v-4z"/>',
    sort: '<path d="M7 4.5v15M7 19.5 4 16.5M7 19.5l3-3"/><path d="M14 7.5h6M14 12h5M14 16.5h4"/>',
    globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2"/><path d="M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.3-3.6-8.6S9.6 5.8 12 3.4z"/>',
    branch: '<circle cx="6.5" cy="5.5" r="2.2"/><circle cx="6.5" cy="18.5" r="2.2"/><circle cx="17.5" cy="9.5" r="2.2"/><path d="M6.5 7.7v8.6"/><path d="M8.6 6.4h5a2.4 2.4 0 0 1 2.4 2.4v.2"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/>',
    compass: '<circle cx="12" cy="12" r="8.6"/><path d="M14.9 9.1 13.2 13.2 9.1 14.9 10.8 10.8z"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="2.4"/><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    scale: '<path d="M12 4v16"/><path d="M6 8h12"/><path d="M6 8 3.4 14h5.2z"/><path d="M18 8l-2.6 6h5.2z"/><path d="M8.5 20h7"/>',
    hourglass: '<path d="M7 3.5h10"/><path d="M7 20.5h10"/><path d="M8 3.5v3.6L12 11l-4 3.9v5.6"/><path d="M16 3.5v3.6L12 11l4 3.9v5.6"/>',
    quill: '<path d="M4 20l3.4-1.4"/><path d="M7.4 18.6 18.6 7.4a2.4 2.4 0 0 0-3.4-3.4L4 15.2z"/><path d="M13.6 6.4 17.6 10.4"/>',
    stamp: '<path d="M4.5 19.5h15"/><path d="M6.5 16.5h11v-1.6a1.4 1.4 0 0 0-1.4-1.4h-8.2a1.4 1.4 0 0 0-1.4 1.4z"/><path d="M10 13.5V9.6a2 2 0 0 1 4 0v3.9"/>',
    crown: '<path d="M4 18.5h16"/><path d="M4.5 15.5 3 7l4.8 3.4L12 5l4.2 5.4L21 7l-1.5 8.5z"/>',
    ledger: '<rect x="4" y="3.5" width="16" height="17" rx="1.4"/><path d="M8 3.5v17"/><path d="M11 8h6M11 12h6M11 16h4"/>',
    puzzle: '<path d="M9.5 4.5h5v2a1.8 1.8 0 1 0 3.6 0v-2h1.4v5h-2a1.8 1.8 0 1 0 0 3.6h2v5h-5v-2a1.8 1.8 0 1 0-3.6 0v2h-5v-5h2a1.8 1.8 0 1 0 0-3.6h-2v-5h1.6"/>',
    rss: '<path d="M5 18.6a1.4 1.4 0 1 0 0 .1"/><path d="M4.5 10.5A9 9 0 0 1 13.5 19.5"/><path d="M4.5 5.5A14 14 0 0 1 18.5 19.5"/>'
  };

  var order = Object.keys(P);

  function sprite() {
    var out = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">';
    for (var i = 0; i < order.length; i++) {
      var k = order[i];
      out += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + P[k] + '</symbol>';
    }
    return out + '</svg>';
  }

  function use(name, cls) {
    var n = P[name] ? name : 'info';
    return '<svg class="' + (cls || 'ico') + '" aria-hidden="true" focusable="false"><use href="#i-' + n + '"/></svg>';
  }

  /* 直接构造 DOM 节点（避免 innerHTML 时 use 命名空间问题） */
  function node(name, cls) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', cls || 'ico');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var u = document.createElementNS(NS, 'use');
    var n = P[name] ? name : 'info';
    u.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#i-' + n);
    u.setAttribute('href', '#i-' + n);
    svg.appendChild(u);
    return svg;
  }

  function mount() {
    var host = document.createElement('div');
    host.id = 'p3-sprite';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = sprite();
    document.body.insertBefore(host, document.body.firstChild);
  }

  window.ICONS = { paths: P, names: order, svg: use, use: use, node: node, mount: mount, has: function (n) { return !!P[n]; } };
})();
