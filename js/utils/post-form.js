import { setBackgroundImage, setTextContent } from '.'
import { randomNumber, setFieldValue } from './common'
import * as yup from 'yup'

const ImageSource = {
  PICSUM: 'picsum',
  UPLOAD: 'upload',
}

function setFormValues(form, formValues) {
  setFieldValue(form, '[name="title"]', formValues?.title)
  setFieldValue(form, '[name="author"]', formValues?.author)
  setFieldValue(form, '[name="description"]', formValues?.description)

  setFieldValue(form, '[name="imageUrl"]', formValues?.imageUrl)
  setBackgroundImage(document, '#postHeroImage', formValues?.imageUrl)
}

function getFormValues(form) {
  const formValues = {}

  // ;['title', 'author', 'description', 'imageUrl'].forEach((name) => {
  //   const field = form.querySelector(`[name="${name}"]`)
  //   if (field) formValues[name] = field.value
  // })

  const data = new FormData(form)
  for (const [key, value] of data) {
    formValues[key] = value
  }

  return formValues
}

function getPostSchema() {
  return yup.object().shape({
    title: yup.string().required('Please enter title'),
    author: yup
      .string()
      .required('Please enter author')
      .test(
        'at-least-two-words',
        'please enter at least two words',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 2
      ),
    description: yup.string(),
    imageSource: yup
      .string()
      .required('Please select an image source')
      .oneOf([ImageSource.PICSUM, ImageSource.UPLOAD], 'Invalid image source'),
    imageUrl: yup.string().when('imageSource', {
      is: ImageSource.PICSUM,
      then: yup
        .string()
        .required('Please random a background image')
        .url('Please enter a valid URL'),
    }),
    image: yup.mixed().when('imageSource', {
      is: ImageSource.UPLOAD,
      then: yup
        .mixed()
        .test('required', 'Please select an image to upload', (file) => Boolean(file?.name))
        .test('max-3mb', 'The image is too large (max 3MB)', (file) => {
          const fileSize = file?.size || 0
          const MAX_SIZE = 5 * 1024 * 1024
          return fileSize <= MAX_SIZE
        }),
    }),
  })
}

function setFieldError(form, name, error) {
  const element = form.querySelector(`[name="${name}"]`)
  if (element) {
    element.setCustomValidity(error)
    setTextContent(element.parentElement, '.invalid-feedback', error)
  }
}

async function validatePostForm(form, formValues) {
  try {
    ;['title', 'author', 'imageUrl', 'image '].forEach((name) => setFieldError(form, name, ''))
    const schema = getPostSchema()
    await schema.validate(formValues, { abortEarly: false })
  } catch (error) {
    const errorLog = {}

    if (error.name === 'ValidationError' && Array.isArray(error.inner)) {
      for (const validationError of error.inner) {
        const name = validationError.path

        if (errorLog[name]) continue
        setFieldError(form, name, validationError.message)

        errorLog[name] = true
      }
    }
  }

  const isValid = form.checkValidity()
  if (!isValid) form.classList.add('was-validated')
  return isValid
}

async function validateFormField(form, formValues, name) {
  try {
    setFieldError(form, name, '')

    const schema = getPostSchema()
    await schema.validateAt(name, formValues)
  } catch (error) {
    setFieldError(form, name, error.message)
  }

  const field = form.querySelector(`[name="${name}"]`)
  if (field && !field.checkValidity()) {
    field.parentElement.classList.add('was-validated')
  }
}

function showLoading(form) {
  const button = form.querySelector('[name="submit"]')
  if (button) {
    button.disabled = true
    button.textContent = 'Saving...'
  }
}
function hideLoading(form) {
  const button = form.querySelector('[name="submit"]')
  if (button) {
    button.disabled = false
    button.textContent = 'Save'
  }
}

function initRandomImage(form) {
  const randomButton = document.getElementById('postChangeImage')
  if (!randomButton) return

  randomButton.addEventListener('click', () => {
    const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}/1368/400`

    setFieldValue(form, '[name="imageUrl"]', imageUrl)
    setBackgroundImage(document, '#postHeroImage', imageUrl)
  })
}

function renderImageSourceControl(form, selectedValue) {
  const controlList = form.querySelectorAll('[data-id="imageSource"]')
  controlList.forEach((control) => {
    control.hidden = control.dataset.imageSource !== selectedValue
  })
}

function initRadioImageSource(form) {
  const radioList = form.querySelectorAll('[name="imageSource"]')
  radioList.forEach((radio) => {
    radio.addEventListener('change', (event) => renderImageSourceControl(form, event.target.value))
  })
}

function initUploadImage(form) {
  const uploadImage = form.querySelector('[name="image"]')
  if (!uploadImage) return

  uploadImage.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setBackgroundImage(document, '#postHeroImage', imageUrl)

      validateFormField(form, { imageSource: ImageSource.UPLOAD, image: file }, 'image')
    }
  })
}

function initValidationOnChange(form) {
  ;['title', 'author'].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`)
    if (field) {
      field.addEventListener('input', (event) => {
        const newValue = event.target.value
        validateFormField(form, { [name]: newValue }, name)
      })
    }
  })
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId)
  if (!form) return

  let submitting = false

  setFormValues(form, defaultValues)

  initRandomImage(form)
  initRadioImageSource(form)
  initUploadImage(form)
  initValidationOnChange(form)

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (submitting) return

    showLoading(form)
    submitting = true

    // get form value
    const formValues = getFormValues(form)

    // validation
    // if valid, trigger submit callback
    // otherwise, show error
    const isValid = await validatePostForm(form, formValues)
    if (isValid) await onSubmit?.(formValues)

    hideLoading(form)
    submitting = false
  })
}
