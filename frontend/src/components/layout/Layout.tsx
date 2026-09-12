import React from 'react'

const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface text-primary">
      <header className="h-14 bg-primary/80 text-white flex items-center px-4">GreenVoltz</header>
      <main className="p-4">{children}</main>
    </div>
  )
}

export default Layout
