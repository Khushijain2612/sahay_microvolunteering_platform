"use client";
import React from "react";

const SidebarContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

function Sidebar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { isOpen } = useSidebar();
  
  return (
    <div 
      className={`bg-gray-100 h-screen transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SidebarTrigger({ className = "" }: { className?: string }) {
  const { isOpen, setIsOpen } = useSidebar();
  
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`p-2 hover:bg-gray-200 rounded ${className}`}
    >
      {isOpen ? "←" : "→"}
    </button>
  );
}

function SidebarContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

function SidebarHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function SidebarFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function SidebarMenu({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {children}
    </ul>
  );
}

function SidebarMenuItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <li className={className}>
      {children}
    </li>
  );
}

function SidebarMenuButton({ 
  children, 
  isActive = false, 
  className = "",
  ...props
}: { 
  children: React.ReactNode; 
  isActive?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full text-left p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? "bg-blue-100 text-blue-600" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

function SidebarSeparator({ className = "" }: { className?: string }) {
  return (
    <hr className={`my-2 border-gray-300 ${className}`} />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};