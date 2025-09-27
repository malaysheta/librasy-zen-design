import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  History,
  Settings,
  Menu,
  X,
  BookMarked
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Books", url: "/admin/books", icon: BookOpen },
  { title: "Issue Book", url: "/admin/issue", icon: BookMarked },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Borrowing Records", url: "/admin/records", icon: History },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path)
      ? "bg-primary-foreground/10 text-primary-foreground font-medium border-r-2 border-accent"
      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground";

  return (
    <Sidebar
      className={`${state === "collapsed" ? "w-16" : "w-64"} bg-primary border-r-0 transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="bg-primary">
        {/* Logo Section */}
        <div className="p-6 border-b border-primary-foreground/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent-foreground" />
            </div>
            {state === "expanded" && (
              <span className="text-xl font-bold text-primary-foreground">
                LibraSys
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      className={`${getNavClass(item.url)} rounded-lg transition-all duration-200`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {state === "expanded" && (
                        <span className="ml-3 font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Info */}
        {state === "expanded" && (
          <div className="mt-auto p-6 border-t border-primary-foreground/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-accent-foreground">A</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-primary-foreground">Admin</p>
                <p className="text-primary-foreground/60">admin@library.edu</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}