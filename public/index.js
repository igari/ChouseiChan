htmx.logAll()

let fp = null

document.body.addEventListener('htmx:configRequest', function (event) {
  const url = event.detail.path
  switch (url) {
    case '/api/createEvent':
    case '/api/updateEvent': {
      const values = htmx.values(htmx.find('#form-create-event'))
      const candidateDates = values.candidateDates
        .split(', ')
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((candidateDate) => {
          const [date, time] = candidateDate.trim().split('T')
          return { date, time }
        })
      // Override the request parameters with the candidate dates
      event.detail.parameters['candidateDates'] = candidateDates
      // TODO: improve behavior
      if (fp) fp.destroy()
      break
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
  // wait dom rendering
  await new Promise((resolve) => setTimeout(resolve, 0))
  htmx.process(document.body)
  initFlatpickr()
})

function initFlatpickr() {
  const input = document.getElementById('datepicker')
  const defaultDate = input.value.split(',').map((datetime) => datetime.trim())
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
