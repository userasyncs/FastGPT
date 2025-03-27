import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { authFileToken } from '@fastgpt/service/support/permission/controller';
import { getDownloadStream, getFileById } from '@fastgpt/service/common/file/gridfs/controller';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { stream2Encoding } from '@fastgpt/service/common/file/gridfs/utils';
import fs from 'fs';
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

  // return;
  // try {
  //   await connectToDatabase();

  //   const { token, filename } = req.query as { token: string; filename: string };

  //   const { fileId, bucketName } = await authFileToken(token);
  //   // console.log(fileId, bucketName);

  //   if (!fileId) {
  //     throw new Error('fileId is empty');
  //   }

  //   const [file, fileStream] = await Promise.all([
  //     getFileById({ bucketName, fileId }),
  //     getDownloadStream({ bucketName, fileId })
  //   ]);

  //   // console.log(file, fileStream, '====>');

  //   if (!file) {
  //     return Promise.reject(CommonErrEnum.fileNotFound);
  //   }

  //   const { stream, encoding } = await (async () => {
  //     if (file.metadata?.encoding) {
  //       return {
  //         stream: fileStream,
  //         encoding: file.metadata.encoding
  //       };
  //     }
  //     return stream2Encoding(fileStream);
  //   })();

  //   const extension = file.filename.split('.').pop() || '';
  //   const disposition = ['html', 'htm'].includes(extension) ? 'attachment' : 'inline';

  //   res.setHeader('Content-Type', `${file.contentType}; charset=${encoding}`);
  //   res.setHeader('Cache-Control', 'public, max-age=31536000');
  //   res.setHeader(
  //     'Content-Disposition',
  //     `${disposition}; filename="${encodeURIComponent(filename)}"`
  //   );
  //   res.setHeader('Content-Length', file.length);

  //   stream.pipe(res);

  //   stream.on('error', () => {
  //     res.status(500).end();
  //   });
  //   stream.on('end', () => {
  //     res.end();
  //   });
  // } catch (error) {
  //   jsonRes(res, {
  //     code: 500,
  //     error
  //   });
  // }
}
export const config = {
  api: {
    responseLimit: '100mb'
  }
};
