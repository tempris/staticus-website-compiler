document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
      document.body.classList.add('input-keyboard');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('input-keyboard');
});
