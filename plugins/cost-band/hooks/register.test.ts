import { expect, test } from 'claude-code/testing'

let usd: number | undefined

const usage = (cost: number | undefined) => ({
  startedAt: 0,
  context: { tokens: 0, window: 0, percent: 0 },
  rateLimits: [],
  cost: cost === undefined ? undefined : { usd: cost },
})

const done = { answer: '', durationMs: 1, isAborted: false, turnId: 't', reason: 'answer', text: '' } as const

for (const surface of ['terminal', 'desktop'] as const) {
  test(`band shows last turn and session cost on ${surface}`, async ($, on) => {
    on('session.usage', () => ({ value: usage(usd) }))
    on('turn.complete', () => ({ text: '' }))

    usd = 0.12
    await $.turn.complete(done)
    usd = 0.5
    await $.turn.complete(done)

    const ui = await $.ui.mount({ plugin: 'cost-band', surface, component: 'AbovePrompt', props: { hasSurvey: false } })

    expect(await ui.find({ type: 'Text', text: 'Last turn $0.380' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Session $0.500' })).toBeDefined()
  })
}
