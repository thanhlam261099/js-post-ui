import postApi from './api/postApi'
import { registerLightbox, setTextContent } from './utils'
import dayjs from 'dayjs'

function renderPostList(post) {
  if (!post) return

  setTextContent(document, '#postDetailTitle', post.title)
  setTextContent(document, '#postDetailDescription', post.description)
  setTextContent(document, '#postDetailAuthor', post.author)
  setTextContent(
    document,
    '#postDetailTimeSpan',
    dayjs(post.updatedAt).format(' - DD/MM/YYYY HH:mm')
  )

  const heroImage = document.getElementById('postHeroImage')
  if (heroImage) {
    heroImage.style.backgroundImage = `url("${post.imageUrl}")`
    heroImage.addEventListener('error', () => {
      thumbnailElement.src = 'https://via.placeholder.com/1368x400?text=:D'
    })
  }

  const editPageLink = document.getElementById('goToEditPageLink')
  if (editPageLink) {
    editPageLink.href = `/add-edit-post.html?id=${post.id}`
    editPageLink.textContent = 'Edit post'
  }
}

;(async () => {
  registerLightbox({
    modalId: 'lightbox',
    imgSelector: 'img[data-Id="lightboxImg"]', 
    prevSelector: 'button[data-Id="lightboxPrev"]', 
    nextSelector: 'button[data-Id="lightboxNext"]'
  })

  try {
    const searchParams = new URLSearchParams(window.location.search)
    const postId = searchParams.get('id')
    if (!postId) {
      console.log('post not found')
      return
    }
    const post = await postApi.getById(postId)
    renderPostList(post)
  } catch (error) {
    console.log('fail to fetch post detail', error)
  }
})()
