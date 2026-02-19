let currentScale = 1; // Start at normal size
const btn = document.getElementById('growBtn');

btn.onclick = function() {
  currentScale += 0.2; // Increase scale by 20% each click
  btn.style.transform = `scale(${currentScale})`;
};
