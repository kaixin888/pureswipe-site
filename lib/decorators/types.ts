// 装饰器核心类型定义
// 所有装饰器均为 HOF：接收 RouteHandler，返回包装后的 RouteHandler
import { NextRequest, NextResponse } from 'next/server'

export type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>

export type DecoratorFn = (handler: RouteHandler) => RouteHandler

// 装饰器执行失败时返回的 HTTP 响应
export function errorResponse(status: number, message: string, details?: any) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status }
  )
}
