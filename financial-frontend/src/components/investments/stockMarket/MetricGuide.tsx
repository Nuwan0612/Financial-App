// src/components/investments/MetricGuide.tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { metricGuideData } from "./data"

export default function MetricGuide() {
  const [open, setOpen] = useState<number | null>(0)
  
  return (
    <div className="space-y-2">
      {metricGuideData.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors text-left"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <span>{item.title}</span>
            {open === idx ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {open === idx && (
            <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
              <p className="text-xs font-mono bg-muted/50 rounded px-2 py-1 text-muted-foreground">
                {item.formula}
              </p>
              <p className="text-sm text-foreground">{item.definition}</p>
              <p className="text-xs text-muted-foreground">{item.howToUse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}