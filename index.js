
const fs = require('fs');
const core = require('@actions/core');

const file = core.getInput('file');
const regex = core.getInput('regex');
const version = core.getInput('version');


/// run
async function run()
{
    try
    {
        const pkg = JSON.parse(fs.readFileSync(file));
        if (pkg.version)
        {
            const ver = parse_version(version);
            if (ver)
            {
                pkg.version = version;
                fs.writeFileSync(file, JSON.stringify(pkg, null, '  ') + '\n');
            }
            else
            {
                core.setFailed("failed to parse package.json version");
            }
        }
        else
        {
            core.setFailed("invalid package.json does not contain version");
        }

        // read back
        const pkg2 = JSON.parse(fs.readFileSync(file));
        if (pkg2.version)
        {
            const ver = parse_version(pkg2.version);
            if (ver)
            {
                core.setOutput('version', pkg2.version);
            }
            else
            {
                core.setFailed("failed to parse package.json version");
            }

            if (pkg2.version === pkg.version)
            {
                // no issues
            }
            else
            {
                core.setFailed("readback version different from input version");
            }
        }
        else
        {
            core.setFailed("invalid package.json does not contain version");
        }
    }
    catch (error)
    {
        core.setFailed(error.message);
    }
}

function parse_version(version)
{
    let match = version.match(regex);
    if (match)
    {
        return [match.groups.major, match.groups.minor, match.groups.patch, match.groups.prerelease, match.groups.buildmetadata];
    }
    return null
}

run()
