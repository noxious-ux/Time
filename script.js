function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function createDigit(digit) {
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
  const groupOrder = [
    ['h1', 'h2'], 'colon1',
    ['m1', 'm2'], 'colon2',
    ['s1', 's2']
  ];
  const groupElems = {};

  groupOrder.forEach((group) => {
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

function getISTDate() {
  // Get current UTC time
  const now = new Date();
  // --- IST offset hardcoded here ---
  now.setMinutes(now.getMinutes() + 330); // <--- This is where IST offset is added (line 49)
  // ---------------------------------
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return { h, m, s };
}

function startFlipClock() {
  const clockContainer = document.getElementById('flipClock');
  clockContainer.innerHTML = '';
  const digits = renderClock(clockContainer);

  // Optional: Display time zone label
  let tzLabel = document.getElementById('tzLabel');
  if (!tzLabel) {
    tzLabel = document.createElement('div');
    tzLabel.id = 'tzLabel';
    tzLabel.style.textAlign = 'center';
    tzLabel.style.color = '#10ffb1';
    tzLabel.style.fontFamily = 'monospace';
    tzLabel.style.fontSize = '1.1rem';
    tzLabel.style.marginTop = '12px';
    clockContainer.parentNode.appendChild(tzLabel);
  }
  tzLabel.textContent = 'IST (UTC+05:30)';

  function update() {
    const { h, m, s } = getISTDate();
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
