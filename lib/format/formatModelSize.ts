export function formatModelSize(size: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	const index = Math.floor(Math.log10(size) / 3)
	return (size / Math.pow(1024, index)).toFixed(2) + ' ' + units[index]
}
