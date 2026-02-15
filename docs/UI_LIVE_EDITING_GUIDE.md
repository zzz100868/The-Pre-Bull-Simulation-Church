# UI 实时调试指南（像设计工具一样）

## 0. 目标

你改 `frontend` 代码后，浏览器立即刷新，不用每次重建镜像。

## 1. 启动开发模式

在项目根目录执行：

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

打开：

- 前端：`http://127.0.0.1:3000`
- 后端：`http://127.0.0.1:3001/api/status`

查看日志：

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
```

## 2. 如何确认热更新生效

1. 打开 `frontend/src/app/page.tsx`
2. 找一个明显文本（例如按钮文案）改成其他字
3. 保存文件
4. 浏览器应在 1-3 秒内自动更新

如果没更新：

- 确认你是用上面带 `-f docker-compose.dev.yml` 的命令启动
- 看 `frontend` 日志是否有编译输出
- 强刷一次浏览器（`Ctrl + F5`）

## 3. 像设计工具一样调 UI（推荐流程）

1. 先在浏览器 DevTools 里试样式
- `F12` 打开 Elements
- 直接改 CSS（padding、颜色、字体、间距）
- 找到满意样式后复制回代码

2. 回填到代码（Tailwind 或 CSS）
- 结构类：在 `page.tsx` 的 className 中调整
- 全局样式：改 `frontend/src/app/globals.css`

3. 小步提交
- 每次只改一个模块（例如顶部指标卡）
- 每步保存后立刻在浏览器验证

## 4. 常用开发命令

```bash
# 只重启前端（一般不用重建）
docker compose -f docker-compose.yml -f docker-compose.dev.yml restart frontend

# 关闭开发模式
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## 5. 建议

- 先做“评委模式”再做“完整模式”
- 首屏只保留：转化进度、当前回合、本轮结果、下一轮按钮
- 复杂面板（联盟/榜单/全日志）先折叠
