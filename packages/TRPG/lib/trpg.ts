import BasePackage from 'lib/package';
import TRPGReportDefinition from './models/game-report';
import TRPGMapDefinition, { TRPGGameMap } from './models/game-map';
import gameReportRouter from './routers/game-report';
import {
  createGroupMap,
  joinMapRoom,
  updateMapToken,
  updateMapLayer,
} from './map-event';
import { getMapManager, MapManagerCls } from './managers/map-manager';
import { getGroupMapList } from './event';
import TRPGRecruitDefinition from './models/recruit';
import recruitRouter from './routers/recruit';

// 注入方法声明
declare module 'packages/Core/lib/application' {
  interface Application {
    trpg: {
      mapManager?: MapManagerCls;
      [others: string]: any;
    };
  }
}

export default class TRPG extends BasePackage {
  public name: string = 'TRPG';
  public require: string[] = ['Player', 'Actor', 'Group', 'Chat'];
  public desc: string =
    'TRPG 专用包, 所有TRPG Engine独有内容都应当存放在这个包里';

  onInit(): void {
    this.regModel(TRPGReportDefinition);
    this.regModel(TRPGMapDefinition);
    this.regModel(TRPGRecruitDefinition);

    this.regRoute(gameReportRouter);
    this.regRoute(recruitRouter);

    this.initSocket();
    this.initMapService();
  }

  initSocket() {
    this.regSocketEvent('getGroupMapList', getGroupMapList);
  }

  /**
   * 初始化地图服务
   */
  initMapService() {
    const app = this.app;
    const enable = app.get('trpg.map.enable', false);
    if (enable) {
      // 地图管理器
      const mapManager = getMapManager({
        redisUrl: app.get('redisUrl'),
        cache: app.cache,
      });
      this.regValue('mapManager', mapManager);
      this.regCloseTask(() => mapManager.close());

      this.regSocketEvent('createGroupMap', createGroupMap);
      this.regSocketEvent('joinMapRoom', joinMapRoom);
      this.regSocketEvent('updateMapToken', updateMapToken);
      this.regSocketEvent('updateMapLayer', updateMapLayer);

      this.regScheduleJob(
        'dumpMapData',
        TRPGGameMap.dumpCacheCron,
        async () => {
          await TRPGGameMap.dumpMapData();
        }
      );
    }
  }
}
