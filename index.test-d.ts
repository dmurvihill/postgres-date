import { expectType, expectError } from 'tsd'

import parse from '.'

expectType<Date | number | null>(parse('2010-12-11 09:09:04'))
expectType<Date | number | null>(parse('infinity'))
expectType<Date | number | null>(parse('garbage'))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', 'America/New York'))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', 'UTC'))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', 'Australia/Adelaide'))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', 0))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', 840)) // UTC +14 (Line Islands)
expectType<Date | number | null>(parse('2010-12-11 09:09:04', -720)) // UTC -12 (Baker Island)
expectType<Date | number | null>(parse('2010-12-11 09:09:04', {}))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', { serverTz: 'America/New York' }))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', { serverTz: 123 }))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', { tzMode: 'javascript' }))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', { serverTz: 'America/New York', tzMode: 'strict' }))
expectType<Date | number | null>(parse('2010-12-11 09:09:04', { tzMode: 'postgres' }))
expectType<null>(parse(null))
expectType<null>(parse(undefined))
expectError(parse(1625042787))
expectError(parse(new Date()))
expectError(parse('2010-12-11 09:09:04', 'not-a-time-zone')) // TODO is it possible to get a union type of all IANA time zone names?
expectError(parse('2010-12-11 09:09:04', { serverTz: 'not-a-tz-mode' }))
expectError(parse('2010-12-11 09:09:04', { tzMode: 'not-a-tz-mode' }))
