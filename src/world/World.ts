import { Channel } from './Channel';

export class World {
  private id: number;
  private channels: Channel[];

  constructor(id: number, channelCount: number) {
    this.id = id;
    this.channels = [];
    for (let i = 1; i <= channelCount; i++) {
      this.channels.push(new Channel(i, 0, this));
    }
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }

  getChannels(): Channel[] { return this.channels; }
  setChannels(channels: Channel[]): void { this.channels = channels; }

  getChannelById(id: number): Channel | undefined {
    return this.channels.find(ch => ch.getId() === id);
  }
}
