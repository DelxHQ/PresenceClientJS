import { Client } from './Client'
import { SWITCH_IP } from '../config.json'

new Client(SWITCH_IP, 51966).init()