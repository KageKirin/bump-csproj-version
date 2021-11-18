# set-csproj-version

GitHub Action to set the current version to a dotnet .csproj project file.
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
        uses: KageKirin/set-csproj-version@v0
        with:
          file: src/a_project.csproj
          version: ${{ github.ref_name }}

      - name: Commit new version
        run: |
          git commit -am "CI: update version from tag"
          git push https://${{ github.token }}@github.com/OWNER/REPO
```

## Inputs

### `file`

This represents the path to the `.csproj` to retrieve the version number from.

### `regex`

This is the Regular Expression used to verify the version.
It defaults to an equivalent of `major.minor.patch` and requires all 3 integers to be present.

### `xpath`

This is the XPath locator for the `Version` element.
It defaults to `//PropertyGroup/Version`.

### `version` (input)

This is the version string to write into the package.
It must match the provided `regex` format.

## Outputs

### `version`

This the `version` string as retrieved from the `package.json` after writing to the file.

## Errors

The action will fail if:

* it can't open the `file`
* it fails to retrieve the `<Version>` element
  * note that a newly created project does not contain any `<Version>` tag.
* the `version` string does not match the provided `regex`
