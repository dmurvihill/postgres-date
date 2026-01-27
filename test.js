'use strict'

const test = require('tape')
const parse = require('./')
const timezoneMock = require('timezone-mock')

const springForward = '2025-03-09 02:30:00' // Never occurred in the U.S.
const fallBack = '2025-11-02 01:30:00' // Occurred twice in the U.S.

test('date parser', function (t) {
  t.equal(parse('garbage'), null)

  t.equal(
    parse('2010-12-11 09:09:04').toString(),
    new Date('2010-12-11 09:09:04').toString()
  )

  t.equal(
    parse('2011-12-11 09:09:04 BC').toString(),
    new Date('-002010-12-11T09:09:04').toString()
  )

  t.equal(
    parse('0001-12-11 09:09:04 BC').toString(),
    new Date('0000-12-11T09:09:04').toString()
  )

  t.equal(
    parse('0001-12-11 BC').getFullYear(),
    0
  )

  t.equal(
    parse('0013-06-01').getFullYear(),
    13
  )

  t.equal(
    parse('1800-06-01').getFullYear(),
    1800
  )

  const summer = '2025-06-30 11:57:23'
  const winter = '2026-01-13 23:53:08'

  withLocalTimeZone('US/Eastern', () => {
    t.skip(
      parse(winter, 'UTC').getTime(),
      new Date('2026-01-13T23:53:08Z').getTime(),
      'client behind server'
    )
    t.skip(
      parse(summer, 'UTC').getTime(),
      new Date('2025-06-30T11:57:23Z').getTime(),
      'client behind server (DST)'
    )
    t.skip(
      parse(summer, 'America/New_York').getTime(),
      new Date('2026-01-13T23:53:08-05:00').getTime(),
      'client same time as server'
    )
    t.skip(
      parse(summer, 123).getTime(),
      new Date('2026-01-13T23:53:08+02:03').getTime(),
      'Arbitrary offset in minutes'
    )
    t.skip(
      parse(summer, 1440).getTime(),
      new Date('2026-01-12T23:53:08Z').getTime(),
      'Extreme offset in minutes (UTC +24h)'
    )
    t.skip(
      parse(summer, 'Pacific/Kiritimati').getTime(),
      new Date('2025-06-30T11:57:23+14:00').getTime(),
      'Server in Kiritimati'
    )
    // Etc zones have inverted signs for POSIX compliance, so this is UTC-12.
    t.skip(
      parse(summer, 'Etc/GMT+12').getTime(),
      new Date('2025-06-30T11:57:23-12:00').getTime(),
      'Server on Baker Island'
    )
  })

  withLocalTimeZone('Etc/GMT-14', () => {
    t.skip(
      parse(summer, 'Etc/GMT+12').getTime(),
      new Date('2025-06-30T11:57:23-12:00').getTime(),
      'Server extremely behind'
    )
  })

  withLocalTimeZone('Etc/GMT+12', () => {
    t.skip(
      parse(summer, 'Etc/GMT+12').getTime(),
      new Date('2025-06-30T11:57:23-12:00').getTime(),
      'Server extremely ahead'
    )
  })

  withLocalTimeZone('Australia/Adelaide', () => {
    t.skip(
      parse(summer, 'Asia/Kathmandu').getTime(),
      new Date('2025-06-30T11:57:23+05:45').getTime(),
      'Funky offsets'
    )
  })

  const postgresTzOptions = { serverTz: 'America/New_York', tzMode: 'postgres' }

  t.skip(
    parse(springForward, postgresTzOptions).getTime(),
    new Date('2025-03-09T02:30:00-05:00:00').getTime(),
    'Postgres timezone mode assumes illegal times are given in the pre-change offset'
  )

  t.skip(
    parse(fallBack, postgresTzOptions).getTime(),
    new Date('2025-11-02T01:30:00-05:00').getTime(),
    'Postgres timezone mode assumes ambiguous times are given in the post-change offset'
  )

  const javascriptTzOptions = { serverTz: 'America/New_York', tzMode: 'javascript' }

  t.skip(
    parse(springForward, javascriptTzOptions).getTime(),
    new Date('2025-03-09T02:30:00-05:00:00').getTime(),
    'Javascript timezone mode assumes illegal times are given in the pre-change offset'
  )

  t.skip(
    parse(fallBack, javascriptTzOptions).getTime(),
    new Date('2025-11-02T01:30:00-04:00').getTime(),
    'Javascript timezone mode assumes ambiguous times are given in the pre-change offset'
  )

  const strictTzOptions = { serverTimeZone: 'America/New_York', tzMode: 'strict' }

  t.skip(
    () => parse(springForward, strictTzOptions),
    'Strict mode rejects illegal timestamp'
  )

  t.skip(
    () => parse(fallBack, strictTzOptions),
    'Strict mode rejects ambiguous timestamp'
  )

  t.skip(
    parse(springForward, 'America/New_York').getTime(),
    new Date('2025-03-09T02:30:00-05:00:00').getTime(),
    'tz mode defaults to postgres (spring forward)'
  )

  t.skip(
    parse(fallBack, 'America/New_York').getTime(),
    new Date('2025-11-02T01:30:00-05:00').getTime(),
    'tz mode defaults to postgres (fall back)'
  )

  function ms (string) {
    const base = '2010-01-01 01:01:01'
    return parse(base + string).getMilliseconds()
  }

  t.equal(ms('.1'), 100)
  t.equal(ms('.01'), 10)
  t.equal(ms('.74'), 740)

  function iso (string) {
    return parse(string).toISOString()
  }

  t.equal(
    iso('2010-12-11 09:09:04.1'),
    new Date(2010, 11, 11, 9, 9, 4, 100).toISOString(),
    'no timezones'
  )

  t.equal(
    iso('2011-01-23 22:15:51.280843-06'),
    '2011-01-24T04:15:51.280Z',
    'huge ms value'
  )

  t.equal(
    iso('2011-01-23 22:15:51Z'),
    '2011-01-23T22:15:51.000Z',
    'zulu time offset'
  )

  t.equal(
    iso('2011-01-23 10:15:51-04'),
    '2011-01-23T14:15:51.000Z',
    'negative hour offset'
  )

  t.equal(
    iso('2011-01-23 10:15:51+06:10'),
    '2011-01-23T04:05:51.000Z',
    'positive HH:mm offset'
  )

  t.equal(
    iso('2011-01-23 10:15:51-06:10'),
    '2011-01-23T16:25:51.000Z',
    'negative HH:mm offset'
  )

  t.equal(
    iso('0005-02-03 10:53:28+01:53:28'),
    '0005-02-03T09:00:00.000Z',
    'positive HH:mm:ss offset'
  )

  t.equal(
    iso('0005-02-03 09:58:45-02:01:15'),
    '0005-02-03T12:00:00.000Z',
    'negative HH:mm:ss offset'
  )

  t.equal(
    iso('0076-01-01 01:30:15+12'),
    '0075-12-31T13:30:15.000Z',
    '0 to 99 year boundary'
  )

  t.equal(parse('infinity'), Infinity)
  t.equal(parse('-infinity'), -Infinity)

  t.end()
})

function withLocalTimeZone (tz, f) {
  timezoneMock.register(tz)
  try {
    f()
  } finally {
    timezoneMock.unregister()
  }
}
