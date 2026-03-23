import '../scss/styles.scss';

const sections = Array.from(document.querySelectorAll('.page-section'));
const navButtons = Array.from(document.querySelectorAll('.folder'));
const desktopCanvas = document.getElementById('desktop-canvas');
const contentModal = document.getElementById('content-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const profileImage = document.getElementById('profile-image');
const folderStorageKey = 'desktop-folder-positions-v1';
const REM_BASE_PX = 12;

function switchPage(pageId, currentButton) {
  navButtons.forEach((item) => item.classList.remove('is-active'));
  sections.forEach((section) => section.classList.remove('is-active'));

  currentButton.classList.add('is-active');
  document.getElementById(pageId)?.classList.add('is-active');
  if (modalTitle) {
    modalTitle.textContent = `${currentButton.textContent.trim()} - Angela Liao`;
  }
}

function openModal() {
  if (!contentModal) return;
  contentModal.classList.add('is-open');
  contentModal.setAttribute('aria-hidden', 'false');
}

function updateDesktopImage(currentButton) {
  if (!profileImage) return;
  const nextImage = currentButton.dataset.image;
  if (!nextImage) return;
  profileImage.src = nextImage;
  profileImage.alt = `${currentButton.textContent.trim()} 對應圖片`;
}

function closeModal() {
  if (!contentModal) return;
  contentModal.classList.remove('is-open');
  contentModal.setAttribute('aria-hidden', 'true');
  navButtons.forEach((item) => item.classList.remove('is-active'));
  sections.forEach((section) => section.classList.remove('is-active'));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pxToRem(px) {
  return `${(px / REM_BASE_PX).toFixed(3).replace(/\.?0+$/, '')}rem`;
}

function saveFolderPositions() {
  if (!desktopCanvas) return;

  const positions = {};
  navButtons.forEach((button) => {
    const id = button.dataset.folderId;
    if (!id) return;
    positions[id] = {
      left: button.style.left,
      top: button.style.top
    };
  });

  localStorage.setItem(folderStorageKey, JSON.stringify(positions));
}

function loadFolderPositions() {
  if (!desktopCanvas) return;

  const saved = localStorage.getItem(folderStorageKey);
  if (!saved) return;

  try {
    const positions = JSON.parse(saved);
    navButtons.forEach((button) => {
      const id = button.dataset.folderId;
      if (!id || !positions[id]) return;
      button.style.left = positions[id].left;
      button.style.top = positions[id].top;
    });
  } catch (error) {
    localStorage.removeItem(folderStorageKey);
  }
}

function enableFolderDrag(button) {
  if (!desktopCanvas) return;

  const drag = {
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    pointerId: null
  };

  button.addEventListener('pointerdown', (event) => {
    if (window.matchMedia('(max-width: 81.667rem)').matches) return;

    const folderRect = button.getBoundingClientRect();
    drag.active = true;
    drag.moved = false;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.pointerId = event.pointerId;
    drag.offsetX = event.clientX - folderRect.left;
    drag.offsetY = event.clientY - folderRect.top;
    button.dataset.dragged = 'false';
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', (event) => {
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const canvasRect = desktopCanvas.getBoundingClientRect();
    const nextLeft = clamp(
      event.clientX - canvasRect.left - drag.offsetX,
      0,
      canvasRect.width - button.offsetWidth
    );
    const nextTop = clamp(
      event.clientY - canvasRect.top - drag.offsetY,
      0,
      canvasRect.height - button.offsetHeight
    );

    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (distance > 6) {
      drag.moved = true;
      button.classList.add('is-dragging');
    }

    button.style.left = pxToRem(Math.round(nextLeft));
    button.style.top = pxToRem(Math.round(nextTop));
  });

  button.addEventListener('pointerup', (event) => {
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    drag.active = false;
    button.classList.remove('is-dragging');

    if (drag.moved) {
      button.dataset.dragged = 'true';
      saveFolderPositions();
    }

    button.releasePointerCapture(event.pointerId);
  });

  button.addEventListener('pointercancel', () => {
    drag.active = false;
    button.classList.remove('is-dragging');
  });
}

loadFolderPositions();

navButtons.forEach((btn) => {
  enableFolderDrag(btn);

  btn.addEventListener('mouseenter', () => {
    updateDesktopImage(btn);
  });

  btn.addEventListener('focus', () => {
    updateDesktopImage(btn);
  });

  btn.addEventListener('click', () => {
    if (btn.dataset.dragged === 'true') {
      btn.dataset.dragged = 'false';
      return;
    }

    const pageId = btn.dataset.page;
    switchPage(pageId, btn);
    updateDesktopImage(btn);
    openModal();
  });
});

modalClose?.addEventListener('click', closeModal);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

let projects = [];

const projectList = document.getElementById('project-list');
const pagerNumbers = document.getElementById('pager-numbers');
const prevPage = document.getElementById('prev-page');
const nextPage = document.getElementById('next-page');

const pageSize = 4;
let currentPage = 1;

function totalPages() {
  return Math.ceil(projects.length / pageSize);
}

function createProjectCard(project) {
  return `
    <article class="project-card">
      <img src="${project.image}" alt="${project.title} 作品預覽" loading="lazy" />
      <div class="project-card__body">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-card__links">
          <a class="btn btn--primary" href="${project.demo}" target="_blank" rel="noreferrer">作品連結</a>
        </div>
      </div>
    </article>
  `;
}

function renderProjects() {
  if (!projects.length) {
    projectList.innerHTML = '<p>目前沒有作品資料。</p>';
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const pageItems = projects.slice(start, start + pageSize);

  projectList.innerHTML = pageItems.map(createProjectCard).join('');
}

function renderPager() {
  const pages = totalPages();

  pagerNumbers.innerHTML = Array.from({ length: pages }, (_, i) => {
    const page = i + 1;
    const activeClass = page === currentPage ? 'is-active' : '';
    return `<button class="pager__number ${activeClass}" data-pager="${page}">${page}</button>`;
  }).join('');

  pagerNumbers.querySelectorAll('.pager__number').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = Number(button.dataset.pager);
      updateProjectUI();
    });
  });

  prevPage.disabled = pages <= 1 || currentPage === 1;
  nextPage.disabled = pages <= 1 || currentPage === pages;
}

function updateProjectUI() {
  renderProjects();
  renderPager();
}

async function loadProjects() {
  try {
    const response = await fetch('/assets/data/projects.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    projects = await response.json();
    currentPage = 1;
    updateProjectUI();
  } catch (error) {
    projectList.innerHTML = '<p>讀取作品資料失敗，請稍後再試。</p>';
    pagerNumbers.innerHTML = '';
  }
}

prevPage?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    updateProjectUI();
  }
});

nextPage?.addEventListener('click', () => {
  if (currentPage < totalPages()) {
    currentPage += 1;
    updateProjectUI();
  }
});

loadProjects();
