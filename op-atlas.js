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
    ".opa-bar{display:flex;gap:4px;margin:0 0 14px;justify-content:center}",
    ".opa-bar button{appearance:none;background:#fde7ff;border:1px solid transparent;color:#4c274a;",
      "font-family:brother-1816,'Brother 1816',sans-serif;font-size:11px;letter-spacing:.11em;",
      "text-transform:uppercase;padding:9px 15px;cursor:pointer;transition:.18s;border-radius:11px}",
    /* One family, two values. Every button on the picture rests on the pale
       pink with plum type; hovering draws a plum hairline — the chosen colour
       arriving early rather than a new colour arriving at all — and the chosen
       one inverts. That retires #ffa8fa, and drops #cc69c7 back to what it is
       good at: the dots. Both states read at 10.64:1 where the old chosen
       fill managed 4.8:1. */
    ".opa-bar button:hover{border-color:#4c274a}",
    ".opa-bar button[aria-pressed=true]{background:#4c274a;color:#fde7ff;border-color:#4c274a}",
    ".opa-stage{position:relative;border:1px solid rgba(5,33,78,.14);border-radius:11px;overflow:hidden;background:#fefcff}",
    /* touch-action:none, not pan-y. pan-y hands every touch to the browser —
       including the second finger — so on a phone the pinch never arrived and
       a drag scrolled the page instead of turning the globe. The picture is
       kept short enough on a phone (see resize) that there is page either
       side of it to scroll by. */
    ".opa-cv{display:block;width:100%;height:auto;cursor:grab;touch-action:none}",
    ".opa-cv.opa-grab{cursor:grabbing}",
    ".opa-zoom{position:absolute;right:12px;top:12px;display:flex;gap:4px}",
    ".opa-zoom button{appearance:none;width:30px;height:30px;border:1px solid transparent;background:#fde7ff;",
      "color:#4c274a;border-radius:11px;cursor:pointer;font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:14px;line-height:1;transition:.16s;padding:0}",
    ".opa-zoom button:hover{border-color:#4c274a}",
    ".opa-zoom button.opa-wide{width:auto;padding:0 11px;font-size:11px;letter-spacing:.1em;text-transform:uppercase}",
    /* A thumb is not a cursor. These are the guaranteed way to zoom, so on a
       touch screen they get a target somebody can actually hit. */
    "@media (pointer:coarse){.opa-zoom{right:10px;top:10px;gap:6px}",
      ".opa-zoom button{width:40px;height:40px;font-size:16px}",
      ".opa-zoom button.opa-wide{width:auto;padding:0 14px}}",
    /* On a phone all three buttons in one cluster lie across the top of the
       globe. Split them into the two corners the sphere cannot reach: minus
       and plus top right, Reset bottom right. display:contents drops the
       wrapper's box so each button positions against the stage instead of
       against the cluster. 720px is where the legend goes, so the bottom
       right is free. The minus inset is the plus's, plus a button, plus the
       gap — and a button is 40px to a thumb, 30px to a cursor. */
    "@media (max-width:720px){.opa-zoom{display:contents}",
      ".opa-zoom .opa-out{position:absolute;top:10px;right:56px}",
      ".opa-zoom .opa-in{position:absolute;top:10px;right:10px}",
      ".opa-zoom .opa-reset{position:absolute;bottom:10px;right:10px}}",
    "@media (max-width:720px) and (pointer:fine){.opa-zoom .opa-out{right:46px}}",
    ".opa-card{position:absolute;left:14px;top:14px;width:330px;max-width:calc(100% - 28px);",
      "background:rgba(254,252,255,.94);backdrop-filter:blur(8px);border:1px solid rgba(5,33,78,.14);",
      "border-radius:11px;padding:15px 17px 17px;opacity:0;transform:translateY(-4px);",
      "transition:opacity .2s,transform .2s;pointer-events:none;color:#05214e}",
    ".opa-card.opa-on{opacity:1;transform:none}",
    ".opa-card.opa-pin{pointer-events:auto}",
    ".opa-card.opa-right{left:auto;right:14px;top:52px}",
    ".opa-card h3{font-family:brother-1816,'Brother 1816',sans-serif;margin:0;font-weight:400;font-size:18px;padding-right:20px}",
    ".opa-meta{font-family:brother-1816,'Brother 1816',sans-serif;font-size:11px;letter-spacing:.1em;",
      "text-transform:uppercase;color:rgba(5,33,78,.68);margin-top:7px}",
    /* The list used to stop at a flat 200px, which on a place like New York
       showed three names out of ten with no sign the other seven existed —
       macOS hides an overlay scrollbar until you already know to scroll.
       So: as tall as the picture allows, and a scrollbar that is always
       there when there is more to read. */
    ".opa-card ul{list-style:none;margin:12px 0 0;padding:0 5px 0 0;",
      "max-height:var(--opa-list,260px);overflow:auto;overscroll-behavior:contain;",
      "scrollbar-width:thin;scrollbar-color:rgba(5,33,78,.3) transparent}",
    ".opa-card ul::-webkit-scrollbar{width:7px}",
    ".opa-card ul::-webkit-scrollbar-track{background:transparent}",
    ".opa-card ul::-webkit-scrollbar-thumb{background:rgba(5,33,78,.3);border-radius:4px}",
    ".opa-card ul::-webkit-scrollbar-thumb:hover{background:rgba(5,33,78,.48)}",
    ".opa-card li{padding:6px 0;border-top:1px solid rgba(5,33,78,.14);font-size:15px;line-height:1.35}",
    ".opa-card li:first-child{border-top:0}",
    ".opa-card li i{display:block;font-size:13.5px;color:rgba(5,33,78,.68);font-style:italic;line-height:1.45;margin-top:3px}",
    ".opa-who{color:#05214e;text-decoration:none;border-bottom:1px solid transparent;transition:.15s}",
    ".opa-card.opa-pin .opa-who:hover{color:#cc69c7;border-bottom-color:#cc69c7}",
    ".opa-x{position:absolute;right:10px;top:9px;width:20px;height:20px;border:0;background:none;",
      "color:rgba(5,33,78,.68);cursor:pointer;font-size:16px;line-height:1;display:none;padding:0}",
    ".opa-card.opa-pin .opa-x{display:block}",
    /* Colours inherit from the card so this needs no dark-mode counterpart. */
    ".opa-scroll-note{display:block;width:100%;margin:9px 0 0;padding:7px 0 0;",
      "border:0;border-top:1px solid currentColor;background:none;color:inherit;opacity:.62;",
      "font-family:brother-1816,'Brother 1816',sans-serif;font-size:11px;letter-spacing:.1em;",
      "text-transform:uppercase;text-align:left;cursor:pointer}",
    ".opa-scroll-note:hover{color:#cc69c7;opacity:1}",
    ".opa-scroll-note[hidden]{display:none}",
    "@media (max-width:720px){.opa-card{position:static;width:auto;max-width:none;opacity:1;transform:none;",
      "pointer-events:auto;border:0;border-top:1px solid rgba(5,33,78,.14);border-radius:0;backdrop-filter:none}",
      ".opa-card:not(.opa-on){display:none}.opa-card.opa-right{top:auto}",
      /* Below the picture the card is part of the page, so let the list run
         its full length and be scrolled by the page. A scrolling box inside
         a scrolling page is a trap on a phone. */
      ".opa-card ul{max-height:none;overflow:visible;padding-right:0}}",

    /* --- the four counters double as the index, as in the original --- */
    "#" + ROOT_ID + "{scroll-margin-top:150px}",
    /* No text-align here. This class lands on the page's own .op-atlas-stat,
       which is centred, and a button reset saying left would win the tie on
       load order alone — invisibly, and only on the live page, never in the
       Designer, which does not run this file. */
    ".opa-ct{appearance:none;background:none;border:0;padding:6px 10px 8px;margin:0 -10px;",
      "border-radius:11px;cursor:pointer;transition:.16s;font:inherit;color:inherit}",
    ".opa-ct:hover{background:#fde7ff}",
    ".opa-ct:focus-visible{outline:2px solid #cc69c7;outline-offset:2px}",
    /* Open, a figure inverts the same way a chosen tab does — plum fill,
       pale type, 10.64:1. The label takes it by inheritance rather than
       being dimmed on top. */
    ".opa-ct[aria-expanded=true]{background:#4c274a;color:#fde7ff}",
    /* The label carries its own colour on the page, so it does not inherit
       the line above — and it used to be dimmed to 80% on top of that, which
       dropped it to 3.1:1. Stated, at full strength: 10.64:1. */
    ".opa-ct[aria-expanded=true] .op-atlas-lab{color:#fde7ff;opacity:1}",
    /* The caret is the only thing saying a figure opens. Inside the label's
       line it pushed the word off the centre of the number above it, so it
       sits under the word on a line of its own, where it costs no width and
       shares the same axis. line-height 1 keeps it from growing the box on
       load. It turns over when the panel is open. */
    ".opa-caret{display:block;font-style:normal;color:inherit;",
      "font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:10px;line-height:1;margin:2px 0 0;transition:transform .18s ease}",
    ".opa-ct[aria-expanded=true] .opa-caret{transform:rotate(180deg)}",
    "@media (prefers-reduced-motion:reduce){.opa-caret{transition:none}}",
    ".opa-panel{display:none;border-top:1px solid rgba(5,33,78,.14);",
      "border-bottom:1px solid rgba(5,33,78,.14);padding:22px 0 24px;margin:0 0 6px}",
    ".opa-panel.opa-on{display:block}",
    ".opa-cols{columns:4 180px;column-gap:30px}",
    ".opa-pitem{display:block;break-inside:avoid;padding:3px 0;font-size:15px;line-height:1.45;",
      "cursor:pointer;color:#05214e;border:0;background:none;font-family:inherit;text-align:left;",
      "width:100%;text-decoration:none;transition:color .15s}",
    ".opa-pitem:hover{color:#cc69c7}",
    ".opa-pitem u{text-decoration:none;font-family:brother-1816,'Brother 1816',sans-serif;",
      "font-size:11.5px;color:rgba(5,33,78,.68);margin-left:6px}",
    ".opa-pgroup{break-inside:avoid;margin:0 0 18px}",
    ".opa-pgroup h5{font-family:brother-1816,'Brother 1816',sans-serif;font-size:11px;",
      "letter-spacing:.14em;text-transform:uppercase;color:rgba(5,33,78,.68);margin:0 0 8px;font-weight:400}",
    ".opa-pgroup h5 span{opacity:.55;margin-left:4px}",
    ".opa-seemore{appearance:none;border:0;background:none;padding:5px 0 0;cursor:pointer;display:block;",
      "font-family:brother-1816,'Brother 1816',sans-serif;font-size:11px;letter-spacing:.1em;",
      "text-transform:uppercase;color:#b03fa9;text-align:left}",
    ".opa-seemore:hover{opacity:.7}",
    /* The written-out index stays in the page for search engines and screen
       readers; the panels above are the sighted way in. It is taken out of the
       flow the moment this file parses — waiting until the data arrives meant
       the page shrank by the height of 259 names while you were reading it.
       If the map fails to load, .opa-show puts it back. */
    ".op-atlas-index:not(.opa-show),.opa-sr{position:absolute!important;",
      "width:1px!important;height:1px!important;overflow:hidden!important;",
      "clip:rect(0 0 0 0)!important;white-space:nowrap!important;",
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
    '</div>';

  var bar    = root.querySelector(".opa-bar"),
      stage  = root.querySelector(".opa-stage"),
      cv     = root.querySelector(".opa-cv"),
      card   = root.querySelector(".opa-card"),
      ctx    = cv.getContext("2d");

  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* "fill" draws the flat map's landmasses solid; "outline" leaves them open,
     matching the globe. The globe is always outline — half of it is facing
     away, and closing shapes along the horizon is the expensive part. */
  var LAND_STYLE = root.getAttribute("data-land") || "fill";
  /* Dark mode used to be a CSS brightness filter over the whole canvas, which
     lifted the antialiased edges along with everything else and left the dots
     looking soft. Now that land is drawn rather than sampled, the map can just
     be given its own colours. */
  function palette(dark){
    return dark
      ? { landFill:"rgba(44,66,116,.55)", landLine:"rgba(104,158,245,.72)",
          sphere:"rgba(80,140,255,.10)", rim:"rgba(104,158,245,.34)",
          dot:"226,128,220", hot:"255,205,250", sep:"13,19,38" }
      : { landFill:"rgba(206,220,243,.92)", landLine:"rgba(1,83,219,.55)",
          sphere:"rgba(1,83,219,.09)", rim:"rgba(1,83,219,.32)",
          dot:"204,105,199", hot:"76,39,74", sep:"254,252,255" };
  }
  var MQ = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  var PAL = palette(!!(MQ && MQ.matches));
  /* switching the system theme just swaps the colours and redraws — the page
     itself never reloads */
  if (MQ && MQ.addEventListener){
    MQ.addEventListener("change", function(e){ PAL = palette(e.matches); mark(); });
  }

  var state = { view:"globe", hover:null, sel:null, rot:-20, tilt:12,
                spin:true, z:1, px:0, py:0, gz:1, pin:false };
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

  /* ------------------------------------------------ coastlines on the sphere
     The globe used to sample land into a grid of dots. Contributors are dots
     too, so the eye had to sort one kind from the other. Now it draws the same
     coastlines the flat map does, and the only dots on it are people.

     Half the world faces away at any moment, so every outline has to be cut at
     the horizon — a point is in front when cos(c) > 0. Filling is the harder
     half: a landmass running off the edge of the disc must be closed along the
     limb itself or the fill leaks into the ocean.

     This runs sixty times a second while the globe turns, so the per-point
     trigonometry that never changes is worked out once, at load. */
  var RINGS = null;                      // per ring: lon, sin/cos lat, bounding cap
  function prepareRings(){
    RINGS = [];
    for (var k = 0; k < LAND.length; k++){
      var ring = LAND[k], n = ring.length;
      var lon = new Float64Array(n), sla = new Float64Array(n), cla = new Float64Array(n);
      var seam = new Uint8Array(n);
      var mx = 0, my = 0, mz = 0, i, la;
      for (i = 0; i < n; i++){
        lon[i] = rad(ring[i][0]);
        la = rad(ring[i][1]);
        sla[i] = Math.sin(la); cla[i] = Math.cos(la);
        seam[i] = Math.abs(Math.abs(ring[i][0]) - 180) < 0.01 ? 1 : 0;
        mx += cla[i]*Math.cos(lon[i]); my += cla[i]*Math.sin(lon[i]); mz += sla[i];
      }
      var len = Math.sqrt(mx*mx + my*my + mz*mz) || 1;
      mx /= len; my /= len; mz /= len;
      var worst = 1;                     // smallest dot product = widest angle
      for (i = 0; i < n; i++){
        var d = cla[i]*Math.cos(lon[i])*mx + cla[i]*Math.sin(lon[i])*my + sla[i]*mz;
        if (d < worst) worst = d;
      }
      RINGS.push({ lon:lon, sla:sla, cla:cla, seam:seam, n:n,
                   cx:mx, cy:my, cz:mz, cap:Math.acos(Math.max(-1, Math.min(1, worst))) });
    }
  }

  /* scratch, reused every frame so nothing is allocated in the draw loop */
  var PX = new Float64Array(1), PY = new Float64Array(1), PV = new Uint8Array(1);
  function ensureScratch(n){
    if (PX.length < n){ PX = new Float64Array(n); PY = new Float64Array(n); PV = new Uint8Array(n); }
  }

  function project(ring, g, sp0, cp0, rotR){
    ensureScratch(ring.n);
    var i, l, cosc, cl;
    for (i = 0; i < ring.n; i++){
      l = ring.lon[i] - rotR;
      cl = Math.cos(l);
      cosc = sp0*ring.sla[i] + cp0*ring.cla[i]*cl;
      PV[i] = cosc > 0 ? 1 : 0;
      PX[i] = g.cx + g.r*ring.cla[i]*Math.sin(l);
      PY[i] = g.cy - g.r*(cp0*ring.sla[i] - sp0*ring.cla[i]*cl);
    }
  }
  /* bisect along the segment for the point that sits exactly on the horizon */
  function limbAt(ring, a, b, g, sp0, cp0, rotR){
    var lo = 0, hi = 1, m, i, lon, sla, cla, l, cosc;
    var lonA = ring.lon[a], lonB = ring.lon[b];
    var slaA = ring.sla[a], slaB = ring.sla[b], claA = ring.cla[a], claB = ring.cla[b];
    for (i = 0; i < 12; i++){
      m = (lo + hi) / 2;
      lon = lonA + (lonB-lonA)*m;
      sla = slaA + (slaB-slaA)*m; cla = claA + (claB-claA)*m;
      l = lon - rotR;
      cosc = sp0*sla + cp0*cla*Math.cos(l);
      if (cosc > 0) lo = m; else hi = m;
    }
    m = (lo + hi) / 2;
    lon = lonA + (lonB-lonA)*m;
    sla = slaA + (slaB-slaA)*m; cla = claA + (claB-claA)*m;
    l = lon - rotR;
    return [ g.cx + g.r*cla*Math.sin(l),
             g.cy - g.r*(cp0*sla - sp0*cla*Math.cos(l)) ];
  }

  function drawGlobeLand(g){
    if (!RINGS) return;
    var sp0 = Math.sin(rad(g.lat0)), cp0 = Math.cos(rad(g.lat0)), rotR = rad(state.rot);
    /* the unit vector we are looking down */
    var vx = cp0*Math.cos(rotR), vy = cp0*Math.sin(rotR), vz = sp0;
    var fill = LAND_STYLE !== "outline";
    var k, i, t, ring, vis, prevVis, start, anyVis, allVis, lp, ang, exitAng;

    for (var pass = fill ? 0 : 1; pass < 2; pass++){
      if (pass === 1) ctx.beginPath();
      for (k = 0; k < RINGS.length; k++){
        ring = RINGS[k];
        /* if the whole ring sits more than a quarter turn away, it is behind us */
        /* an island narrower than a pixel costs a whole subpath to say nothing */
        if (g.r * ring.cap < 1.1) continue;
        var sep = Math.acos(Math.max(-1, Math.min(1, ring.cx*vx + ring.cy*vy + ring.cz*vz)));
        if (sep - ring.cap > Math.PI/2) continue;

        if (pass === 0) ctx.beginPath();
        project(ring, g, sp0, cp0, rotR);
        anyVis = false; allVis = true; start = 0;
        for (i = 0; i < ring.n; i++){
          if (PV[i]){ if (!anyVis) start = i; anyVis = true; } else allVis = false;
        }
        if (!anyVis) continue;

        if (allVis){
          for (i = 0; i < ring.n; i++){
            if (i) ctx.lineTo(PX[i], PY[i]); else ctx.moveTo(PX[i], PY[i]);
          }
          if (pass === 0){ ctx.closePath(); ctx.fillStyle = PAL.landFill; ctx.fill(); }
          else ctx.lineTo(PX[0], PY[0]);
          continue;
        }

        prevVis = 0; exitAng = null;
        for (t = 0; t <= ring.n; t++){
          i = (start + t) % ring.n;
          var prevI = (start + t - 1 + ring.n) % ring.n;
          vis = PV[i];
          if (t === 0){ ctx.moveTo(PX[i], PY[i]); }
          else if (pass === 1 && ring.seam[i] && ring.seam[prevI]){
            /* the flat map's rings were cut at ±180; drawing along that cut
               would paint a coast down the Pacific that isn't there */
            if (vis) ctx.moveTo(PX[i], PY[i]);
          }
          else if (vis && prevVis){ ctx.lineTo(PX[i], PY[i]); }
          else if (!vis && prevVis){
            lp = limbAt(ring, prevI, i, g, sp0, cp0, rotR);
            ctx.lineTo(lp[0], lp[1]);
            if (pass === 0) exitAng = Math.atan2(lp[1]-g.cy, lp[0]-g.cx);
          }
          else if (vis && !prevVis){
            lp = limbAt(ring, i, prevI, g, sp0, cp0, rotR);
            ang = Math.atan2(lp[1]-g.cy, lp[0]-g.cx);
            if (pass === 0 && exitAng !== null){
              /* close along the horizon, the short way round. Land that leaves
                 the front of the world and comes back always does so over a
                 short stretch of limb, because the far side of that stretch is
                 the part we cannot see. */
              var dd = ang - exitAng;
              while (dd >  Math.PI) dd -= 2*Math.PI;
              while (dd < -Math.PI) dd += 2*Math.PI;
              var steps = Math.max(2, Math.min(24, Math.ceil(Math.abs(dd)/0.08)));
              for (var q = 1; q <= steps; q++){
                var aq = exitAng + dd*(q/steps);
                ctx.lineTo(g.cx + g.r*Math.cos(aq), g.cy + g.r*Math.sin(aq));
              }
            }
            else ctx.moveTo(lp[0], lp[1]);
            ctx.lineTo(PX[i], PY[i]);
          }
          prevVis = vis;
        }
        if (pass === 0){ ctx.closePath(); ctx.fillStyle = PAL.landFill; ctx.fill(); }
      }
      if (pass === 1){
        ctx.strokeStyle = PAL.landLine;
        ctx.lineWidth = fill ? 0.6 : 0.75;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.stroke();
      }
    }
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
    var dim = opt.dim||1;
    /* One mark for everyone. A pin sits at the finest place we were told —
       the town where we know it, the country where that's all anyone said.
       Which of the two it is shows in the card, not as a second symbol the
       reader would have to decode from a key. */
    ctx.beginPath(); ctx.arc(x,y,r,0,6.2832);
    ctx.fillStyle = "rgba(" + (on?PAL.hot:PAL.dot) + "," + ((on?1:0.92)*dim) + ")";
    ctx.fill();
    ctx.strokeStyle = "rgba(" + PAL.sep + "," + (0.55*dim) + ")";
    ctx.lineWidth = 0.7; ctx.stroke();
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
      if (LAND_STYLE !== "outline"){ ctx.fillStyle = PAL.landFill; ctx.fill(); }
      ctx.strokeStyle = PAL.landLine;
      ctx.lineWidth = LAND_STYLE === "outline" ? 0.75 : 0.6;
      ctx.stroke();
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
    drawGlobeLand(g);
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
      /* Same sign error as the drag: the idle spin was turning the world
         backwards. The Earth carries a place eastward, so it drifts right. */
      if (spin) state.rot -= 0.075;
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
    var more = people.length>80 ? '<li style="opacity:.62">+ ' + (people.length-80) + " more</li>" : "";
    return '<button type="button" class="opa-x" aria-label="Close">&times;</button>' +
           "<h3>" + esc(title) + '</h3><div class="opa-meta">' + esc(meta) + "</div><ul>" + li + more + "</ul>" +
           '<button type="button" class="opa-scroll-note" hidden></button>';
  }
  /* Shared by both card openers. The note exists because macOS keeps its
     scrollbar hidden until you already scroll: a place with ten poets showed
     a few names and nothing to say the rest were there. */
  function mountCard(){
    var x  = card.querySelector(".opa-x"),
        ul = card.querySelector("ul"),
        note = card.querySelector(".opa-scroll-note");
    if (x) x.onclick = function(){ state.sel = null; state.pin = false;
      card.classList.remove("opa-on","opa-pin"); mark(); };
    if (!ul || !note) return;
    /* How tall the list may stand is measured, not guessed: a long title
       wraps to two lines and a group card's meta can run to three, so any
       fixed allowance eventually pushes the card past the bottom edge. */
    function fit(){
      ul.style.maxHeight = "";
      if (window.matchMedia && matchMedia("(max-width:720px)").matches) return;
      note.hidden = false; note.textContent = " ";   /* reserve its line */
      ul.style.maxHeight = "0px";
      var room = stage.clientHeight - card.offsetTop - card.offsetHeight - 16;
      ul.style.maxHeight = Math.max(140, room) + "px";
    }
    function tally(){
      var left = ul.scrollHeight - ul.clientHeight - ul.scrollTop;
      if (left <= 2){ note.hidden = true; note.textContent = ""; return; }
      var n = 0, k, li;
      for (k = 0; k < ul.children.length; k++){
        li = ul.children[k];
        if (li.offsetTop - ul.scrollTop + li.offsetHeight > ul.clientHeight + 1) n++;
      }
      note.hidden = n === 0;
      note.textContent = n ? n + " more below" : "";
    }
    fit();
    ul.onscroll = tally;
    note.onclick = function(){ ul.scrollTop += ul.clientHeight * 0.82; };
    tally();
  }
  function showRow(i, pin){
    var r = ROWS[i], h = null, k;
    for (k=0;k<hits.length;k++) if (hits[k].i === i) { h = hits[k]; break; }
    card.classList.toggle("opa-right", !!h && h.x > W*0.52);
    /* The title already says "Ohio, United States" or "Nigeria", so spelling
       out the precision underneath only repeated it back at the reader. */
    var bits = [ r.poets.length + (r.poets.length===1 ? " poet" : " poets"), r.continent ];
    card.innerHTML = cardHTML(r.city ? r.city + ", " + r.country : r.country, bits.join(" · "), r.poets);
    card.classList.add("opa-on");
    card.classList.toggle("opa-pin", !!pin);
    mountCard();
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
    state.pin = true;
    mountCard();
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
    state.spin = true; state.sel = null; state.pin = false;
    card.classList.remove("opa-on","opa-pin"); mark();
  }
  function local(ev){
    var b = cv.getBoundingClientRect();
    return [ (ev.clientX-b.left)*(W/b.width), (ev.clientY-b.top)*(H/b.height) ];
  }
  function pick(ev){
    var l = local(ev), best = null, bd = 1e9, k, d;
    /* A fingertip covers about forty pixels; a cursor covers one. Without this
       a dot on a phone was a two-pixel target and every attempt missed. */
    var slop = ev.pointerType === "touch" ? 13 : 4;
    for (k=0;k<hits.length;k++){
      d = Math.sqrt(Math.pow(hits[k].x-l[0],2) + Math.pow(hits[k].y-l[1],2));
      if (d < hits[k].r+slop && d < bd){ bd = d; best = hits[k].i; }
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
        /* state.rot is the longitude sitting at the centre of the disc, so
           pulling the globe to the right has to walk that longitude west.
           Adding dx did the opposite and the globe fought your hand. */
        state.rot -= dx*0.32;
        state.tilt = Math.max(-75, Math.min(75, state.tilt + dy*0.28));
      } else { state.px += dx; state.py += dy; clampPan(); }
      mark();
      return;
    }
    var i = pick(ev);
    if (i !== state.hover){
      state.hover = i;
      if (state.sel === null && !state.pin){
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
    if (i === null){
      /* A mouse click on empty water is deliberate, so it puts everything back.
         A tap is usually a near miss, and throwing away the zoom somebody just
         pinched to would be a punishment. Close the card; RESET is right there. */
      if (ev.pointerType === "touch"){
        state.sel = null; state.pin = false;
        card.classList.remove("opa-on","opa-pin"); mark(); return;
      }
      resetView(); return;
    }
    state.sel = (i === state.sel) ? null : i;
    state.pin = state.sel !== null;
    if (state.sel !== null) showRow(state.sel, true);
    else card.classList.remove("opa-on","opa-pin");
    mark();
  });
  cv.addEventListener("pointercancel", function(ev){
    endTouch(ev); drag.on = false; cv.classList.remove("opa-grab");
  });
  cv.addEventListener("mouseleave", function(){
    state.hover = null;
    if (state.sel === null && !state.pin) card.classList.remove("opa-on","opa-pin");
    mark();
  });
  cv.addEventListener("dblclick", function(ev){ var l = local(ev); zoomAt(1.8, l[0], l[1]); });

  root.querySelector(".opa-in").onclick    = function(){ zoomAt(1.5, W/2, H/2); };
  root.querySelector(".opa-out").onclick   = function(){ zoomAt(1/1.5, W/2, H/2); };
  root.querySelector(".opa-reset").onclick = resetView;

  function atRest(){
    return state.sel === null && !state.pin && state.spin && state.gz === 1 && state.z === 1 &&
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
    state.hover = state.sel = null; state.pin = false;
    card.classList.remove("opa-on","opa-pin");
    Array.prototype.forEach.call(bar.children, function(x){
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    resetView(); resize();
  });

  function resize(){
    var box = stage.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio||1, 2);
    W = Math.round(box.width);
    H = Math.round(Math.max(340, Math.min(W*(state.view==="globe"?0.62:0.52), 620)));
    /* On a phone the picture would otherwise stand half the height of the
       screen, and since the canvas now takes the touches there would be
       little page left to scroll by. Keep it under half the window. */
    if (W < 560){
      var vh = window.innerHeight || 700;
      H = Math.round(Math.max(260, Math.min(H, vh*0.46)));
    }
    cv.width = W*DPR; cv.height = H*DPR; cv.style.height = H+"px";
    /* Let the readout list use whatever height the picture leaves it, so a
       place with ten poets shows most of them instead of three. */
    root.style.setProperty("--opa-list", Math.max(180, H - 150) + "px");
    fitFlat(); mark();
  }
  var rt;
  window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(resize, 140); });

  /* Size the canvas straight away rather than waiting for atlas.json. Otherwise
     the stage stands at the canvas default of 150px while the data is in
     flight and then shoves the rest of the page down when it arrives. */
  resize();

  /* ------------------------------------------------ counters as the index
     The four numbers above the map open a panel underneath themselves, the way
     the original did. The written-out index further down the page stays in the
     HTML — it just stops taking up the screen. */
  var SHORT = { "United States":"USA", "United Kingdom":"UK", "United Arab Emirates":"UAE" };
  function brief(c){ return SHORT[c] || c; }
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
      return '<div class="opa-cols">' + all.map(function(p){
          return '<a class="opa-pitem" href="' + p.u + '">' + esc(p.n) + "<u>" + esc(p.w) + "</u></a>";
        }).join("") + "</div>";
    },
    countries: function(){
      var q = tally("country");
      return '<div class="opa-cols">' + q.order.map(function(c){
          return '<button type="button" class="opa-pitem" data-country="' + esc(c) + '">' +
                 esc(c) + "<u>" + q.t[c] + "</u></button>";
        }).join("") + "</div>";
    },
    continents: function(){
      var q = tally("continent");
      return '<div class="opa-cols">' + q.order.map(function(c){
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
      return '<div class="opa-cols">' + html + "</div>";
    }
  };

  var panel = null;
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

  }

  /* ------------------------------------------------ keep the page honest
     The four figures and the written-out index are real HTML, so a search
     engine reads them without running any of this. That also means they are
     only as current as the last publish. Once the data is here we know the
     true numbers, so we correct them — and rebuild the index — in place.
     Nothing else on the page is touched: the essay is Karan's. */
  var CONT_ORDER = ["North America","South America","Europe","Africa","Asia","Oceania"];

  function setNum(el, n){
    if (!el || n == null) return;
    var now = parseInt((el.textContent || "").replace(/[^0-9]/g, ""), 10);
    if (now !== n) el.textContent = String(n);
  }

  function refreshCounters(totals){
    var placed = ROWS.reduce(function(t,r){ return t + r.poets.length; }, 0);
    var countries = {}, continents = {}, cities = 0;
    ROWS.forEach(function(r){
      if (r.country) countries[r.country] = 1;
      if (r.continent && r.continent !== "—") continents[r.continent] = 1;
      if (r.precision === "city") cities++;
    });
    var want = {
      people:     (totals && totals.contributors) || null,
      countries:  Object.keys(countries).length,
      continents: Object.keys(continents).length,
      cities:     cities
    };
    Array.prototype.forEach.call(document.querySelectorAll(".op-atlas-stat"), function(el){
      var lab = el.querySelector(".op-atlas-lab");
      var key = keyFor(lab ? lab.textContent : el.textContent);
      if (key && want[key] != null) setNum(el.querySelector(".op-atlas-num"), want[key]);
    });
  }

  function refreshIndex(){
    var host = document.querySelector(".op-atlas-index-inner");
    if (!host) return;
    var byCont = {};
    ROWS.forEach(function(r){
      var c = byCont[r.continent] = byCont[r.continent] || { n:0, byCountry:{} };
      c.n += r.poets.length;
      (c.byCountry[r.country] = c.byCountry[r.country] || []).push.apply(
        c.byCountry[r.country], r.poets);
    });
    var order = CONT_ORDER.filter(function(c){ return byCont[c]; })
      .concat(Object.keys(byCont).filter(function(c){ return CONT_ORDER.indexOf(c) < 0; }));

    var html = order.map(function(cont){
      var c = byCont[cont];
      var countries = Object.keys(c.byCountry).sort(function(a,b){
        return c.byCountry[b].length - c.byCountry[a].length || a.localeCompare(b);
      });
      return '<div class="op-atlas-cont"><h3 class="op-atlas-conth">' + esc(cont) +
        ' <span class="op-atlas-contn">' + c.n + "</span></h3>" +
        countries.map(function(k){
          var names = c.byCountry[k].slice().sort(function(a,b){
            return a.n.toLowerCase().localeCompare(b.n.toLowerCase());
          });
          return '<p class="op-atlas-ctry"><span class="op-atlas-ctryname">' + esc(k) +
            "</span>" + names.map(function(p){
              return p.u
                ? '<a class="op-atlas-poet" href="' + p.u + '">' + esc(p.n) + "</a>"
                : '<span class="op-atlas-poet">' + esc(p.n) + "</span>";
            }).join(", ") + "</p>";
        }).join("") + "</div>";
    }).join("");

    if (host.innerHTML !== html) host.innerHTML = html;
  }

  /* ------------------------------------------------ go */
  function fail(msg){
    root.innerHTML = '<p style="font-family:brother-1816,sans-serif;font-size:11px;' +
      'letter-spacing:.02em;color:rgba(5,33,78,.62);padding:40px 0">' + msg + "</p>";
    var idx = document.querySelector(".op-atlas-index");   // put the list back
    if (idx) idx.className += " opa-show";
  }
  /* Ask whether atlas.json has moved on, rather than trusting what we were
     handed last time. jsDelivr labels a file on a branch max-age=604800, so a
     reader who came last week would keep their own copy for another week and
     never see the rebuild. "no-cache" means revalidate, not re-download:
     unchanged data comes back as a 304 with no body. If the network is
     unreachable, an old copy is far better than no map at all. */
  function load(){
    return fetch(DATA, { credentials: "omit", cache: "no-cache" })
      .catch(function(){ return fetch(DATA, { credentials: "omit" }); });
  }

  load()
    .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(d){
      LAND = d.land.filter(function(r){
        return r.some(function(p){ return p[1] > -56; });   // Antarctica out
      });
      ROWS = d.places;
      MAXN = Math.max.apply(null, ROWS.map(function(r){ return r.poets.length; }).concat([1]));
      prepareRings();
      resize();
      ready = true;
      mark();
      try { refreshCounters(d.totals); } catch (e) { /* leave the page's own figures */ }
      try { buildCounters(); } catch (e) { /* the map still works without them */ }
      try { refreshIndex(); } catch (e) { /* the page's own index stands */ }
    })
    .catch(function(){
      fail("The map could not load \u2014 the full list of poets is below.");
    });

  loop();
})();
