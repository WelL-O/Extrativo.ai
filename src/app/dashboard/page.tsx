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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrentUser, useUserStats, useExtractions } from "@/lib/supabase-front/hooks"
import { Download, FolderKanban, Search, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton"
import { useTranslation } from "@/lib/i18n"

export default function DashboardPage() {
  const { user } = useCurrentUser()
  const { stats, loading: statsLoading } = useUserStats(user?.id)
  const { extractions, loading: extractionsLoading } = useExtractions({
    userId: user?.id,
    enableRealtime: true,
  })
  const { t } = useTranslation('dashboard')

  // Últimas 5 extrações
  const recentExtractions = extractions.slice(0, 5)

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

  // Show loading skeleton
  const isLoading = statsLoading || extractionsLoading

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
                  <BreadcrumbPage>{t('dashboard')}</BreadcrumbPage>
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
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Card: Buscas */}
              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('searches')}</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.searches_used || 0}/{stats?.searches_limit || 10}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.searches_remaining || 0} {t('searches_remaining')}
                    </p>
                  </>
                )}
              </CardContent>
              </Card>

              {/* Card: Leads */}
              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('leads_extracted')}</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.total_leads?.toLocaleString('pt-BR') || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('from_extractions', { count: stats?.total_extractions || 0 })}
                    </p>
                  </>
                )}
              </CardContent>
              </Card>

              {/* Card: Projetos */}
              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('projects')}</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.total_projects || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <Link href="/dashboard/projects" className="hover:underline">
                        {t('view_projects')}
                      </Link>
                    </p>
                  </>
                )}
              </CardContent>
              </Card>
            </div>

            {/* Recent Extractions */}
            <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('recent_extractions')}</CardTitle>
                  <CardDescription>{t('recent_extractions_description')}</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/dashboard/extractions/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('new_extraction')}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {extractionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
              ) : recentExtractions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">{t('no_extractions_yet')}</p>
                  <Button asChild>
                    <Link href="/dashboard/extractions/new">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('create_first_extraction')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table_name')}</TableHead>
                      <TableHead>{t('table_status')}</TableHead>
                      <TableHead>{t('table_leads')}</TableHead>
                      <TableHead>{t('table_date')}</TableHead>
                      <TableHead className="text-right">{t('table_actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExtractions.map((extraction) => {
                      const statusInfo = getStatusBadge(extraction.status)
                      return (
                        <TableRow key={extraction.id}>
                          <TableCell className="font-medium">
                            {extraction.name || extraction.query || t('no_name')}
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
                                {t('view')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}

              {!extractionsLoading && recentExtractions.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/extractions">
                      {t('view_all_extractions')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
