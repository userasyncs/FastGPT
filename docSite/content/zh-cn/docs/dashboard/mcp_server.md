---
title: 'MCP 服务'
description: '快速了解 专心小智 MCP server'
icon: 'extension'
draft: false
toc: true
weight: 260
---

## MCP server 介绍

MCP 协议（Model Context Protocol），是由 Anthropic 在 2024 年 11 月初发布的协议。它的目的在于统一 AI 模型与外部系统之间的通信方式，从而简化 AI 模型与外部系统之间的通信问题。随着 OpenAI 官宣支持 MCP 协议，越来越多的 AI 厂商开始支持 MCP 协议。

MCP 协议主要包含 Client 和 Server 两部分。简单来说，Client 是使用 AI 模型的一方，它通过 MCP Client 可以给模型提供一些调用外部系统的能能力；Server 是提供外部系统调用的一方，也就是实际运行外部系统的一方。

专心小智 MCP Server 功能允许你选择`多个`在 专心小智 上构建好的应用，以 MCP 协议对外提供调用 专心小智 应用的能力。

目前 专心小智 提供的 MCP server 为 SSE 通信协议，未来将会替换成 `HTTP streamable`。

## 专心小智 使用 MCP server

### 1. 创建 MCP server

登录 专心小智 后，打开`工作台`，点击`MCP server`，即可进入管理页面，这里可以看到你创建的所有 MCP server，以及他们管理的应用数量。

![创建 MCP server](/imgs/mcp_server1.png)

可以自定义 MCP server 名称和选择关联的应用

|                            |                            |
| -------------------------- | -------------------------- |
| ![](/imgs/mcp_server2.png) | ![](/imgs/mcp_server3.png) |

### 2. 获取 MCP server 地址

创建好 MCP server 后，可以直接点击`开始使用`，即可获取 MCP server 访问地址。

|                            |                            |
| -------------------------- | -------------------------- |
| ![](/imgs/mcp_server4.png) | ![](/imgs/mcp_server5.png) |

#### 3. 使用 MCP server

可以在支持 MCP 协议的客户端使用这些地址，来调用 专心小智 应用，例如：`Cursor`、`Cherry Studio`。下面以 Cursor 为例，介绍如何使用 MCP server。

打开 Cursor 配置页面，点击 MCP 即可进入 MCP 配置页面，可以点击新建 MCP server 按钮，会跳转到一个 JSON 配置文件，将第二步的`接入脚本`复制到`json 文件`中，保存文件。

此时返回 Cursor 的 MCP 管理页面，即可看到你创建的 MCP server，记得设成`enabled`状态。

|                            |                            |                            |
| -------------------------- | -------------------------- | -------------------------- |
| ![](/imgs/mcp_server6.png) | ![](/imgs/mcp_server7.png) | ![](/imgs/mcp_server8.png) |

打开 Cursor 的对话框，切换成`Agent`模型，只有这个模型，cursor 才会调用 MCP server。  
发送一个关于`专心小智`的问题后，可以看到，cursor 调用了一个 MCP 工具（描述为：查询 专心小智 知识库），也就是调用 专心小智 应用去进行处理该问题，并返回了结果。

|                            |                             |
| -------------------------- | --------------------------- |
| ![](/imgs/mcp_server9.png) | ![](/imgs/mcp_server10.png) |


## 私有化部署 MCP server 问题

私有化部署版本的 专心小智，需要升级到`v4.9.6-alpha`及以上版本才可使用 MCP server 功能。

### 修改 docker-compose.yml 文件

在`docker-compose.yml`文件中，加入`zxzz-mcp-server`服务:

```yml
zxzz-mcp-server:
    container_name: zxzz-mcp-server
    image: ghcr.io/labring/zxzz-mcp_server:latest
    ports:
      - 3005:3000
    networks:
      - zxzz
    restart: always
    environment:
      - ZXZZ_ENDPOINT=http://ai.anosi.cn:3000
```

### 修改 zxzz 容器环境变量

修改`config.json`配置文件，增加: `"feconfigs.mcpServerProxyEndpoint": "zxzz-mcp-server 的访问地址"`， 末尾不要携带/，例如:
```json
{
  "feConfigs": {
    "lafEnv": "https://laf.dev",
    "mcpServerProxyEndpoint": "https://ai.anosi.cn" 
  }
}
```

### 重启 zxzz 容器

因为是修改的挂载文件，可以强制 down 再 up 服务。启动后，既可以在工作台看到 MCP server 服务选项。

```bash
docker-compose down
docker-compose up -d
```
