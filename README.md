# Validate CSS and HTML

### How to use
- Create a a file in `.github/workflows`

Past this
```yaml
name: Validate CSS and HTML
on:
  push:
    branches:
      - master

jobs:
  comments:
    name: Validate CSS and HTML
    runs-on: ubuntu-latest
    steps:
      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '15'
      - name: Validate CSS and HTML
        uses: y3ll0wlife/validate-css-html@master
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
```
