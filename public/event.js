htmx.logAll();

document.body.addEventListener('htmx:configRequest', function (event) {});

document.addEventListener('htmx:afterRequest', function (event) {});

document.addEventListener('htmx:afterSwap', function (event) {
  // This event is triggered after HTMX swaps content on the page.
  console.log('HTMX content swapped:', event.detail);
});

// Function to initialize any JavaScript after HTMX content swap
function initDynamicContent() {
  // If you have any dynamic content that needs JS initialization, do it here.
  // For example, attaching event listeners to new DOM elements.
}

// Initialize dynamic content on page load
initDynamicContent();

// Listen for HTMX content swaps to re-initialize dynamic content
document.body.addEventListener('htmx:afterSwap', function () {
  initDynamicContent();
});

// You can add more JavaScript code here if needed for your scheduling tool.
// For example, code to handle form submissions, dynamic updates, etc.
