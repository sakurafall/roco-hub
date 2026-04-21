/**
 * 统一异常类，方便上层 catch 时分流处理。
 */

export class BizError extends Error {
  code: number
  requestId?: string

  constructor(code: number, message: string, requestId?: string) {
    super(message)
    this.name = 'BizError'
    this.code = code
    this.requestId = requestId
  }
}

export class NetworkError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'NetworkError'
    this.cause = cause
  }
}

export class NotImplementedError extends Error {
  constructor(api: string) {
    super(`API not implemented in skeleton: ${api}`)
    this.name = 'NotImplementedError'
  }
}
