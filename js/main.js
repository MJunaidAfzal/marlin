(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasG = typeof window.gsap !== 'undefined';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesk = () => matchMedia('(min-width: 961px)').matches;
  $('#yr').textContent = new Date().getFullYear();

  if (hasG) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasG) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop();
  }
  const navH = () => ($('#nav').offsetHeight || 80) - 10;
  const goTo = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -navH(), duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - (el.id === 'top' ? 0 : navH()), behavior: 'smooth' });
  };

  /* ---------- split headings into words ---------- */
  $$('.split').forEach(h => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = part; w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
  });

  /* ---------- loader ---------- */
  const loader = $('#loader'), pctEl = $('#ldPct'), bar = $('.ld-bar span');
  let shown = 0, loaded = false;
  const t0 = performance.now();
  const heroPic = $('.slides img');
  const heroReady = heroPic && heroPic.decode ? heroPic.decode().catch(() => {}) : Promise.resolve();
  window.addEventListener('load', () => { heroReady.then(() => { loaded = true; }); });
  setTimeout(() => { loaded = true; }, 12000);
  const tickLoad = () => {
    const minDone = performance.now() - t0 > 1700;
    const cap = loaded && minDone ? 100 : 88;
    shown += (cap - shown) * (loaded && minDone ? 0.16 : 0.05);
    if (cap === 100 && shown > 99.4) shown = 100;
    pctEl.textContent = Math.round(shown) + '%';
    bar.style.width = shown + '%';
    if (shown < 100) requestAnimationFrame(tickLoad); else finishLoad();
  };
  requestAnimationFrame(tickLoad);

  function finishLoad() {
    document.body.classList.remove('is-loading');
    if (!hasG || reduce) { loader.remove(); $('#wipe').remove(); if (lenis) lenis.start(); heroIntro(); return; }
    const bars = $$('#wipe i');
    gsap.set(bars, { left: '-80%' });
    const tl = gsap.timeline({ onComplete: () => { $('#wipe').remove(); if (lenis) lenis.start(); } });
    tl.to('.ld-in', { y: -30, opacity: 0, duration: .45, ease: 'power2.in' })
      .to(bars, { left: '0%', duration: .6, ease: 'power3.inOut', stagger: .09 }, '-=.15')
      .add(() => loader.remove())
      .to(bars, { left: '130%', duration: .7, ease: 'power3.inOut', stagger: .09 })
      .add(heroIntro, '-=.3');
  }

  /* ---------- hero ---------- */
  // hidden start state is applied straight away, so the hero image can never flash in un-animated
  const heroClip = () => isDesk()
    ? ['polygon(100% 0,100% 0,100% 100%,78% 100%)', 'polygon(22% 0,100% 0,100% 100%,0 100%)']
    : ['polygon(0 100%,100% 100%,100% 100%,0 100%)', 'polygon(0 12%,100% 0,100% 100%,0 100%)'];
  if (hasG && !reduce) {
    gsap.set('.slash', { skewX: -12.5, yPercent: -105 });
    gsap.set('#heroImg', { xPercent: isDesk() ? 100 : 0, yPercent: isDesk() ? 0 : 100 });
    gsap.set('.slides img', { xPercent: isDesk() ? -100 : 0, yPercent: isDesk() ? 0 : -100, scale: 1.15 });
    gsap.set('.hero-h .ln>span', { yPercent: 110 });
    gsap.set('.hero .pill', { x: -24, opacity: 0 });
    gsap.set('.hero-p,.hero-cta>*,.badge', { y: 26, opacity: 0 });
    gsap.set('.hero-lines i', { scaleX: 0, transformOrigin: 'left center' });
  }
  function heroIntro() {
    if (!hasG || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('#heroImg', { xPercent: 0, yPercent: 0, duration: 2.2, ease: 'power3.inOut', clearProps: 'transform' })
      .to('.slides img', { xPercent: 0, yPercent: 0, duration: 2.2, ease: 'power3.inOut' }, '<')
      .to('.slides img', { scale: 1, duration: 3.4, ease: 'power2.out', clearProps: 'transform' }, '<.4')
      .to('.slash', { yPercent: 0, duration: 1.5, stagger: .14, ease: 'power4.inOut' }, '<.3')
      .to('.hero-h .ln>span', { yPercent: 0, duration: 1.3, stagger: .1 }, '<.35')
      .to('.hero .pill', { x: 0, opacity: 1, duration: 1.1 }, '<.1')
      .to('.hero-p', { y: 0, opacity: 1, duration: 1.2 }, '<.35')
      .to('.hero-cta>*', { y: 0, opacity: 1, duration: 1.2, stagger: .1 }, '<.1')
      .to('.hero-lines i', { scaleX: 1, duration: 1.2, stagger: .1 }, '<.1')
      .to('.badge', { y: 0, opacity: 1, duration: 1.2 }, '<.1');
  }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle('solid', y > 60);
    const menuOpen = document.body.classList.contains('menu-open');
    nav.classList.toggle('hide', !menuOpen && y > 700 && y > lastY + 2);
    if (y < lastY - 2 || y < 700) nav.classList.remove('hide');
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    $('#ringFill').style.strokeDashoffset = 138.2 * (1 - p);
    $('#totop').classList.toggle('on', y > innerHeight * .8);
  };
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  // anchors
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    closeMenu();
    goTo(id);
  }));

  // mobile menu
  const burger = $('#burger');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); $('#mmenu').setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    if (!open) return closeMenu();
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true'); $('#mmenu').setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  addEventListener('resize', () => { if (innerWidth > 1100) closeMenu(); });

  // scroll spy
  const spyMap = [['#services', ['#services', '#gallery']], ['#fleet', ['#fleet']], ['#process', ['#process', '#pband', '#numbers', '#industries']], ['#compliance', ['#compliance']], ['#coverage', ['#coverage']], ['#contact', ['#quote', '#faq', '#contact']]];
  const links = $$('.nav ul a');
  const spyObs = new IntersectionObserver(ents => {
    ents.forEach(en => {
      if (!en.isIntersecting) return;
      const id = '#' + en.target.id;
      const hit = spyMap.find(([, secs]) => secs.includes(id));
      links.forEach(l => l.classList.toggle('act', !!hit && l.getAttribute('href') === hit[0]));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['#hero', '#about', '#services', '#gallery', '#fleet', '#numbers', '#process', '#pband', '#industries', '#compliance', '#coverage', '#quote', '#faq', '#contact'].forEach(s => $(s) && spyObs.observe($(s)));

  /* ---------- scroll animations ---------- */
  if (hasG && !reduce) {
    // heading words
    $$('.split').forEach(h => {
      gsap.from($$('.w>i', h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: h, start: 'top 88%' } });
    });
    $$('.pill:not(.hero .pill)').forEach(p => gsap.from(p, { x: -20, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%' } }));
    // batch reveal
    gsap.set('.rv', { y: 50, opacity: 0 });
    ScrollTrigger.batch('.rv', { start: 'top 90%', onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .08, overwrite: true }) });
    // generic fades
    $$('.about-copy p,.stats,.sig,.sec-hd>p,.cov-copy p,.cities,.q-info>p,.q-list,.q-mail,.faq-p,.band-in,.band-act,.pb-in p,.pb-in .btn').forEach(el =>
      gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    // about media
    gsap.from('.am-stamp', { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(1.6)', delay: .7, scrollTrigger: { trigger: '.about-media', start: 'top 80%' } });
    // horizontal gallery rows (all screens, incl. mobile)
    $$('.rg-row').forEach(row => {
      const dir = +row.dataset.dir;
      const dist = () => Math.max(200, row.scrollWidth - innerWidth * (innerWidth < 761 ? .9 : .7));
      gsap.fromTo(row, { x: () => dir < 0 ? 0 : -dist() }, { x: () => dir < 0 ? -dist() : 0, ease: 'none', scrollTrigger: { trigger: '.road-gal', start: 'top bottom', end: 'bottom top', scrub: .8, invalidateOnRefresh: true } });
    });
    // parallax images (all screens)
    $$('.par').forEach(p => {
      const img = p.querySelector(':scope>img'); if (!img) return;
      const amt = p.classList.contains('big') ? 14 : p.classList.contains('sec-bg') ? 10 : 9;
      gsap.fromTo(img, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // image reveals
    // soft image reveals: photo fades in, rises slightly and settles from a gentle zoom (no colour block)
    const curtain = (el, trigger, delay = 0) => {
      if (!el) return;
      const img = el.querySelector('img'); if (!img) return;
      const par = el.classList.contains('par');
      gsap.fromTo(img, { opacity: 0, scale: 1.22 }, {
        opacity: 1, scale: 1, duration: 2, delay, ease: 'power3.out',
        clearProps: par ? 'opacity' : 'opacity,transform',
        scrollTrigger: { trigger: trigger || el, start: 'top 88%' }
      });
    };
    curtain($('.am-main'), '.about-media');
    curtain($('.am-sub'), '.about-media', .35);
    $$('.svc-img').forEach((el, i) => curtain(el, el.closest('.svc'), (i % 3) * .12));
    $$('.vc .ph').forEach((el, i) => curtain(el, '#rail', i * .12));
    $$('.st-img').forEach((el, i) => curtain(el, '#steps', i * .15));
    $$('.ic').forEach((el, i) => curtain(el, el, (i % 3) * .1));
    $$('.rg-it').forEach((el, i) => curtain(el, el.parentElement, (i % 7) * .08));
    curtain($('.cm-main'), '.comp-media');
    curtain($('.cm-sub'), '.comp-media', .35);
    curtain($('.q-img'), '.q-img');
    curtain($('.faq-img'), '.faq-img');
    gsap.from('.cm-tag', { scale: 0, rotate: -60, duration: 1.2, ease: 'back.out(1.6)', delay: .6, scrollTrigger: { trigger: '.comp-media', start: 'top 80%' } });
    gsap.from('.nb-hd', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.nband', start: 'top 70%' } });
    // vehicle cards
    gsap.from('.vc', { x: 120, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '#rail', start: 'top 85%' } });
    // pband words
    gsap.from('.pb-h .w', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .14, scrollTrigger: { trigger: '.pband', start: 'top 70%' } });
    // map
    gsap.from('.map', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.map', start: 'top 85%' } });
    gsap.from('.pins g', { scale: 0, transformOrigin: 'center', duration: .7, ease: 'back.out(2)', stagger: .08, scrollTrigger: { trigger: '.map', start: 'top 70%' } });
    gsap.from('.qform', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.qform', start: 'top 88%' } });
    gsap.from('.ai', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#acc', start: 'top 85%' } });
    gsap.from('.band', { scale: .94, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.band', start: 'top 88%' } });
    gsap.from('.band-slash', { scaleY: 0, duration: 1.2, ease: 'expo.inOut', delay: .3, scrollTrigger: { trigger: '.band', start: 'top 80%' } });
    gsap.from('.ft-big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.ft-big', start: 'top 95%' } });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
    });
    mm.add('(min-width: 961px)', () => {
      // process road + truck
      const tl = gsap.timeline({ scrollTrigger: { trigger: '#steps', start: 'top 75%', end: 'bottom 55%', scrub: .6,
        onUpdate: s => $$('.st').forEach((st, i) => st.classList.toggle('on', s.progress >= i / 4 + .02)) } });
      tl.to('#roadFill', { width: '100%', ease: 'none' }, 0).to('#truck', { left: '100%', ease: 'none' }, 0);
    });
    mm.add('(max-width: 960px)', () => {
      $$('.st').forEach(st => ScrollTrigger.create({ trigger: st, start: 'top 75%', onEnter: () => st.classList.add('on') }));
    });
  } else {
    $$('.st').forEach(s => s.classList.add('on'));
  }

  /* ---------- counters ---------- */
  const cObs = new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, to = +el.dataset.to, d = 1600, s = performance.now();
    const step = t => { const k = Math.min(1, (t - s) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); cObs.unobserve(el);
  }), { threshold: .6 });
  $$('.count').forEach(c => cObs.observe(c));

  /* ---------- fleet rail ---------- */
  const wrapEl = $('#railWrap'), rail = $('#rail'), rBar = $('#railBar');
  let x = 0, minX = 0, dragging = false, startX = 0, startPos = 0, moved = 0;
  const measure = () => {
    const pad = parseFloat(getComputedStyle(wrapEl).paddingLeft) || 0;
    minX = Math.min(0, wrapEl.clientWidth - pad - rail.scrollWidth);
    const vis = minX === 0 ? 1 : (wrapEl.clientWidth - pad) / rail.scrollWidth;
    rBar.style.width = vis * 100 + '%';
    setX(x, false);
  };
  const setX = (v, anim = true) => {
    x = Math.max(minX, Math.min(0, v));
    rail.style.transition = anim ? 'transform .8s cubic-bezier(.22,1,.36,1)' : 'none';
    rail.style.transform = `translate3d(${x}px,0,0)`;
    const p = minX ? x / minX : 0;
    const w = parseFloat(rBar.style.width) || 30;
    rBar.style.transition = rail.style.transition;
    rBar.style.transform = `translateX(${p * (100 / w * 100 - 100)}%)`;
    $('#fPrev').classList.toggle('on', x < 0);
    $('#fNext').classList.toggle('on', x > minX);
  };
  const cardStep = () => { const c = $('.vc', rail); return c.offsetWidth + 22; };
  let pinST = null;
  const go = target => {
    if (!pinST) return setX(target);
    target = Math.max(minX, Math.min(0, target));
    const p = minX ? target / minX : 0;
    const y = pinST.start + p * (pinST.end - pinST.start) + (p >= 1 ? 1 : 0);
    if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  };
  $('#fNext').addEventListener('click', () => go(x - cardStep()));
  $('#fPrev').addEventListener('click', () => go(x + cardStep()));
  if (hasG && !reduce) {
    gsap.matchMedia().add('(min-width: 961px)', () => {
      document.body.classList.add('fleet-pin');
      measure();
      pinST = ScrollTrigger.create({
        trigger: '#fleet',
        start: () => ($('#fleet').offsetHeight > innerHeight ? 'bottom bottom' : 'top top'),
        end: () => '+=' + Math.max(1, Math.abs(minX)),
        pin: true, anticipatePin: 1, refreshPriority: 1, invalidateOnRefresh: true,
        onRefreshInit: measure,
        onUpdate: s => setX(minX * s.progress, false)
      });
      return () => { pinST && pinST.kill(); pinST = null; document.body.classList.remove('fleet-pin'); };
    });
  }
  wrapEl.addEventListener('pointerdown', e => {
    if (pinST) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; moved = 0; startX = e.clientX; startPos = x; wrapEl.classList.add('drag');
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
    if (moved > 5) setX(startPos + dx, false);
  });
  const endDrag = () => {
    if (!dragging) return; dragging = false; wrapEl.classList.remove('drag');
    if (moved > 5) { const st = cardStep(); setX(Math.round(x / st) * st); }
  };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  wrapEl.addEventListener('click', e => { if (moved > 5) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  // touch: allow vertical page scroll, horizontal swipe moves rail
  wrapEl.style.touchAction = 'pan-y';
  addEventListener('resize', measure); addEventListener('load', measure); measure();

  /* ---------- coverage map ---------- */
  const info = {
    glasgow: ['Blackburn → Glasgow', 'Overnight & same-day runs to Scotland'],
    leeds: ['Blackburn → Leeds', 'Same-day dispatch across the Pennines'],
    manchester: ['Blackburn → Manchester', 'Same-day dispatch · Direct, no shared stops'],
    birmingham: ['Blackburn → Birmingham', 'Daily routes into the Midlands'],
    bristol: ['Blackburn → Bristol', 'Dedicated runs to the South West'],
    london: ['Blackburn → London', 'Same-day express & overnight trunking']
  };
  let cityTimer, cityI = 2;
  const cityKeys = Object.keys(info);
  const setCity = c => {
    $$('.routes path').forEach(p => p.classList.toggle('on', p.dataset.r === c));
    $$('.pins g').forEach(p => p.classList.toggle('on', p.dataset.p === c));
    $$('#cities button').forEach(b => b.classList.toggle('on', b.dataset.c === c));
    $('#mcCity').textContent = info[c][0]; $('#mcInfo').textContent = info[c][1];
    const route = $(`.routes path[data-r="${c}"]`);
    if (route && hasG && !reduce) { const L = route.getTotalLength(); gsap.fromTo(route, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1, ease: 'power2.out', onComplete: () => { route.style.strokeDasharray = 'none'; } }); }
    if (hasG && !reduce) gsap.fromTo('#mapCard', { y: 10, opacity: .4 }, { y: 0, opacity: 1, duration: .5 });
  };
  const stopAuto = () => clearInterval(cityTimer);
  $$('#cities button').forEach(b => b.addEventListener('click', () => { stopAuto(); setCity(b.dataset.c); }));
  $$('.pins g').forEach(g => g.addEventListener('click', () => { stopAuto(); setCity(g.dataset.p); }));
  setCity('manchester');
  const mObs = new IntersectionObserver(ents => ents.forEach(en => {
    if (en.isIntersecting) { stopAuto(); cityTimer = setInterval(() => { cityI = (cityI + 1) % cityKeys.length; setCity(cityKeys[cityI]); }, 3200); }
    else stopAuto();
  }), { threshold: .4 });
  mObs.observe($('#map'));
  $$('#cities button,.pins g').forEach(el => el.addEventListener('click', () => mObs.disconnect()));

  /* ---------- quote form ---------- */
  const form = $('#qform'), steps = $$('.qstep', form), stepLbl = $$('.qf-steps span'), qBar = $('#qfBar'), err = $('#qErr');
  let cur = 0;
  const showStep = i => {
    cur = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    stepLbl.forEach((s, k) => s.classList.toggle('on', k <= i));
    qBar.style.width = ((i + 1) / 3 * 100) + '%';
    err.textContent = '';
    $('#qdone').classList.remove('on');
  };
  const validate = i => {
    let ok = true, emailBad = false;
    $$('[required]', steps[i]).forEach(inp => {
      const empty = !inp.value.trim();
      const eBad = !empty && inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
      inp.closest('.fld').classList.toggle('err', empty || eBad);
      if (empty) ok = false;
      if (eBad) { ok = false; emailBad = true; }
    });
    err.textContent = ok ? '' : emailBad ? 'Please enter a valid email address.' : 'Please fill in the highlighted fields.';
    return ok;
  };
  $$('[required]', form).forEach(inp => inp.addEventListener('input', () => inp.closest('.fld').classList.remove('err')));
  $$('.next', form).forEach(b => b.addEventListener('click', () => { if (validate(cur)) showStep(cur + 1); }));
  $$('.back', form).forEach(b => b.addEventListener('click', () => showStep(cur - 1)));
  const fDate = $('#fDate'); fDate.min = new Date().toISOString().slice(0, 10);

  // prefill from service / vehicle links
  $$('[data-svc]').forEach(a => a.addEventListener('click', () => {
    const v = a.dataset.svc;
    const chip = $$('input[name="service"]', form).find(r => r.value === v);
    if (chip) chip.checked = true;
    else { const g = $('#fGoods'); if (!g.value) g.value = v; }
    showStep(0);
  }));
  $$('[data-veh]').forEach(a => a.addEventListener('click', () => {
    const r = $$('input[name="vehicle"]', form).find(x => x.value === a.dataset.veh);
    if (r) r.checked = true;
    showStep(0);
  }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate(2)) return;
    const fd = new FormData(form);
    const g = k => (fd.get(k) || '').toString().trim();
    const extras = fd.getAll('extras').join(', ') || 'None';
    const subject = `Quote request: ${g('from').toUpperCase()} to ${g('to').toUpperCase()} (${g('service')})`;
    const body = [
      'QUOTE REQUEST - Marlin Logistics website', '',
      `Service: ${g('service')}`,
      `Collection postcode: ${g('from').toUpperCase()}`,
      `Delivery postcode: ${g('to').toUpperCase()}`,
      `Collection date: ${g('date') || 'Not specified'}`,
      `Collection time: ${g('time')}`, '',
      `Vehicle: ${g('vehicle')}`,
      `Goods: ${g('goods') || 'Not specified'}`,
      `Pallets / weight: ${g('weight') || 'Not specified'}`,
      `Extras: ${extras}`, '',
      `Name: ${g('name')}`,
      `Company: ${g('company') || '-'}`,
      `Email: ${g('email')}`,
      `Phone: ${g('phone') || '-'}`, '',
      `Notes: ${g('message') || '-'}`
    ].join('\n');
    window.location.href = `mailto:Marlinlogisticsuk@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    steps.forEach(s => s.classList.remove('on'));
    qBar.style.width = '100%';
    $('#qdone').classList.add('on');
  });
  $('#qAgain').addEventListener('click', () => { form.reset(); showStep(0); });

  /* ---------- FAQ ---------- */
  $$('.ai').forEach(ai => {
    const a = $('.aa', ai);
    if (ai.classList.contains('open')) a.style.height = 'auto';
    $('.aq', ai).addEventListener('click', () => {
      const open = ai.classList.contains('open');
      $$('.ai.open').forEach(o => { if (o !== ai) { const oa = $('.aa', o); oa.style.height = oa.scrollHeight + 'px'; requestAnimationFrame(() => { oa.style.height = '0px'; }); o.classList.remove('open'); } });
      if (open) { a.style.height = a.scrollHeight + 'px'; requestAnimationFrame(() => { a.style.height = '0px'; }); ai.classList.remove('open'); }
      else { a.style.height = a.scrollHeight + 'px'; ai.classList.add('open'); a.addEventListener('transitionend', function f() { if (ai.classList.contains('open')) a.style.height = 'auto'; a.removeEventListener('transitionend', f); }); }
      if (hasG) setTimeout(() => ScrollTrigger.refresh(), 550);
    });
  });

  /* ---------- magnetic buttons ---------- */
  if (matchMedia('(pointer: fine)').matches && !reduce) {
    $$('.mag').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- footer name fits exactly ---------- */
  const ftBig = $('.ft-big');
  const fitName = () => {
    if (!ftBig) return;
    ftBig.style.fontSize = '100px';
    const w = ftBig.parentElement.clientWidth;
    ftBig.style.fontSize = (100 * w / ftBig.scrollWidth) + 'px';
  };
  fitName();
  addEventListener('resize', fitName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);

  addEventListener('load', () => { fitName(); hasG && ScrollTrigger.refresh(); });
})();
