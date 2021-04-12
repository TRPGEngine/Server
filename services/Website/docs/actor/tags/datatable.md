---
id: datatable
title: <DataTable>
---

```xml
<DataTable title="简单表格" :rows="[['表头1','表头2','表头3'], ['内容1','内容2','内容3']]" />
```

数据表格组件。用于根据数据渲染表格

## API

| 名称   | 类型                           | 描述                                   | 默认值   |
| ------ | ------------------------------ | -------------------------------------- | -------- |
| title  | string                         | 标题                                   |          |
| rows   | string[][]                     | 表格内容                               | []       |
| size   | "small" \| "middle" \| "large" | 表格大小类型                           | "middle" |
| height | number                         | 表格内容高度，如果填了的话则会限制高度 |          |

:::note
如果 rows 传入的数据不是一个数组的话。会视为空数组
:::

## 示例

### 紧凑表格

```xml
<DataTable title="紧凑表格" size="small" :rows="[['表头1','表头2','表头3'], ['内容1','内容2','内容3']]" />
```

### 大量数据表格

```xml
<Var name="tableExample" value="_range(100).map((x) => _range(3).map(y => `内容${x}-${y}`))" />
<DataTable title="大量数据" height="200" :rows="[['表头1','表头2','表头3'], ...tableExample]" />
```
