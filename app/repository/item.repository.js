"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const data_source_1 = require("../data-source");
const item_1 = require("../entity/item");
class ItemRepository {
    constructor(eventsCenter) {
        this.eventsCenter = eventsCenter;
        this._baseUrl = 'item';
        this.loadEvents();
    }
    addEvent(eventKey, listener) {
        this.eventsCenter.registerEvent(`${this._baseUrl}-${eventKey}`, listener);
    }
    loadEvents() {
        const itemRepo = data_source_1.AppDataSource.getRepository(item_1.Item);
        this.addEvent('add', (event, _item) => __awaiter(this, void 0, void 0, function* () {
            yield itemRepo.save(_item);
            return itemRepo.find();
        }));
        this.addEvent('getAll', (event, searchName) => {
            if (searchName === undefined) {
                return itemRepo.find();
            }
            else {
                return itemRepo.createQueryBuilder("item")
                    .where("name LIKE :param")
                    .setParameters({
                    param: '%' + searchName + '%'
                }).orderBy("id", "DESC").getMany();
            }
        });
        this.addEvent('delete', (event, _item) => __awaiter(this, void 0, void 0, function* () {
            yield itemRepo.remove(_item);
            return itemRepo.find();
        }));
        this.addEvent('getById', (event, itemId) => __awaiter(this, void 0, void 0, function* () {
            return itemRepo.findOne({ where: { id: itemId } });
        }));
        this.addEvent('update', (event, _newItem) => __awaiter(this, void 0, void 0, function* () {
            if (_newItem.id !== undefined) {
                if ((yield itemRepo.update(_newItem.id, _newItem)).affected === 1) {
                    return itemRepo.findOne({ where: { id: _newItem.id } });
                }
            }
        }));
    }
}
exports.ItemRepository = ItemRepository;
//# sourceMappingURL=item.repository.js.map