import type { LogMeterData } from '@/screens/marketing/types/LogMeterData'

type LogMeterProps = { meter: LogMeterData }

export function LogMeter({ meter }: LogMeterProps) {
  return (
    <div className="mk">
      <div className="t">
        <b>{meter.name}</b>
        <span>
          <b>{meter.spent}</b> of {meter.of}
        </span>
      </div>
      <div className="bar">
        <i style={{ width: meter.width }}></i>
      </div>
      <small>{meter.left}</small>
    </div>
  )
}
