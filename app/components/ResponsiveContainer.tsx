'use client'

import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  center?: boolean
}

export default function ResponsiveContainer({ 
  children, 
  className = '', 
  padding = 'md',
  center = true 
}: ResponsiveContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2 sm:px-6 sm:py-4 lg:px-8 lg:py-6',
    md: 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8', 
    lg: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12'
  }

  const centerClasses = center ? 'mx-auto' : ''
  
  return (
    <div className={`
      w-full max-w-7xl ${centerClasses}
      ${paddingClasses[padding]}
      ${className}
    `}>
      <div className="w-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small'
  className?: string
  overlay?: boolean
}

export function ResponsiveText({ 
  children, 
  variant = 'body', 
  className = '',
  overlay = false 
}: ResponsiveTextProps) {
  const variants = {
    h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold', 
    h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold',
    h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm md:text-base'
  }

  const overlayClass = overlay ? 'gecko-text-container' : ''
  
  return (
    <div className={`${variants[variant]} ${overlayClass} ${className}`}>
      {children}
    </div>
  )
}

// Responsive grid component
interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile: number
    tablet: number  
    desktop: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '' 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8'
  }
  
  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`
  
  return (
    <div className={`grid ${gridCols} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-friendly button component
interface ResponsiveButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  disabled?: boolean
}

export function ResponsiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md', 
  fullWidth = false,
  className = '',
  disabled = false
}: ResponsiveButtonProps) {
  const variants = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white', 
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm sm:px-4 sm:py-2',
    md: 'px-4 py-2 text-base sm:px-6 sm:py-3', 
    lg: 'px-6 py-3 text-lg sm:px-8 sm:py-4'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        rounded-lg font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 touch-manipulation
        ${className}
      `}
    >
      {children}
    </button>
  )
}