# labs.eustasy.org

[![Normal](https://github.com/eustasy/labs.eustasy.org/actions/workflows/normal.yml/badge.svg)](https://github.com/eustasy/labs.eustasy.org/actions/workflows/normal.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/819e8d5bfbbd16b1c1f2/maintainability)](https://codeclimate.com/github/eustasy/labs.eustasy.org/maintainability)

### Update submodules

```bash
git pull
git submodule update --init --recursive
git submodule foreach git checkout main
git submodule foreach git reset --hard HEAD
git submodule foreach git pull
```
