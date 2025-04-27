import { jsonRes } from '@fastgpt/service/common/response';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { filename } = req.query as { filename: string };
  // 读取本地
  const filePath = path.join(process.cwd(), 'public', 'imgs', filename);
  console.log(filePath, 'filePath');

  try {
    const content = fs.readFileSync(filePath);

    // 确定文件扩展名
    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';

    // 根据扩展名设置合适的 Content-Type
    switch (extname) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    // 设置响应头，确保只展示不下载
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(path.basename(filePath))}"`
    );
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    res.send(content);
  } catch (error) {
    let errorMessage = '读取图片失败';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    jsonRes(res, {
      code: 500,
      error: errorMessage
    });
  }
}
export const config = {
  api: {
    responseLimit: '100mb'
  }
};
