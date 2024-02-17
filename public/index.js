htmx.logAll()

let fp = null

document.body.addEventListener('htmx:configRequest', function (event) {
  const url = new URL(event.detail.path)
  switch (url.pathname.split('/').at(-1)) {
    case 'createEvent': {
      const values = htmx.values(htmx.find('#form-create-event'))
      const candidateDates = values.candidateDates
        .split(',')
        .map((candidateDate) => {
          const [date, time] = candidateDate.trim().split(/\s/)
          return { date, time }
        })
      // Override the request parameters with the candidate dates
      event.detail.parameters['candidateDates'] = candidateDates

      if (fp) fp.destroy()
    }
  }
})

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
  await new Promise((resolve) => setTimeout(resolve, 0))
  htmx.process(document.body)
  initFlatpickr()
})

function initFlatpickr() {
  fp = flatpickr('#datepicker', {
    inline: true,
    mode: 'multiple',
    defaultHour: 19,
    enableTime: true,
    time_24hr: true,
    allowInput: false,
    locale: 'ja',
    minuteIncrement: 15,
  })
}
