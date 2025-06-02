const body             = document.querySelector('body');
const themeToggle      = document.querySelector('.theme-switch');
const themeIcon        = document.querySelector('.theme-icon');
const textBox          = document.querySelector('#textInput');
const excludeCheck     = document.getElementById('exclude');
const densityContainer = document.getElementById('letterDensity');
const message          = document.getElementById('letterMessage');
const setLimitCheck    = document.getElementById('setLimit');
const limitInput       = document.getElementById('charLimitInput');
const limitMessage     = document.getElementById('limitMessage');
const viewMoreBtn      = document.getElementById('viewMoreBtn');

themeToggle.addEventListener('click', () => {
  const isDarkMode = body.classList.contains('dark');
  const logo       = body.querySelector('.logo');

  if (isDarkMode) {
    body.classList.remove('dark');
    themeIcon.src = '/assets/icon-moon.svg';
    logo.src = '/assets/logo-light-theme.svg';
  } else {
    body.classList.add('dark');
    themeIcon.src = '/assets/icon-sun.svg';
    logo.src = '/assets/logo-dark-theme.svg';
  }
});

textBox.addEventListener('input', updateCount);
excludeCheck.addEventListener('change', updateCount);

setLimitCheck.addEventListener('change', () => {
  limitInput.style.display = setLimitCheck.checked ? 'block' : 'none';
  limitMessage.style.display = 'none';
  textBox.classList.remove('limit-reached');
});

textBox.addEventListener('keydown', (e) => {
  if (setLimitCheck.checked && limitInput.value) {
    const limit = parseInt(limitInput.value, 10);
    const isSpecialKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Control', 'Meta'].includes(e.key);

    if (textBox.value.length >= limit && !isSpecialKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  }
});

textBox.addEventListener('paste', (e) => {
  if (setLimitCheck.checked && limitInput.value) {
    const limit         = parseInt(limitInput.value, 10);
    const paste         = e.clipboardData.getData('text');
    const currentLength = textBox.value.length;

    if (currentLength + paste.length > limit) {
      e.preventDefault();
      const allowed = paste.slice(0, limit - currentLength);
      textBox.value += allowed;
      updateCount();
    }
  }
});

viewMoreBtn.addEventListener('click', () => {
    const rows     = densityContainer.querySelectorAll('.letter-density-row');
    const expanded = viewMoreBtn.getAttribute('data-expanded') === 'true';
    const btnLabel = document.querySelector('.btn-label');

    rows.forEach((row, index) => {
        row.style.display = expanded ? (index < 5 ? 'flex' : 'none') : 'flex';
    });

    btnLabel.textContent = expanded ? 'View More' : 'View Less';
    viewMoreBtn.setAttribute('data-expanded', !expanded);
});

function updateCount() {
    const mainText      = textBox.value;
    const excludeSpaces = excludeCheck.checked;
    let textForLetters  = mainText;

    if (setLimitCheck.checked && limitInput.value) {
        const limit = parseInt(limitInput.value, 10);

        if (textBox.value.length >= limit) {
            const limitLabel = document.querySelector('.limit-label');

            textBox.classList.add('limit-reached');
            limitLabel.textContent = `Limit reached! Your text exceeds ${limit} characters.`;
            limitMessage.style.display = 'flex';
        } else {
            textBox.classList.remove('limit-reached');
            limitMessage.style.display = 'none';
        }
    }

    if (excludeSpaces) {
        textForLetters = mainText.replace(/\s/g, '');
    }

    wordCount(mainText);
    letterCount(textForLetters);
    sentenseCount(mainText);
    estimateReadingTime(mainText);
    updateLetterDensity(mainText);
}

function wordCount(mainText) {
    const wordCounter = document.getElementById('wordCount');
    const words       = mainText.trim().split(/\s+/).filter(Boolean);

    wordCounter.innerHTML = words.length.toString().padStart(2, '0');
}

function letterCount(mainText) {
    const charCounter = document.getElementById('charCount');

    charCounter.innerHTML = mainText.length.toString().padStart(2, '0');
}

function sentenseCount(mainText) {
    const sentenceCounter = document.getElementById('sentCount');
    const sentences       = mainText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
        
    sentenceCounter.innerHTML = sentences.length.toString().padStart(2, '0');
}

function estimateReadingTime(mainText) {
    const readMinutes    = document.getElementById('readingTime');
    const words          = mainText.trim().split(/\s+/).filter(Boolean);
    const wordsPerMinute = 200;

    if (words.length === 0) {
        readMinutes.innerHTML = '0 minutes';
        return;
    }

    const totalSeconds = (words.length / wordsPerMinute) * 60;

    if (totalSeconds < 60) {
        readMinutes.innerHTML = 'Less than a minute';
    } else {
        const minutes = Math.ceil(totalSeconds / 60);
        readMinutes.innerHTML = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}

function updateLetterDensity(mainText) {
    const cleaned      = mainText.toLowerCase().replace(/[^a-z]/g, '');
    const totalLetters = cleaned.length;

    if (totalLetters === 0) {
        densityContainer.innerHTML = '';
        message.style.display = 'block';
        viewMoreBtn.style.display = 'none';
        return;
    } else {
        message.style.display = 'none';
    }

    const counts = {};

    for (let char of cleaned) {
        counts[char] = (counts[char] || 0) + 1;
    }

    const allRows = document.querySelectorAll('.letter-density-row');

    allRows.forEach(row => {
        const letter = row.dataset.letter;
        if (!(letter in counts)) {
            row.remove();
        }
    });

    Object.keys(counts).forEach(letter => {
    const percent     = (counts[letter] / totalLetters) * 100;
    const existingRow = document.querySelector(`.letter-density-row[data-letter="${letter}"]`);

    if (existingRow) {
        const fill  = existingRow.querySelector('.fill');
        const label = existingRow.querySelector('.percent');

        fill.style.width  = `${percent}%`;
        label.textContent = `${counts[letter]} (${percent.toFixed(2)}%)`;
    } else {
        const row = document.createElement('div');

        row.classList.add('letter-density-row');
        row.dataset.letter = letter;

        row.innerHTML = `
        <span class="letter-label">${letter.toUpperCase()}</span>
        <div class="progress-bar">
            <div class="fill" style="width: ${percent}%"></div>
        </div>
        <span class="percent">${counts[letter]} (${percent.toFixed(2)}%)</span>
        `;

        densityContainer.appendChild(row);
    }
    });

  const rows     = densityContainer.querySelectorAll('.letter-density-row');
  const expanded = viewMoreBtn.getAttribute('data-expanded') === 'true';

  rows.forEach((row, index) => {
    row.style.display = expanded || index < 5 ? 'flex' : 'none';
  });

  viewMoreBtn.style.display = rows.length > 5 ? 'inline-flex' : 'none';
}
