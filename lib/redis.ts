import Redis from 'ioredis'
import chalk from 'chalk'
const redis = new Redis({
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: false,
})

// 处理连接错误
redis.on('error', (error) => {
    console.error('Redis connection error:', error.message)
})

redis.on('connect', () => {
    console.log('Redis connected successfully')
})

redis.on('ready', () => {
    console.log(chalk.red('Redis is ready'))
})

export default redis 