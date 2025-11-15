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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrentUser, useExtractions } from "@/lib/supabase-front/hooks"
import { Plus, ArrowRight, Search, Download, FileX } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useTranslation } from "@/lib/i18n"
import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ExtractionsPage() {
  const { user } = useCurrentUser()
  const { extractions, loading } = useExtractions({
    userId: user?.id,
    enableRealtime: true,
  })
  const { t } = useTranslation('extractions')
  const { t: tDashboard } = useTranslation('dashboard')

  // Estado para filtros e busca
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Status colors
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: t('status_pending') },
      processing: { variant: "default", label: t('status_processing') },
      completed: { variant: "default", label: t('status_completed') },
      failed: { variant: "destructive", label: t('status_failed') },
      cancelled: { variant: "outline", label: t('status_cancelled') },
    }
    return variants[status] || { variant: "secondary", label: status }
  }

  // Filtrar extrações
  const filteredExtractions = useMemo(() => {
    let filtered = extractions

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter)
    }

    // Filtro por busca (nome ou query)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e =>
        (e.name && e.name.toLowerCase().includes(query)) ||
        (e.query && e.query.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [extractions, statusFilter, searchQuery])

  // Contadores por status
  const statusCounts = useMemo(() => {
    return {
      all: extractions.length,
      pending: extractions.filter(e => e.status === 'pending').length,
      processing: extractions.filter(e => e.status === 'processing').length,
      completed: extractions.filter(e => e.status === 'completed').length,
      failed: extractions.filter(e => e.status === 'failed').length,
      cancelled: extractions.filter(e => e.status === 'cancelled').length,
    }
  }, [extractions])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">{tDashboard('dashboard')}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{t('extractions')}</BreadcrumbPage>
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
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header com ação */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('extractions')}</h1>
              <p className="text-muted-foreground mt-1">
                Histórico completo de todas as suas extrações
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/extractions/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('new_extraction')}
              </Link>
            </Button>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou palavras-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({statusCounts.all})</SelectItem>
                <SelectItem value="pending">
                  {t('status_pending')} ({statusCounts.pending})
                </SelectItem>
                <SelectItem value="processing">
                  {t('status_processing')} ({statusCounts.processing})
                </SelectItem>
                <SelectItem value="completed">
                  {t('status_completed')} ({statusCounts.completed})
                </SelectItem>
                <SelectItem value="failed">
                  {t('status_failed')} ({statusCounts.failed})
                </SelectItem>
                <SelectItem value="cancelled">
                  {t('status_cancelled')} ({statusCounts.cancelled})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Extrações */}
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredExtractions.length} {filteredExtractions.length === 1 ? 'extração' : 'extrações'}
              </CardTitle>
              <CardDescription>
                {statusFilter !== "all"
                  ? `Filtrando por: ${getStatusBadge(statusFilter).label}`
                  : "Mostrando todas as extrações"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando extrações...
                </div>
              ) : filteredExtractions.length === 0 ? (
                <div className="text-center py-12">
                  {searchQuery || statusFilter !== "all" ? (
                    <>
                      <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {t('no_extractions')}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setStatusFilter("all")
                        }}
                      >
                        Limpar filtros
                      </Button>
                    </>
                  ) : (
                    <>
                      <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não criou nenhuma extração
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/extractions/new">
                          <Plus className="mr-2 h-4 w-4" />
                          {t('new_extraction')}
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tDashboard('table_name')}</TableHead>
                        <TableHead>Palavras-chave</TableHead>
                        <TableHead>{tDashboard('table_status')}</TableHead>
                        <TableHead>{tDashboard('table_leads')}</TableHead>
                        <TableHead>{tDashboard('table_date')}</TableHead>
                        <TableHead className="text-right">{tDashboard('table_actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExtractions.map((extraction) => {
                        const statusInfo = getStatusBadge(extraction.status)
                        return (
                          <TableRow key={extraction.id}>
                            <TableCell className="font-medium">
                              {extraction.name || extraction.query || tDashboard('no_name')}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">
                              {extraction.keywords?.join(', ') || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusInfo.variant as any}>
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{extraction.total_results || 0}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(extraction.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/extractions/${extraction.id}`}>
                                  {tDashboard('view')}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
