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

  it('renders without the fallback once the module is preloaded', async () => {
    const Hello = () => <p>hello there</p>
    const Lazy = lazyNamed(() => Promise.resolve({ Hello }), 'Hello')
    await Lazy.preload()
    render(
      <Suspense fallback={<p>loading</p>}>
        <Lazy />
      </Suspense>,
    )
    expect(screen.queryByText('loading')).toBeNull()
    expect(screen.getByText('hello there')).toBeInTheDocument()
  })

  it('downloads the module once and tries again after a failed download', async () => {
    const Hello = () => <p>hello there</p>
    const loader = vi
      .fn<() => Promise<{ Hello: typeof Hello }>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ Hello })
    const Lazy = lazyNamed(loader, 'Hello')
    await Lazy.preload()
    await Lazy.preload()
    await Lazy.preload()
    expect(loader).toHaveBeenCalledTimes(2)
  })
})
