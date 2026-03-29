import { useState } from "react"

function PieChart({ slices, title, size = 200, formatMoney, isDark = true }) {
  const [hovered, setHovered] = useState(null)
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  const radius = size / 2
  const center = radius
  let cumulativeAngle = -90

  const holeFill = isDark ? "#030712" : "#ffffff"

  const paths = slices
    .filter((s) => s.value > 0)
    .map((slice, index) => {
      const percentage = slice.value / total
      const angle = percentage * 360
      const startAngle = cumulativeAngle
      const endAngle = cumulativeAngle + angle
      cumulativeAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = center + radius * Math.cos(startRad)
      const y1 = center + radius * Math.sin(startRad)
      const x2 = center + radius * Math.cos(endRad)
      const y2 = center + radius * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0
      const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

      return { ...slice, path, percentage, index }
    })

  const fmt = formatMoney || ((v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v)
  )

  return (
    <div className="space-y-3">
      {title && (
        <h4 className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-gray-500" : "text-gray-400"}`}>{title}</h4>
      )}
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <svg width={size} height={size}>
            {paths.map((p) => (
              <path
                key={p.index}
                d={p.path}
                fill={p.color}
                stroke={holeFill}
                strokeWidth="2"
                opacity={hovered === null || hovered === p.index ? 1 : 0.3}
                onMouseEnter={() => setHovered(p.index)}
                onMouseLeave={() => setHovered(null)}
                className="transition-opacity duration-200 cursor-pointer"
              />
            ))}
            <circle cx={center} cy={center} r={radius * 0.55} fill={holeFill} />

            {hovered !== null && paths[hovered] && (
              <>
                <text
                  x={center}
                  y={center - 8}
                  textAnchor="middle"
                  className="text-sm font-bold"
                  fill={isDark ? "#ffffff" : "#111827"}
                >
                  {fmt(paths[hovered].value)}
                </text>
                <text
                  x={center}
                  y={center + 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isDark ? "#9ca3af" : "#6b7280"}
                >
                  {(paths[hovered].percentage * 100).toFixed(1)}%
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="space-y-1.5 min-w-0 pt-2">
          {paths.map((p) => (
            <div
              key={p.index}
              className={`flex items-center gap-2 text-sm cursor-pointer transition-opacity duration-200 ${
                hovered === null || hovered === p.index ? "opacity-100" : "opacity-30"
              }`}
              onMouseEnter={() => setHovered(p.index)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>{p.label}</span>
              <span className="ml-auto font-medium whitespace-nowrap">
                {(p.percentage * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PieChart