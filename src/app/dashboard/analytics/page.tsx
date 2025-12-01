'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/lib/i18n/components/LanguageSwitcher"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/lib/supabase-front/hooks"
import { useAnalytics } from "@/lib/supabase-front/hooks/useAnalytics"
import { TrendingUp, Target, Award, BarChart3 } from "lucide-react"
// Optimized: Import specific components from recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import dynamic from 'next/dynamic'
import { AnalyticsSkeleton } from "@/components/skeletons/AnalyticsSkeleton"

// Lazy load mapa para evitar problemas de SSR (Leaflet is heavy)
const LeafletMap = dynamic(() => import('@/components/analytics/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">Carregando mapa...</div>
})

export default function AnalyticsPage() {
  const { user } = useCurrentUser()
  const { data, loading } = useAnalytics({ userId: user?.id, days: 30 })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 justify-between px-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Análises</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content */}
        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          <div className="flex flex-1 flex-col gap-6 p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Taxa de Sucesso */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            {/* Total de Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.totalLeads.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  De {data?.totalExtractions} extrações
                </p>
              </CardContent>
            </Card>

            {/* Média por Extração */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média por Extração</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.avgLeadsPerExtraction.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leads por busca
                </p>
              </CardContent>
            </Card>

            {/* Melhor Projeto */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Projeto</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">
                  {data?.bestProject || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mais produtivo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Principal - Evolução Temporal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Extrações e Leads</CardTitle>
              <CardDescription>Últimos 30 dias - Tendências de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="extractions"
                    stroke="#8884d8"
                    name="Extrações"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="leads"
                    stroke="#82ca9d"
                    name="Leads"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grade 2 Colunas */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Leads por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Categorias</CardTitle>
                <CardDescription>Distribuição de leads por tipo de negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.byCategory || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Taxa de Sucesso ao Longo do Tempo */}
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso Diária</CardTitle>
                <CardDescription>Performance das extrações por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="#10b981"
                      name="Taxa de Sucesso"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance por Projeto */}
          {data && data.byProject.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance por Projeto</CardTitle>
                <CardDescription>Comparação de resultados entre projetos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.byProject.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center">
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.totalExtractions} extrações · {project.totalLeads} leads
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {project.successRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">sucesso</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mapa de Calor */}
          {data && data.locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição Geográfica</CardTitle>
                <CardDescription>Concentração de leads extraídos por localização</CardDescription>
              </CardHeader>
              <CardContent>
                <LeafletMap locations={data.locations} />
              </CardContent>
            </Card>
          )}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
