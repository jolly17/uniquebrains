import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function SEO({ 
  title = 'UniqueBrains - Where the Neurodiverse Community Connects and Thrives',
  description = 'A platform built for neurodivergent individuals and families. Learn with free courses, connect with supportive community, access curated content, and find care resources—all in one place.',
  keywords,
  canonical
}) {
  const location = useLocation()
  const baseUrl = 'https://uniquebrains.org'
  const fullUrl = canonical || `${baseUrl}${location.pathname}`

  useEffect(() => {
    // Update title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${property}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, property)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }

    // Update description
    updateMetaTag('description', description)
    
    // Update keywords if provided
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Update canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', fullUrl)

    // Update Open Graph tags
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:url', fullUrl, true)

    // Update Twitter tags
    updateMetaTag('twitter:title', title, true)
    updateMetaTag('twitter:description', description, true)
    updateMetaTag('twitter:url', fullUrl, true)
  }, [title, description, keywords, fullUrl])

  return null
}

export default SEO
