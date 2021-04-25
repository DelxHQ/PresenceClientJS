import { Client } from './Client'
import { SWITCH_IP } from '../config.json'

;(async() => {
  const client = await new Client(SWITCH_IP, 51966).init()

  process.on('SIGHUP', async () => {
    console.log('Exiting, destroying client')
    await client.destroy()
    process.exit()
  })
})()
