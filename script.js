const navBars = document.querySelectorAll('.bottom-nav');

for (const nav of navBars) {
  const buttons = nav.querySelectorAll('button');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const sibling of buttons) sibling.classList.remove('active');
      button.classList.add('active');
    });
  }
}

const buses = document.querySelectorAll('.bus-marker');

for (const bus of buses) {
  const startTop = parseFloat(getComputedStyle(bus).top);
  let direction = 1;

  setInterval(() => {
    const next = startTop + Math.sin(Date.now() / 900) * 8 * direction;
    bus.style.top = `${next}px`;
    direction *= -1;
  }, 1100);
}
