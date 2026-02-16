/**
 * Utility functions for managing dynamic meta tags for social sharing
 */

/**
 * Update meta tags for course sharing
 * @param {Object} course - Course object with title, description, etc.
 */
export function updateCourseMetaTags(course) {
  if (!course) return

  const title = `${course.title} - UniqueBrains`
  const description = course.description || 'Join this course on UniqueBrains'
  const url = `https://uniquebrains.org/courses/${course.id}`
  const image = 'https://uniquebrains.org/uniquebrains-thumbnail.png.png'

  // Update document title
  document.title = title

  // Update or create meta tags
  updateMetaTag('description', description)
  
  // Open Graph tags
  updateMetaTag('og:type', 'website', 'property')
  updateMetaTag('og:url', url, 'property')
  updateMetaTag('og:title', title, 'property')
  updateMetaTag('og:description', description, 'property')
  updateMetaTag('og:image', image, 'property')
  updateMetaTag('og:image:width', '1200', 'property')
  updateMetaTag('og:image:height', '630', 'property')
  updateMetaTag('og:image:alt', `${course.title} course thumbnail`, 'property')
  
  // Twitter tags
  updateMetaTag('twitter:card', 'summary_large_image', 'property')
  updateMetaTag('twitter:url', url, 'property')
  updateMetaTag('twitter:title', title, 'property')
  updateMetaTag('twitter:description', description, 'property')
  updateMetaTag('twitter:image', image, 'property')
}

/**
 * Reset meta tags to default
 */
export function resetMetaTags() {
  const defaultTitle = 'UniqueBrains - Learning Marketplace for Unique Minds'
  const defaultDescription = 'Where every brain learns differently. Live classes for neurodivergent children with personalized learning.'
  const defaultUrl = 'https://uniquebrains.org/'
  const defaultImage = 'https://uniquebrains.org/uniquebrains-thumbnail.png.png'

  document.title = defaultTitle

  updateMetaTag('description', defaultDescription)
  
  updateMetaTag('og:type', 'website', 'property')
  updateMetaTag('og:url', defaultUrl, 'property')
  updateMetaTag('og:title', defaultTitle, 'property')
  updateMetaTag('og:description', defaultDescription, 'property')
  updateMetaTag('og:image', defaultImage, 'property')
  
  updateMetaTag('twitter:card', 'summary_large_image', 'property')
  updateMetaTag('twitter:url', defaultUrl, 'property')
  updateMetaTag('twitter:title', defaultTitle, 'property')
  updateMetaTag('twitter:description', defaultDescription, 'property')
  updateMetaTag('twitter:image', defaultImage, 'property')
}

/**
 * Helper function to update or create a meta tag
 * @param {string} name - Meta tag name or property
 * @param {string} content - Meta tag content
 * @param {string} attribute - 'name' or 'property'
 */
function updateMetaTag(name, content, attribute = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`)
  
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  
  element.setAttribute('content', content)
}
