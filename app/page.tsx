"use client";

import { useAccount } from 'wagmi'

export default function Home() {
  const { address } = useAccount()

  return (
    <div className="w-full min-h-screen">
      <nav className="w-full h-16 flex items-center justify-between">
        <div>Pollay</div>
        <div>
          {/* @ts-expect-error msg */}
          <appkit-button />
        </div>
      </nav>

      <h1>Hello world</h1>
      <p>{address || 'NULL'}</p>
    </div>
  );
}
