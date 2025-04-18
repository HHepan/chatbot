"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const item_1 = require("./entity/item");
const typeorm_1 = require("typeorm");
const environment_main_1 = require("./environment.main");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "better-sqlite3",
    database: environment_main_1.MAIN_CONFIG.dataBaseUrl,
    synchronize: true,
    logging: ['error', 'warn'],
    entities: [
        item_1.Item
    ], // 实体或模型表
});
//# sourceMappingURL=data-source.js.map