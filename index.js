
const fs = require('fs');
const core = require('@actions/core');
const xpath = require('xpath')
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

const file = core.getInput('file');
const regex = core.getInput('regex');
const xpath_location = core.getInput('xpath');
const bump_major = core.getInput('major') === 'true' || core.getInput('major') > 0;
const bump_minor = core.getInput('minor') === 'true' || core.getInput('minor') > 0;
const bump_patch = core.getInput('patch') === 'true' || core.getInput('patch') > 0;

/// run
async function run()
{
    try
    {
        const doc = read_csproj(file);
        const verElement = get_csproj_version(doc);
        if (verElement)
        {
            const ver = parse_version(verElement.data);
            if (ver)
            {
                let [major, minor, patch, prerelease, buildmetadata] = ver;
                console.dir({ver});
                console.dir({major, minor, patch, prerelease, buildmetadata});
                console.dir({bump_major, bump_minor, bump_patch});

                if (bump_major)
                {
                    major++;
                }
                if (bump_minor)
                {
                    minor++;
                }
                if (bump_patch)
                {
                    patch++;
                }
                verElement.data = `${major}.${minor}.${patch}`;

                if (prerelease)
                {
                    verElement.data += `-${prerelease}`;
                }
                if (buildmetadata)
                {
                    verElement.data += `+${buildmetadata}`;
                }

                write_csproj(file, doc);
            }
            else
            {
                core.setFailed("failed to parse .csproj version");
            }
        }
        else
        {
            core.setFailed("invalid .csproj does not contain version");
        }

        // read back
        const doc2 = read_csproj(file);
        const verElement2 = get_csproj_version(doc2);
        if (verElement2)
        {
            const ver = parse_version(verElement2.data);
            if (ver)
            {
                core.setOutput('version', verElement2.data);
            }
            else
            {
                core.setFailed("failed to parse .csproj version at read back");
            }

            if (verElement2.data === verElement.data)
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
            core.setFailed("invalid .csproj does not contain version at read back");
        }
    }
    catch (error)
    {
        core.setFailed(error.message);
    }
}

function parse_version(version)
{
    const match = version.match(regex);
    if (match)
    {
        console.dir({groups: match.groups});
        return [match.groups.major, match.groups.minor, match.groups.patch, match.groups.prerelease, match.groups.buildmetadata];
    }
    return null
}

function get_csproj_version(doc)
{
    const verElement = xpath.select(xpath_location, doc);

    if (verElement === undefined ||
        verElement.length == 0   ||
        verElement[0] === undefined)
    {
        throw Error("Could not locate version element. Check XPath expression or .csproj file");
    }

    if (verElement)
    {
        return verElement[0].firstChild;
    }
    return null;
}

function read_csproj(csprojfile)
{
    const xml = fs.readFileSync(csprojfile, 'utf8');
    console.log("%s", xml);

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    console.dir({doc});

    if (doc == null)
    {
        throw Error("error while parsing");
    }

    return doc;
}

function write_csproj(csprojfile, doc)
{
    const serializer = new XMLSerializer();
    const xml = serializer.serializeToString(doc);
    fs.writeFileSync(csprojfile, xml + '\n');
}

run()
