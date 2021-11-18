# set-node-package-version

GitHub Action to set the current version to a package.json.
Places the set version into a context variable for later reference.

## Usage

In a GitHub Workflow that runs after pushing a tag:

```yaml
name: Auto-version on tag

on:
  push:
    tags:
      - '*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set version
        id: package_version
        uses: KageKirin/set-node-package-version@v0
        with:
          version: ${{ github.ref_name }}

      - name: Commit new version
        run: |
          git commit -am "CI: update version from tag"
          git push https://${{ github.token }}@github.com/OWNER/REPO
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

### `version` (input)

This is the version string to write into the package.
It must match the provided `regex` format.

## Outputs

### `version`

This the `version` string as retrieved from the `package.json` after writing to the file.

## Errors

The action will fail if:

* it can't open the `file`
* it fails to retrieve the `version` element
* the `version` string does not match the provided `regex`
