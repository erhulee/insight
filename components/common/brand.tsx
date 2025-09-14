'use client'
import Link from 'next/link'

export function Brand() {
	return (
		<Link
			href="/"
			className="flex items-center gap-2 font-bold text-xl text-primary"
		>
			{/* <AudioLines></AudioLines> */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="lucide lucide-audio-lines-icon lucide-audio-lines"
			>
				<path
					d="M2 10v3"
					style={{
						animation: 'audioWave 1.2s ease-in-out infinite',
						animationDelay: '0s',
						transformOrigin: 'center',
					}}
				/>
				<path
					d="M6 6v11"
					style={{
						animation: 'audioWave 1.2s ease-in-out infinite',
						animationDelay: '0.1s',
						transformOrigin: 'center',
					}}
				/>
				<path
					d="M10 3v18"
					style={{
						animation: 'audioWave 1.2s ease-in-out infinite',
						animationDelay: '0.2s',
						transformOrigin: 'center',
					}}
				/>
				<path
					d="M14 8v7"
					style={{
						animation: 'audioWave 1.2s ease-in-out infinite',
						animationDelay: '0.3s',
						transformOrigin: 'center',
					}}
				/>
				<path
					d="M18 5v13"
					style={{
						animation: 'audioWave 1.2s ease-in-out infinite',
						animationDelay: '0.4s',
						transformOrigin: 'center',
					}}
				/>
				<path
					d="M22 10v3"
					style={{
						animation: 'audioWave 1.2s ease-in-out infinite',
						animationDelay: '0.5s',
						transformOrigin: 'center',
					}}
				/>
			</svg>

			<span className=" 2xl:text-2xl">Qortex</span>

			<style jsx global>{`
				@keyframes audioWave {
					0%,
					100% {
						transform: scaleY(1);
					}
					50% {
						transform: scaleY(1.8);
					}
				}
			`}</style>
		</Link>
	)
}
