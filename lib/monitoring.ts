/**
 * Performance monitoring for Dukaanify
 * Sends Core Web Vitals to analytics endpoint
 */

export function reportWebVitals(metric: any) {
  // Send to your analytics endpoint
  const url = `/api/vitals`
  
  // Only report on production
  if (process.env.NODE_ENV === 'production') {
    // Use navigator.sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, JSON.stringify(metric))
    }
  }
}

// Track page performance
export function trackPagePerformance() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (perfData) {
        const metrics = {
          // DNS + TCP
          domainLookupTime: perfData.domainLookupEnd - perfData.domainLookupStart,
          // Connection time
          connectTime: perfData.connectEnd - perfData.connectStart,
          // Request time
          requestTime: perfData.responseStart - perfData.requestStart,
          // Response time
          responseTime: perfData.responseEnd - perfData.responseStart,
          // DOM processing
          domInteractiveTime: perfData.domInteractive - perfData.fetchStart,
          // Total page load
          pageLoadTime: perfData.loadEventEnd - perfData.fetchStart,
        }

        if (process.env.NODE_ENV === 'production') {
          console.log('[Perf]', metrics)
          // Could send to analytics service
        }
      }
    }, 0)
  })
}

// Web Vitals tracking
export function measureWebVitals() {
  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals')
    
    getCLS(reportWebVitals)
    getFID(reportWebVitals)
    getFCP(reportWebVitals)
    getLCP(reportWebVitals)
    getTTFB(reportWebVitals)
  } catch (e) {
    // web-vitals not available
  }
}
