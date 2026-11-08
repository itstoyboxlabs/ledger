// A named set of tool values.
export interface Preset<T = unknown> {
  name: string
  data: T
}
