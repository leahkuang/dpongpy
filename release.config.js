function isNullOrEmpty(str) { return str === null || str === undefined || str.replace(/\s+/g, '') === ""; }

var dryRun = (process.env.RELEASE_DRY_RUN || "false").toLowerCase() === "true";
var testPypi = (process.env.RELEASE_TEST_PYPI || "false").toLowerCase() === "true";
var pypiUsername = process.env.PYPI_USERNAME;
var pypiPassword = process.env.PYPI_PASSWORD;


var prepareCmd = "poetry version -- \${nextRelease.version}";
var publishCmd = `poetry publish --build --username ${pypiUsername} --password ${pypiPassword}`;

if (testPypi) {
    // test-pypi repository name is defined in poetry.toml
    publishCmd = publishCmd.replace("--build", "--build --repository pypi-test");
}

if (dryRun) {
    publishCmd = publishCmd.replace("--build", "--build --dry-run");
}

var config = require('semantic-release-preconfigured-conventional-commits');

if (isNullOrEmpty(pypiUsername) || isNullOrEmpty(pypiPassword)) {
    console.warn("PyPI credentials not set, skipping the exec plugin");
    config.plugins.push(
        ["@semantic-release/exec", {
            "prepareCmd" : prepareCmd,
            "publishCmd": "poetry build",
        }]
    )
} else {
    config.plugins.push(
        ["@semantic-release/exec", {
            "prepareCmd" : prepareCmd,
            "publishCmd": publishCmd,
        }]
    )
}

if (!dryRun) {
    config.plugins.push(
        ["@semantic-release/github", {
            "assets": [
                { "path": "dist/*" },
            ]
        }],
        ["@semantic-release/git", {
            "assets": [
                "CHANGELOG.md",
                "pyproject.toml"
            ],
            "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }]
    );
}

module.exports = config
