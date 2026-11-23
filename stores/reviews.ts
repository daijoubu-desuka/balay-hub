import { defineStore } from 'pinia'

// Client reviews of agents (kept in this browser). One review per client per agent; writing again updates it.
export interface Review { id: string; agent: string; authorId: string; author: string; rating: number; text: string; date: string; deal: string }

const R = (id: string, agent: string, author: string, rating: number, date: string, deal: string, text: string): Review =>
  ({ id, agent, authorId: 'seed-' + id, author, rating, text, date, deal })

export const useReviewStore = defineStore('reviews', {
  state: () => ({
    items: [
      R('r1', 'Rica Santos', 'Marites D.', 5, '2026-11-02', 'Bought a house and lot', 'Rica walked us through every document for our Villa Kananga house. She answered messages even late at night and got the Pag-IBIG papers moving fast.'),
      R('r2', 'Rica Santos', 'Joel P.', 5, '2026-10-21', 'Rented an apartment', 'Very honest about the unit. She told us upfront about the water pressure and had the owner fix it before we moved in.'),
      R('r3', 'Rica Santos', 'Liza M.', 4, '2026-09-30', 'Viewing only', 'Professional and on time for the viewing. Would have liked a few more options in our budget, but no pressure at all.'),
      R('r4', 'Anthony Adlawon', 'Ramon T.', 5, '2026-11-05', 'Bought a condo', 'Knows Libertad and Baan Riverside very well. Compared three units for us side by side and negotiated the HOA dues down.'),
      R('r5', 'Anthony Adlawon', 'Grace A.', 5, '2026-10-15', 'Bought a house and lot', 'Smooth from reservation to turnover. Clear explanations of the contract to sell, which really helped as first-time buyers.'),
      R('r6', 'Anthony Adlawon', 'Dennis O.', 4, '2026-09-12', 'Viewing only', 'Quick to schedule viewings and very patient with our questions.'),
      R('r7', 'Ace Nathaniel Magbanua', 'Kristine L.', 5, '2026-10-28', 'Leased an office', 'Found us an office on J.C. Aquino within a week. He handled the lease terms with the owner and explained the permits we needed.'),
      R('r8', 'Ace Nathaniel Magbanua', 'Paolo S.', 4, '2026-09-18', 'Rented a warehouse', 'Good knowledge of Bancasi and the airport area. Responsive on messages.'),
      R('r9', 'John Mark Lugsanay', 'Annie B.', 5, '2026-10-09', 'Bought a lot', 'Very helpful for our lot in Ampayon. He even went with us to check the boundaries and the title at the Registry of Deeds.'),
      R('r10', 'Leo Ocampo', 'Mark V.', 4, '2026-10-02', 'Bought a condo', 'Straightforward and quick. The condo on J.C. Aquino was exactly as described.'),
      R('r11', 'Daniel Bantillo', 'Cherry N.', 5, '2026-08-25', 'Viewing only', 'Showed us around Baan Riverside and explained the flood history of each street. Very trustworthy.')
    ] as Review[]
  }),
  getters: {
    forAgent: s => (name: string) => s.items.filter(r => r.agent === name).sort((a, b) => b.date.localeCompare(a.date)),
    stats: s => (name: string) => {
      const l = s.items.filter(r => r.agent === name)
      const avg = l.length ? Math.round((l.reduce((n, r) => n + r.rating, 0) / l.length) * 10) / 10 : 0
      return { count: l.length, avg, bars: [5, 4, 3, 2, 1].map(st => ({ st, n: l.filter(r => r.rating === st).length })) }
    }
  },
  actions: {
    write(agent: string, by: { id: string; name: string }, rating: number, text: string, deal: string) {
      const i = this.items.findIndex(r => r.agent === agent && r.authorId === by.id)
      const author = by.name.split(' ')[0] + ' ' + (by.name.split(' ')[1]?.[0] ?? '') + '.'
      const r: Review = { id: i >= 0 ? this.items[i].id : 'r-' + Date.now(), agent, authorId: by.id, author: author.trim(), rating, text: text.trim(), date: new Date().toISOString().slice(0, 10), deal }
      if (i >= 0) this.items[i] = r; else this.items.unshift(r)
      useNotifyStore().push({ type: 'listing', title: `New ${rating}-star review`, body: `${r.author}: “${r.text.slice(0, 70)}”`, link: '/agents/' + agentSlug(agent), to: 'name:' + agent })
      return i < 0
    }
  }
})
