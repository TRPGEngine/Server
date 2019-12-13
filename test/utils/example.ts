import { TRPGModel } from 'packages/Core/lib/storage';

/**
 * 用于同一管理测试数据
 */
class TestExampleStack {
  stack: TRPGModel[] = [];

  /**
   * 增加样式实例到堆栈中
   */
  append(model: TRPGModel) {
    this.stack.push(model);
  }

  async gc(): Promise<void> {
    Promise.all(
      this.stack.map((model) => model.destroy({ force: true }))
    ).catch((e) => console.error('测试数据回收失败: ' + e));
  }

  /**
   * 供外部直接注册一个配好的afterAll 生命周期
   */
  regAfterAll() {
    afterAll(async () => {
      await this.gc();
    });
  }
}

const testExampleStack = new TestExampleStack();
export default testExampleStack;
