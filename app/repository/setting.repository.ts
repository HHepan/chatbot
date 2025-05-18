import {EventsCenter} from "../events.center";
import {IpcMainInvokeEvent} from "electron";
import {AppDataSource} from "../data-source";
import {Message} from "../entity/message";
import {Setting} from "../entity/setting";
export class SettingRepository {
  _baseUrl = 'setting';

  constructor(private eventsCenter: EventsCenter) {
    this.loadEvents()
  }

  addEvent(eventKey: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    this.eventsCenter.registerEvent(`${this._baseUrl}-${eventKey}`, listener);
  }

  loadEvents(): void {
    const settingRepo = AppDataSource.getRepository(Setting);

    this.addEvent('add', async (event: any, _item: Setting) => {
      await settingRepo.save(_item);
      return settingRepo.find();
    });

    this.addEvent('getAll', (event, searchName: string) => {
      if (searchName === undefined) {
        return settingRepo.find();
      } else {
        return settingRepo.createQueryBuilder("item")
          .where("name LIKE :param")
          .setParameters({
            param: '%' + searchName + '%'
          }).orderBy("id", "DESC").getMany();
      }
    });

    this.addEvent('delete', async (event: any, _item: Setting) => {
      await settingRepo.remove(_item);
      return settingRepo.find();
    });

    this.addEvent('getById', async (event: any, itemId: number) => {
      return settingRepo.findOne({where: {id: itemId}});
    });

    this.addEvent('update', async (event: any, _newItem: Setting) => {
      if (_newItem.id !== undefined) {
        if ((await settingRepo.update(_newItem.id, _newItem)).affected === 1) {
          return settingRepo.findOne({where: {id: _newItem.id}})
        }
      }
    });

    this.addEvent('setDefaultById', async (event: any, itemId: number) => {
      // 1. 把所有项的 default 字段设为 false
      await settingRepo
        .createQueryBuilder()
        .update(Setting)
        .set({ default: 0 })
        .execute();

      // 2. 把目标项的 default 字段设为 true
      await settingRepo
        .createQueryBuilder()
        .update(Setting)
        .set({ default: 1 })
        .where('id = :id', { id: itemId })
        .execute();

      return settingRepo.find();
    });
  }
}
