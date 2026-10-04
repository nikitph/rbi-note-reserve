const {
  Cam, clamp, facing, fit, hull, open, poly, proj, ringAt, rrect, run, seg,
  rings, prism, solid, put, fillet, unproj, tween, tset, tval, tdone,
  disposer, mk, pointer, register, reducedMotion,
} = HL;

const N = 4, W = 106.5, H = 49.5, GAP = 35;
const HEIGHTS = [12, 21, 28, 17], LIFT = 28;
const X0 = -8, X1 = W + 8, Y0 = -9, Y1 = (N - 1) * GAP + H + 8;
const LR = (p) => p[0][0] < p[p.length - 1][0] ? p : p.slice().reverse();

// An opaque tray: the near wall is drawn last to hide the bundles' feet.
function tray(P, front, outer, inner) {
  const iF = LR(ringAt(P, run(inner, front), 7));
  const oT = LR(ringAt(P, run(outer, front), 7));
  const oB = LR(ringAt(P, run(outer, front), 0));
  return {
    far: [
      [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, 7)))), "sil"],
      [poly(ringAt(P, inner, 7)), "nf lo"],
    ],
    near: [
      [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
      [open(oT), "nf lo"], [open(iF), "nf lo"],
      [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
    ],
  };
}

// Front: portrait, round spectacles, watermark oval, security thread and bleed lines.
// Reverse: the stepped terraces and repeated colonnades of Rani ki Vav.
function engraving(P, i, y, z) {
  const Q = (u, v) => P(u, y + v, z);
  const line = (p) => open(p.map(([u, v]) => Q(u, v)));
  const contour = p => poly(fillet(p, p.map(() => 1.1), 5).map(([u, v]) => Q(u, v)));
  const round = (a, b, c, d, r) => poly(rrect(a, b, c, d, r, 10).map(q => Q(q.u, q.v)));
  let marks = "";
  if (i === 0) {
    for (let j = 0; j < 4; j++) {
      const x = 22 + j * 5, yy = 10 + j * 5;
      marks += line([[x, yy + 11], [x, yy], [87 - j * 5, yy], [87 - j * 5, yy + 11]]);
      for (let k = 0; k < 6 - j; k++) {
        const u = x + 4 + k * 8;
        marks += line([[u, yy + 2], [u, yy + 8], [u + 3, yy + 8], [u + 3, yy + 2]]);
      }
    }
    marks += line([[22, 38], [86, 38]]) + round(9, 18, 15, 30, 2);
  } else {
    marks += round(73, 10, 91, 35, 8);
    marks += contour([[48, 36], [46, 29], [43, 25], [42, 17], [45, 10], [52, 8], [58, 11],
      [60, 17], [64, 20], [60, 22], [59, 29], [55, 33], [55, 36]]);
    marks += round(44, 17, 50, 22, 2) + round(52, 17, 58, 22, 2);
    marks += line([[50, 19], [52, 19]]) + line([[42, 19], [44, 19]]);
    marks += line([[49, 27], [55, 28], [57, 26]]);
    marks += line([[32, 43], [36, 38], [47, 34], [51, 39], [55, 35], [69, 42]]);
    marks += line([[66, 5], [66, 44]]);
    marks += round(13, 17, 20, 29, 2);
  }
  for (let k = 0; k < 4; k++) {
    marks += line([[3, 12 + k * 3.4], [7, 10 + k * 3.4]]);
    marks += line([[100, 12 + k * 3.4], [104, 10 + k * 3.4]]);
  }
  return marks;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const loader = stage.dataset.mode === "loader";
  let stagger = loader ? 40 : value, speed = loader ? value : 1;
  let active = -1, elapsed = 0, sequence = 0, clock = performance.now();
  const WAVE = [0, 1, 2, 3, 2, 1];
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[X0, Y0, 0], [X1, Y0, 0], [X0, Y1, 0], [X1, Y1, 0],
    [0, 0, 72], [W, Y1, 72]], 200, 166);
  const P = proj(C), front = facing(C);
  const outer = rrect(X0, Y0, X1, Y1, 6, 8);
  const inner = rrect(X0 + 2.3, Y0 + 2.3, X1 - 2.3, Y1 - 2.3, 3.7, 8);
  const T = tray(P, front, outer, inner), g = mk("g", {}, svg);
  T.far.forEach(([d, cls]) => mk("path", {d, class: cls}, g));
  const bundles = [];
  for (let i = 0; i < N; i++) {
    const group = mk("g", {}, g), body = solid(group);
    const sheets = mk("path", {class: "nf lo"}, group);
    const ink = mk("path", {class: "nf lo"}, group);
    bundles.push({group, body, sheets, ink, lift: tween(0), shift: tween(0), last: ""});
  }
  T.near.forEach(([d, cls]) => mk("path", {d, class: cls}, g));

  function draw(i, lift, shift) {
    const b = bundles[i], key = lift.toFixed(3) + ":" + shift.toFixed(3);
    if (key === b.last) return;
    b.last = key;
    const y = i * GAP + shift, z = HEIGHTS[i] + lift;
    const [ring, innerRing] = rings(0, y, W, y + H, 2.5, 1.3);
    put(b.body, prism(P, front, ring, innerRing, 7 + lift, z));
    b.sheets.setAttribute("d", [z - 2.4, z - 4.8].map(h => open(ringAt(P, run(innerRing, front), h))).join(""));
    b.ink.setAttribute("d", engraving(P, i, y, z));
  }
  bundles.forEach((b, i) => { draw(i, 0, 0); b.body.sil.classList.toggle("hi", i === 2); });
  read.textContent = "rest";
  const B = register(stage, (dt, now) => {
    if (loader && reducedMotion()) return false;
    clock = loader ? clock + dt * 1000 * speed : now;
    if (loader) elapsed += dt * 1000 * speed;
    if (loader && elapsed >= 1100) {
      elapsed %= 1100;
      sequence = (sequence + 1) % WAVE.length;
      choose(WAVE[sequence]);
    }
    let moving = false;
    bundles.forEach((b, i) => {
      draw(i, tval(b.lift, clock), tval(b.shift, clock));
      if (!tdone(b.lift, clock) || !tdone(b.shift, clock)) moving = true;
    });
    return loader || moving;
  });
  bag.add(B.unregister);

  function choose(a, force = false) {
    if (a === active && !force) return;
    const from = a >= 0 ? a : active, now = loader ? clock : performance.now();
    active = a;
    bundles.forEach((b, i) => {
      const distance = Math.abs(i - from), delay = distance * stagger;
      const shift = a < 0 || i === a ? 0 : Math.sign(i - a) * (distance === 1 ? 8 : 3);
      tset(b.lift, a === i ? LIFT : 0, now, delay);
      tset(b.shift, clamp(shift, -8, 8), now, delay);
      b.body.sil.classList.toggle("hi", i === (a < 0 ? 2 : a));
    });
    read.textContent = a < 0 ? "rest" : "₹100 · " + String(a + 1).padStart(2, "0");
    B.wake();
  }
  function hit([sx, sy]) {
    for (let i = N - 1; i >= 0; i--) {
      const [x, y] = unproj(C, sx, sy, HEIGHTS[i]);
      if (x >= -3 && x <= W + 3 && y >= i * GAP - 3 && y <= i * GAP + H + 3) return i;
    }
    return -1;
  }
  if (loader && !reducedMotion()) choose(WAVE[0]);
  bag.add(pointer(stage, {
    move: p => loader ? B.wake() : choose(hit(p)),
    leave: () => loader ? B.wake() : choose(-1),
  }));
  bag.add(() => svg.replaceChildren());
  return { set: v => { if (loader) { speed = clamp(v, 0.25, 3); B.wake(); } else stagger = v; }, destroy: bag.dispose };
}

hairline({
  name: "note-reserve",
  means: "Indian ₹100 notes in a reserve tray: hover to lift a bundle and part its neighbours.",
  rules: [1, 2, 4, 5, 7, 8, 9, 10],
  range: [30, 40, 55],
  mount,
});
