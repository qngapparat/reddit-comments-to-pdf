
var mode = 'comments' // or 'Posts'

var onSubmit = function(ev) {
  const authorName = document.getElementById('author-input').value;
  ev.preventDefault()
  document.getElementById('hint').innerHTML = '<div class="loader">ewg</div>'
  window.location.href = mode === 'comments' 
    ? `/comments?author=${ authorName }`
    : `/posts?author=${ authorName }`
}

var onModeToggle = function(ev) {
  if(mode == 'comments'){
    mode = 'posts'
    document.getElementById('toggletext').innerHTML = 'Posts'
  } 
  else {
    mode = 'comments'
    document.getElementById('toggletext').innerHTML = 'Comments'
  }
}

document
 .getElementById('author-form')
 .addEventListener('submit', onSubmit, true)

document 
  .getElementById('toggletext-box')
  .addEventListener('click', onModeToggle, true)
