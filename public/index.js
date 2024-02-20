if (location.hostname === 'localhost') {
  htmx.logAll()
}

let fp = null
// Function to initialize any JavaScript after HTMX content swap
function initDynamicContent() {
  // If you have any dynamic content that needs JS initialization, do it here.
  // For example, attaching event listeners to new DOM elements.
  const datepickerEl = document.getElementById('datepicker')
  if (datepickerEl) {
    initFlatpickr()
  }
}

// Initialize dynamic content on page load
initDynamicContent()

// Listen for HTMX content swaps to re-initialize dynamic content
document.body.addEventListener('htmx:afterSwap', function () {
  initDynamicContent()
})

window.addEventListener('popstate', async function (event) {
  // wait dom rendering
  await new Promise((resolve) => setTimeout(resolve, 0))
  htmx.process(document.body)
  initFlatpickr()
})

function initFlatpickr() {
  const input = document.getElementById('datepicker')
  const defaultDate = input.value.split(/\s*,\s*/).map((datetime) => datetime)
  fp = flatpickr(input, {
    inline: true,
    mode: 'multiple',
    defaultHour: 19,
    enableTime: true,
    time_24hr: true,
    allowInput: false,
    locale: 'ja',
    minuteIncrement: 15,
    dateFormat: 'Y-m-d\\TH:i',
    defaultDate,
  })
}
