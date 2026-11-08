import { Suspense } from 'react'
import { render, screen } from '@testing-library/react'
import { lazyNamed } from './lazyNamed'

describe('lazyNamed', () => {
  it('loads a named export and renders it', async () => {
    const Hello = () => <p>hello there</p>
    const Lazy = lazyNamed(() => Promise.resolve({ Hello }), 'Hello')
    render(
      <Suspense fallback={<p>loading</p>}>
        <Lazy />
      </Suspense>,
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('hello there')).toBeInTheDocument()
  })
})
