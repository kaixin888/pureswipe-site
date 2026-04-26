import re

with open('app/admin/products/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the last line that is '  );' (closing return of ProductList)
# Then everything after that should be replaced with ImageCell
match = re.search(r'^  \);\n', content, re.MULTILINE)
if match:
    end_pos = match.end()
    before = content[:end_pos]
    after = """function ImageCell({ url }) {
  const [broken, setBroken] = React.useState(false);
  const resolved = url && url.startsWith('/') ? `https://www.clowand.com${url}` : url;
  return resolved && !broken ? (
    <img
      src={resolved}
      alt="product"
      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
      onError={() => setBroken(true)}
    />
  ) : (
    <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 11 }}>
      {resolved ? '裂开' : '无图'}
    </div>
  );
}
"""
    with open('app/admin/products/page.js', 'w', encoding='utf-8') as f:
        f.write(before + after)
    print(f"OK: written {len(before)} + {len(after)} chars")
else:
    print("FAIL: could not find '  );'")
