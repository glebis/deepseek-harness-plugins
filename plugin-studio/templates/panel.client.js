window.__ModuleLoader__.load({
  id: '__PKG__',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const DATA = __DATA__;

    const CSS = [
      '.psp-root{display:flex;flex-direction:column;gap:8px;width:100%;max-width:720px;margin:0 auto;padding:10px 12px;',
      'border:0.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px);',
      'background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:13px;line-height:19px;}',
      '.psp-head{display:flex;align-items:center;gap:8px;}',
      '.psp-title{font-weight:600;font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.psp-meta{color:var(--dsw-alias-label-secondary);font-size:12px;white-space:nowrap;}',
      '.psp-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;}',
      '.psp-item{display:flex;flex-direction:column;gap:2px;padding:7px 9px;border-radius:var(--dsw-radius-md,8px);',
      'background:var(--dsw-alias-bg-layer-2);}',
      '.psp-source{align-self:flex-start;padding:0 6px;border-radius:999px;font-size:11px;line-height:17px;',
      'border:0.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);}',
      '.psp-text{margin:0;white-space:pre-wrap;word-break:break-word;}',
      '.psp-text[data-clamped="true"]{display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden;}',
      '.psp-foot{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);font-size:12px;}',
      '.psp-button{border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,6px);',
      'padding:3px 9px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;}',
      '.psp-button:hover{background:var(--dsw-alias-bg-layer-2);}',
      '.psp-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}',
      '.psp-empty{margin:0;color:var(--dsw-alias-label-secondary);}',
      '.psp-toggle{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;',
      'border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,6px);background:transparent;',
      'color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;}',
      '.psp-toggle:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.psp-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}',
      '.psp-toggle svg{width:12px;height:12px;transition:transform 120ms ease;}',
      '.psp-toggle[aria-expanded="false"] svg{transform:rotate(-90deg);}',
      '@media (prefers-reduced-motion: reduce){.psp-toggle svg{transition:none;}}',
      '.psp-body[hidden]{display:none;}',
    ].join('')

    const COLLAPSE_KEY = '__ID__-collapsed'

    function readCollapsed() {
      try {
        return window.localStorage.getItem(COLLAPSE_KEY) === '1'
      } catch (error) {
        return false
      }
    }

    function Panel() {
      const [expanded, setExpanded] = React.useState(false)
      const [collapsed, setCollapsed] = React.useState(readCollapsed)
      const toggleCollapsed = () => {
        setCollapsed(value => {
          const next = !value
          try {
            window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
          } catch (error) {
            /* storage unavailable: the panel still collapses for this mount */
          }
          return next
        })
      }
      const bodyId = '__ID__-body'
      const items = Array.isArray(DATA.items) ? DATA.items : []
      const sources = Array.isArray(DATA.sources) ? DATA.sources : []
      const shown = expanded ? items : items.slice(0, 4)
      const stamp = DATA.collectedAt ? new Date(DATA.collectedAt) : null
      const collected = stamp && !Number.isNaN(stamp.getTime())
        ? stamp.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : 'an unknown time'
      const rows = shown.map((item, index) => h('li', { className: 'psp-item', key: `${item.source}:${item.tool}:${index}` },
        h('span', { className: 'psp-source' }, `${item.source} · ${item.tool}`),
        h('p', { className: 'psp-text', 'data-clamped': String(!expanded) }, item.text)))
      return h('div', { className: 'psp-root' },
        h('style', null, CSS),
        h('div', { className: 'psp-head' },
          h('span', { className: 'psp-title' }, DATA.title),
          h('span', { className: 'psp-meta' }, `${sources.length} ${sources.length === 1 ? 'source' : 'sources'} · ${items.length} ${items.length === 1 ? 'item' : 'items'}`),
          h('button', {
            type: 'button',
            className: 'psp-toggle',
            'aria-expanded': String(!collapsed),
            'aria-controls': bodyId,
            'aria-label': collapsed ? 'Expand panel' : 'Collapse panel',
            title: collapsed ? 'Expand panel' : 'Collapse panel',
            onClick: toggleCollapsed,
          }, h('svg', { viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
            h('path', { d: 'M3 4.5 6 7.5 9 4.5' })))),
        h('div', { className: 'psp-body', id: bodyId, hidden: collapsed },
        items.length === 0
          ? h('p', { className: 'psp-empty' }, 'No information was collected when this panel was generated.')
          : h('ul', { className: 'psp-list' }, rows),
        h('div', { className: 'psp-foot' },
          h('span', null, `Collected ${collected}${DATA.truncated ? ' · truncated' : ''}`),
          items.length > 4
            ? h('button', {
              type: 'button',
              className: 'psp-button',
              onClick: () => setExpanded(value => !value),
              'aria-expanded': String(expanded),
            }, expanded ? 'Show less' : `Show all ${items.length}`)
            : null)))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const slot = DATA.slot === 'turn' ? 'conversation.chat.turnTail' : 'conversation.composer.dock'
        ctx.slots.inject(slot, () => ctx.slots.register({
          name: slot,
          id: '__ID__-panel',
          order: 40,
        }, Panel))
      },
    }
  },
})
