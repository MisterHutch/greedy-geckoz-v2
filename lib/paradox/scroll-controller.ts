'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * 🌀 Paradox Scroll Controller
 * Controls all impossible physics and dimensional effects based on scroll position
 */
export class ParadoxScrollMaster {
  private scrollProgress: number = 0
  private paradoxIntensity: number = 1
  private dimensionalPhase: number = 0
  private sections: Map<string, ParadoxSection> = new Map()
  private animationFrameId: number | null = null
  
  constructor() {
    this.initializeParadox()
  }
  
  private initializeParadox() {
    if (typeof window === 'undefined') return
    
    // Bind scroll events with throttling
    window.addEventListener('scroll', this.handleParadoxScroll.bind(this), { passive: true })
    
    // Initialize intersection observers for section transitions
    this.initSectionObservers()
    
    console.log('🌀 Paradox dimension portal initialized')
  }
  
  private handleParadoxScroll = () => {
    if (this.animationFrameId) return
    
    this.animationFrameId = requestAnimationFrame(() => {
      const scrollY = window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      this.scrollProgress = Math.max(0, Math.min(1, scrollY / maxScroll))
      
      // Calculate paradox intensity based on scroll position
      this.paradoxIntensity = 1 + Math.sin(this.scrollProgress * Math.PI * 4) * 0.5
      this.dimensionalPhase = scrollY * 0.001
      
      // Update CSS custom properties
      this.updateParadoxVariables(scrollY)
      
      // Update all sections
      this.sections.forEach(controller => {
        controller.updateParadoxState(scrollY, this.paradoxIntensity, this.dimensionalPhase)
      })
      
      // Handle infinite loop
      if (this.scrollProgress > 0.98) {
        this.initiateInfiniteLoop()
      }
      
      this.animationFrameId = null
    })
  }
  
  private updateParadoxVariables(scrollY: number) {
    const root = document.documentElement
    root.style.setProperty('--scroll-progress', this.scrollProgress.toString())
    root.style.setProperty('--paradox-intensity', this.paradoxIntensity.toString())
    root.style.setProperty('--dimensional-phase', this.dimensionalPhase.toString())
    root.style.setProperty('--scroll-y', scrollY.toString())
    
    // Individual rotation values for stats
    root.style.setProperty('--scroll-rotation-1', `${scrollY * 0.1}deg`)
    root.style.setProperty('--scroll-rotation-2', `${scrollY * -0.15}deg`)
    root.style.setProperty('--scroll-rotation-3', `${scrollY * 0.08}deg`)
    root.style.setProperty('--scroll-rotation-4', `${scrollY * -0.12}deg`)
    
    // Reality phase calculations
    const realityPhase = scrollY * 0.005
    root.style.setProperty('--gecko-reality-phase', `${realityPhase}deg`)
  }
  
  private initSectionObservers() {
    const observerOptions = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '50px'
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.getAttribute('data-paradox-section')
        if (sectionId && this.sections.has(sectionId)) {
          const section = this.sections.get(sectionId)!
          section.updateVisibility(entry.intersectionRatio)
        }
      })
    }, observerOptions)
    
    // Observe all paradox sections
    document.querySelectorAll('[data-paradox-section]').forEach(section => {
      observer.observe(section)
    })
  }
  
  private initiateInfiniteLoop() {
    // Add visual effect for infinite loop
    document.body.classList.add('infinite-loop-active')
    
    // Smooth transition back to top with paradox effect
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }, 500)
    
    // Remove effect after animation
    setTimeout(() => {
      document.body.classList.remove('infinite-loop-active')
    }, 2000)
  }
  
  public registerSection(id: string, section: ParadoxSection) {
    this.sections.set(id, section)
  }
  
  public unregisterSection(id: string) {
    this.sections.delete(id)
  }
  
  public destroy() {
    if (typeof window === 'undefined') return
    
    window.removeEventListener('scroll', this.handleParadoxScroll)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.sections.clear()
  }
}

/**
 * Base class for all paradox sections
 */
export abstract class ParadoxSection {
  protected element: HTMLElement | null = null
  protected visible: number = 0
  
  constructor(elementId: string) {
    if (typeof window !== 'undefined') {
      this.element = document.getElementById(elementId)
    }
  }
  
  abstract updateParadoxState(scrollY: number, intensity: number, phase: number): void
  
  updateVisibility(ratio: number) {
    this.visible = ratio
  }
}

/**
 * Impossible Gecko Hero Controller
 */
export class ImpossibleHeroController extends ParadoxSection {
  updateParadoxState(scrollY: number, intensity: number, phase: number): void {
    if (!this.element) return
    
    const realityPhase = scrollY * 0.005
    const glitchIntensity = Math.max(0, Math.min(1, (scrollY - 100) / 500))
    
    // Update primary gecko
    const primaryGecko = this.element.querySelector('.gecko-reality-prime') as HTMLElement
    if (primaryGecko) {
      primaryGecko.style.transform = `rotateX(${realityPhase}deg) scale(${1 + Math.sin(realityPhase) * 0.1})`
      primaryGecko.style.filter = `drop-shadow(0 0 ${30 + glitchIntensity * 20}px rgba(86, 236, 106, ${0.6 + glitchIntensity * 0.4}))`
    }
    
    // Update mirror gecko
    const mirrorGecko = this.element.querySelector('.gecko-reality-mirror') as HTMLElement
    if (mirrorGecko) {
      mirrorGecko.style.transform = `rotateX(${180 + realityPhase}deg) rotateY(180deg) translateZ(-${200 + scrollY * 0.1}px)`
      mirrorGecko.style.opacity = (0.85 - glitchIntensity * 0.2).toString()
    }
    
    // Update glitch layers
    const glitchLayers = this.element.querySelectorAll('.glitch-layer') as NodeListOf<HTMLElement>
    glitchLayers.forEach((layer, index) => {
      layer.style.opacity = (glitchIntensity * (0.3 - index * 0.05)).toString()
    })
  }
}

/**
 * Portal Carousel Controller
 */
export class PortalCarouselController extends ParadoxSection {
  updateParadoxState(scrollY: number, intensity: number, phase: number): void {
    if (!this.element) return
    
    const portals = this.element.querySelectorAll('.dimensional-portal') as NodeListOf<HTMLElement>
    
    portals.forEach((portal, index) => {
      const portalPhase = phase + index * 0.5
      const energyLevel = Math.abs(Math.sin(portalPhase)) * intensity
      
      // Update portal energy
      const energyRing = portal.querySelector('.portal-energy-ring') as HTMLElement
      if (energyRing) {
        energyRing.style.borderColor = `rgba(${86 + energyLevel * 169}, ${236 - energyLevel * 236}, ${106 + energyLevel * 4}, ${0.6 + energyLevel * 0.4})`
        energyRing.style.transform = `scale(${1 + energyLevel * 0.2}) rotate(${portalPhase * 57.3}deg)`
      }
      
      // Gravitational effects between portals
      const otherPortals = Array.from(portals).filter((_, i) => i !== index)
      otherPortals.forEach((otherPortal, otherIndex) => {
        const distance = Math.abs(index - otherIndex)
        const gravityEffect = (1 / distance) * intensity * 0.1
        
        if (otherPortal instanceof HTMLElement) {
          const currentTransform = otherPortal.style.transform || ''
          const newTransform = currentTransform + ` translateZ(${gravityEffect * 10}px)`
          otherPortal.style.transform = newTransform
        }
      })
    })
  }
}

/**
 * React Hook for using Paradox Scroll
 */
export function useParadoxScroll() {
  const masterRef = useRef<ParadoxScrollMaster | null>(null)
  
  useEffect(() => {
    masterRef.current = new ParadoxScrollMaster()
    
    return () => {
      masterRef.current?.destroy()
    }
  }, [])
  
  const registerSection = useCallback((id: string, section: ParadoxSection) => {
    masterRef.current?.registerSection(id, section)
  }, [])
  
  const unregisterSection = useCallback((id: string) => {
    masterRef.current?.unregisterSection(id)
  }, [])
  
  return { registerSection, unregisterSection }
}

/**
 * Custom hook for scroll-based values
 */
export function useScrollValue() {
  const scrollY = useRef(0)
  const paradoxIntensity = useRef(1)
  
  useEffect(() => {
    const updateValues = () => {
      scrollY.current = window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, scrollY.current / maxScroll))
      paradoxIntensity.current = 1 + Math.sin(progress * Math.PI * 4) * 0.5
    }
    
    window.addEventListener('scroll', updateValues, { passive: true })
    updateValues()
    
    return () => {
      window.removeEventListener('scroll', updateValues)
    }
  }, [])
  
  return { scrollY: scrollY.current, paradoxIntensity: paradoxIntensity.current }
}