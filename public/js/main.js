
// Main interactive logic (candles, knife drag, slicing, countdown)
const targetDate = new Date('2026-09-16T00:00:00'); 
const daysEl = document.getElementById('days'),
      hoursEl = document.getElementById('hours'),
      minutesEl = document.getElementById('minutes'),
      secondsEl = document.getElementById('seconds');

function updateCountdown(){
  const now = new Date();
  let diff = targetDate - now;
  if(diff < 0) diff = 0;
  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  const minutes = Math.floor((diff%(1000*60*60))/(1000*60));
  const seconds = Math.floor((diff%(1000*60))/1000);
  daysEl.textContent = days;
  hoursEl.textContent = hours;
  minutesEl.textContent = minutes;
  secondsEl.textContent = seconds;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Candles logic
const candles = document.querySelectorAll('.candle');
const knife = document.getElementById('knife');
let extinguishedCount = 0;
candles.forEach(c => {
  c.addEventListener('click', () => {
    if(!c.classList.contains('extinguished')){
      c.classList.add('extinguished');
      extinguishedCount++;
      if(extinguishedCount >= candles.length){
        // show knife
        knife.style.display = 'block';
        knife.setAttribute('aria-hidden', 'false');
        knife.classList.add('ready');
      }
    }
  });
});

// Knife drag to slice
let dragging = false;
let removedSlices = new Set();
const knifeEl = knife;
const cakeEl = document.getElementById('cake');
const slices = document.querySelectorAll('.slice');

function getOffset(el){
  const rect = el.getBoundingClientRect();
  return {left:rect.left + window.scrollX, top: rect.top + window.scrollY};
}

function pointerDown(e){
  if(!knifeEl.classList.contains('ready')) return;
  dragging = true;
  knifeEl.style.cursor = 'grabbing';
  document.body.style.userSelect = 'none';
}
function pointerMove(e){
  if(!dragging) return;
  const x = (e.touches)? e.touches[0].clientX : e.clientX;
  const y = (e.touches)? e.touches[0].clientY : e.clientY;
  // move knife to pointer (clamp inside cake-wrap)
  const wrap = document.querySelector('.cake-wrap');
  const wrapRect = wrap.getBoundingClientRect();
  const nx = Math.min(Math.max(x - wrapRect.left, 20), wrapRect.width - 20);
  const ny = Math.min(Math.max(y - wrapRect.top, 20), wrapRect.height - 20);
  knifeEl.style.left = (nx - 30) + 'px';
  knifeEl.style.top = (ny - 18) + 'px';

  // compute angle relative to cake center to decide which slice to remove
  const cakeRect = cakeEl.getBoundingClientRect();
  const centerX = cakeRect.left + cakeRect.width/2;
  const centerY = cakeRect.top + cakeRect.height*0.55; // because svg translated
  const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI; // -180..180
  // map to slice index 0..5
  let ang = angle + 180; // 0..360
  const sliceIndex = Math.floor(ang / 60) % 6;
  // if pointer crosses near cake (distance)
  const dist = Math.hypot(x - centerX, y - centerY);
  if(dist < Math.max(cakeRect.width, cakeRect.height) * 0.6){
    markSliceRemoved(sliceIndex);
  }
}
function pointerUp(e){
  dragging = false;
  knifeEl.style.cursor = 'grab';
  document.body.style.userSelect = '';
}

function markSliceRemoved(i){
  if(removedSlices.has(i)) return;
  removedSlices.add(i);
  const s = Array.from(slices).find(p => parseInt(p.dataset.index) === i);
  if(s){
    s.classList.add('removed');
  }
  if(removedSlices.size >= slices.length){
    // all removed: show floating message
    const msg = document.getElementById('message');
    setTimeout(()=> msg.classList.add('show'), 600);
  }
}

knifeEl.addEventListener('pointerdown', pointerDown);
window.addEventListener('pointermove', pointerMove);
window.addEventListener('pointerup', pointerUp);

// Mobile: support touch events in case pointer events are not available
knifeEl.addEventListener('touchstart', (e)=>{ pointerDown(e); }, {passive:true});
window.addEventListener('touchmove', (e)=>{ pointerMove(e); }, {passive:true});
window.addEventListener('touchend', (e)=>{ pointerUp(e); }, {passive:true});

// Next button to gallery
document.getElementById('nextBtn').addEventListener('click', ()=>{
  location.href = 'gallery.html';
});
