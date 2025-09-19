import { ollamaService } from '../services/ai/ollama'
import { publicProcedure, router } from '../trpc'

export const AIRouter = router({
	getModelList: publicProcedure.query(async () => {
		return await ollamaService.getDownloadedModelList()
	}),
})
