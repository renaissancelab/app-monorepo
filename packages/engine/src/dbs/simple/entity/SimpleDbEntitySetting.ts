import { SimpleDbEntityBase } from './SimpleDbEntityBase';

export type ISimpleDbEntitySettings = {
  appReviewsLastOpenedAt: number;
};

export class SimpleDbEntitySetting extends SimpleDbEntityBase<ISimpleDbEntitySettings> {
  entityName = 'setting';

  async getAppReviewsLastOpenedAt(): Promise<number> {
    const data = await this.getRawData();
    return data?.appReviewsLastOpenedAt ?? 0;
  }

  async setAppReviewsLastOpenedAt(appReviewsLastOpenedAt: number) {
    const rawData = await this.getRawData();
    return this.setRawData({ ...rawData, appReviewsLastOpenedAt });
  }
}