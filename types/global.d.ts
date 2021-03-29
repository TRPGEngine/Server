type AllowedModelFieldType = number | string | boolean; // 这里的类型会被选出
type DisabledModelFieldList = 'isNewRecord'; // 这里会被移除

type ExtractModelField<T> = {
  [K in keyof T]: T[K] extends AllowedModelFieldType
    ? K extends DisabledModelFieldList
      ? never
      : K
    : never;
}[keyof T];

type PartialModelField<T> = Partial<Pick<T, ExtractModelField<T>>>;
