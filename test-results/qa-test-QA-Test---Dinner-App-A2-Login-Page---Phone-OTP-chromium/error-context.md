# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - heading "登入" [level=1] [ref=e3]
    - paragraph [ref=e4]: 選擇登入方式
    - generic [ref=e5]:
      - button "← 返回" [ref=e6]
      - text: 香港手機號碼
      - generic [ref=e7]:
        - generic [ref=e8]: "+852"
        - textbox "91234567" [ref=e9]: "12345678"
      - paragraph [ref=e10]: Unsupported phone provider
      - button "取得驗證碼" [active] [ref=e11]
      - paragraph [ref=e12]: 我哋唔會亂發訊息
    - link "返回" [ref=e13] [cursor=pointer]:
      - /url: /
    - button "📱 加到主畫面" [ref=e15]
  - button "Open Next.js Dev Tools" [ref=e21] [cursor=pointer]:
    - img [ref=e22]
  - alert [ref=e25]
```