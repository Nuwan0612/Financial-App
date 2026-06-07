"use client"

import { ChevronDown, ChevronRight, Wallet } from "lucide-react"
import { usePathname } from "next/navigation"
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./theme-togle"
import Link from "next/link"
import { navigationGroups } from "@/components/sidebar/navigationGroups"

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Financial Ledger</span>
            <span className="text-xs text-muted-foreground">Personal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => (
          <Collapsible key={group.label} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between w-full cursor-pointer hover:text-foreground transition-colors">
                  {group.label}
                  <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>

              <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                <SidebarGroupContent>
                  <SidebarMenu className="my-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title} className="mb-1">

                        <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={pathname === item.url}
                          >
                            <Link href={item.url} tabIndex={-1}>
                              <item.icon className="size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>

                        {/* Item WITH subitems — nested collapsible */}
                        {/* {item.subItems ? (
                          <Collapsible className="group/subcollapsible w-full">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                tooltip={item.title}
                                isActive={pathname.startsWith(item.url)}
                              >
                                <item.icon className="size-4" />
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/subcollapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                              <SidebarMenuSub>
                                {item.subItems.map((sub) => (
                                  <SidebarMenuSubItem key={sub.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === sub.url}
                                    >
                                      <Link href={sub.url}>
                                        <span>{sub.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>

                        ) : (
                          
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={pathname === item.url}
                          >
                            <Link href={item.url} tabIndex={-1}>
                              <item.icon className="size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )} */}

                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium">YN</span>
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium">Your Name</span>
            <span className="text-xs text-muted-foreground">you@email.com</span>
          </div>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}