import serve from 'koa-static';
import Debug from 'debug';
import BasePackage from 'lib/package';
import HelpFeedbackDefinition from './models/feedback';
import faqRouter from './routers/faq';
const debug = Debug('trpg:component:help');

export default class Help extends BasePackage {
  public name: string = 'Help';
  public require: string[] = [];
  public desc: string = '帮助模块';

  onInit(): void {
    this.regModel(HelpFeedbackDefinition);

    this.initWebService();

    this.regRoute(faqRouter);
  }

  initWebService() {
    const app = this.app;
    const webservice = app.webservice;
    if (app.get('env') === 'development') {
      webservice.use(serve(__dirname + '/public'));
      // 用于清理view相关缓存的require缓存
      webservice.use(async (ctx, next) => {
        let reqModules = Object.keys(require.cache);
        let viewModules = reqModules.filter((item) =>
          /.*\/Help\/lib\/views\//.test(item)
        );
        for (let modulePath of viewModules) {
          delete require.cache[modulePath];
        }
        await next();
      });
    } else {
      webservice.use(
        serve(__dirname + '/public', { maxage: 1000 * 60 * 60 * 24 })
      );
    }
  }
}
