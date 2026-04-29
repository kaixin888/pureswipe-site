const fs = require('fs')

// 读取被转义的文件并修正
let raw = fs.readFileSync('scripts/seed-blog-posts.js', 'utf8')

// 替换被转义的反引号
raw = raw.replace(/\\`/g, '`')
raw = raw.replace(/\\\$/g, '$')

// 写入临时干净版本
fs.writeFileSync('scripts/seed-blog-posts-clean.js', raw, 'utf8')
console.log('Written scripts/seed-blog-posts-clean.js')
