import postApi from './api/postApi'
import { initPostForm, toast } from './utils'

function removeUnusedFields(formValues) {
  const payload = { ...formValues }

  if (payload.imageSource === 'upload') {
    delete payload.imageUrl
  } else {
    delete payload.image
  }

  delete payload.imageSource

  // remove id if it's add mode
  if(!payload.id) delete payload.id

  return payload
}

function jsonToFormData(jsonObject) {
  const formData = new FormData()

  for(const key in jsonObject){
    formData.set(key, jsonObject[key])
  }

  return formData
}

async function handlePostFormSubmit(formValues) {
  try {
    const payload = removeUnusedFields(formValues)
    const formData = jsonToFormData(payload)

    const savedPost = formValues.id
      ? await postApi.updateFormData(formData)
      : await postApi.addFormData(formData)

    // show success message
    toast.success('Save post successfully!')

    setTimeout(() => {
      window.location.assign(`/post-detail.html?id=${savedPost.id}`)
    }, 2000)
  } catch (error) {
    console.log('fail to save post', error)
    toast.error(`Error: ${error.message}`)
  }
}

;(async () => {
  try {
    const searchParams = new URLSearchParams(window.location.search)
    const postId = searchParams.get('id')

    const defaultValues = Boolean(postId)
      ? await postApi.getById(postId)
      : {
          title: '',
          description: '',
          author: '',
          imageUrl: '',
        }

    initPostForm({
      formId: 'postForm',
      defaultValues,
      onSubmit: handlePostFormSubmit,
    })
  } catch (error) {
    console.log('fail to fetch post details', error)
  }
})()
