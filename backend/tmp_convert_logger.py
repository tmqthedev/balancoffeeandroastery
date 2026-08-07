import pathlib, re, os

root = pathlib.Path('.')
logger_path = root / 'utils' / 'logger.js'
assert logger_path.exists(), 'logger.js missing'
files = [p for p in root.rglob('*.js') if p != logger_path]
conv = [
    (re.compile(r'console\.error\('), 'logger.error('),
    (re.compile(r'console\.warn\('), 'logger.warn('),
    (re.compile(r'console\.info\('), 'logger.info('),
    (re.compile(r'console\.debug\('), 'logger.debug('),
    (re.compile(r'console\.log\('), 'logger.debug('),
]
removals = [
    re.compile(r'logger\.debug\(\s*"?>>> BEFORE BEDROCK"?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?>>> AFTER BEDROCK"?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?===== PRODUCTS COUNT ====="?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?===== FIRST PRODUCT ====="?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?===== PRODUCTS CONTEXT ====="?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?===== MODEL OUTPUT ====="?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?FULL RESULT:"?\s*\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?Database Provider:"?\s*,.*?\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?Query:"?\s*,.*?\);?\n?', re.S),
    re.compile(r'logger\.debug\(\s*"?Total products:"?\s*,.*?\);?\n?', re.S),
    re.compile(r'console\.dir\(.*?\);?\n?', re.S),
]
updated = []
for path in files:
    text = path.read_text(encoding='utf-8')
    orig = text
    for pat, repl in conv:
        text = pat.sub(repl, text)
    for pat in removals:
        text = pat.sub('', text)
    if 'logger.' in text:
        head = '\n'.join(text.splitlines()[:20])
        if not re.search(r"require\(['\"](?:\.\.?/)+utils/logger['\"]\)", head):
            rel = os.path.relpath(logger_path, path.parent).replace('\\', '/')
            if not rel.startswith('.'):
                rel = './' + rel
            text = f"const logger = require('{rel}');\n" + text
    if text != orig:
        path.write_text(text, encoding='utf-8')
        updated.append(str(path))
print('UPDATED', len(updated), 'files')
for u in updated:
    print(u)
