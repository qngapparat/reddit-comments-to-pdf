
var onSubmit = function(ev) {
  const authorName = document.getElementById('author-input').value;
  ev.preventDefault()
  window.location.href = `/comments?author=${ authorName }`
}

var form = document.getElementById('author-form')
form.addEventListener('submit', onSubmit, true)

var dlbutton = document.getElementById('download-button')
dlbutton.addEventListener('click', onSubmit, true)

console.log("💊💊💊")