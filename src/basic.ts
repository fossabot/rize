import puppeteer from 'puppeteer'
import RizeInstance from './index'

export default function mixinBasic (Rize: typeof RizeInstance) {
  Rize.prototype.sleep = function (ms: number) {
    this.push(async () => {
      await this.page.waitFor(ms)
    })

    return this
  }

  Rize.prototype.execute = function (
    fn: (
      this: RizeInstance,
      browser: puppeteer.Browser,
      page: puppeteer.Page,
      ...args
    ) => void
  ) {
    this.push(() => fn.call(this, this.browser, this.page))

    return this
  }

  Rize.prototype.end = function (callback?: (...args) => any) {
    this.push(async () => {
      await this.browser.close()
      callback && callback()
    })
  }
}
