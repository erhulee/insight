import { FAQCard } from './faq-card'
import { QuickStartGuide } from './quick-start-guide'
import { SupportedServicesCard } from './supported-services-card'

function Useage() {
	return (
		<div className=" flex flex-col gap-4">
			<SupportedServicesCard />
			<QuickStartGuide />
			<FAQCard />
		</div>
	)
}

export default Useage
