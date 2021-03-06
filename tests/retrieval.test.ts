import http from 'http'
import puppeteer from 'puppeteer'
import { getPortPromise as getPort } from 'portfinder'
import Rize from '../src'

test('retrieve title', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><title>rize</title></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.title()).resolves.toBe('rize')
  instance.execute(() => {
    jest
      .spyOn(instance.page, 'title')
      .mockReturnValue(Promise.reject(new Error()))
    server.close()
  })
  await expect(instance.title()).rejects.toThrowError()
  instance.end(done)
})

test('retrieve text', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><body><div>rize</div></body></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.text()).resolves.toBe('rize\n  ')
  await expect(instance.text('div')).resolves.toBe('rize')
  await expect(instance.text('span')).rejects.toThrowError()
  server.close()
  instance.end(done)
})

test('retrieve html', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><body><div>rize</div></body></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.html()).resolves.toBe(
    '<head></head><body><div>rize</div>\n  </body>'
  )
  await expect(instance.html('body')).resolves.toBe('<div>rize</div>\n  ')
  await expect(instance.html('span')).rejects.toThrowError()
  server.close()
  instance.end(done)
})

test('retrieve attribute', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><body><div class="rize"></div></body></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.attribute('div', 'class')).resolves.toBe('rize')
  await expect(instance.attribute('div', 'style')).resolves.toBe(null)
  await expect(instance.attribute('span', 'class')).rejects.toThrowError()
  server.close()
  instance.end(done)
})

test('retrieve style', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><body><div style="font-size: 5px"></div></body></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.style('div', 'font-size')).resolves.toBe('5px')
  await expect(instance.style('span', 'class')).rejects.toThrowError()
  server.close()
  instance.end(done)
})

test('retrieve value', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><body><input value="rize" /></body></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.value('input')).resolves.toBe('rize')
  await expect(instance.value('span')).rejects.toThrowError()
  server.close()
  instance.end(done)
})

test('retrieve if an element has a class', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end(`
    <html><body><div class="rize"></div></body></html>
  `)).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/`)
  await expect(instance.hasClass('div', 'rize')).resolves.toBe(true)
  await expect(instance.hasClass('div', 'chino')).resolves.toBe(false)
  await expect(instance.hasClass('span', 'class')).rejects.toThrowError()
  server.close()
  instance.end(done)
})

test('retrieve url', async done => {
  const instance = new Rize()
  await expect(instance.url()).resolves.toBe('about:blank')
  instance.end(done)
})

test('retrieve query string', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end('')).listen(port)
  const instance = new Rize()
  instance.goto(`http://localhost:${port}/?key1=value1&key2=abc&key2=123`)
  await expect(instance.queryString('key1')).resolves.toBe('value1')
  await expect(instance.queryString('key2')).resolves.toEqual(['abc', '123'])
  await expect(instance.queryString('key3')).resolves.toBeUndefined()
  server.close()
  instance.end(done)
})

test('retrieve cookies', async done => {
  const port = await getPort()
  const server = http.createServer((req, res) => res.end('')).listen(port)
  const instance = new Rize()
  instance
    .goto(`http://localhost:${port}/`)
    .execute(
      (browser, page) => page.setCookie({ name: 'name', value: 'value' })
    )
  await expect(instance.cookies())
    .resolves
    .toMatchObject({ name: 'name', value: 'value' })
  instance.execute(() => jest
    .spyOn(instance.page, 'cookies')
    .mockReturnValue(Promise.reject(new Error())))
  await expect(instance.cookies()).rejects.toThrowError()
  server.close()
  instance.end(done)
})
