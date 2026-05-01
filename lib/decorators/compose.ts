// composeDecorators — 按声明顺序组合装饰器
// 用法: composeDecorators(requireAuth, validateBody(schema))(handler)
// 执行顺序: requireAuth → validateBody → handler
import { DecoratorFn, RouteHandler } from './types'

export function composeDecorators(
  ...decorators: DecoratorFn[]
): (handler: RouteHandler) => RouteHandler {
  if (decorators.length === 0) {
    return (handler) => handler
  }
  // reduceRight: A(B(C(handler))) → A 先执行，然后 B，然后 C
  return (handler) => decorators.reduceRight((inner, outer) => outer(inner), handler)
}
