import { validateDisplayLogicConfig, DisplayLogicConfig } from '@/lib/logic/dsl'

type FormId = string

// In-memory fallback store for development; replace with Prisma/DB later
const memoryStore = new Map<FormId, DisplayLogicConfig>()

export const displayLogicService = {
	async getDisplayLogic(formId: FormId): Promise<DisplayLogicConfig> {
		const found = memoryStore.get(formId)
		if (found) return found
		const empty: DisplayLogicConfig = { enabled: false, version: 1, rules: [] }
		memoryStore.set(formId, empty)
		return empty
	},

	async saveDisplayLogic(formId: FormId, cfg: unknown): Promise<void> {
		const valid = validateDisplayLogicConfig(cfg)
		memoryStore.set(formId, valid)
	},
}
