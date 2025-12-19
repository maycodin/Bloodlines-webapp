import Navbar from '@/components/Navbar'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <div className="flex relative">
      <Image
        src="/Leftside.png"
        alt="Jumbotron Image"
        width={843.8}
        height={850}
        className="absolute -top-0.75 -left-2.5 rounded-br-[56px]"
      />
      <Image
        src="/Rightside.png"
        alt="Jumbotron Image"
        width={571}
        height={800}
        className="absolute -top-5 left-177.5 rounded-bl-[300px]"
      />
      </div>
      <nav>

      </nav>
      <Navbar />
    
    </main>
    
  )
}


