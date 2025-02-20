let pswpElement = null;

const gallerySelector = '.pswp-gallery';
const itemSelector = '.pswp-gallery__item';

let fullscreenOnOpen = false;

let scrollAnimationFrame;
let scrollElement = null;

let isSwitchingGalleries = false;
let newSwitchingGalleryIndex = 0;
let newSwitchingItemIndex = 0;

// ============================================================================
// Debug
// ============================================================================

const debugLogConfig = {
  Event:               { enabled: true, color: 'color: #9fbbe0' }, // blue (50% white)
  Content:             { enabled: false, color: 'color: #ffbf80' }, // orange (50% white)
  PointerGesture:      { enabled: false, color: 'color: #96d896' }, // green (50% white)
  EventDocumentWindow: { enabled: false, color: 'color: #eb9393' }, // red (50% white)
  Scroll:              { enabled: true, color: 'color: #c8a8e0' }, // purple (50% white)
  Caption:             { enabled: false, color: 'color: #c5aaa2' }, // brown (50% white)
  Fullscreen:          { enabled: false, color: 'color: #f1b9d6' }, // pink (50% white)
  URL:                 { enabled: false, color: 'color: #d6d859' }, // yellow-green (50% white)
};

function debugLog(tag, ...msgs) {
  const config = debugLogConfig[tag];
  if (config && config.enabled) {
    console.log(`%c[${tag}]`, config.color, ...msgs);
  }
}

// ============================================================================
// Construct
// ============================================================================

const lightbox = new PhotoSwipeLightbox({
  gallery: gallerySelector,
  children: itemSelector,
  pswpModule: PhotoSwipe
});

function isValidLightbox() {
  return lightbox && lightbox.pswp;
}

// ============================================================================
// Open
// ============================================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function openGalleryItemIndexes(galleryIndex, itemIndex) {
  debugLog('URL', 'openGalleryItemIndexes, galleryIndex:', galleryIndex, ', itemIndex:', itemIndex);

  const galleryElements = document.querySelectorAll(gallerySelector);

  const galleryElement = galleryElements[galleryIndex];

  lightbox.loadAndOpen(itemIndex, { gallery: galleryElement });
}

// ============================================================================
// Scroll to Element
// ============================================================================

function getViewportHeight() {
  debugLog('Scroll', 'getViewportHeight');

  return window.innerHeight || document.documentElement.clientHeight;
}

function getViewportWidth() {
  debugLog('Scroll', 'getViewportWidth');

  return window.innerWidth || document.documentElement.clientWidth;
}

function getWindowScrollPosition() {
  debugLog('Scroll', 'getWindowScrollPosition');

  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset
  };
}

function getCurrentItem() {
  debugLog('Scroll', 'getCurrentItem');

  if (!isValidLightbox()) {
    return null;
  }

  const currSlide = lightbox.pswp.currSlide;
  
  if (!currSlide || !currSlide.data) return null;
  
  // Scroll the element into view if it is off-screen
  return currSlide.data.element;
}

function getScrollElement() {
  debugLog('Scroll', 'getScrollElement');

  let currentItem = getCurrentItem();

  if (!currentItem) {
    return null;
  }
  
  // Check if the element's parent is a figure with a figcaption child
  if (currentItem.parentNode.tagName.toLowerCase() === 'figure' && currentItem.parentNode.querySelector('figcaption')) {
    currentItem = currentItem.parentNode;
  }

  return currentItem;
}

function getScrollElementPositionY() {
  debugLog('Scroll', 'getScrollElementPositionY');

  const elementRect = scrollElement.getBoundingClientRect();
  const viewportScrollPosition = getWindowScrollPosition().y;
  const viewportHeight = getViewportHeight();

  // Calculate the target scroll position to center the element vertically
  let targetScrollPosition = viewportScrollPosition;

  if (elementRect.top < 0 || elementRect.bottom > viewportHeight) {
    // Center the element vertically in the viewport
    targetScrollPosition = viewportScrollPosition + elementRect.top - (viewportHeight / 2 - elementRect.height / 2);
  }

  debugLog('Scroll', 'getScrollElementPositionY, targetScrollPosition:', targetScrollPosition);

  return targetScrollPosition;
}

function scrollToScrollElement(duration) {
  debugLog('Scroll', 'scrollToScrollElement, duration: ', duration);

  const startPosition = getWindowScrollPosition().y;
  const targetPosition = getScrollElementPositionY();
  
  debugLog('Scroll', 'scrollToScrollElement, startPosition: ', startPosition);
  debugLog('Scroll', 'scrollToScrollElement, targetPosition: ', targetPosition);

  if (startPosition == targetPosition) {
    return;
  }

  if (duration === 0) {
    window.scrollTo(0, targetPosition); // Scroll immediately
    return;
  }

  if (typeof duration !== 'number' || duration < 0) {
    duration = lightbox.pswp.options.showAnimationDuration;
  }

  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);

    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      scrollAnimationFrame = requestAnimationFrame(animation);
    }
  }

  function easeInOutQuad(t, b, c, d) {
    if (d === 0) return b + c; // Immediately go to the target position if duration is 0
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  scrollAnimationFrame = requestAnimationFrame(animation);
}

function jumpToScrollElement() {
  debugLog('Scroll', 'jumpToScrollElement');
  
  if (scrollAnimationFrame) {
    cancelAnimationFrame(scrollAnimationFrame);
    scrollToScrollElement(0);
  }
}

// Use this function to scroll the element into view if it is off-screen
function processScrollElement() {
  scrollElement = getScrollElement();

  debugLog('Scroll', 'processScrollElement, scrollElement: ', scrollElement);

  scrollToScrollElement();
}

// ============================================================================
// Fullscreen
// ============================================================================

// Function to check if we are in fullscreen mode
function isFullscreen() {
  debugLog('Fullscreen', 'debugLog_Fullscreen');

  return !!(
    // alternative standard method:
    document.fullscreenElement ||
    // current working methods:
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

// Function to check if fullscreen is supported
function isFullscreenSupported() {
  debugLog('Fullscreen', 'isFullscreenSupported');

  return !!(
    document.fullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.msFullscreenEnabled
  );
}

// Function to update fullscreen button content
function updateFullscreenButton(isFullscreen) {
  debugLog('Fullscreen', 'updateFullscreenButton, isFullscreen:', isFullscreen);

  const button = document.querySelector('.pswp__button--fs');
  if (button) {
    if (isFullscreen) {
      button.innerHTML = '<span class="icon-module_photoswipe-fullscreen-disable"></span>';
    } else {
      button.innerHTML = '<span class="icon-module_photoswipe-fullscreen-enable"></span>';
    }
  }
}

// Function to request fullscreen mode
function enterFullscreen() {
  debugLog('Fullscreen', 'enterFullscreen');

  const elem = document.documentElement; // You can also target a specific element if needed
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
    elem.msRequestFullscreen();
  }
  updateFullscreenButton(true);
}

// Function to exit fullscreen mode
function exitFullscreen() {
  debugLog('Fullscreen', 'exitFullscreen');

  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { // Firefox
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE/Edge
    document.msExitFullscreen();
  }
  updateFullscreenButton(false);
}

// Function to toggle fullscreen mode
function toggleFullscreen() {
  debugLog('Fullscreen', 'toggleFullscreen');

  if (!isFullscreen()) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
}

if (isFullscreenSupported()) {
  lightbox.on('uiRegister', function() {
    debugLog('Fullscreen', 'uiRegister pswp__button--fs');
  
    lightbox.pswp.ui.registerElement({
      name: 'fullscreen-button',
      order: 8,
      isButton: true,
      tagName: 'button',
      html: '<span class="icon-module_photoswipe-fullscreen-enable"></span>',
      title: 'Fullscreen',
      className: 'pswp__button--fs',
      onClick: toggleFullscreen
    });
  });
}

// ============================================================================
// Zoom Indicator
// ============================================================================

// lightbox.on('uiRegister', function() {
//   lightbox.pswp.ui.registerElement({
//     name: 'zoom-level-indicator',
//     order: 9,
//     onInit: (el, pswp) => {
//       pswp.on('zoomPanUpdate', (e) => {
//         if (e.slide === pswp.currSlide) {
//           el.innerHTML = '<span class="label">Zoom</span><span class="value">' + Math.ceil(pswp.currSlide.currZoomLevel * 100) + '%</span>';
//         }
//       });
//     }
//   });
// });

// ============================================================================
// Caption
// ============================================================================

lightbox.on('uiRegister', function() {
  debugLog('Caption', 'uiRegister custom-caption');

  lightbox.pswp.ui.registerElement({
    name: 'custom-caption',
    order: 9,
    isButton: false,
    appendTo: 'root',
    html: 'Caption text',
    onInit: (el, pswp) => {
      lightbox.pswp.on('change', () => {
        debugLog('Caption', 'custom-caption change');
      
        const currSlideElement = lightbox.pswp.currSlide.data.element;
        let captionHTML = '';
        if (currSlideElement) {
          const parentElement = currSlideElement.parentElement;
          let captionElement = null;

          if (parentElement && parentElement.tagName.toLowerCase() === 'figure') {
            captionElement = parentElement.querySelector('figcaption');
          }

          if (captionElement) {
            // get caption from figcaption element
            captionHTML = captionElement.innerHTML;
          } else {
            // get caption from alt attribute
            captionHTML = currSlideElement.querySelector('img').getAttribute('alt');
          }
        }
        if (captionHTML) {
          el.innerHTML = captionHTML;
          el.style.display = 'block';
        } else {
          el.innerHTML = '';
          el.style.display = 'none';
        }
      });
    }
  });
});

// ============================================================================
// Google Map
// ============================================================================

// parse data-google-map-url attribute
lightbox.addFilter('itemData', (itemData, index) => {
  
  const el = itemData.element;

  if (!el) {
    return;
  }

  const googleMapUrl = el.dataset.googleMapUrl;
  if (googleMapUrl) {
    itemData.googleMapUrl = googleMapUrl;
  }
  return itemData;
});

// ============================================================================
// Event - Content
// ============================================================================

lightbox.on('contentLoad', (e) => {
  debugLog('Content', 'contentLoad', e);

  const { content } = e;
  if (content.type === 'google-map') {
    // prevent the default behavior
    e.preventDefault();

    // Create a container for iframe
    // and assign it to the `content.element` property
    content.element = document.createElement('div');
    content.element.className = 'pswp__google-map-container';

    const iframe = document.createElement('iframe');
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = content.data.googleMapUrl;
    content.element.appendChild(iframe);
  }
});

// ============================================================================
// Event - Open
// ============================================================================

function getAnimationDuration() {
  return 333;
}

// photoswipe starts to open
lightbox.on('beforeOpen', () => {
  debugLog('Event', 'beforeOpen');

  lightbox.pswp.options.showAnimationDuration = getAnimationDuration();
});

// photoswipe keeps opening
// you may modify initial index or basic DOM structure
lightbox.on('firstUpdate', function() {
  debugLog('Event', 'firstUpdate');

  fullscreenOnOpen = isFullscreen();
  updateFullscreenButton(fullscreenOnOpen);
});

// photoswipe measures size of various elements
// if you need to read getBoundingClientRect of something - do it here
// lightbox.on('initialLayout', () => {
//   debugLog('Event', 'initialLayout');
// });

// triggers when slide is switched, and at initialization
lightbox.on('change', () => {
  debugLog('Event', 'change');
  
  // Update URL when slide changes
  const currSlide = lightbox.pswp.currSlide;
  
  if (!currSlide || !currSlide.data) return;
  
  const galleryElements = document.querySelectorAll(gallerySelector);
  let gallery = 0;
  for (let i = 0; i < galleryElements.length; i++) {
    if (galleryElements[i].contains(currSlide.data.element)) {
      gallery = i + 1;
      break;
    }
  }
  const item = currSlide.index + 1;

  processScrollElement();
});

lightbox.on('bindEvents', () => {
  debugLog('Event', 'bindEvents');
  // photoswipe binds DOM events (such as pointer events, wheel, etc)

  // Event listeners for .pswp__button elements to track mouseover state
  document.querySelectorAll('.pswp__button, .pswp__counter, .pswp__zoom-level-indicator, .pswp__custom-caption, .pswp__menu').forEach(element => {
    element.addEventListener('mouseenter', () => {
      mouseOverUICount += 1;
      // console.log(`Mouse entered: ${element.className}, button count: ${mouseOverUICount}`);
    });
    element.addEventListener('mouseleave', () => {
      mouseOverUICount = Math.max(mouseOverUICount - 1, 0);
      // console.log(`Mouse left: ${element.className}, button count: ${mouseOverUICount}`);
    });
  });
});

lightbox.on('openingAnimationStart', () => {
  debugLog('Event', 'closingAnimationStart');

  isSwitchingGalleries = false;

  pswpElement = document.querySelector('.pswp');
  if (pswpElement) {
    pswpElement.classList.add('pswp--animation-open');
  }
});

lightbox.on('openingAnimationEnd', () => {
  debugLog('Event', 'closingAnimationEnd');

  if (pswpElement) {
    pswpElement.classList.remove('pswp--animation-open');
  }
});

// ============================================================================
// Event - Close
// ============================================================================

// PhotoSwipe starts to close, unbind most events here
lightbox.on('close', () => {
  debugLog('Event', 'close');
  
  jumpToScrollElement();
});

lightbox.on('closingAnimationStart', () => {
  debugLog('Event', 'closingAnimationStart');

  jumpToScrollElement();

  if (!fullscreenOnOpen && isFullscreen()) {
    exitFullscreen();
  }

  if (pswpElement) {
    pswpElement.classList.add('pswp--animation-close');
  }
});

// PhotoSwipe is fully closed, destroy everything
lightbox.on('destroy', () => {
  debugLog('Event', 'destroy');

  jumpToScrollElement();

  if (isSwitchingGalleries) {
    setTimeout(() => {
      openGalleryItemIndexes(newSwitchingGalleryIndex, newSwitchingItemIndex);
    }, 1);
  }
});

// ============================================================================
// Init
// ============================================================================

lightbox.init();

// ============================================================================
// Control
// ============================================================================

function PSWP_Open(gallery, item) {
  debugLog('URL', 'PSWP_Open, gallery:', gallery, ', item:', item);

  // Open the gallery based on the new hash
  openGalleryItemIndexes(gallery, item);
}

// ============================================================================
// Document & Window
// ============================================================================

// Function to reposition the menu on window resize
function onWindowResize() {
  debugLog('EventDocumentWindow', 'onWindowResize');

  if (!isValidLightbox()) {
    return;
  }
}

// Bind the resize event to the window
window.addEventListener('resize', onWindowResize);

window.PSWP_Open = PSWP_Open;
