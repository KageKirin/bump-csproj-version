# bump-csproj-version-fork

GitHub Action to bump the current dotnet .csproj project version, or a part of it, to the next higher revision.
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
        uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Bump version
        id: package_version
        uses: MWin10/bump-csproj-version-fork@latest
        with:
          file: src/a_project.csproj
          patch: true

      - name: Commit new version
        run: |
          git commit -am "CI: bump version to ${{ steps.package_version.outputs.version }}"
          git tag -a v${{ steps.package_version.outputs.version }}
          git push --follow-tags
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

### `major`, `minor` and `patch`

These 3 input variables represent the 3 levels of semantic versioning.
They must be set to `true` or `false` depending on which version level you want to increment.

## Outputs

### `version`

This the `version` string as retrieved from the `package.json` after writing to the file.

## Errors

The action will fail if:

* it can't open the `file`
* it fails to retrieve the `<Version>` element
  * note that a newly created project does not contain any `<Version>` tag.
* the `version` string does not match the provided `regex`
