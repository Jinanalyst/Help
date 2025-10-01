'use client'

import SearchBox from '@/components/SearchBox'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="container">
      <div className="logo-container">
        <Image 
          src="/assets/help-sharp-logo.svg" 
          alt="Help Logo" 
          className="logo"
          width={200}
          height={200}
        />
      </div>
      
      <div className="search-container">
        <SearchBox />
      </div>
    </div>
  )
}
