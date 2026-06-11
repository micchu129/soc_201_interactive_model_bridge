import { useLayoutEffect, useRef, useState } from 'react'

export default function SlidingToggleGroup({ items, value, onChange, className = '', buttonClassName = '', ariaLabel, disabled = false, renderLabel }) {
  const wrapperRef = useRef(null)
  const buttonRefs = useRef(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const wrapper = wrapperRef.current
      const activeButton = buttonRefs.current.get(value)
      if (!wrapper || !activeButton) return
      const wrapperRect = wrapper.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      setIndicator({
        left: buttonRect.left - wrapperRect.left,
        width: buttonRect.width,
        ready: true,
      })
    }

    updateIndicator()
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateIndicator)
    if (resizeObserver && wrapperRef.current) resizeObserver.observe(wrapperRef.current)
    window.addEventListener('resize', updateIndicator)
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [value, items])

  return <div ref={wrapperRef} className={`slider-toggle ${className}`} aria-label={ariaLabel}>
    <span className={`slider-toggle-indicator ${indicator.ready ? 'is-ready' : ''}`} style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} />
    {items.map(item => <button key={item.value} ref={element => { if (element) buttonRefs.current.set(item.value, element); else buttonRefs.current.delete(item.value) }} className={`${buttonClassName} ${item.value === value ? 'active' : ''}`} disabled={disabled || item.disabled} onClick={() => onChange(item.value)}>{renderLabel ? renderLabel(item) : item.label}</button>)}
  </div>
}