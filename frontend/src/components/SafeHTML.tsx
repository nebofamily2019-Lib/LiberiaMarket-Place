import DOMPurify from 'dompurify'

interface SafeHTMLProps {
  html: string
  className?: string
  allowedTags?: string[]
}

/**
 * Safely renders user-generated HTML content
 * Defense-in-depth: Server should sanitize first, this is client-side backup
 */
const SafeHTML = ({ html, className, allowedTags }: SafeHTMLProps) => {
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  })

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  )
}

export default SafeHTML
