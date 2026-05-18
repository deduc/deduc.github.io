import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = REPO_ROOT / 'scripts' / 'github-repos.template.js'
OUTPUT = REPO_ROOT / 'scripts' / 'github-repos.js'
DOTENV = REPO_ROOT / '.env'

def load_dotenv():
    if DOTENV.exists():
        for line in DOTENV.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith('#'):
                key, _, val = line.partition('=')
                os.environ.setdefault(key.strip(), val.strip())

def main():
    load_dotenv()

    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print('ERROR: GITHUB_TOKEN not found in environment or .env file')
        sys.exit(1)

    if not TEMPLATE.exists():
        print(f'ERROR: Template not found at {TEMPLATE}')
        sys.exit(1)

    content = TEMPLATE.read_text()
    content = content.replace('__GITHUB_TOKEN__', token)

    OUTPUT.write_text(content)
    print(f'Generated {OUTPUT}')


if __name__ == '__main__':
    main()
