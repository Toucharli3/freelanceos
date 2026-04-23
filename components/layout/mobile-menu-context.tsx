'use client'
import { createContext, useContext, useState } from 'react'

interface MobileMenuContextType {
    mobileOpen: boolean
    openMobileMenu: () => void
    closeMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType>({
    mobileOpen: false,
    openMobileMenu: () => {},
    closeMobileMenu: () => {},
})

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    return (
          <MobileMenuContext.Provider
                  value={{
                            mobileOpen,
                            openMobileMenu: () => setMobileOpen(true),
                            closeMobileMenu: () => setMobileOpen(false),
                  }}
                >
            {children}
          </MobileMenuContext.Provider>MobileMenuContext.Provider>
        )
}

export function useMobileMenu() {
    return useContext(MobileMenuContext)
}
</MobileMenuContext.Provider>
