import net from 'net'
import RPC from 'discord-rpc'
import { Logger } from './util/Logger'
import BinaryStream from './util/BinaryStream'
import chalk from 'chalk'

export class Client {

  private rpcClient = new RPC.Client({ transport: 'ipc' })
  private socketClient: net.Socket = net.connect(this.port, this.host)
  private logger = new Logger()

  private clientId = '831528990439243806'

  private currentProgramId: bigint
  private pingTimeout: NodeJS.Timeout | null = null

  constructor(private host: string, private port: number) {}

  public async init() {
    await Promise.all([
      this.initListeners(),
      this.connectToDiscord(),
    ])

    return this
  }

  public async setActivity(gameName: string, programId: bigint, timestamp?: number) {
    await this.rpcClient.setActivity({
      details: gameName,
      largeImageKey: '0' + programId.toString(16),
      largeImageText: gameName,
      startTimestamp: timestamp
    })
  }

  private async initListeners() {
    this.rpcClient.on('ready', () => {
      this.logger.log(`Successfully connected to Discord.`)
    })

    this.socketClient.on('connect', () => {
      this.logger.log('Successfully connected to Nintendo Switch console.')
    })

    this.socketClient.on('data', data => this.handleData(data))
    this.socketClient.on('error', err => this.handleError(err))
  }

  private handleData(message: Buffer) {
    clearTimeout(this.pingTimeout)
    const stream = new BinaryStream(message)

    stream.readULong() // Magic
    let programId = stream.readULong()
    let name = stream.readString(612).split('\0')[0]

    if (programId === 0n) {
      programId = 0x0100000000001000n
      name = 'Home Menu'
    }

    if (programId != this.currentProgramId) {
      this.currentProgramId = programId
      this.setActivity(name, programId, programId === 0x0100000000001000n ? null : Date.now())
      this.logger.log(`Program ID for ${chalk.yellow(name)} is ${chalk.yellow(programId.toString(16))}`)
    }

    this.pingTimeout = setTimeout(() => {
      this.logger.log('Not received data in 10 seconds, reconnecting...')
      this.startSocket()
    }, 10000)
  }

  private handleError(err: any) {
    switch (err.code) {
      case 'ETIMEDOUT':
        this.logger.log('Timed out whilst attempting to connect to the Nintendo Switch console. Retrying connection...')
        this.startSocket()
        break
      default:
        this.logger.log('An unknown error has occured. Please make a new issue at https://github.com/DelxHQ/ClientSwitchPresence/issues with a screenshot with of the terminal.')
        console.error(err)

        this.rpcClient.destroy()
        this.socketClient.destroy()
        process.exit()
    }
  }

  private startSocket() {
    this.logger.log('Connecting to Switch...')
    this.socketClient.connect(this.port, this.host)
  }

  private async connectToDiscord() {
    this.logger.log('Connecting to Discord...')
    await this.rpcClient.login({ clientId: this.clientId })
  }

  public async destroy() {
    await this.rpcClient.destroy()
    this.socketClient.destroy()
  }

}
