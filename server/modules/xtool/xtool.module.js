"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtoolModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const xtool_controller_1 = require("./xtool.controller");
const xtool_service_1 = require("./xtool.service");
const public_controller_1 = require("./public.controller");
const public_service_1 = require("./public.service");
const laser_preview_controller_1 = require("./laser-preview.controller");
let XtoolModule = class XtoolModule {
};
exports.XtoolModule = XtoolModule;
exports.XtoolModule = XtoolModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [xtool_controller_1.XtoolController, public_controller_1.PublicController, laser_preview_controller_1.LaserPreviewController],
        providers: [xtool_service_1.XtoolService, public_service_1.PublicService],
    })
], XtoolModule);
