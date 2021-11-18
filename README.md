# bump-node-package-version

GitHub Action to bump the current package.json version, or a part of it, to the next higher revision.
Places the bumped version into a context variable for later reference.

## Usage

In a GitHub Workflow that runs after pushing a tag:

```yaml
name: Auto-bump-version on merging a Pull Request

on:
  pull_request:
    branches:
      - main
    types: [closed]

jobs:
  build:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Bump version
        id: package_version
        uses: KageKirin/bump-node-package-version@v0
        with:
          patch: true

      - name: Commit new version
        run: |
          git commit -am "CI: bump version to ${{ steps.test.package_version.version }}"
          git tag -m "CI: create new tag" v${{ steps.test.package_version.version }}
          git push --follow-tags https://${{ github.token }}@github.com/OWNER/REPO
```

## Inputs

### `file`

This represents the path to the `package.json` to retrieve the version number from.
It defaults to `package.json`,
but you might need to adapt it if the file is named differently,
or lies in a subfolder.

### `regex`

This is the Regular Expression used to verify the version.
It defaults to an equivalent of `major.minor.patch` and requires all 3 integers to be present.

### `major`, `minor` and `patch`

These 3 input variables represent the 3 levels of semantic versioning.
They must be set to `true` or `false` depending on which version level you want to increment.

## Outputs

### `version`

This the `version` string as retrieved from the `package.json` after writing to the file.

## Errors

The action will fail if:

* it can't open the `file`
* it fails to retrieve the `version` element
* the `version` string does not match the provided `regex`
