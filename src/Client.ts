import net from 'net'
import RPC from 'discord-rpc'
import { Logger } from './util/Logger'
import BinaryStream from './util/BinaryStream'

export class Client {

  private rpcClient = new RPC.Client({ transport: 'ipc' })
  private socketClient = net.connect(this.port, this.host)
  private logger = new Logger()

  private clientId = '831528990439243806'

  private currentProgramId: bigint

  constructor(private host: string, private port: number) { }

  public async init() {
    await Promise.all([
      this.initListeners()
    ])
  }

  public async setActivity(gameName: string, programId: bigint, timestamp?: number) {
    await this.rpcClient.setActivity({
      details: gameName,
      largeImageKey: programId.toString(),
      largeImageText: gameName,
      startTimestamp: timestamp
    })
    this.logger.log(`Successfully set Rich Presence to ${gameName}`)
  }

  private async initListeners() {
    this.socketClient.on('connect', () => {
      this.logger.log('Successfully connected to Nintendo Switch console. Waiting to connect to Discord...')

      this.connectToDiscord()
    })
    this.socketClient.on('data', message => {
      const stream = new BinaryStream(message)

      let magic = stream.readULong()
      let programId = stream.readULong()
      let name = stream.readString(612).split('\0')[0]

      if (programId === 0n) name = 'Home Menu'

      // this.logger.log(`MAGIC: ${magic.toString(16)}, PROGRAM ID ${programId.toString(16)}, NAME: ${name}`)

      if (programId != this.currentProgramId) {
        this.currentProgramId = programId
        this.setActivity(name, programId, programId === 0n ? null : Date.now())
        // this.logger.log(`${name}'s program ID is ${programId} (${programId.toString(16)})`)
      }
    })
    this.socketClient.on('error', err => {
      switch (err['code']) {
        case 'ETIMEDOUT':
          this.logger.log('Timed out whilst attempting to connect to the Nintendo Switch console. Retrying connection...')
          this.startSocket()
          break
        default:
          this.logger.log('An unknown error has occured. Please make a new issue at https://github.com/DelxHQ/ClientSwitchPresence/issues with a screenshot with of the terminal. Shutting down...')
          console.error(err)

          this.rpcClient.destroy()
          this.socketClient.destroy()
          process.exit()
      }
    })
  }

  private startSocket() {
    this.socketClient.connect(this.port, this.host)
  }

  private async connectToDiscord() {
    this.rpcClient.on('ready', () => {
      this.logger.log(`Connected to Discord successfully. Setting Rich Presence for ${this.rpcClient.user.username}...`)
    })
    await this.rpcClient.login({ clientId: this.clientId })
  }
}