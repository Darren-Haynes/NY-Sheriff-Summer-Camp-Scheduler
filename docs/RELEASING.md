# Releasing

A release is built and published by `.github/workflows/release.yml` when a version tag
is pushed. Nobody builds installers by hand.

| Platform | Files | Built on |
| --- | --- | --- |
| Windows | `.msi` | `windows-latest` |
| macOS (Apple Silicon) | `.dmg`, `.zip` | `macos-latest` |
| Linux (x64) | `.deb`, `.rpm` | `ubuntu-latest` |

Every release also includes `SHA256SUMS.txt`.

## Cutting a release

1. **Bump the version** on a branch and open a PR. This updates `package.json` and
   `package-lock.json` without creating a tag:

   ```bash
   npm version 1.0.1 --no-git-tag-version
   ```

2. **Merge the PR** once CI is green.
3. **Tag the merge commit on `main`** and push the tag:

   ```bash
   git checkout main && git pull
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. The **Release** workflow runs. It fails immediately if the tag (`v1.0.1`) and the
   `package.json` version (`1.0.1`) disagree, so the installers always match the tag.
5. When all three builds pass, a GitHub Release is created with the installers, checksums
   and generated release notes. A tag containing a hyphen (`v1.1.0-rc.1`) is published as a
   pre-release.

The MSI takes its version from `package.json`, so it follows step 1 automatically.

## Trying the pipeline without publishing

- Open **Actions → Release → Run workflow**. All three builds run and upload their installers
  as workflow artifacts (kept 14 days), but no release is created because the run is not
  from a tag.
- A pull request that changes `release.yml` or `forge.config.ts` runs the same builds
  automatically.

## Building locally

```bash
npm run make        # output in out/make/
```

`make` only builds the installers for the operating system it runs on. The `.rpm` needs
`rpmbuild` (`sudo dnf install rpm-build`), and the `.deb` needs `dpkg` and `fakeroot`.

## What users will see: the installers are not signed

The installers are not code-signed, because signing needs paid certificates. Each OS warns
about that on first launch.

- **Windows:** SmartScreen says "Windows protected your PC". Choose **More info**, then
  **Run anyway**.
- **macOS:** Gatekeeper may refuse to open the app. Control-click the app and choose
  **Open**, or remove the download quarantine flag:

  ```bash
  xattr -cr "/Applications/NY Sheriff Summer Camp Scheduler.app"
  ```

- **Linux:** no warning.

Users can check a download against `SHA256SUMS.txt`:

```bash
sha256sum -c SHA256SUMS.txt --ignore-missing
```
