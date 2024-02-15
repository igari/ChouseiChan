document.body.addEventListener('htmx:configRequest', function (event) {
  const candidate_dates = window.flatpickr.input.value
    .split(',')
    .map((candidate_date) => {
      const [date, time] = candidate_date.trim().split(/\s/);
      return { date, time };
    });
  // Override the request parameters with the candidate dates
  event.detail.parameters['candidate_dates'] = candidate_dates;
});

document.addEventListener('htmx:afterRequest', function (event) {
  // This event is triggered after an HTMX AJAX request is made.
  console.log('HTMX request made:', event.detail);
});

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
