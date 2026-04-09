import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.cwd(), 'dist')
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '0.0.0.0'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const resolveRequestPath = (url = '/') => {
  const decodedPath = decodeURIComponent(url.split('?')[0] || '/')
  const safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '')
  const targetPath = join(root, safePath)

  if (existsSync(targetPath) && statSync(targetPath).isFile()) {
    return targetPath
  }

  if (existsSync(targetPath) && statSync(targetPath).isDirectory()) {
    const indexPath = join(targetPath, 'index.html')
    if (existsSync(indexPath)) {
      return indexPath
    }
  }

  return join(root, 'index.html')
}

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url)
  const extension = extname(filePath)
  const contentType = mimeTypes[extension] || 'application/octet-stream'

  response.setHeader('Content-Type', contentType)
  createReadStream(filePath)
    .on('error', () => {
      response.statusCode = 404
      response.end('Not found')
    })
    .pipe(response)
})

server.listen(port, host, () => {
  console.log(`Static frontend ready at http://${host}:${port}`)
})
