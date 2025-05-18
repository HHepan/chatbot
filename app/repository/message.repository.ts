import {EventsCenter} from "../events.center";
import {IpcMainInvokeEvent} from "electron";
import {AppDataSource} from "../data-source";
import {Message} from "../entity/message";
export class MessageRepository {
  _baseUrl = 'message';

  constructor(private eventsCenter: EventsCenter) {
    this.loadEvents()
  }

  addEvent(eventKey: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    this.eventsCenter.registerEvent(`${this._baseUrl}-${eventKey}`, listener);
  }

  loadEvents(): void {
    const messageRepo = AppDataSource.getRepository(Message);

    this.addEvent('add', async (event: any, _item: Message) => {
      await messageRepo.save(_item);
      return messageRepo.find();
    });

    this.addEvent('getAll', (event, currentSettingId: number) => {
      if (currentSettingId === undefined) {
        return messageRepo.find();
      } else {
        return messageRepo.createQueryBuilder("item")
          .where("settingId = :param")
          .setParameters({
            param: currentSettingId
          }).orderBy("id", "ASC").getMany();
      }
    });

    this.addEvent('delete', async (event: any, _item: Message) => {
      await messageRepo.remove(_item);
      return messageRepo.find();
    });

    this.addEvent('getById', async (event: any, itemId: number) => {
      return messageRepo.findOne({where: {id: itemId}});
    });

    this.addEvent('update', async (event: any, _newItem: Message) => {
      if (_newItem.id !== undefined) {
        if ((await messageRepo.update(_newItem.id, _newItem)).affected === 1) {
          return messageRepo.findOne({where: {id: _newItem.id}})
        }
      }
    });
  }
}
