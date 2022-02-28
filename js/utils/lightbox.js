function showModal(modalElement) {
  const modal = new window.bootstrap.Modal(modalElement)
  if (modal) modal.show()
}

// handle click for all imgs => event delegation
// img click => ind all imgs with the same album / gallery
// determine index of selected img
// show modal with selected img
// handle prev/next click
export function registerLightbox({ modalId, imgSelector, prevSelector, nextSelector }) {
  const modalElement = document.getElementById(modalId)
  if (!modalElement) return

  // check if this modal is register or not
  if(Boolean(modalElement.dataset.registered)) return

  const imageElement = modalElement.querySelector(imgSelector)
  const prevButton = modalElement.querySelector(prevSelector)
  const nextButton = modalElement.querySelector(nextSelector)
  if (!imageElement || !prevButton || !nextButton) return

  let imgList = []
  let currentIndex = 0

  function showImageAtIndex(index) {
    imageElement.src = imgList[index].src
  }

  document.addEventListener('click', (event) => {
    const { target } = event
    if (target.tagName !== 'IMG' || !target.dataset.album) return

    // img with data-album
    imgList = document.querySelectorAll(`img[data-album="${target.dataset.album}"]`)
    currentIndex = [...imgList].findIndex((x) => x === target)

    showImageAtIndex(currentIndex)
    showModal(modalElement)
  })

  prevButton.addEventListener('click', () => {
    // show prev img of current album
    currentIndex = (currentIndex - 1 + imgList.length) % imgList.length
    showImageAtIndex(currentIndex)
  })

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % imgList.length
    showImageAtIndex(currentIndex)
  })

  modalElement.dataset.registered = 'true'
}
