import React from 'react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

export function Loader({ 
  size = 'md', 
  variant = 'spinner', 
  className, 
  text 
}: LoaderProps) {
  const baseClasses = sizeClasses[size]
  
  const renderSpinner = () => (
    <div 
      className={cn(
        baseClasses,
        'border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin',
        className
      )}
    />
  )
  
  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-blue-600 rounded-full animate-pulse',
            size === 'sm' ? 'w-2 h-2' : 
            size === 'md' ? 'w-3 h-3' : 
            size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
  
  const renderPulse = () => (
    <div 
      className={cn(
        baseClasses,
        'bg-blue-600 rounded-full animate-ping',
        className
      )}
    />
  )
  
  const renderBars = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-blue-600 animate-pulse',
            size === 'sm' ? 'w-1 h-4' :
            size === 'md' ? 'w-1 h-6' :
            size === 'lg' ? 'w-2 h-8' : 'w-2 h-12'
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      default:
        return renderSpinner()
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className={cn(
          'text-gray-600 font-medium animate-pulse',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border">
        <Loader size="lg" variant="spinner" text={text} />
      </div>
    </div>
  )
}

export function InlineLoader({ 
  text, 
  size = 'md', 
  variant = 'spinner' 
}: { 
  text?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
}) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader size={size} variant={variant} text={text} />
    </div>
  )
}

export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Loader 
      size={size} 
      variant="spinner" 
      className="border-white border-t-transparent" 
    />
  )
}