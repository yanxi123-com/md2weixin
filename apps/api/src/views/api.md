### 调用示例

```bash
curl -X POST http://localhost:3000/api/wx-md \
-H "Content-Type: application/json" \
-d '{"font": "cx", "theme": "chengxin", "markdown": "## 示例\n\n这是一个示例"}'
```

可选参数:

- font: no-cx, cx
- theme: default, chengxin, mohei, chazi, nenqing, lvyi, hongfei, wechat-format, lanying, kejilan, lanqing, shanchui, qianduan, jikehei, jian, qiangweizi, menglv, quanzhanlan
