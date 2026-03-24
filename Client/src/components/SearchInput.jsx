import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function SearchInput() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const isFocusedRef = useRef(false)
  const lastUrlSearchRef = useRef('')

  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || ''
    if (!isFocusedRef.current && searchFromUrl !== lastUrlSearchRef.current) {
      lastUrlSearchRef.current = searchFromUrl
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(searchFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    const handleFocus = () => { isFocusedRef.current = true }
    const handleBlur = () => { 
      isFocusedRef.current = false
      setInputValue(searchParams.get('search') || '')
    }
    
    const input = inputRef.current
    if (input) {
      input.addEventListener('focusin', handleFocus)
      input.addEventListener('focusout', handleBlur)
      return () => {
        input.removeEventListener('focusin', handleFocus)
        input.removeEventListener('focusout', handleBlur)
      }
    }
  }, [searchParams])

  const handleChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      if (value.length < 2) {
        navigate('/leads?page=1', { replace: true })
      } else {
        navigate(`/leads?search=${encodeURIComponent(value)}&page=1`, { replace: true })
      }
    }, 400)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search by name, email, company..."
        value={inputValue}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  )
}
