// Optional, style-specific parameters. Each is rendered to a URL query
// param of the same key (e.g. `speed`) and exposed as a control on the
// homepage automatically — adding parameters to another style only means
// adding an entry to `styleParameters` below, no changes needed in
// Homepage.vue or StyleParamsForm.vue.

export interface StyleParameterOption {
  value: string
  label: string
  warning?: string
}

// A companion free-form color input, revealed when the parameter's value
// equals 'custom'. Stored under its own URL key so the preset options and
// the custom color can coexist without clobbering each other.
export interface StyleColorPicker {
  key: string
  label: string
  default: string
}

// A closed set of presets (e.g. light/dark/custom), rendered as a <select>.
// An option can carry a `warning`: when the current value resolves to an
// option with a warning, MessageRenderer shows a full-screen content
// warning before playing the style, and the form shows an inline caution
// note next to the control.
export interface SelectStyleParameter {
  type: 'select'
  key: string
  label: string
  default: string
  options: StyleParameterOption[]
  colorPicker?: StyleColorPicker
}

// A continuous numeric parameter, rendered as a slider. `warningFor` plays
// the same role `option.warning` plays for select parameters, but as a
// function of the chosen value instead of a fixed set of options.
export interface RangeStyleParameter {
  type: 'range'
  key: string
  label: string
  default: number
  min: number
  max: number
  step?: number
  unit?: string
  warningFor?: (value: number) => string | undefined
}

export type StyleParameter = SelectStyleParameter | RangeStyleParameter

// A `theme` parameter, shared by every style whose background/text color
// currently comes from the random light/dark coin-flip, letting users pin
// it — to a preset, or to any color they like — instead of leaving it to
// chance. Kept as a small reusable factory so wording can be tailored per
// style while the mechanics (and the `theme`/`themeColor` URL keys) stay
// the same everywhere.
function themeParameter ({
  label = 'Colors',
  colorPickerLabel = 'Background color',
  colorPickerDefault = '#1188aa'
} = {}): SelectStyleParameter {
  return {
    type: 'select',
    key: 'theme',
    label,
    default: 'random',
    options: [
      { value: 'random', label: 'Random (default)' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'custom', label: 'Custom color…' }
    ],
    colorPicker: {
      key: 'themeColor',
      label: colorPickerLabel,
      default: colorPickerDefault
    }
  }
}

// A `speed` parameter expressed as a percentage of the default speed —
// 100% is always the (safe) default, 50% is half as fast, 200% is twice
// as fast, and anything in between is fair game. How a percentage maps to
// an actual interval/duration is up to whoever renders the style; this is
// just the dial.
function speedParameter ({
  label = 'Speed',
  min = 10,
  max = 400,
  warningFor
}: {
  label?: string
  min?: number
  max?: number
  warningFor?: (percent: number) => string | undefined
} = {}): RangeStyleParameter {
  return {
    type: 'range',
    key: 'speed',
    label,
    default: 100,
    min,
    max,
    step: 10,
    unit: '%',
    warningFor
  }
}

// A single accent-color parameter (default vs. a custom pick), for styles
// that don't have a light/dark coin-flip to override — just one fixed
// accent color to swap out. Shares the same colorPicker mechanic as
// themeParameter but without the light/dark/random presets.
function colorParameter ({
  key,
  label,
  defaultLabel = 'Default',
  colorPickerLabel = 'Color',
  colorPickerDefault
}: {
  key: string
  label: string
  defaultLabel?: string
  colorPickerLabel?: string
  colorPickerDefault: string
}): SelectStyleParameter {
  return {
    type: 'select',
    key,
    label,
    default: 'default',
    options: [
      { value: 'default', label: defaultLabel },
      { value: 'custom', label: 'Custom color…' }
    ],
    colorPicker: {
      key: `${key}Color`,
      label: colorPickerLabel,
      default: colorPickerDefault
    }
  }
}

export const styleParameters: Record<string, StyleParameter[]> = {
  basic: [
    themeParameter()
  ],
  jprdy: [
    colorParameter({
      key: 'accentColor',
      label: 'Board color',
      defaultLabel: 'Default (blue)',
      colorPickerLabel: 'Board color',
      colorPickerDefault: '#1d4ed8'
    })
  ],
  heart: [
    speedParameter({
      label: 'Heartbeat speed',
      min: 25,
      max: 400
    })
  ],
  hypno: [
    speedParameter({
      label: 'Spin speed',
      min: 25,
      max: 400
    })
  ],
  magic: [
    // 100% is the safe default (~1.4 flashes/sec); pushing well past 100%
    // approaches the original, unthrottled flashing (~60 flashes/sec),
    // which is why it's warned rather than clamped away entirely.
    speedParameter({
      label: 'Flashing speed',
      min: 10,
      max: 2000,
      warningFor: (percent) => {
        if (percent > 1000) return 'This speed flashes rapidly and may trigger seizures in people with photosensitive epilepsy.'
        if (percent > 300) return 'This speed flashes quickly and may be uncomfortable for people sensitive to flashing lights.'
        return undefined
      }
    }),
    // Magic's background already flashes on its own (see `speed` above);
    // here `custom` only pins the text color instead of letting it flip
    // randomly between black and white with each flash.
    themeParameter({
      label: 'Text color',
      colorPickerLabel: 'Text color',
      colorPickerDefault: '#1188aa'
    })
  ],
  banner: [
    speedParameter({
      label: 'Scroll speed',
      min: 20,
      max: 300
    }),
    themeParameter()
  ]
}
