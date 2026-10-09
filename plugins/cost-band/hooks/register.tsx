import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { formatUsd, nextCost, START } from './cost'

const cost = atom({ plugin: 'cost-band', key: 'cost' } as const, START)

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const usage = await $.session.usage()
    await update($, cost, prev => nextCost(prev, usage.cost?.usd))

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { turns, total, last } = await read($, cost)

    if (e.props.hasSurvey || turns === 0) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>
          {total === null || last === null
            ? 'Cost estimate unavailable in this session'
            : `Last turn ${formatUsd(last)} · Session ${formatUsd(total)} · list-price estimate, not a bill`}
        </Text>
      </Box>
    )
  })
}
