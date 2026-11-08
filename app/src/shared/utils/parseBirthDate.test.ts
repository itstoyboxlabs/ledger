import { parseBirthDate } from './parseBirthDate'

const today = '2026-11-08'

describe('parseBirthDate', () => {
  it('reads MM-DD-YYYY and MM/DD/YYYY as YYYY-MM-DD', () => {
    expect(parseBirthDate('04-15-1990', today)).toEqual({ iso: '1990-04-15' })
    expect(parseBirthDate('04/15/1990', today)).toEqual({ iso: '1990-04-15' })
    expect(parseBirthDate(' 4/5/1990 ', today)).toEqual({ iso: '1990-04-05' })
  })
  it('asks for the format when the text is not a date', () => {
    for (const t of ['', '1990-04-15', '04-15-90', 'April 15 1990', '04-15']) {
      expect(parseBirthDate(t, today)).toEqual({ error: 'Type your birth date as MM-DD-YYYY, like 04-15-1990.' })
    }
  })
  it('rejects a day that does not exist', () => {
    expect(parseBirthDate('02-30-1990', today)).toEqual({ error: 'That date does not exist. Check the month and the day.' })
    expect(parseBirthDate('13-01-1990', today)).toEqual({ error: 'That date does not exist. Check the month and the day.' })
  })
  it('rejects a future date but accepts today', () => {
    expect(parseBirthDate('11-09-2026', today)).toEqual({ error: 'That date is in the future. Check the year.' })
    expect(parseBirthDate('11-08-2026', today)).toEqual({ iso: '2026-11-08' })
  })
  it('rejects an age over 120', () => {
    expect(parseBirthDate('11-07-1905', today)).toEqual({ error: 'That would make you older than 120. Check the year.' })
    expect(parseBirthDate('11-08-1906', today)).toEqual({ iso: '1906-11-08' })
  })
})
