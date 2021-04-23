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
    this.logger.log(`Successfully set Rich Presence to ${gameName}`)
  }

  private async initListeners() {
    this.socketClient.on('connect', () => {
      this.logger.log('Successfully connected to Nintendo Switch console. Waiting to connect to Discord...')

      this.connectToDiscord()
    })
    this.socketClient.on('data', message => {
      const stream = new BinaryStream(message)

      const magic = stream.readULong()
      const programId = stream.readULong()

      if (programId != this.currentProgramId) {
        this.currentProgramId = programId
        if (games[programId.toString()]) {
          this.setActivity(games[programId.toString()].name, programId, games[programId.toString()] === games['0'] ? null : Date.now())
        } else {
          this.logger.log(`Program ID ${programId} is not supported yet.`)
        }
      }
    })
  }

  private async connectToDiscord() {
    this.rpcClient.on('ready', () => {
      this.logger.log(`Connected to Discord successfully. Setting Rich Presence for ${this.rpcClient.user.username}...`)
    })
    await this.rpcClient.login({ clientId: this.clientId })
  }
}