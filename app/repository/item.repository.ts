import {EventsCenter} from "../events.center";
import {IpcMainInvokeEvent} from "electron";
import {AppDataSource} from "../data-source";
import {Item} from "../entity/item";
export class ItemRepository {
  _baseUrl = 'item';

  constructor(private eventsCenter: EventsCenter) {
    this.loadEvents()
  }

  addEvent(eventKey: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    this.eventsCenter.registerEvent(`${this._baseUrl}-${eventKey}`, listener);
  }

  loadEvents(): void {
    const itemRepo = AppDataSource.getRepository(Item);

    this.addEvent('add', async (event: any, _item: Item) => {
      await itemRepo.save(_item);
      return itemRepo.find();
    });

    this.addEvent('getAll', (event, searchName: string) => {
      if (searchName === undefined) {
        return itemRepo.find();
      } else {
        return itemRepo.createQueryBuilder("item")
          .where("name LIKE :param")
          .setParameters({
            param: '%' + searchName + '%'
          }).orderBy("id", "DESC").getMany();
      }
    });

    this.addEvent('delete', async (event: any, _item: Item) => {
      await itemRepo.remove(_item);
      return itemRepo.find();
    });

    this.addEvent('getById', async (event: any, itemId: number) => {
      return itemRepo.findOne({where: {id: itemId}});
    });

    this.addEvent('update', async (event: any, _newItem: Item) => {
      if (_newItem.id !== undefined) {
        if ((await itemRepo.update(_newItem.id, _newItem)).affected === 1) {
          return itemRepo.findOne({where: {id: _newItem.id}})
        }
      }
    });
  }
}
