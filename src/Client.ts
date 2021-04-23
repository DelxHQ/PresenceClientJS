import net from 'net'
import RPC from 'discord-rpc'
import { Logger } from './util/Logger'
import BinaryStream from './util/BinaryStream'
import games from '../games.json'

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
    this.logger.log(`Successfully set Rich Presence to ${gameName}`, 'RPCClient')
  }

  private async initListeners() {
    this.socketClient.on('connect', () => {
      this.logger.log('Successfully connected to Nintendo Switch console. Waiting to connect to Discord...', 'SocketClient')

      this.connectToDiscord()
    })
    this.socketClient.on('data', message => {
      const stream = new BinaryStream(message)

      const magic = stream.readULong()
      const programId = stream.readULong()

      if (programId != this.currentProgramId) {
        if (games[programId.toString()]) {
          this.currentProgramId = programId
          this.setActivity(games[programId.toString()].name, programId, games[programId.toString()] === games['0'] ? null : Date.now())
        } else {
          this.logger.log(`Program ID ${programId} is not supported yet.`)
        }
      }
    })
    this.socketClient.on('error', err => {
      switch (err['code']) {
        case 'ETIMEDOUT':
          this.logger.log('Timed out whilst attempting to connect to the Nintendo Switch console. Retrying connection...', 'SocketClient')
          this.startSocket()
          break
        default:
          this.logger.log('An unknown error has occured. Please make a new issue at https://github.com/DelxHQ/ClientSwitchPresence/issues with a screenshot with of the terminal. Shutting down...', 'SocketClient')
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
      this.logger.log(`Connected to Discord successfully. Setting Rich Presence for ${this.rpcClient.user.username}...`, 'RPCClient')
    })
    await this.rpcClient.login({ clientId: this.clientId })
  }
}