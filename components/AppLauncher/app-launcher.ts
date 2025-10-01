import dataDefault from './data.json' assert { type: 'json' }
import './app-launcher.css'
import templateHtml from './app-launcher.html?raw'

type Category = { name: string; href: string }
type Section = { label: string; icon: string; categories: Category[] }

type LauncherData = { sections: Section[] }

export interface AppLauncherOptions {
  data?: LauncherData
  openOnHover?: boolean
  hoverOpenDelay?: number
  hoverCloseDelay?: number
  anchor?: HTMLElement
  onOpen?: () => void
  onClose?: () => void
  onSelect?: (category: Category) => void
}

const DEFAULT_OPTS = {
  data: dataDefault as LauncherData,
  openOnHover: true,
  hoverOpenDelay: 120,
  hoverCloseDelay: 180
}

function createTemplate(): DocumentFragment {
  const parser = new DOMParser()
  const doc = parser.parseFromString(templateHtml, 'text/html')
  const template = doc.getElementById('app-launcher-template') as HTMLTemplateElement
  return template.content.cloneNode(true) as DocumentFragment
}

export class AppLauncher {
  private trigger: HTMLElement
  private opts: Required<AppLauncherOptions>
  private panel: HTMLDivElement
  private sectionsNav: HTMLElement
  private categoriesPane: HTMLElement
  private searchInput: HTMLInputElement
  private openState = false
  private hoverTimeout: number | null = null
  private closeTimeout: number | null = null
  private currentSectionIndex = 0
  private currentFocusSide: 'left' | 'right' = 'left'
  private filteredCategories: Category[] | null = null
  private outsideHandler = this.handleOutsideClick.bind(this)
  private keyHandler = this.handleKeydown.bind(this)

  constructor(trigger: HTMLElement, opts: AppLauncherOptions = {}) {
    this.trigger = trigger
    this.opts = { ...DEFAULT_OPTS, ...opts } as Required<AppLauncherOptions>

    const fragment = createTemplate()
    this.panel = fragment.querySelector('.app-launcher') as HTMLDivElement
    this.sectionsNav = fragment.querySelector('.sections') as HTMLElement
    this.categoriesPane = fragment.querySelector('.categories') as HTMLElement
    this.searchInput = fragment.querySelector('.launcher-search') as HTMLInputElement

    this.trigger.setAttribute('aria-haspopup', 'menu')
    this.trigger.setAttribute('aria-expanded', 'false')
    this.trigger.classList.add('apps-trigger-button')

    const anchor = this.opts.anchor ?? this.trigger
    anchor.parentElement?.appendChild(this.panel)

    this.renderSections()
    this.renderCategories(this.opts.data.sections[0].categories)
    this.attachEvents()
  }

  open() {
    if (this.openState) return
    this.openState = true
    this.panel.classList.add('open')
    this.trigger.setAttribute('aria-expanded', 'true')
    document.addEventListener('click', this.outsideHandler, { capture: true })
    document.addEventListener('keydown', this.keyHandler)
    const firstSection = this.sectionsNav.querySelectorAll<HTMLButtonElement>('.section-item')[this.currentSectionIndex]
    firstSection?.setAttribute('aria-selected', 'true')
    setTimeout(() => this.searchInput.focus(), 30)
    this.opts.onOpen?.()
  }

  close() {
    if (!this.openState) return
    this.openState = false
    this.panel.classList.remove('open')
    this.trigger.setAttribute('aria-expanded', 'false')
    document.removeEventListener('click', this.outsideHandler, { capture: true } as any)
    document.removeEventListener('keydown', this.keyHandler)
    this.trigger.focus()
    this.opts.onClose?.()
  }

  toggle() { this.openState ? this.close() : this.open() }
  isOpen() { return this.openState }

  destroy() {
    this.close()
    this.panel.remove()
    this.detachEvents()
  }

  private attachEvents() {
    this.trigger.addEventListener('click', () => this.toggle())
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        this.toggle()
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this.openState) {
        e.preventDefault()
        this.open()
      }
    })

    if (this.opts.openOnHover && window.matchMedia('(pointer:fine)').matches) {
      this.trigger.addEventListener('mouseenter', () => this.scheduleOpen())
      this.trigger.addEventListener('mouseleave', () => this.scheduleClose())
      this.panel.addEventListener('mouseenter', () => this.clearTimeouts())
      this.panel.addEventListener('mouseleave', () => this.scheduleClose())
    }

    this.searchInput.addEventListener('input', () => this.filterCategories(this.searchInput.value))
  }

  private detachEvents() {
    this.trigger.replaceWith(this.trigger.cloneNode(true))
  }

  private renderSections() {
    this.sectionsNav.innerHTML = ''
    this.opts.data.sections.forEach((section, index) => {
      const btn = document.createElement('button')
      btn.className = 'section-item'
      btn.setAttribute('role', 'menuitem')
      btn.dataset.index = String(index)
      btn.innerHTML = `<span class="icon">${section.icon}</span><span>${section.label}</span><span class="caret">›</span>`

      btn.addEventListener('mouseenter', () => {
        if (!this.openState) return
        this.focusSection(index)
      })

      btn.addEventListener('focus', () => {
        this.focusSection(index)
        this.currentFocusSide = 'left'
      })

      btn.addEventListener('click', () => {
        this.focusSection(index)
        this.currentFocusSide = 'left'
      })

      this.sectionsNav.appendChild(btn)
    })
  }

  private renderCategories(categories: Category[]) {
    this.categoriesPane.innerHTML = ''

    const grid = document.createElement('div')
    grid.className = 'category-grid'
    categories.forEach(category => {
      const link = document.createElement('a')
      link.className = 'category-pill'
      link.href = category.href
      link.textContent = category.name
      link.setAttribute('role', 'menuitem')
      link.addEventListener('click', () => {
        this.opts.onSelect?.(category)
        this.close()
      })
      link.addEventListener('focus', () => {
        this.currentFocusSide = 'right'
      })
      grid.appendChild(link)
    })

    if (!categories.length) {
      const empty = document.createElement('div')
      empty.className = 'category-empty'
      empty.textContent = 'No matches found'
      grid.appendChild(empty)
    }

    this.categoriesPane.appendChild(grid)
  }

  private focusSection(index: number) {
    this.currentSectionIndex = index
    const sections = this.sectionsNav.querySelectorAll<HTMLButtonElement>('.section-item')
    sections.forEach((btn, idx) => {
      btn.setAttribute('aria-selected', String(idx === index))
    })

    const categories = this.filteredCategories ?? this.opts.data.sections[index].categories
    this.renderCategories(categories)
  }

  private filterCategories(term: string) {
    const normalized = term.trim().toLowerCase()
    if (!normalized) {
      this.filteredCategories = null
      this.focusSection(this.currentSectionIndex)
      this.sectionsNav.parentElement?.classList.remove('filtered')
      return
    }

    const matches: Category[] = []
    this.opts.data.sections.forEach(section => {
      section.categories.forEach(category => {
        if (category.name.toLowerCase().includes(normalized)) matches.push(category)
      })
    })

    this.filteredCategories = matches
    this.sectionsNav.parentElement?.classList.add('filtered')
    this.renderCategories(matches)
  }

  private handleOutsideClick(event: MouseEvent) {
    if (!this.openState) return
    const target = event.target as Node
    if (!this.panel.contains(target) && target !== this.trigger) {
      this.close()
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    if (!this.openState) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        this.close()
        break
      case 'ArrowDown':
        event.preventDefault()
        this.moveSectionFocus(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        this.moveSectionFocus(-1)
        break
      case 'ArrowRight':
        event.preventDefault()
        this.moveCategoryFocus(1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        this.moveCategoryFocus(-1)
        break
      default:
        break
    }
  }

  private moveSectionFocus(direction: number) {
    const sections = this.sectionsNav.querySelectorAll<HTMLButtonElement>('.section-item')
    if (!sections.length) return

    let next = this.currentSectionIndex + direction
    if (next < 0) next = sections.length - 1
    if (next >= sections.length) next = 0

    this.currentSectionIndex = next
    this.filteredCategories = null
    this.searchInput.value = ''

    this.focusSection(next)
    sections[next].focus()
  }

  private moveCategoryFocus(direction: number) {
    const categories = this.categoriesPane.querySelectorAll<HTMLAnchorElement>('.category-pill')
    if (!categories.length) return

    if (this.currentFocusSide === 'left') {
      categories[0].focus()
      this.currentFocusSide = 'right'
      return
    }

    const active = document.activeElement as HTMLElement
    const index = Array.from(categories).indexOf(active as HTMLAnchorElement)
    let next = index + direction
    if (next < 0) {
      this.sectionsNav.querySelectorAll<HTMLButtonElement>('.section-item')[this.currentSectionIndex]?.focus()
      this.currentFocusSide = 'left'
      return
    }
    if (next >= categories.length) next = categories.length - 1
    categories[next].focus()
  }

  private scheduleOpen() {
    this.clearTimeouts()
    this.hoverTimeout = window.setTimeout(() => this.open(), this.opts.hoverOpenDelay)
  }

  private scheduleClose() {
    this.clearTimeouts()
    this.closeTimeout = window.setTimeout(() => this.close(), this.opts.hoverCloseDelay)
  }

  private clearTimeouts() {
    if (this.hoverTimeout) window.clearTimeout(this.hoverTimeout)
    if (this.closeTimeout) window.clearTimeout(this.closeTimeout)
    this.hoverTimeout = null
    this.closeTimeout = null
  }
}
