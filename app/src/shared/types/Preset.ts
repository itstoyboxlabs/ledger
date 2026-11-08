// A named set of tool values. `id` is stable across renames, so other pages can point at
// a preset. Only keys that ask for ids have them (see usePresets); older presets get one
// from their name the first time they load.
export interface Preset<T = unknown> {
  id?: string
  name: string
  data: T
}
