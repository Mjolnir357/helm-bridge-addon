import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

// GitHub connection via Replit connector (connection:conn_github_01KHEPWC0XVS0JN6SYWVF6C6G5)
let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const OWNER = 'Mjolnir357';
const REPO = 'helm-bridge-addon';
const BRANCH = 'main';
const PROJECT_ROOT = path.resolve('/home/runner/workspace');

type BumpType = 'patch' | 'minor' | 'major';

function bumpVersion(version: string, type: BumpType): string {
  const parts = version.replace(/"/g, '').split('.').map(Number);
  switch (type) {
    case 'major': return `${parts[0] + 1}.0.0`;
    case 'minor': return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch': return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
}

function readVersion(configPath: string): string {
  const content = fs.readFileSync(configPath, 'utf-8');
  const match = content.match(/version:\s*"?([0-9]+\.[0-9]+\.[0-9]+)"?/);
  return match ? match[1] : '0.0.0';
}

function updateVersionInFile(filePath: string, newVersion: string): void {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /version:\s*"?[0-9]+\.[0-9]+\.[0-9]+"?/,
    `version: "${newVersion}"`
  );
  const versionLogPattern = /Helm (Bridge|Supervisor) v[0-9]+\.[0-9]+\.[0-9]+/g;
  content = content.replace(
    versionLogPattern,
    (match) => {
      const name = match.match(/Helm (Bridge|Supervisor)/)?.[0] || 'Helm Bridge';
      return `${name} v${newVersion}`;
    }
  );
  fs.writeFileSync(filePath, content, 'utf-8');
}

function generateChangelogEntry(version: string, changes: string): string {
  const date = new Date().toISOString().split('T')[0];
  const parsedChanges = changes.replace(/\\n/g, '\n');
  return `\n## [${version}] - ${date}\n\n${parsedChanges}\n`;
}

function prependChangelog(changelogPath: string, entry: string): void {
  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, `# Changelog\n\nAll notable changes will be documented in this file.\n${entry}`, 'utf-8');
    return;
  }
  let content = fs.readFileSync(changelogPath, 'utf-8');
  const headerEnd = content.indexOf('\n## ');
  if (headerEnd === -1) {
    content += entry;
  } else {
    content = content.substring(0, headerEnd) + entry + content.substring(headerEnd);
  }
  fs.writeFileSync(content.startsWith('#') ? changelogPath : changelogPath, content, 'utf-8');
}

interface AddonConfig {
  name: string;
  slug: string;
  configPaths: string[];
  changelogPath: string;
  runShPaths: string[];
}

const BRIDGE_ADDON: AddonConfig = {
  name: 'Helm Bridge',
  slug: 'helm-bridge',
  configPaths: [
    'helm-bridge-addon/helm-bridge/config.yaml',
    'helm-bridge-addon/packages/helm-bridge-addon/config.yaml',
  ],
  changelogPath: 'helm-bridge-addon/helm-bridge/CHANGELOG.md',
  runShPaths: [
    'helm-bridge-addon/helm-bridge/run.sh',
    'helm-bridge-addon/packages/helm-bridge-addon/run.sh',
  ],
};

const SUPERVISOR_ADDON: AddonConfig = {
  name: 'Helm Supervisor',
  slug: 'helm_supervisor',
  configPaths: [
    'helm-supervisor/config.yaml',
    'helm-supervisor-addon/helm_supervisor/config.yaml',
  ],
  changelogPath: 'helm-supervisor/CHANGELOG.md',
  runShPaths: [],
};

function bumpAddon(addon: AddonConfig, type: BumpType, changes: string): string {
  const primaryConfig = path.join(PROJECT_ROOT, addon.configPaths[0]);
  const currentVersion = readVersion(primaryConfig);
  const newVersion = bumpVersion(currentVersion, type);

  console.log(`  ${addon.name}: ${currentVersion} -> ${newVersion}`);

  for (const cp of addon.configPaths) {
    updateVersionInFile(path.join(PROJECT_ROOT, cp), newVersion);
  }
  for (const rp of addon.runShPaths) {
    updateVersionInFile(path.join(PROJECT_ROOT, rp), newVersion);
  }

  const changelogEntry = generateChangelogEntry(newVersion, changes);
  prependChangelog(path.join(PROJECT_ROOT, addon.changelogPath), changelogEntry);

  return newVersion;
}

interface FileToUpload {
  repoPath: string;
  localPath: string;
}

function collectAllFiles(): FileToUpload[] {
  const files: FileToUpload[] = [];

  const dirs = [
    { localDir: 'helm-bridge-addon/helm-bridge', repoDir: 'helm-bridge' },
    { localDir: 'helm-supervisor', repoDir: 'helm-supervisor' },
    { localDir: 'helm-supervisor-addon/helm_supervisor', repoDir: 'helm-supervisor-addon/helm_supervisor' },
    { localDir: 'bridge/src', repoDir: 'bridge/src' },
    { localDir: 'bridge/public', repoDir: 'bridge/public' },
  ];

  for (const { localDir, repoDir } of dirs) {
    const fullDir = path.join(PROJECT_ROOT, localDir);
    if (!fs.existsSync(fullDir)) continue;
    walkDir(fullDir, (filePath) => {
      const relativePath = path.relative(fullDir, filePath);
      files.push({
        repoPath: `${repoDir}/${relativePath}`,
        localPath: filePath,
      });
    });
  }

  const rootFiles = [
    { local: 'helm-bridge-addon/repository.yaml', repo: 'repository.yaml' },
    { local: 'helm-supervisor/repository.yaml', repo: 'helm-supervisor/repository.yaml' },
    { local: 'helm-supervisor-addon/repository.yaml', repo: 'helm-supervisor-addon/repository.yaml' },
    { local: 'helm-supervisor-addon/README.md', repo: 'helm-supervisor-addon/README.md' },
    { local: 'helm-bridge-addon/packages/helm-bridge-addon/config.yaml', repo: 'helm-bridge-addon/packages/helm-bridge-addon/config.yaml' },
    { local: 'helm-bridge-addon/packages/helm-bridge-addon/repository.yaml', repo: 'helm-bridge-addon/packages/helm-bridge-addon/repository.yaml' },
    { local: 'scripts/push-to-github.ts', repo: 'scripts/push-to-github.ts' },
  ];

  for (const { local, repo } of rootFiles) {
    const localPath = path.join(PROJECT_ROOT, local);
    if (fs.existsSync(localPath)) {
      files.push({ repoPath: repo, localPath });
    }
  }

  return files;
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  const skipDirs = ['node_modules', '.git', '.cache'];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) {
        walkDir(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  }
}

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.zip', '.tar', '.gz'].includes(ext);
}

async function main() {
  const args = process.argv.slice(2);

  let bumpType: BumpType = 'patch';
  let target: 'bridge' | 'supervisor' | 'both' = 'both';
  let changes = '### Changed\n- Sync updates from development';
  let commitMsg = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--bump':
        bumpType = (args[++i] as BumpType) || 'patch';
        break;
      case '--target':
        target = (args[++i] as any) || 'both';
        break;
      case '--changes':
        changes = args[++i] || changes;
        break;
      case '--message':
      case '-m':
        commitMsg = args[++i] || '';
        break;
      case '--help':
        console.log(`
Usage: npx tsx scripts/push-to-github.ts [options]

Options:
  --bump <patch|minor|major>   Version bump type (default: patch)
  --target <bridge|supervisor|both>  Which addon to bump (default: both)
  --changes "<changelog text>"  Changelog entry content
  -m, --message "<commit msg>"  Custom commit message
  --help                        Show this help

Examples:
  npx tsx scripts/push-to-github.ts --bump patch --changes "### Fixed\\n- Bug fix"
  npx tsx scripts/push-to-github.ts --bump minor --target bridge -m "feat: new feature"
  npx tsx scripts/push-to-github.ts  (sync with defaults)
`);
        process.exit(0);
    }
  }

  console.log('=== Helm GitHub Sync ===\n');
  console.log('Connecting to GitHub...');
  const octokit = await getUncachableGitHubClient();

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}\n`);

  console.log('Version bumping...');
  let bridgeVersion = '';
  let supervisorVersion = '';

  if (target === 'bridge' || target === 'both') {
    bridgeVersion = bumpAddon(BRIDGE_ADDON, bumpType, changes);
  }
  if (target === 'supervisor' || target === 'both') {
    supervisorVersion = bumpAddon(SUPERVISOR_ADDON, bumpType, changes);
  }

  if (!commitMsg) {
    const parts: string[] = [];
    if (bridgeVersion) parts.push(`bridge v${bridgeVersion}`);
    if (supervisorVersion) parts.push(`supervisor v${supervisorVersion}`);
    commitMsg = `release: ${parts.join(', ')}\n\n${changes}`;
  }

  console.log(`\nTarget: ${OWNER}/${REPO} (branch: ${BRANCH})`);

  let baseSha: string;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    baseSha = ref.object.sha;
    console.log(`Current HEAD: ${baseSha.substring(0, 7)}`);
  } catch (error: any) {
    console.error(`Could not find branch '${BRANCH}'. Make sure the repo exists.`);
    throw error;
  }

  const { data: baseCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: baseSha,
  });

  const files = collectAllFiles();
  console.log(`\nUploading ${files.length} files...`);

  const treeItems: any[] = [];

  for (const file of files) {
    try {
      const isBinary = isBinaryFile(file.localPath);
      const content = fs.readFileSync(file.localPath);

      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: content.toString('base64'),
        encoding: 'base64',
      });

      treeItems.push({
        path: file.repoPath,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      });

      console.log(`  + ${file.repoPath}`);
    } catch (err: any) {
      console.warn(`  ! Skipped ${file.repoPath}: ${err.message}`);
    }
  }

  console.log('\nCreating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseCommit.tree.sha,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: commitMsg,
    tree: tree.sha,
    parents: [baseSha],
  });

  console.log('Updating branch...');
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha,
  });

  console.log(`\n=== Push Complete ===`);
  console.log(`Commit: ${newCommit.sha.substring(0, 7)}`);
  console.log(`URL: https://github.com/${OWNER}/${REPO}/commit/${newCommit.sha}`);
  if (bridgeVersion) console.log(`Bridge: v${bridgeVersion}`);
  if (supervisorVersion) console.log(`Supervisor: v${supervisorVersion}`);
}

main().catch((err) => {
  console.error('Push failed:', err.message);
  if (err.response?.data) {
    console.error('Details:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
