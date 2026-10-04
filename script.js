const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 36);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
  nav.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = 'Open navigation';
  nav.classList.remove('open');
  document.body.classList.remove('nav-open');
}));

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const counters = document.querySelectorAll('[data-count]');
if (!reducedMotion) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count);
      let value = 0;
      const tick = () => {
        value += 1;
        node.textContent = String(Math.min(value, target));
        if (value < target) window.setTimeout(tick, 130);
      };
      node.textContent = '0';
      tick();
      countObserver.unobserve(node);
    });
  }, { threshold: .7 });
  counters.forEach((counter) => countObserver.observe(counter));
}

const capabilityTabs = [...document.querySelectorAll('[role="tab"]')];
const capabilityPanel = document.querySelector('#cap-panel');
const capTitle = capabilityPanel.querySelector('[data-cap-title]');
const capEyebrow = capabilityPanel.querySelector('[data-cap-eyebrow]');
const capSupplier = capabilityPanel.querySelector('[data-cap-supplier]');
const capDescription = capabilityPanel.querySelector('[data-cap-description]');
const seatingDescription = capDescription.textContent;
const capabilityMedia = document.querySelector('.capability-media');
const capabilityMediaCurrent = capabilityMedia?.querySelector('[data-capability-media-current]');
const capabilityMediaNext = capabilityMedia?.querySelector('[data-capability-media-next]');
let capabilityMediaTimer = 0;
let capabilityPanelTimer = 0;

const capabilityData = {
  'Seating': {
    description: seatingDescription,
    supplier: 'Lear',
    image: 'assets/tsh-seating-line.png',
    position: '62% center'
  },
  'Body-in-white': {
    description: 'The body-in-white forms the structural foundation of a vehicle. Establishing this manufacturing capability locally supports a critical stage of the automotive value chain.',
    supplier: 'Shin Young',
    image: 'assets/capabilities-robot-assembly.png',
    position: '62% center'
  },
  'Chassis': {
    description: 'Chassis systems carry the vehicle and shape how it handles and performs. Local capability strengthens the link between specialist component manufacturing and the OEM production line.',
    supplier: 'BENTELER',
    image: 'assets/capability-chassis-transparent-car.png',
    position: '58% center'
  },
  'Interior plastics': {
    description: 'From cabin surfaces to functional interior parts, plastic components shape the in-vehicle experience. Local manufacturing brings this capability into the Saudi supply chain.',
    supplier: 'Fangxin',
    image: 'assets/capability-interior-automation.png',
    position: '48% center'
  },
  'Exterior plastics': {
    description: "Exterior plastic components combine form and function across the vehicle. Localizing their manufacture expands the range of components available within the Kingdom’s automotive ecosystem.",
    supplier: 'JVIS',
    image: 'assets/capability-exterior-ev-detail.png',
    position: '45% center'
  }
};

Object.values(capabilityData).forEach(({ image }) => {
  const preload = new Image();
  preload.src = image;
});

const setCapabilityMedia = (name) => {
  if (!capabilityMediaCurrent || !capabilityMediaNext) return;
  const data = capabilityData[name] || capabilityData.Seating;
  const currentImage = capabilityMediaCurrent.style.getPropertyValue('--capability-image');
  const nextImage = `url("${data.image}")`;
  capabilityMedia.setAttribute('aria-label', `${name} manufacturing capability image`);
  if (currentImage === nextImage) return;

  window.clearTimeout(capabilityMediaTimer);
  capabilityMediaNext.style.setProperty('--capability-image', nextImage);
  capabilityMediaNext.style.setProperty('--capability-position', data.position);
  capabilityMediaNext.classList.remove('is-exiting');

  if (reducedMotion) {
    capabilityMediaCurrent.style.setProperty('--capability-image', nextImage);
    capabilityMediaCurrent.style.setProperty('--capability-position', data.position);
    return;
  }

  capabilityMediaCurrent.classList.add('is-exiting');
  capabilityMediaNext.classList.add('is-active');
  capabilityMediaTimer = window.setTimeout(() => {
    capabilityMediaCurrent.style.setProperty('--capability-image', nextImage);
    capabilityMediaCurrent.style.setProperty('--capability-position', data.position);
    capabilityMediaCurrent.classList.remove('is-exiting');
    capabilityMediaNext.classList.remove('is-active');
  }, 980);
};

const selectCapability = (tab, options = {}) => {
  if (!tab) return;
  capabilityTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  const name = tab.dataset.cap;
  const data = capabilityData[name] || capabilityData.Seating;
  capTitle.textContent = name;
  capEyebrow.textContent = name;
  capSupplier.textContent = data.supplier;
  capDescription.textContent = data.description;
  capDescription.hidden = false;
  setCapabilityMedia(name);
  capabilityPanel.setAttribute('aria-labelledby', tab.id);
  tab.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  window.clearTimeout(capabilityPanelTimer);
  capabilityPanel.classList.remove('is-switching');
  if (!reducedMotion) {
    window.requestAnimationFrame(() => capabilityPanel.classList.add('is-switching'));
    capabilityPanelTimer = window.setTimeout(() => capabilityPanel.classList.remove('is-switching'), 520);
  }
  if (options.focus) tab.focus();
};

setCapabilityMedia('Seating');

capabilityTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCapability(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % capabilityTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + capabilityTabs.length) % capabilityTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = capabilityTabs.length - 1;
    capabilityTabs[next].focus();
    selectCapability(capabilityTabs[next]);
  });
});

const locationSection = document.querySelector('.location');
const locationSlides = [...document.querySelectorAll('.location-slide')];
const locationTriggers = [...document.querySelectorAll('[data-location-index]')];
let locationIndex = 0;
let locationTimer = 0;
let locationPaused = false;

const showLocation = (index) => {
  locationIndex = (index + locationSlides.length) % locationSlides.length;
  locationSlides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === locationIndex));
  locationTriggers.forEach((trigger, triggerIndex) => {
    const active = triggerIndex === locationIndex;
    trigger.classList.toggle('is-active', active);
    if (active) trigger.setAttribute('aria-current', 'true');
    else trigger.removeAttribute('aria-current');
  });
};

const stopLocationRotation = () => {
  if (locationTimer) window.clearInterval(locationTimer);
  locationTimer = 0;
};

const startLocationRotation = () => {
  stopLocationRotation();
  if (reducedMotion || locationPaused) return;
  locationTimer = window.setInterval(() => showLocation(locationIndex + 1), 5800);
};

locationTriggers.forEach((trigger, index) => trigger.addEventListener('click', () => {
  showLocation(index);
  startLocationRotation();
}));

locationSection.addEventListener('mouseenter', () => { locationPaused = true; stopLocationRotation(); });
locationSection.addEventListener('mouseleave', () => { locationPaused = false; startLocationRotation(); });
locationSection.addEventListener('focusin', () => { locationPaused = true; stopLocationRotation(); });
locationSection.addEventListener('focusout', () => {
  window.setTimeout(() => {
    if (!locationSection.contains(document.activeElement)) {
      locationPaused = false;
      startLocationRotation();
    }
  }, 0);
});

if (!reducedMotion) {
  const locationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? startLocationRotation() : stopLocationRotation());
  }, { threshold: .2 });
  locationObserver.observe(locationSection);
}

const searchDialog = document.querySelector('[data-search-dialog]');
const searchOpen = document.querySelector('[data-search-open]');
const searchInput = document.querySelector('[data-search-input]');
const searchStatus = document.querySelector('[data-search-status]');

searchOpen.addEventListener('click', () => {
  searchDialog.showModal();
  document.body.classList.add('search-open');
  window.setTimeout(() => searchInput.focus(), 50);
});

searchDialog.addEventListener('close', () => document.body.classList.remove('search-open'));
searchDialog.addEventListener('click', (event) => {
  if (event.target === searchDialog) searchDialog.close();
});

searchDialog.querySelector('form').addEventListener('submit', (event) => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    event.preventDefault();
    searchStatus.textContent = 'Enter a section name to search.';
    return;
  }
  const sections = [...document.querySelectorAll('main section[id]')];
  const match = sections.find((section) => section.innerText.toLowerCase().includes(query));
  if (match) {
    searchDialog.close();
    match.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  } else {
    event.preventDefault();
    searchStatus.textContent = `No section found for “${searchInput.value.trim()}”.`;
  }
});

if (!reducedMotion) {
  const heroMedia = document.querySelector('.hero-media');
  const sectionMedia = [...document.querySelectorAll('.capability-media, .location-media-stack')];
  let motionFrame = 0;

  const updateMotion = () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) heroMedia.style.translate = `0 ${y * .055}px`;
    sectionMedia.forEach((media) => {
      const rect = media.parentElement.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = (rect.top - window.innerHeight * .5) * -.035;
        media.style.translate = `0 ${offset}px`;
      }
    });
    motionFrame = 0;
  };

  const requestMotion = () => {
    if (!motionFrame) motionFrame = window.requestAnimationFrame(updateMotion);
  };

  updateMotion();
  window.addEventListener('scroll', requestMotion, { passive: true });
  window.addEventListener('resize', requestMotion, { passive: true });
}
