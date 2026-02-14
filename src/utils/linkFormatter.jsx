// Utility function to convert URLs in text to clickable links
export const formatLinksInText = (text) => {
  if (!text) return text

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  
  // Split text by URLs and create an array of text and link elements
  const parts = text.split(urlRegex)
  
  return parts.map((part, index) => {
    // If this part matches a URL, create a link
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-link"
        >
          {part}
        </a>
      )
    }
    // Otherwise, return the text as is
    return part
  })
}
