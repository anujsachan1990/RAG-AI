"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Database, Brain, Search, FileText, Zap, Users, Server, Globe, Code, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export default function ArchitectureDiagram() {
  const [activeStep, setActiveStep] = useState<Step>(0)
  const [scenario, setScenario] = useState<"rag" | "no-rag">("rag")

  useEffect(() => {
    setActiveStep(0)
  }, [scenario])

  useEffect(() => {
    const maxStep = scenario === "rag" ? 7 : 6
    if (activeStep < maxStep) {
      const timer = setTimeout(() => {
        setActiveStep((activeStep + 1) as Step)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setScenario((prev) => (prev === "rag" ? "no-rag" : "rag"))
        setActiveStep(0)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [activeStep, scenario])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">HESTA AI System Architecture</h1>
          <p className="text-lg text-gray-300 mb-6">RAG-Powered Conversational AI with Vector Search</p>

          {/* Scenario Toggle */}
          <div className="flex gap-2 justify-center mb-6">
            <Button
              onClick={() => setScenario("rag")}
              className={
                scenario === "rag" ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }
            >
              RAG Enabled (ENABLE_RAG=true)
            </Button>
            <Button
              onClick={() => setScenario("no-rag")}
              className={
                scenario === "no-rag"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }
            >
              Direct LLM (ENABLE_RAG=false)
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* User Layer */}
          <div className="relative">
            <LayerLabel>User Layer</LayerLabel>
            <div className="flex justify-center">
              <SystemBox
                icon={<Users className="w-6 h-6" />}
                label="User Query"
                isActive={activeStep >= 0}
                color="bg-slate-800 border-slate-600"
              >
                <div className="text-xs text-gray-400 mt-1">How many members?</div>
              </SystemBox>
            </div>
            {activeStep >= 0 && (
              <div className="flex justify-center">
                <AnimatedArrow color="blue" />
              </div>
            )}
          </div>

          {/* API Layer */}
          <div className="relative">
            <LayerLabel>API Layer</LayerLabel>
            <div className="flex justify-center">
              <SystemBox
                icon={<Server className="w-6 h-6" />}
                label="API Route"
                subLabel="Check ENABLE_RAG"
                isActive={activeStep >= 1}
                color="bg-slate-800 border-slate-600"
              />
            </div>
            {activeStep >= 1 && (
              <>
                <div className="flex justify-center">
                  <div className="w-0.5 h-8 bg-purple-400" />
                </div>
                <div className="flex justify-center">
                  <div className="w-64 h-0.5 bg-purple-400" />
                </div>
                <div className="flex justify-center relative">
                  <div className="absolute left-1/2 -translate-x-full w-0.5 h-8 bg-purple-400 -ml-32" />
                  <div className="absolute left-1/2 w-0.5 h-8 bg-purple-400 ml-32" />
                </div>
                <div className="absolute left-1/4 top-full mt-16 text-xs text-teal-300 bg-slate-800/80 px-2 py-1 rounded border border-teal-500">
                  ENABLE_RAG = true
                </div>
                <div className="absolute right-1/4 top-full mt-16 text-xs text-purple-300 bg-slate-800/80 px-2 py-1 rounded border border-purple-500">
                  ENABLE_RAG = false
                </div>
              </>
            )}
          </div>

          {/* Workflow Layer - Two parallel paths */}
          <div className="grid grid-cols-2 gap-12 pt-16 relative">
            {/* RAG Workflow (Left) */}
            <div className={`relative ${scenario !== "rag" ? "opacity-40" : ""}`}>
              <div className="bg-teal-600 text-white px-4 py-2 text-center font-bold rounded-t-lg">RAG Workflow</div>
              <div className="border-4 border-teal-600 rounded-b-lg p-6 space-y-4 bg-slate-800/50 backdrop-blur">
                <SystemBox
                  icon={<Search className="w-6 h-6" />}
                  label="Vector Search"
                  subLabel="Query Upstash"
                  isActive={scenario === "rag" && activeStep >= 2}
                  color="bg-slate-800 border-teal-500"
                />
                {scenario === "rag" && activeStep >= 2 && (
                  <div className="flex justify-center">
                    <AnimatedArrow color="teal" />
                  </div>
                )}

                <SystemBox
                  icon={<Database className="w-6 h-6" />}
                  label="Upstash Vector"
                  subLabel="Return chunks"
                  isActive={scenario === "rag" && activeStep >= 3}
                  color="bg-slate-800 border-teal-500"
                />
                {scenario === "rag" && activeStep >= 3 && (
                  <div className="flex justify-center">
                    <AnimatedArrow color="teal" />
                  </div>
                )}

                <SystemBox
                  icon={<Brain className="w-6 h-6" />}
                  label="LLM (e.g. Claude) + Retrieved Context"
                  isActive={scenario === "rag" && activeStep >= 4}
                  color="bg-slate-800 border-teal-500"
                />
                {scenario === "rag" && activeStep >= 4 && (
                  <div className="flex justify-center">
                    <AnimatedArrow color="teal" />
                  </div>
                )}

                <SystemBox
                  icon={<Code className="w-6 h-6" />}
                  label="C1 Renderer"
                  isActive={scenario === "rag" && activeStep >= 5}
                  color="bg-slate-800 border-teal-500"
                />
              </div>
            </div>

            {/* Direct LLM Workflow (Right) */}
            <div className={`relative ${scenario !== "no-rag" ? "opacity-40" : ""}`}>
              <div className="bg-purple-600 text-white px-4 py-2 text-center font-bold rounded-t-lg">
                Direct LLM Workflow
              </div>
              <div className="border-4 border-purple-600 rounded-b-lg p-6 space-y-4 bg-slate-800/50 backdrop-blur">
                <SystemBox
                  icon={<Brain className="w-6 h-6" />}
                  label="LLM (e.g. Claude)"
                  subLabel="No external context"
                  isActive={scenario === "no-rag" && activeStep >= 2}
                  color="bg-slate-800 border-purple-500"
                />
                {scenario === "no-rag" && activeStep >= 2 && (
                  <div className="flex justify-center">
                    <AnimatedArrow color="purple" />
                  </div>
                )}

                <SystemBox
                  icon={<Code className="w-6 h-6" />}
                  label="C1 Renderer"
                  isActive={scenario === "no-rag" && activeStep >= 3}
                  color="bg-slate-800 border-purple-500"
                />

                {scenario === "no-rag" && activeStep >= 3 && (
                  <div className="bg-orange-900/50 border-2 border-orange-500 px-3 py-2 rounded-lg flex items-start gap-2 text-xs backdrop-blur">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span className="text-orange-100">
                      <strong>Warning:</strong> Response based on LLM training data (may be outdated or hallucinated)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {((scenario === "rag" && activeStep >= 5) || (scenario === "no-rag" && activeStep >= 3)) && (
            <div className="relative h-20 flex justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-0.5 h-12 bg-blue-400" />
                <AnimatedArrow color="blue" />
              </motion.div>
            </div>
          )}

          {/* UI Layer */}
          <div className="relative">
            <LayerLabel>UI Layer</LayerLabel>
            <div className="flex justify-center">
              <SystemBox
                icon={<FileText className="w-6 h-6" />}
                label="UI Response"
                subLabel="Tables, charts, buttons"
                isActive={(scenario === "rag" && activeStep >= 6) || (scenario === "no-rag" && activeStep >= 4)}
                color="bg-slate-800 border-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Indexing Pipeline */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Indexing Pipeline (One-Time Setup)</h2>
          <div className="grid grid-cols-4 gap-4">
            <IndexingStep icon={<Globe />} label="1. Scrape" desc="Puppeteer fetches pages" />
            <IndexingStep icon={<FileText />} label="2. Extract" desc="Parse HTML & text" />
            <IndexingStep icon={<Zap />} label="3. Chunk" desc="Split into chunks" />
            <IndexingStep icon={<Database />} label="4. Embed" desc="Store in Vector DB" />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Technology Stack</h2>
          <div className="grid grid-cols-4 gap-4">
            <TechBadge name="Next.js 16" />
            <TechBadge name="Upstash Vector" />
            <TechBadge name="Claude Sonnet 4" />
            <TechBadge name="Puppeteer" />
            <TechBadge name="Recharts" />
            <TechBadge name="Tailwind CSS v4" />
            <TechBadge name="Framer Motion" />
            <TechBadge name="React Markdown" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LayerLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute -left-32 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 whitespace-nowrap">
      {children}
    </div>
  )
}

function SystemBox({
  icon,
  label,
  subLabel,
  isActive,
  color,
  children,
}: {
  icon: React.ReactNode
  label: string
  subLabel?: string
  isActive: boolean
  color: string
  children?: React.ReactNode
}) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.6,
      }}
      className={`border-2 rounded-lg p-4 w-64 ${color} transition-all duration-300 ${
        isActive ? "shadow-lg shadow-purple-500/20" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-300">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-white">{label}</div>
          {subLabel && <div className="text-xs text-gray-400">{subLabel}</div>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function AnimatedArrow({ color = "blue" }: { color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "#60a5fa",
    teal: "#14b8a6",
    purple: "#a855f7",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center"
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <motion.path
          d="M 20 0 L 20 35 M 15 30 L 20 35 L 25 30"
          stroke={colorMap[color]}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  )
}

function IndexingStep({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="border-2 border-slate-600 rounded-lg p-4 bg-slate-800/50 backdrop-blur hover:border-slate-500 transition-colors">
      <div className="text-gray-300 mb-2">{icon}</div>
      <div className="font-bold text-sm mb-1 text-white">{label}</div>
      <div className="text-xs text-gray-400">{desc}</div>
    </div>
  )
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="border-2 border-slate-600 rounded-lg p-3 bg-slate-800/50 backdrop-blur text-center hover:border-slate-500 transition-colors">
      <div className="text-sm font-semibold text-white">{name}</div>
    </div>
  )
}
