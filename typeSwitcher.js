const jsonType = document.createElement("script")
      jsonType.src="jsonQueue.js"

      const xmlType = document.createElement("script")
      xmlType.src="xmlQueue.js"

const file = document.querySelector('.file')

file.addEventListener('change', e => {
    let pointIndex = e.target.value.indexOf('.')
    let switcher = e.target.value.slice(pointIndex+1)

    if (switcher === "xml") {
        document.querySelector('body').appendChild(xmlType)
    } else {
        document.querySelector('body').appendChild(jsonType)
    }
})