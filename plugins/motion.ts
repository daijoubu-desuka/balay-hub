// v-reveal="index": staggered fade/slide-in the first time an element scrolls into view (max 8 animated)
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, { value }: { value?: number }) {
      const i = value ?? 0
      if (i > 7 || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      el.classList.add('x-reveal')
      el.style.transitionDelay = i * 60 + 'ms'
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return
        el.classList.add('in')
        io.disconnect()
        setTimeout(() => { el.style.transitionDelay = '' }, 700 + i * 60)
      })
      io.observe(el)
    },
    getSSRProps: () => ({})
  })
})
