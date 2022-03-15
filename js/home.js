import postApi from './api/postApi'
import { initPagination, initSearch, renderPostList, renderPagination, toast} from './utils'

async function handleFilterChange(filterName, filterValue) {
  // update query params
  try {
    const url = new URL(window.location)

    if (filterName) url.searchParams.set(filterName, filterValue)

    // reset page if needed
    if (filterName === 'title_like') url.searchParams.set('_page', 1)
    history.pushState({}, '', url)

    const { data, pagination } = await postApi.getAll(url.searchParams)
    renderPostList('postList', data)
    renderPagination('pagination', pagination)
  } catch (error) {
    console.log('fetch post list failed', error)
  }
}

function registerPostDeleteEvent() {
  document.addEventListener('post-delete', async (event) => {
    try {
      const post = event.detail
      const message = `Are you sure to remove post "${post.title}"?`
      if (window.confirm(message)) {
        await postApi.remove(post.id)
        await handleFilterChange()

        toast.success('Remove post successfully')
      }
    } catch (error) {
      console.log('failed to remove post', error)
      toast.error(error.message)
    }
  })
}

;(async () => {
  try {
    const url = new URL(window.location)

    if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1)
    if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6)

    history.pushState({}, '', url)
    const queryParams = url.searchParams

    registerPostDeleteEvent()

    initPagination({
      elementId: 'pagination',
      defaultParams: queryParams,
      onChange: (page) => handleFilterChange('_page', page),
    })
    initSearch({
      elementId: 'searchInput',
      defaultParams: queryParams,
      onChange: (value) => handleFilterChange('title_like', value),
    })

    const { data, pagination } = await postApi.getAll(queryParams)
    renderPostList('postList', data)
    renderPagination('pagination', pagination)
  } catch (error) {
    console.log('get all fail', error)
  }
})()
