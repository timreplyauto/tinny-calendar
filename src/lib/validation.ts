// Input validation and sanitization

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return ''
  
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Limit length
  sanitized = sanitized.slice(0, maxLength)
  
  // Trim whitespace
  return sanitized.trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9_]{3,30}$/
  return usernameRegex.test(username)
}

export function validateEventData(data: any): { valid: boolean; error?: string } {
  if (!data.title || typeof data.title !== 'string') {
    return { valid: false, error: 'Title is required' }
  }
  
  if (data.title.length > 200) {
    return { valid: false, error: 'Title too long (max 200 characters)' }
  }
  
  if (data.description && data.description.length > 5000) {
    return { valid: false, error: 'Description too long (max 5000 characters)' }
  }
  
  if (!data.start_time || !Date.parse(data.start_time)) {
    return { valid: false, error: 'Invalid start time' }
  }
  
  if (!data.end_time || !Date.parse(data.end_time)) {
    return { valid: false, error: 'Invalid end time' }
  }
  
  const start = new Date(data.start_time)
  const end = new Date(data.end_time)
  
  if (end <= start) {
    return { valid: false, error: 'End time must be after start time' }
  }
  
  return { valid: true }
}

export function validateAIPrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required' }
  }
  
  if (prompt.length < 3) {
    return { valid: false, error: 'Prompt too short' }
  }
  
  if (prompt.length > 1000) {
    return { valid: false, error: 'Prompt too long (max 1000 characters)' }
  }
  
  return { valid: true }
}

// Prevent SQL injection in search queries
export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[';--]/g, '').trim().slice(0, 100)
}
