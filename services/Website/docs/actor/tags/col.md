---
id: tags/col
title: <Col />
---

```xml
<Col>
  ....
</Col>
```

独立占用一行。一般可以与`Row`标签来描述人物卡的布局

参数:

| 名称 | 类型 | 描述 | 默认值 |
| ---- | ---- | ---- | ---- |
| flex | string \| number | flex 弹性布局属性 | - |
| offset | number | 栅格左侧的间隔格数，间隔内不可以有栅格 | 0 |
| order | number | 栅格顺序 | 0 |
| pull | number | 栅格向左移动格数 | 0 |
| push | number | 栅格向右移动格数 | 0 |
| span | number | 栅格占位格数，为 0 时相当于 `display: none` | - |
| xs | number\|object | `<576px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | - |
| sm | number\|object | `≥576px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | - |
| md | number\|object | `≥768px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | - |
| lg | number\|object | `≥992px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | - |
| xl | number\|object | `≥1200px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | - |
| xxl | number\|object | `≥1600px` 响应式栅格，可为栅格数或一个包含其他属性的对象 | - |
