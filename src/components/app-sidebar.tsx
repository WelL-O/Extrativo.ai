"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Download,
  FolderKanban,
  CreditCard,
  User,
  Settings,
  LifeBuoy,
  Send,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { SidebarLogo } from "@/components/sidebar-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { PaperPlaneIcon } from "@radix-ui/react-icons"
import { useCurrentUser } from "@/lib/supabase-front"
import { useTranslation } from "@/lib/i18n"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, loading } = useCurrentUser()
  const { t } = useTranslation('sidebar')

  // Dados do usuário vindos do Supabase
  const userData = {
    name: profile?.full_name || user?.email?.split('@')[0] || t('user'),
    email: user?.email || '',
    avatar: profile?.avatar_url || '',
  }

  // Dados da navegação - Extrativo
  const data = {
    navMain: [
      {
        title: t('dashboard'),
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: t('overview'),
            url: "/dashboard",
          },
          {
            title: t('analytics'),
            url: "/dashboard/analytics",
          },
        ],
      },
      {
        title: t('extractions'),
        url: "/dashboard/extractions",
        icon: Download,
        items: [
          {
            title: t('new_extraction'),
            url: "/dashboard/extractions/new",
          },
          {
            title: t('history'),
            url: "/dashboard/extractions",
          },
        ],
      },
      {
        title: t('projects'),
        url: "/dashboard/projects",
        icon: FolderKanban,
      },
    ],
    navSecondary: [
      {
        title: t('subscription'),
        url: "/dashboard/subscription",
        icon: CreditCard,
      },
      {
        title: t('profile'),
        url: "/dashboard/profile",
        icon: User,
      },
      {
        title: t('settings'),
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  }

  if (loading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#" className="flex items-center justify-center">
                  <SidebarLogo />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="px-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </SidebarContent>
        <SidebarFooter className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[160px]" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center justify-center">
                <SidebarLogo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
