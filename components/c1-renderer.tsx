"use client"
import { Card } from "@/components/ui/card"
import React from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import {
  User,
  Globe,
  Phone,
  Info,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  TrendingUp,
  PresentationIcon,
  PieChart,
  BarChart3,
  LineChartIcon,
} from "lucide-react"

import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface C1ComponentSpec {
  component?: string
  type?: string
  props?: Record<string, any>
  content?: string
  text?: string
  children?: any
}

interface C1RendererProps {
  c1Response: string
  onButtonClick?: (buttonName: string, buttonText: string) => void
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function sanitizeJSON(jsonStr: string): string {
  return jsonStr
    .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
    .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
    .replace(/:\s*'([^']*)'/g, ':"$1"') // Replace single quotes with double quotes
    .replace(/\n/g, " ") // Remove newlines
    .replace(/\r/g, "") // Remove carriage returns
    .replace(/\t/g, " ") // Replace tabs with spaces
    .replace(/\s+/g, " ") // Collapse multiple spaces
}

export function C1Renderer({ c1Response, onButtonClick }: C1RendererProps): ReactElement {
  try {
    const decodedResponse = decodeHTMLEntities(c1Response)

    let contentToProcess = decodedResponse

    // Check if response is wrapped in <content thesys="true">
    const thesysMatch = decodedResponse.match(/<content\s+thesys="true">(.+?)(?:<\/content>|$)/s)
    if (thesysMatch) {
      contentToProcess = thesysMatch[1]
      console.log("[v0] Extracted content from thesys wrapper")
    }

    // Try to find the JSON object more reliably
    let jsonStr = ""
    let braceCount = 0
    let inString = false
    let escapeNext = false
    let startIndex = -1

    for (let i = 0; i < contentToProcess.length; i++) {
      const char = contentToProcess[i]

      if (startIndex === -1 && char === "{") {
        startIndex = i
        braceCount = 1
        continue
      }

      if (startIndex === -1) continue

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === "\\") {
        escapeNext = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === "{") braceCount++
        if (char === "}") {
          braceCount--
          if (braceCount === 0) {
            jsonStr = contentToProcess.substring(startIndex, i + 1)
            break
          }
        }
      }
    }

    if (!jsonStr) {
      console.log("[v0] No valid JSON found in response, rendering as markdown")
      return (
        <div className="prose prose-sm max-w-full break-words text-foreground">
          <ReactMarkdown>{c1Response}</ReactMarkdown>
        </div>
      )
    }

    const sanitizedJSON = sanitizeJSON(jsonStr)

    let spec
    try {
      spec = JSON.parse(sanitizedJSON)
    } catch (parseError) {
      console.error("[v0] JSON parse error after sanitization:", parseError)
      console.log("[v0] Falling back to markdown rendering")
      return (
        <div className="prose prose-sm max-w-full break-words text-foreground">
          <ReactMarkdown>{c1Response}</ReactMarkdown>
        </div>
      )
    }

    // If there's a root component property, use that
    const rootSpec = spec.component || spec

    return <ComponentRenderer spec={rootSpec} onButtonClick={onButtonClick} />
  } catch (error) {
    console.error("[v0] Error parsing C1 response:", error)
    return (
      <div className="prose prose-sm max-w-full break-words text-foreground">
        <ReactMarkdown>{c1Response}</ReactMarkdown>
      </div>
    )
  }
}

interface ComponentRendererProps {
  spec: C1ComponentSpec
  onButtonClick?: (buttonName: string, buttonText: string) => void
}

function ComponentRenderer({ spec, onButtonClick }: ComponentRendererProps): ReactElement {
  if (!spec || typeof spec !== "object") {
    return <div className="text-foreground">{String(spec)}</div>
  }

  if (typeof spec === "string") {
    return <div className="text-foreground">{spec}</div>
  }

  const componentType = spec.component || spec.type
  const { props = {} } = spec
  const children = props.children || spec.children

  // Helper to render children recursively
  const renderChildren = (childrenData: any): React.ReactNode => {
    if (!childrenData) return null
    if (Array.isArray(childrenData)) {
      return (
        <>
          {childrenData.map((child: any, idx: number) => (
            <ComponentRenderer key={idx} spec={child} onButtonClick={onButtonClick} />
          ))}
        </>
      )
    }
    if (typeof childrenData === "object" && childrenData.children) {
      return <ComponentRenderer spec={childrenData} onButtonClick={onButtonClick} />
    }
    if (typeof childrenData === "object") {
      return <ComponentRenderer spec={childrenData} onButtonClick={onButtonClick} />
    }
    if (typeof childrenData === "string") {
      return childrenData
    }
    return null
  }

  if (!componentType || typeof componentType !== "string") {
    const content = props.content || props.text || spec.content || spec.text
    if (content) return <div className="text-foreground">{content}</div>
    if (children) return <>{renderChildren(children)}</>
    return null
  }

  switch (componentType.toLowerCase()) {
    case "card":
      return (
        <Card className="overflow-hidden border-border/50 bg-card shadow-sm max-w-full">
          <div className="space-y-4 p-4 md:p-6">{renderChildren(children)}</div>
        </Card>
      )

    case "header":
      return (
        <div className="mb-4 md:mb-6">
          {props.title && <h2 className="text-xl md:text-2xl font-bold text-foreground break-words">{props.title}</h2>}
          {props.subtitle && (
            <p className="mt-2 text-sm md:text-base text-foreground/80 break-words">{props.subtitle}</p>
          )}
        </div>
      )

    case "inlineheader":
      return (
        <div className="mb-4">
          {props.heading && (
            <h3 className="text-lg md:text-xl font-semibold text-foreground break-words">{props.heading}</h3>
          )}
          {props.description && <p className="mt-1 text-sm text-foreground/80 break-words">{props.description}</p>}
        </div>
      )

    case "minicardblock":
      return <div className="mb-6 grid gap-4 md:grid-cols-2">{renderChildren(children)}</div>

    case "minicard":
      return (
        <Card className="border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
          {props.lhs && <ComponentRenderer spec={props.lhs} onButtonClick={onButtonClick} />}
          {props.rhs && <ComponentRenderer spec={props.rhs} onButtonClick={onButtonClick} />}
          {renderChildren(children)}
        </Card>
      )

    case "datatile":
      return (
        <div className="space-y-2">
          {props.child && <ComponentRenderer spec={props.child} onButtonClick={onButtonClick} />}
          {props.amount && <div className="text-2xl font-bold text-primary">{props.amount}</div>}
          {props.description && <div className="text-sm text-foreground/80">{props.description}</div>}
          {renderChildren(children)}
        </div>
      )

    case "icon":
      const IconComponent = getIconComponent(props.name)
      return <IconComponent className="h-6 w-6 text-primary" />

    case "textcontent":
      return (
        <div className="mb-4 leading-relaxed text-foreground break-words prose prose-sm max-w-full">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-primary underline hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              p: ({ node, ...props }) => <p {...props} className="mb-0" />,
            }}
          >
            {props.textMarkdown || props.text}
          </ReactMarkdown>
        </div>
      )

    case "list":
      console.log("[v0] List component received items:", JSON.stringify(props.items, null, 2))
      console.log("[v0] List component received children:", children)

      if (props.variant === "icon" && props.items) {
        const validIconItems = props.items.filter((item: any) => item && (item.title || item.subtitle || item.iconName))
        if (validIconItems.length === 0) return null

        return (
          <ul className="mb-4 space-y-3">
            {validIconItems.map((item: any, idx: number) => (
              <li key={idx} className="flex gap-3">
                {item.iconName && (
                  <div className="flex-shrink-0">
                    {React.createElement(getIconComponent(item.iconName), {
                      className: "h-5 w-5 text-primary mt-0.5",
                    })}
                  </div>
                )}
                <div className="flex-1">
                  {item.title && <div className="font-semibold text-foreground">{item.title}</div>}
                  {item.subtitle && <div className="mt-1 text-sm text-foreground">{item.subtitle}</div>}
                </div>
              </li>
            ))}
          </ul>
        )
      }

      const listItems = props.items || (Array.isArray(children) ? children : [children])

      const filteredItems = listItems?.filter((item: any) => {
        if (!item) return false
        if (typeof item === "string") return item.trim().length > 0
        if (typeof item === "object") {
          const hasText = item?.text && item.text.trim().length > 0
          const hasContent = item?.content && (typeof item.content === "string" ? item.content.trim().length > 0 : true)
          const hasChildren =
            item?.children && (typeof item.children === "string" ? item.children.trim().length > 0 : true)
          const hasTitle = item?.title && item.title.trim().length > 0
          const hasSubtitle = item?.subtitle && item.subtitle.trim().length > 0
          return hasText || hasContent || hasChildren || hasTitle || hasSubtitle
        }
        return false
      })

      console.log("[v0] Filtered list items:", filteredItems?.length, filteredItems)

      if (!filteredItems || filteredItems.length === 0) return null

      return (
        <ul className="mb-4 space-y-2 pl-6">
          {filteredItems.map((item: any, idx: number) => (
            <li key={idx} className="flex items-start gap-2 text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="flex-1">
                {typeof item === "string" ? (
                  item
                ) : item.title || item.subtitle ? (
                  <div>
                    {item.title && <div className="font-semibold">{item.title}</div>}
                    {item.subtitle && <div className="mt-1 text-sm text-foreground">{item.subtitle}</div>}
                  </div>
                ) : (
                  <ComponentRenderer spec={item} onButtonClick={onButtonClick} />
                )}
              </span>
            </li>
          ))}
        </ul>
      )

    case "sectionblock":
      if (props.sections && Array.isArray(props.sections)) {
        return (
          <div className="mb-6 space-y-4">
            {props.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-3">
                {section.trigger && <h3 className="text-lg font-semibold text-foreground">{section.trigger}</h3>}
                {section.content && renderChildren(section.content)}
              </div>
            ))}
          </div>
        )
      }
      return <div className="mb-6">{renderChildren(children)}</div>

    case "calloutv2":
      return (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              {props.title && <div className="font-semibold text-foreground">{props.title}</div>}
              {props.description && <div className="mt-1 text-sm text-foreground/80">{props.description}</div>}
            </div>
          </div>
        </div>
      )

    case "steps":
      return <div className="mb-6 space-y-4">{renderChildren(children)}</div>

    case "stepsitem":
      return (
        <div className="flex gap-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            •
          </div>
          <div className="flex-1">
            {props.title && <div className="font-semibold text-foreground">{props.title}</div>}
            {props.details && (
              <div className="mt-1">
                <ComponentRenderer spec={props.details} onButtonClick={onButtonClick} />
              </div>
            )}
          </div>
        </div>
      )

    case "accordion":
      return (
        <Accordion type="single" collapsible className="mb-6">
          {children?.map((child: any, idx: number) => (
            <AccordionItem key={idx} value={child.value || `item-${idx}`}>
              <AccordionTrigger>{child.trigger?.text || child.trigger}</AccordionTrigger>
              <AccordionContent>{child.content && renderChildren(child.content)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )

    case "buttongroup":
      return (
        <div className={`flex gap-3 ${props.variant === "horizontal" ? "flex-row" : "flex-col"}`}>
          {renderChildren(children)}
        </div>
      )

    case "button":
      const buttonText = typeof children === "string" ? children : props.text || "Button"
      const handleButtonClick = () => {
        if (props.href) {
          window.open(props.href, props.target || "_blank")
        } else if (onButtonClick) {
          const buttonName = props.name || buttonText.toLowerCase().replace(/\s+/g, "_")
          onButtonClick(buttonName, buttonText)
        }
      }

      return (
        <Button
          variant={props.variant === "primary" ? "default" : "outline"}
          className="w-full text-center md:w-auto cursor-pointer"
          onClick={handleButtonClick}
          disabled={props.disabled}
        >
          {buttonText}
        </Button>
      )

    case "text":
    case "paragraph":
      const textContent = props.content || props.text || (typeof children === "string" ? children : "")
      return <p className="mb-4 leading-relaxed text-foreground break-words">{textContent}</p>

    case "div":
    case "container":
      return <div className={props.className}>{renderChildren(children)}</div>

    case "grid":
      const gridColsClass =
        props.columns === 1
          ? "grid-cols-1"
          : props.columns === 2
            ? "grid-cols-2"
            : props.columns === 3
              ? "grid-cols-3"
              : props.columns === 4
                ? "grid-cols-4"
                : "grid-cols-1 md:grid-cols-2"

      return <div className={`grid gap-4 ${gridColsClass}`}>{renderChildren(children)}</div>

    case "badge":
    case "label":
      const badgeText = props.text || (typeof children === "string" ? children : "")
      return (
        <Badge variant="secondary" className="mb-2">
          {badgeText}
        </Badge>
      )

    case "statistic":
    case "stat":
    case "stats":
      return (
        <div className="inline-flex items-baseline gap-1">
          {props.number && <span className="text-lg font-bold text-foreground">{props.number}</span>}
          {props.label && <span className="text-sm text-foreground/70">{props.label}</span>}
        </div>
      )

    case "section":
      return (
        <section className="mb-6">
          {props.title && <h3 className="mb-3 text-lg font-semibold text-foreground">{props.title}</h3>}
          {renderChildren(children)}
        </section>
      )

    case "link":
      const linkText = props.text || (typeof children === "string" ? children : "Link")
      return (
        <a
          href={props.href}
          className="text-primary underline hover:text-primary/80"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      )

    case "input":
      return (
        <div className="mb-4 space-y-2">
          {props.label && <Label htmlFor={props.name}>{props.label}</Label>}
          <Input
            id={props.name}
            name={props.name}
            type={props.type || "text"}
            placeholder={props.placeholder}
            required={props.rules?.required}
            min={props.rules?.min}
            max={props.rules?.max}
            className="w-full"
          />
        </div>
      )

    case "radioitem":
      return (
        <div className="flex items-start space-x-3 space-y-0 rounded-md border border-border p-4">
          <RadioGroupItem value={props.value || ""} id={props.value} />
          <div className="space-y-1 leading-none">
            <Label htmlFor={props.value} className="font-semibold">
              {props.label}
            </Label>
            {props.description && <p className="text-sm text-foreground/80">{props.description}</p>}
          </div>
        </div>
      )

    case "radiogroup":
      return (
        <RadioGroup defaultValue={props.defaultValue} className="space-y-3">
          {renderChildren(children)}
        </RadioGroup>
      )

    case "minichart":
      const chartData = props.data || []
      if (props.type === "line") {
        return (
          <div className="flex h-8 items-end gap-1">
            {chartData.map((value: number, idx: number) => (
              <div
                key={idx}
                className="flex-1 bg-primary/60 transition-all hover:bg-primary"
                style={{ height: `${(value / Math.max(...chartData)) * 100}%` }}
              />
            ))}
          </div>
        )
      }
      if (props.type === "bar") {
        return (
          <div className="flex h-8 items-end gap-1">
            {chartData.map((value: number, idx: number) => (
              <div
                key={idx}
                className="flex-1 rounded-t bg-primary/60 transition-all hover:bg-primary"
                style={{ height: `${(value / Math.max(...chartData)) * 100}%` }}
              />
            ))}
          </div>
        )
      }
      return null

    case "barchartv2":
      const chartDataV2 = props.chartData?.data
      if (!chartDataV2) return null

      return (
        <div className="mb-6 space-y-4">
          <div className="space-y-3">
            {chartDataV2.labels?.map((label: string, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-foreground">{chartDataV2.series?.[0]?.values?.[idx]}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${chartDataV2.series?.[0]?.values?.[idx]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {props.xAxisLabel && <div className="text-xs text-foreground/70">{props.xAxisLabel}</div>}
        </div>
      )

    case "profiletile":
      return (
        <Card className="overflow-hidden border-border/50 bg-card p-4 shadow-sm">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            {props.image && (
              <img
                src={props.image || "/placeholder.svg"}
                alt={props.name || "Profile"}
                className="h-32 w-32 flex-shrink-0 rounded-full object-cover"
              />
            )}
            <div className="flex-1 text-center md:text-left">
              {props.name && <h3 className="text-lg font-bold text-foreground">{props.name}</h3>}
              {props.label && <div className="text-sm text-foreground/80">{props.label}</div>}
              {props.description && <div className="mt-1 text-xs text-foreground/80">{props.description}</div>}
            </div>
          </div>
        </Card>
      )

    case "image":
      return (
        <div className="mb-4">
          <img
            src={props.src || "/placeholder.svg"}
            alt={props.alt || ""}
            className="max-w-[300px] w-full h-auto rounded-lg"
          />
          {props.caption && <p className="mt-2 text-sm text-foreground/80 text-center">{props.caption}</p>}
        </div>
      )

    case "table":
      if (!props.headers || !props.rows) return null
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {props.headers.map((header: string, idx: number) => (
                  <th key={idx} className="p-3 text-left font-semibold text-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row: string[], rowIdx: number) => (
                <tr key={rowIdx} className="border-b border-border/50">
                  {row.map((cell: string, cellIdx: number) => (
                    <td
                      key={cellIdx}
                      className={cn("p-3", cellIdx === 0 ? "font-medium text-foreground" : "text-foreground/90")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    default:
      return <div className="rounded-md bg-muted p-3 text-sm text-foreground/70">Component: {componentType}</div>
  }
}

function getIconComponent(iconName?: string): any {
  const iconMap: Record<string, any> = {
    "trending-up": TrendingUp,
    trending_up: TrendingUp,
    dollar: Calculator,
    chart: PieChart,
    "pie-chart": PieChart,
    pie_chart: PieChart,
    target: PresentationIcon,
    shield: AlertTriangle,
    leaf: CheckCircle2,
    info: Info,
    globe: Globe,
    user: User,
    phone: Phone,
    "bar-chart": BarChart3,
    bar_chart: BarChart3,
    "line-chart": LineChartIcon,
    line_chart: LineChartIcon,
  }

  return iconMap[iconName?.toLowerCase() || ""] || Info
}
