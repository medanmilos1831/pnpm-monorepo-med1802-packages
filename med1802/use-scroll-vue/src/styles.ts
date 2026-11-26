const STYLE_ID = 'med1802-use-scroll-vue'

const CSS = `
.scroll-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.scroll-viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.scroll-viewport--y {
  overflow-x: hidden;
  overflow-y: auto;
}

.scroll-viewport--x {
  overflow-x: auto;
  overflow-y: hidden;
}

.scroll-viewport--no-toolbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-viewport--no-toolbar::-webkit-scrollbar {
  display: none;
}
`

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}

export { ensureStyles }
