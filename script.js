function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function createDigit(digit) {
  // Each digit has two halves: top and bottom
  const digitElem = document.createElement('div');
  digitElem.className = 'flip-digit';

  digitElem.innerHTML = `
    <div class="flip-inner">
      <div class="flip-half flip-top">${digit}</div>
      <div class="flip-half flip-bottom">${digit}</div>
    </div>
  `;
  return digitElem;
}

function createColon() {
  const colon = document.createElement('div');
  colon.className = 'flip-colon';
  colon.textContent = ':';
  return colon;
}

function updateDigit(digitElem, newDigit) {
  const top = digitElem.querySelector('.flip-top');
  const bottom = digitElem.querySelector('.flip-bottom');
  const prevDigit = top.textContent;

  if (prevDigit !== newDigit) {
    // Animate flip
    top.textContent = prevDigit;
    bottom.textContent = newDigit;
    digitElem.classList.remove('flip-animate');
    void digitElem.offsetWidth; // force reflow
    digitElem.classList.add('flip-animate');

    setTimeout(() => {
      top.textContent = newDigit;
      digitElem.classList.remove('flip-animate');
    }, 300);
  }
}

function renderClock(container) {
  // Layout: [H][H]:[M][M]:[S][S]
  const groupOrder = [
    ['h1', 'h2'], 'colon1',
    ['m1', 'm2'], 'colon2',
    ['s1', 's2']
  ];
  const groupElems = {};

  groupOrder.forEach((group, i) => {
    if (group === 'colon1' || group === 'colon2') {
      container.appendChild(createColon());
    } else {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'flip-group';
      group.forEach((id) => {
        const digitElem = createDigit(0);
        groupElems[id] = digitElem;
        groupDiv.appendChild(digitElem);
      });
      container.appendChild(groupDiv);
    }
  });

  return groupElems;
}

function startFlipClock() {
  const clockContainer = document.getElementById('flipClock');
  clockContainer.innerHTML = '';
  const digits = renderClock(clockContainer);

  function update() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());

    updateDigit(digits.h1, h[0]);
    updateDigit(digits.h2, h[1]);
    updateDigit(digits.m1, m[0]);
    updateDigit(digits.m2, m[1]);
    updateDigit(digits.s1, s[0]);
    updateDigit(digits.s2, s[1]);
  }

  update();
  setInterval(update, 1000);
}

startFlipClock();
