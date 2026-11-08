// A stable id for a preset saved before presets had ids, made from its name so every
// device that migrates the same list gets the same id. New presets use newId instead.
export function presetIdFor(name: string): string {
  let h = 5381
  for (let i = 0; i < name.length; i++) h = ((h * 33) ^ name.charCodeAt(i)) >>> 0
  return `pn${h.toString(36)}`
}
