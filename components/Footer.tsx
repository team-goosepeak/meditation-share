import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
      <div className="flex flex-row items-center justify-center">
        <Image src="/logo/logo_symbol.png" alt="Worship Reflection" width={70} height={70} className="mt-2" />
        <div className="text-left text-sm text-gray-500 pr-4">
          <p>리플렉션 - Worship Reflection v1.0.0</p>
          <p className="mt-1">© {year} All rights reserved</p>
        </div>
      </div>
    </div>
  )
}

