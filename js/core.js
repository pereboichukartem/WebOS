// Глобальний лічильник шарів, щоб клікнуте вікно завжди ставало поверх інших
let highestZIndex = 10;

document.addEventListener('DOMContentLoaded', () => {
  initWindowManager();
  initDesktopIcons();
  initClock();
  initBattery();
});

// 1. Підняття активного вікна на передній план
function bringToFront(win) {
  highestZIndex++;
  win.style.zIndex = highestZIndex;
}

// 2. Відкриття вікон по кліку на іконки робочого столу
function initDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.getAttribute('data-target');
      const targetWindow = document.getElementById(targetId);

      if (targetWindow) {
        targetWindow.classList.remove('hidden');
        bringToFront(targetWindow);
      }
    });
  });
}

// 3. Механіка вікон (Перетягування мишкою + Кнопки)
function initWindowManager() {
  const windows = document.querySelectorAll('.window');

  windows.forEach(win => {
    const header = win.querySelector('.window-header');
    const btnClose = win.querySelector('.btn-close');
    const btnMinimize = win.querySelector('.btn-minimize');
    const btnMaximize = win.querySelector('.btn-maximize');

    // Ставимо вікно поверх інших при будь-якому кліку на нього
    win.addEventListener('mousedown', () => bringToFront(win));

    // Кнопка "Закрити"
    btnClose.addEventListener('click', () => {
      win.classList.add('hidden');
      win.classList.remove('fullscreen');
    });

    // Кнопка "Згорнути"
    btnMinimize.addEventListener('click', () => {
      win.classList.add('hidden');
    });

    // Кнопка "Розгорнути на весь екран"
    btnMaximize.addEventListener('click', () => {
      win.classList.toggle('fullscreen');
    });

    // Логіка перетягування (Drag & Drop за шапку)
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener('mousedown', (e) => {
      // Не тягнемо, якщо клікнули по кнопках закриття/згортання або вікно на весь екран
      if (e.target.tagName === 'BUTTON' || win.classList.contains('fullscreen')) return;

      isDragging = true;
      bringToFront(win);

      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Обмеження, щоб вікно не вилітало за межі екрана зверху
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 80;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  });
}

// 4. Живий годинник у таскбарі
function initClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('uk-UA');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// 5. Індикатор реального заряду батареї (Battery Status API)
function initBattery() {
  const batteryEl = document.getElementById('battery');
  if (!batteryEl) return;

  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      function updateBattery() {
        const level = Math.round(battery.level * 100);
        const chargingIcon = battery.charging ? '⚡' : '🔋';
        batteryEl.textContent = `${chargingIcon} ${level}%`;
      }
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    });
  } else {
    batteryEl.textContent = '🔌 AC Power';
  }
}