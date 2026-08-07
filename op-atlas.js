/*! op-atlas — ONLY POEMS contributor atlas
 *  Draws the globe / map into #op-atlas-map on onlypoems.com/atlas.
 *
 *  The page itself carries the headline, the counters, the essay and the full
 *  poet index as real HTML, so search engines read them without running this.
 *  This file only adds the picture and the interactions.
 *
 *  Data: atlas.json, loaded from the same folder as this script unless the
 *  container carries data-atlas-src="…".
 *
 *  No dependencies. No third-party requests. Equal Earth projection
 *  (Šavrič, Patterson & Jenny 2018) for the flat map, orthographic for the globe.
 *  Coastlines: Natural Earth 1:50m via topojson/world-atlas, public domain.
 */
(function () {
  "use strict";

  var ROOT_ID = "op-atlas-map";
  var root = document.getElementById(ROOT_ID);
  if (!root) return;

  /* ------------------------------------------------ where is atlas.json */
  var here = (document.currentScript && document.currentScript.src) || "";
  var DATA = root.getAttribute("data-atlas-src") ||
             (here ? here.replace(/[^/]*$/, "atlas.json") : "atlas.json");

  /* ------------------------------------------------ styles */
  var CSS = [
    "#" + ROOT_ID + "{border:0!important;min-height:0!important;display:block!important;padding:0}",
    ".opa-bar{display:flex;gap:4px;margin:0 0 14px}",
    ".opa-bar button{appearance:none;background:#fde7ff;border:1px solid transparent;color:#4c274a;",
      "font-family:brother-1816,'Brother 1816',sans-serif;font-size:10.5px;letter-spacing:.13em;",
      "text-transform:uppercase;padding:9px 14px;cursor:pointer;transition:.18s;border-radius:11px}",
    ".opa-bar button:hover{background:#ffa8fa}",
    ".opa-bar button[aria-pressed=true]{background:#cc69c7;color:#fefcff}",
    ".opa-stage{position:relative;border:1px solid rgba(5,33,78,.14);border-radius:11px;overflow:hidden;background:#fefcff}",
    ".opa-cv{display:block;width:100%;height:auto;cursor:grab;touch-action:pan-y}",
    ".opa-cv.opa-grab{cursor:grabbing}",
    ".opa-zoom{position:absolute;right:12px;top:12px;display:flex;gap:4px}",
    ".opa-zoom button{appearance:none;width:30px;height:30px;border:1px solid #fde7ff;background:#fde7ff;",
      "color:#4c274a;border-radius:11px;cursor:pointer;font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:14px;line-height:1;transition:.16s;padding:0}",
    ".opa-zoom button:hover{background:#ffa8fa;border-color:#ffa8fa}",
    ".opa-zoom button.opa-wide{width:auto;padding:0 10px;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase}",
    ".opa-legend{position:absolute;right:14px;bottom:12px;display:flex;gap:16px;align-items:center;",
      "font-family:brother-1816,'Brother 1816',sans-serif;font-size:9.5px;letter-spacing:.14em;",
      "text-transform:uppercase;color:rgba(5,33,78,.6);pointer-events:none}",
    ".opa-legend i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#cc69c7;margin-right:6px;vertical-align:middle}",
    ".opa-legend i.opa-ring{background:transparent;border:1px solid #cc69c7}",
    ".opa-hint{position:absolute;left:14px;bottom:12px;font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(5,33,78,.3);pointer-events:none}",
    ".opa-card{position:absolute;left:14px;top:14px;width:330px;max-width:calc(100% - 28px);",
      "background:rgba(254,252,255,.94);backdrop-filter:blur(8px);border:1px solid rgba(5,33,78,.14);",
      "border-radius:11px;padding:15px 17px 17px;opacity:0;transform:translateY(-4px);",
      "transition:opacity .2s,transform .2s;pointer-events:none;color:#05214e}",
    ".opa-card.opa-on{opacity:1;transform:none}",
    ".opa-card.opa-pin{pointer-events:auto}",
    ".opa-card.opa-right{left:auto;right:14px;top:52px}",
    ".opa-card h3{font-family:brother-1816,'Brother 1816',sans-serif;margin:0;font-weight:400;font-size:18px;padding-right:20px}",
    ".opa-meta{font-family:brother-1816,'Brother 1816',sans-serif;font-size:9.5px;letter-spacing:.16em;",
      "text-transform:uppercase;color:rgba(5,33,78,.6);margin-top:7px}",
    ".opa-card ul{list-style:none;margin:12px 0 0;padding:0;max-height:200px;overflow:auto}",
    ".opa-card li{padding:6px 0;border-top:1px solid rgba(5,33,78,.14);font-size:15px;line-height:1.35}",
    ".opa-card li:first-child{border-top:0}",
    ".opa-card li i{display:block;font-size:13px;color:rgba(5,33,78,.6);font-style:italic;line-height:1.42;margin-top:3px}",
    ".opa-who{color:#05214e;text-decoration:none;border-bottom:1px solid transparent;transition:.15s}",
    ".opa-card.opa-pin .opa-who:hover{color:#cc69c7;border-bottom-color:#cc69c7}",
    ".opa-x{position:absolute;right:10px;top:9px;width:20px;height:20px;border:0;background:none;",
      "color:rgba(5,33,78,.6);cursor:pointer;font-size:15px;line-height:1;display:none;padding:0}",
    ".opa-card.opa-pin .opa-x{display:block}",
    "@media (max-width:720px){.opa-card{position:static;width:auto;max-width:none;opacity:1;transform:none;",
      "pointer-events:auto;border:0;border-top:1px solid rgba(5,33,78,.14);border-radius:0;backdrop-filter:none}",
      ".opa-card:not(.opa-on){display:none}.opa-card.opa-right{top:auto}",
      ".opa-legend,.opa-hint{display:none}}",

    /* --- the four counters double as the index, as in the original --- */
    "#" + ROOT_ID + "{scroll-margin-top:150px}",
    ".opa-ct{appearance:none;background:none;border:0;padding:6px 10px 8px;margin:0 -10px;",
      "text-align:left;border-radius:11px;cursor:pointer;transition:.16s;font:inherit;color:inherit}",
    ".opa-ct:hover{background:#fde7ff}",
    ".opa-ct:focus-visible{outline:2px solid #cc69c7;outline-offset:2px}",
    ".opa-ct[aria-expanded=true]{background:#cc69c7;color:#fefcff}",
    ".opa-ct[aria-expanded=true] .op-atlas-lab{color:#fefcff;opacity:.8}",
    ".opa-caret{font-style:normal;font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:9px;opacity:.55;margin-left:6px}",
    ".opa-panel{display:none;border-top:1px solid rgba(5,33,78,.14);",
      "border-bottom:1px solid rgba(5,33,78,.14);padding:22px 0 24px;margin:0 0 6px}",
    ".opa-panel.opa-on{display:block}",
    ".opa-cols{columns:4 180px;column-gap:30px}",
    ".opa-pitem{display:block;break-inside:avoid;padding:3px 0;font-size:15px;line-height:1.45;",
      "cursor:pointer;color:#05214e;border:0;background:none;font-family:inherit;text-align:left;",
      "width:100%;text-decoration:none;transition:color .15s}",
    ".opa-pitem:hover{color:#cc69c7}",
    ".opa-pitem u{text-decoration:none;font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:11px;color:rgba(5,33,78,.6);margin-left:6px}",
    ".opa-pgroup{break-inside:avoid;margin:0 0 18px}",
    ".opa-pgroup h5{font-family:brother-1816,'Brother 1816',sans-serif;font-size:9.5px;",
      "letter-spacing:.19em;text-transform:uppercase;color:rgba(5,33,78,.6);margin:0 0 6px;font-weight:400}",
    ".opa-pgroup h5 span{opacity:.55;margin-left:4px}",
    ".opa-phint{font-family:brother-1816,'Brother 1816',sans-serif;font-size:9.5px;letter-spacing:.14em;",
      "text-transform:uppercase;color:rgba(5,33,78,.3);margin:0 0 14px}",
    ".opa-seemore{appearance:none;border:0;background:none;padding:5px 0 0;cursor:pointer;display:block;",
      "font-family:brother-1816,'Brother 1816',sans-serif;font-size:9.5px;letter-spacing:.14em;",
      "text-transform:uppercase;color:#cc69c7;text-align:left}",
    ".opa-seemore:hover{opacity:.7}",
    /* the written-out index stays in the page for search engines and screen
       readers; the panels above are the sighted way in */
    ".opa-sr{position:absolute!important;width:1px!important;height:1px!important;",
      "overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;",
      "margin:-1px!important;padding:0!important;border:0!important}",
    "@media (max-width:720px){.opa-cols{columns:1}}"
  ].join("");

  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ------------------------------------------------ markup */
  root.innerHTML =
    '<div class="opa-bar" role="group" aria-label="Map style">' +
      '<button type="button" data-v="globe" aria-pressed="true">Globe</button>' +
      '<button type="button" data-v="flat" aria-pressed="false">Map</button>' +
    '</div>' +
    '<div class="opa-stage">' +
      '<canvas class="opa-cv" role="img" aria-label="World map of ONLY POEMS contributors. The full list of places and poets is written out below."></canvas>' +
      '<div class="opa-zoom">' +
        '<button type="button" class="opa-out" title="Zoom out">&minus;</button>' +
        '<button type="button" class="opa-in" title="Zoom in">+</button>' +
        '<button type="button" class="opa-reset opa-wide" title="Reset the view">Reset</button>' +
      '</div>' +
      '<div class="opa-card"></div>' +
      '<div class="opa-legend"><span><i></i>City</span><span><i class="opa-ring"></i>State or country</span><span>Size = people</span></div>' +
      '<div class="opa-hint">Pinch to zoom &middot; drag to turn</div>' +
    '</div>';

  var bar    = root.querySelector(".opa-bar"),
      stage  = root.querySelector(".opa-stage"),
      cv     = root.querySelector(".opa-cv"),
      card   = root.querySelector(".opa-card"),
      hint   = root.querySelector(".opa-hint"),
      ctx    = cv.getContext("2d");

  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAL = { landFill:"rgba(206,220,243,.92)", landLine:"rgba(1,83,219,.55)",
              sphere:"rgba(1,83,219,.09)", rim:"rgba(1,83,219,.32)",
              dot:"204,105,199", hot:"76,39,74", sep:"254,252,255" };

  var state = { view:"globe", hover:null, sel:null, rot:-20, tilt:12,
                spin:true, z:1, px:0, py:0, gz:1 };
  var LAND = [], ROWS = [], MAXN = 1;
  var W = 0, H = 0, DPR = 1, hits = [], dirty = true, ready = false;
  function mark(){ dirty = true; }
  function stopSpin(){ state.spin = false; }

  /* ------------------------------------------------ projections */
  var A1=1.340264, A2=-0.081106, A3=0.000893, A4=0.003796, M=Math.sqrt(3)/2;
  function rad(d){ return d*Math.PI/180; }
  function equalEarth(lon, lat){
    var lam = rad(lon), phi = rad(lat);
    var th = Math.asin(M*Math.sin(phi)), t2 = th*th, t6 = t2*t2*t2;
    var den = M*(A1 + 3*A2*t2 + t6*(7*A3 + 9*A4*t2));
    return [ lam*Math.cos(th)/den, th*(A1 + A2*t2 + t6*(A3 + A4*t2)) ];
  }
  var FIT = null;
  function fitFlat(){
    var x1=-1e9, y1=-1e9, lat, lon, p, k;
    for (lat=-90; lat<=90; lat+=1){
      for (k=0;k<3;k++){
        lon = [-180,0,180][k];
        p = equalEarth(lon,lat);
        if (Math.abs(p[0])>x1) x1=Math.abs(p[0]);
        if (Math.abs(p[1])>y1) y1=Math.abs(p[1]);
      }
    }
    FIT = { s: Math.min((W-36)/(2*x1), (H-36)/(2*y1)), ox:W/2, oy:H/2 };
  }
  function zx(bx){ return (bx - W/2)*state.z + W/2 + state.px; }
  function zy(by){ return (by - H/2)*state.z + H/2 + state.py; }
  function unzx(sx){ return (sx - W/2 - state.px)/state.z + W/2; }
  function unzy(sy){ return (sy - H/2 - state.py)/state.z + H/2; }
  function pFlat(lon,lat){
    var e = equalEarth(lon,lat);
    return [ zx(FIT.ox + e[0]*FIT.s), zy(FIT.oy - e[1]*FIT.s) ];
  }
  function globeGeom(){
    return { r: Math.min(W,H)*0.46*state.gz, cx: W/2 + state.px, cy: H/2 + state.py, lat0: state.tilt };
  }
  function pGlobe(lon, lat, g){
    var l = rad(lon - state.rot), p = rad(lat), p0 = rad(g.lat0);
    var cosc = Math.sin(p0)*Math.sin(p) + Math.cos(p0)*Math.cos(p)*Math.cos(l);
    if (cosc <= 0.02) return null;
    return [ g.cx + g.r*Math.cos(p)*Math.sin(l),
             g.cy - g.r*(Math.cos(p0)*Math.sin(p) - Math.sin(p0)*Math.cos(p)*Math.cos(l)), cosc ];
  }

  /* ------------------------------------------------ land raster, for globe dots */
  var RW = 1400, RH = 700, MASK = null;
  function buildMask(){
    var c = document.createElement("canvas"); c.width=RW; c.height=RH;
    var g = c.getContext("2d"); g.fillStyle="#fff";
    LAND.forEach(function(ring){
      g.beginPath();
      ring.forEach(function(pt,i){
        var x=(pt[0]+180)/360*RW, y=(90-pt[1])/180*RH;
        if (i) g.lineTo(x,y); else g.moveTo(x,y);
      });
      g.closePath(); g.fill();
    });
    var d = g.getImageData(0,0,RW,RH).data;
    MASK = new Uint8Array(RW*RH);
    for (var i=0;i<RW*RH;i++) MASK[i] = d[i*4] > 90 ? 1 : 0;
  }
  function isLand(lon,lat){
    var x = ((lon+180)/360*RW)|0, y = ((90-lat)/180*RH)|0;
    if (x<0||y<0||x>=RW||y>=RH) return false;
    return MASK[y*RW+x] === 1;
  }
  var sCache = null;
  function sphereDots(){
    var d = 2.4/Math.sqrt(state.gz);
    if (sCache && sCache.d === d) return sCache.pts;
    var pts = [], lat, n, i, lon;
    for (lat = -84; lat <= 84.001; lat += d){
      n = Math.max(1, Math.round(360*Math.cos(rad(lat))/d));
      for (i=0;i<n;i++){
        lon = -180 + i*360/n;
        if (isLand(lon,lat)) pts.push([lon,lat]);
      }
    }
    sCache = { d:d, pts:pts };
    return pts;
  }

  /* ------------------------------------------------ drawing */
  function dotR(n){
    var zoom = state.view === "globe" ? state.gz : state.z;
    return (2.3 + 3.6*Math.sqrt(n/MAXN)) * (1 + (zoom-1)*0.22);
  }
  function placeDot(x,y,row,i,opt){
    opt = opt || {};
    var r = dotR(row.poets.length)*(opt.scale||1);
    var on = state.hover===i || state.sel===i;
    var ring = row.precision !== "city";
    var dim = opt.dim||1;
    ctx.beginPath(); ctx.arc(x,y,r,0,6.2832);
    if (ring){
      ctx.strokeStyle = "rgba(" + (on?PAL.hot:PAL.dot) + "," + ((on?1:0.9)*dim) + ")";
      ctx.lineWidth = Math.max(1.2, r*0.32); ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(" + (on?PAL.hot:PAL.dot) + "," + ((on?1:0.92)*dim) + ")";
      ctx.fill();
      ctx.strokeStyle = "rgba(" + PAL.sep + "," + (0.55*dim) + ")";
      ctx.lineWidth = 0.7; ctx.stroke();
    }
    if (on){
      ctx.beginPath(); ctx.arc(x,y,r+3.5,0,6.2832);
      ctx.strokeStyle = "rgba(" + PAL.hot + ",.55)"; ctx.lineWidth = 1; ctx.stroke();
    }
    hits.push({ x:x, y:y, i:i, r: Math.max(r,7) });
  }
  function drawFlat(){
    ctx.lineJoin = ctx.lineCap = "round";
    LAND.forEach(function(ring){
      ctx.beginPath();
      ring.forEach(function(pt,k){
        var s = pFlat(pt[0],pt[1]);
        if (k) ctx.lineTo(s[0],s[1]); else ctx.moveTo(s[0],s[1]);
      });
      ctx.closePath();
      ctx.fillStyle = PAL.landFill; ctx.fill();
      ctx.strokeStyle = PAL.landLine; ctx.lineWidth = 0.6; ctx.stroke();
    });
    ROWS.forEach(function(row,i){ var s = pFlat(row.lon,row.lat); placeDot(s[0],s[1],row,i); });
  }
  function drawGlobe(){
    var g = globeGeom();
    var grd = ctx.createRadialGradient(g.cx,g.cy,g.r*0.2,g.cx,g.cy,g.r*1.05);
    grd.addColorStop(0, PAL.sphere); grd.addColorStop(1,"rgba(1,83,219,0)");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(g.cx,g.cy,g.r,0,6.2832); ctx.fill();
    ctx.strokeStyle = PAL.rim; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(g.cx,g.cy,g.r,0,6.2832); ctx.stroke();
    sphereDots().forEach(function(ll){
      var p = pGlobe(ll[0],ll[1],g); if (!p) return;
      ctx.fillStyle = "rgba(1,83,219," + (0.30 + 0.62*p[2]).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(p[0],p[1], (1.0 + 0.5*p[2])*Math.min(1.6,state.gz), 0, 6.2832); ctx.fill();
    });
    ROWS.forEach(function(row,i){
      var p = pGlobe(row.lon,row.lat,g); if (!p) return;
      placeDot(p[0],p[1],row,i,{ dim: 0.5 + 0.5*p[2], scale: 0.74 + 0.36*p[2] });
    });
  }
  function draw(){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    hits = [];
    if (state.view === "globe") drawGlobe(); else drawFlat();
    dirty = false;
  }
  function loop(){
    if (ready){
      var spin = state.view === "globe" && state.spin && !RM && state.sel === null && !drag.on;
      if (spin) state.rot += 0.075;
      if (spin || dirty) draw();
    }
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------ readout card */
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function cardHTML(title, meta, people){
    var li = people.slice(0,80).map(function(p){
      var nm = p.u ? '<a class="opa-who" href="' + p.u + '">' + esc(p.n) + '</a>' : esc(p.n);
      return "<li>" + nm + (p.l ? "<i>" + esc(p.l) + "</i>" : "") + "</li>";
    }).join("");
    var more = people.length>80 ? '<li style="color:rgba(5,33,78,.6)">+ ' + (people.length-80) + " more</li>" : "";
    return '<button type="button" class="opa-x" aria-label="Close">&times;</button>' +
           "<h3>" + esc(title) + '</h3><div class="opa-meta">' + esc(meta) + "</div><ul>" + li + more + "</ul>";
  }
  function showRow(i, pin){
    var r = ROWS[i], h = null, k;
    for (k=0;k<hits.length;k++) if (hits[k].i === i) { h = hits[k]; break; }
    card.classList.toggle("opa-right", !!h && h.x > W*0.52);
    var bits = [ r.poets.length + (r.poets.length===1 ? " poet" : " poets"), r.continent ];
    if (r.precision === "country") bits.push("country-level");
    else if (r.precision === "region") bits.push("state-level");
    card.innerHTML = cardHTML(r.city ? r.city + ", " + r.country : r.country, bits.join(" · "), r.poets);
    card.classList.add("opa-on");
    card.classList.toggle("opa-pin", !!pin);
    var x = card.querySelector(".opa-x");
    if (x) x.onclick = function(){ state.sel = null; card.classList.remove("opa-on","opa-pin"); mark(); };
  }
  function showGroup(title, rowsIn){
    var people = [], where = [];
    rowsIn.forEach(function(r){
      people = people.concat(r.poets);
      if (r.precision === "city") where.push(r.city);
    });
    card.classList.remove("opa-right");
    var meta = [ people.length + (people.length===1 ? " poet" : " poets") ];
    if (where.length) meta.push(where.slice(0,6).join(", ") + (where.length>6 ? "…" : ""));
    card.innerHTML = cardHTML(title, meta.join(" · "), people);
    card.classList.add("opa-on","opa-pin");
    var x = card.querySelector(".opa-x");
    if (x) x.onclick = function(){ state.sel = null; card.classList.remove("opa-on","opa-pin"); mark(); };
  }

  /* ------------------------------------------------ zoom / pan / pick */
  function clampPan(){
    if (state.view === "globe"){
      var lim = Math.min(W,H)*0.46*state.gz;
      state.px = Math.max(-lim, Math.min(lim, state.px));
      state.py = Math.max(-lim, Math.min(lim, state.py));
    } else {
      var lx = (state.z-1)*W/2 + 30, ly = (state.z-1)*H/2 + 30;
      state.px = Math.max(-lx, Math.min(lx, state.px));
      state.py = Math.max(-ly, Math.min(ly, state.py));
    }
  }
  function zoomAt(f, sx, sy){
    stopSpin();
    if (state.view === "globe"){
      state.gz = Math.max(1, Math.min(6, state.gz*f));
    } else {
      var bx = unzx(sx), by = unzy(sy);
      state.z = Math.max(1, Math.min(14, state.z*f));
      state.px = sx - W/2 - (bx - W/2)*state.z;
      state.py = sy - H/2 - (by - H/2)*state.z;
    }
    clampPan(); mark();
  }
  function resetView(){
    state.z = 1; state.gz = 1; state.px = 0; state.py = 0; state.tilt = 12;
    state.spin = true; state.sel = null;
    card.classList.remove("opa-on","opa-pin"); mark();
  }
  function local(ev){
    var b = cv.getBoundingClientRect();
    return [ (ev.clientX-b.left)*(W/b.width), (ev.clientY-b.top)*(H/b.height) ];
  }
  function pick(ev){
    var l = local(ev), best = null, bd = 1e9, k, d;
    for (k=0;k<hits.length;k++){
      d = Math.sqrt(Math.pow(hits[k].x-l[0],2) + Math.pow(hits[k].y-l[1],2));
      if (d < hits[k].r+4 && d < bd){ bd = d; best = hits[k].i; }
    }
    return best;
  }

  cv.addEventListener("wheel", function(ev){
    if (!ev.ctrlKey) return;               // plain scrolling belongs to the page
    ev.preventDefault();
    var l = local(ev);
    zoomAt(Math.exp(-ev.deltaY * 0.01), l[0], l[1]);
  }, { passive:false });

  var touches = {}, nTouch = 0, pinch = null;
  function spread(){
    var k = Object.keys(touches), a = touches[k[0]], b = touches[k[1]];
    return { d: Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2)), cx:(a.x+b.x)/2, cy:(a.y+b.y)/2 };
  }
  var drag = { on:false, x:0, y:0, moved:0 };
  cv.addEventListener("pointerdown", function(ev){
    var l = local(ev);
    if (!touches[ev.pointerId]) nTouch++;
    touches[ev.pointerId] = { x:l[0], y:l[1] };
    if (nTouch === 2){ drag.on = false; pinch = spread(); stopSpin(); return; }
    if (cv.setPointerCapture) cv.setPointerCapture(ev.pointerId);
    drag.on = true; drag.x = ev.clientX; drag.y = ev.clientY; drag.moved = 0;
    stopSpin(); cv.classList.add("opa-grab");
  });
  cv.addEventListener("pointermove", function(ev){
    if (touches[ev.pointerId]){ var l = local(ev); touches[ev.pointerId] = { x:l[0], y:l[1] }; }
    if (nTouch === 2 && pinch){
      ev.preventDefault();
      var now = spread();
      if (pinch.d > 0) zoomAt(now.d / pinch.d, now.cx, now.cy);
      pinch = now;
      return;
    }
    if (drag.on){
      var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      drag.x = ev.clientX; drag.y = ev.clientY; drag.moved += Math.abs(dx)+Math.abs(dy);
      if (state.view === "globe"){
        state.rot += dx*0.32;
        state.tilt = Math.max(-75, Math.min(75, state.tilt + dy*0.28));
      } else { state.px += dx; state.py += dy; clampPan(); }
      mark();
      return;
    }
    var i = pick(ev);
    if (i !== state.hover){
      state.hover = i;
      if (state.sel === null){
        if (i !== null) showRow(i, false); else card.classList.remove("opa-on","opa-pin");
      }
      mark();
    }
  });
  function endTouch(ev){
    if (touches[ev.pointerId]){ delete touches[ev.pointerId]; nTouch = Math.max(0, nTouch-1); }
    if (nTouch < 2) pinch = null;
  }
  cv.addEventListener("pointerup", function(ev){
    endTouch(ev);
    cv.classList.remove("opa-grab");
    var wasDrag = drag.moved > 6;
    drag.on = false;
    if (wasDrag) return;
    var i = pick(ev);
    if (i === null){ resetView(); return; }
    state.sel = (i === state.sel) ? null : i;
    if (state.sel !== null) showRow(state.sel, true);
    else card.classList.remove("opa-on","opa-pin");
    mark();
  });
  cv.addEventListener("pointercancel", function(ev){
    endTouch(ev); drag.on = false; cv.classList.remove("opa-grab");
  });
  cv.addEventListener("mouseleave", function(){
    state.hover = null;
    if (state.sel === null) card.classList.remove("opa-on","opa-pin");
    mark();
  });
  cv.addEventListener("dblclick", function(ev){ var l = local(ev); zoomAt(1.8, l[0], l[1]); });

  root.querySelector(".opa-in").onclick    = function(){ zoomAt(1.5, W/2, H/2); };
  root.querySelector(".opa-out").onclick   = function(){ zoomAt(1/1.5, W/2, H/2); };
  root.querySelector(".opa-reset").onclick = resetView;

  function atRest(){
    return state.sel === null && state.spin && state.gz === 1 && state.z === 1 &&
           !state.px && !state.py && !card.classList.contains("opa-on");
  }
  document.addEventListener("pointerdown", function(ev){
    if (root.contains(ev.target) || atRest()) return;
    resetView();
  });
  document.addEventListener("keydown", function(ev){
    if (ev.key === "Escape" && !atRest()) resetView();
  });

  bar.addEventListener("click", function(ev){
    var b = ev.target.closest ? ev.target.closest("button") : null;
    if (!b) return;
    state.view = b.getAttribute("data-v") === "globe" ? "globe" : "flat";
    state.hover = state.sel = null;
    card.classList.remove("opa-on","opa-pin");
    Array.prototype.forEach.call(bar.children, function(x){
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    hint.textContent = state.view === "globe"
      ? "Pinch to zoom · drag to turn" : "Pinch to zoom · drag to move";
    resetView(); resize();
  });

  function resize(){
    var box = stage.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio||1, 2);
    W = Math.round(box.width);
    H = Math.round(Math.max(340, Math.min(W*(state.view==="globe"?0.62:0.52), 620)));
    cv.width = W*DPR; cv.height = H*DPR; cv.style.height = H+"px";
    fitFlat(); mark();
  }
  var rt;
  window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(resize, 140); });

  /* ------------------------------------------------ counters as the index
     The four numbers above the map open a panel underneath themselves, the way
     the original did. The written-out index further down the page stays in the
     HTML — it just stops taking up the screen. */
  var SHORT = { "United States":"USA", "United Kingdom":"UK", "United Arab Emirates":"UAE" };
  function brief(c){ return SHORT[c] || c; }
  function hintLine(s){ return '<p class="opa-phint">' + esc(s) + "</p>"; }
  function tally(key){
    var t = {}, order = [];
    ROWS.forEach(function(r){
      var k = r[key];
      if (!(k in t)){ t[k] = 0; order.push(k); }
      t[k] += r.poets.length;
    });
    order.sort(function(a,b){ return t[b] - t[a] || a.localeCompare(b); });
    return { t:t, order:order };
  }
  var PANELS = {
    people: function(){
      var all = [];
      ROWS.forEach(function(r){
        var w = r.city ? r.city + ", " + brief(r.country) : brief(r.country);
        r.poets.forEach(function(p){ all.push({ n:p.n, u:p.u, w:w }); });
      });
      all.sort(function(a,b){ return a.n.localeCompare(b.n); });
      var missing = Math.max(0, published - all.length);
      return hintLine(all.length + " placed" + (missing ? " · " + missing + " still without a location" : "")) +
        '<div class="opa-cols">' + all.map(function(p){
          return '<a class="opa-pitem" href="' + p.u + '">' + esc(p.n) + "<u>" + esc(p.w) + "</u></a>";
        }).join("") + "</div>";
    },
    countries: function(){
      var q = tally("country");
      return hintLine("Click a country to open it on the map") +
        '<div class="opa-cols">' + q.order.map(function(c){
          return '<button type="button" class="opa-pitem" data-country="' + esc(c) + '">' +
                 esc(c) + "<u>" + q.t[c] + "</u></button>";
        }).join("") + "</div>";
    },
    continents: function(){
      var q = tally("continent");
      return hintLine("Click a continent to open it on the map") +
        '<div class="opa-cols">' + q.order.map(function(c){
          return '<button type="button" class="opa-pitem" data-continent="' + esc(c) + '">' +
                 esc(c) + "<u>" + q.t[c] + "</u></button>";
        }).join("") + "</div>";
    },
    cities: function(){
      var by = {};
      ROWS.forEach(function(r,i){
        if (r.precision !== "city") return;
        (by[r.continent] = by[r.continent] || []).push([r,i]);
      });
      var order = ["North America","South America","Europe","Africa","Asia","Oceania"];
      Object.keys(by).forEach(function(c){ if (order.indexOf(c) < 0) order.push(c); });
      function btn(pair){
        return '<button type="button" class="opa-pitem" data-row="' + pair[1] + '">' +
               esc(pair[0].city) + "<u>" + pair[0].poets.length + "</u></button>";
      }
      var html = order.filter(function(c){ return by[c]; }).map(function(c){
        var list = by[c].slice().sort(function(a,b){
          return b[0].poets.length - a[0].poets.length || a[0].city.localeCompare(b[0].city);
        });
        var shown = list.slice(0,10), rest = list.slice(10);
        return '<div class="opa-pgroup"><h5>' + esc(c) + " <span>" + list.length + "</span></h5>" +
          shown.map(btn).join("") +
          (rest.length
            ? '<span class="opa-rest" hidden>' + rest.map(btn).join("") + "</span>" +
              '<button type="button" class="opa-seemore" data-n="' + list.length + '">See all ' +
              list.length + " &rarr;</button>"
            : "") + "</div>";
      }).join("");
      return hintLine("Cities and towns only — state and country pins are in the country list") +
        '<div class="opa-cols">' + html + "</div>";
    }
  };

  var published = 0, panel = null;
  function keyFor(label){
    var s = (label || "").toLowerCase();
    if (s.indexOf("countr")   >= 0) return "countries";
    if (s.indexOf("continent") >= 0) return "continents";
    if (s.indexOf("cit")      >= 0) return "cities";
    if (s.indexOf("poet")     >= 0 || s.indexOf("people") >= 0) return "people";
    return null;
  }
  function bringMapIntoView(){
    if (root.scrollIntoView) root.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  }
  function buildCounters(){
    var stats = document.querySelectorAll(".op-atlas-stat");
    if (!stats.length) return;
    panel = document.createElement("div");
    panel.className = "opa-panel";
    panel.id = "op-atlas-panel";
    var host = stats[0].parentNode;
    if (host.parentNode) host.parentNode.insertBefore(panel, host.nextSibling);

    var wired = [];
    Array.prototype.forEach.call(stats, function(el){
      var lab = el.querySelector(".op-atlas-lab");
      var key = keyFor(lab ? lab.textContent : el.textContent);
      if (!key || !PANELS[key]) return;
      if (key === "people"){
        var num = el.querySelector(".op-atlas-num");
        published = parseInt((num ? num.textContent : "").replace(/[^0-9]/g,""), 10) || 0;
      }
      el.className += " opa-ct";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", "op-atlas-panel");
      el.setAttribute("data-panel", key);
      if (lab && !lab.querySelector(".opa-caret")){
        var caret = document.createElement("em");
        caret.className = "opa-caret";
        caret.textContent = "▾";
        lab.appendChild(caret);
      }
      wired.push(el);
    });
    if (!wired.length) return;

    function toggle(el){
      var open = el.getAttribute("aria-expanded") === "true";
      wired.forEach(function(x){ x.setAttribute("aria-expanded", "false"); });
      if (open){ panel.classList.remove("opa-on"); panel.innerHTML = ""; return; }
      el.setAttribute("aria-expanded", "true");
      panel.innerHTML = PANELS[el.getAttribute("data-panel")]();
      panel.classList.add("opa-on");
    }
    wired.forEach(function(el){
      el.addEventListener("click", function(){ toggle(el); });
      el.addEventListener("keydown", function(ev){
        if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar"){
          ev.preventDefault(); toggle(el);
        }
      });
    });

    panel.addEventListener("click", function(ev){
      var t = ev.target, more = t.closest && t.closest(".opa-seemore");
      if (more){
        var rest = more.parentNode.querySelector(".opa-rest");
        if (rest.hasAttribute("hidden")){ rest.removeAttribute("hidden"); more.textContent = "See fewer"; }
        else { rest.setAttribute("hidden",""); more.textContent = "See all " + more.getAttribute("data-n") + " →"; }
        return;
      }
      var b = t.closest && t.closest("button.opa-pitem");
      if (!b) return;
      var rowAttr = b.getAttribute("data-row"),
          ctry    = b.getAttribute("data-country"),
          cont    = b.getAttribute("data-continent"), rs;
      stopSpin();
      if (rowAttr !== null){
        var i = +rowAttr, r = ROWS[i];
        state.sel = i;
        if (state.view === "globe"){
          state.rot = r.lon;
          state.tilt = Math.max(-60, Math.min(60, r.lat));
        }
        mark();
        requestAnimationFrame(function(){ showRow(i, true); });
      } else if (ctry){
        rs = ROWS.filter(function(r){ return r.country === ctry; });
        if (rs.length && state.view === "globe"){
          state.rot = rs[0].lon;
          state.tilt = Math.max(-60, Math.min(60, rs[0].lat));
        }
        state.sel = null; mark(); showGroup(ctry, rs);
      } else if (cont){
        rs = ROWS.filter(function(r){ return r.continent === cont; });
        state.sel = null; mark(); showGroup(cont, rs);
      } else return;
      bringMapIntoView();
    });

    /* the map's click-away reset must not fire when the panel is in use */
    panel.addEventListener("pointerdown", function(ev){ ev.stopPropagation(); });

    /* now that the panels exist, the written-out index can step out of the way */
    var idx = document.querySelector(".op-atlas-index");
    if (idx) idx.className += " opa-sr";
  }

  /* ------------------------------------------------ go */
  function fail(msg){
    root.innerHTML = '<p style="font-family:brother-1816,sans-serif;font-size:10px;letter-spacing:.19em;' +
      'text-transform:uppercase;color:rgba(5,33,78,.4);padding:40px 0">' + msg + "</p>";
  }
  fetch(DATA, { credentials: "omit" })
    .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){
      LAND = d.land.filter(function(r){
        return r.some(function(p){ return p[1] > -56; });   // Antarctica out
      });
      ROWS = d.places;
      MAXN = Math.max.apply(null, ROWS.map(function(r){ return r.poets.length; }).concat([1]));
      buildMask();
      resize();
      ready = true;
      mark();
      try { buildCounters(); } catch (e) { /* the map still works without them */ }
    })
    .catch(function(){
      fail("The map could not load. The list of places below is complete.");
    });

  loop();
})();
