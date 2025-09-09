import Image from 'next/image'
import BGSrc from './background.jpg'
import BannerSrc from './banner.png'
import { PrismaClient, Survey } from '@prisma/client/edge'
const prisma = new PrismaClient()
export async function generateStaticParams() {
	const surveys: Survey[] = await prisma.survey.findMany({
		where: {
			published: true,
		},
	})
	return surveys.map((survey) => ({
		id: survey.id,
	}))
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className=" h-screen w-screen">
			<Image className="fixed top-0 left-0 -z-10" src={BGSrc} alt="bg"></Image>
			<div className=" max-w-3xl mx-auto mt-20">
				<Image
					className=" h-[90px] w-full"
					src={BannerSrc}
					alt="banner"
				></Image>
				<div className=" p-6 bg-card ">{children}</div>
			</div>
		</div>
	)
}
