# Deploy Helm Bridge Add-on to GitHub

Follow these steps to set up your GitHub repository for Home Assistant add-on installation.

## Required Repository Structure

Your GitHub repository (`https://github.com/Mjolnir357/Helm-by-nautilink.replit.app`) needs this structure:

```
/
├── repository.yaml          <- At repository root
└── helm-bridge/             <- Add-on folder (must match slug in config.yaml)
    ├── config.yaml
    ├── Dockerfile
    ├── run.sh
    ├── README.md
    ├── rootfs/
    │   └── usr/share/helm-bridge/
    │       ├── package.json
    │       └── dist/
    │           └── index.js  <- Pre-built bundle (included)
    └── translations/
        └── en.yaml
```

## Step-by-Step Deployment

### Step 1: Build the Bridge Code in Replit (REQUIRED FIRST)

Run these commands in the **Replit shell** to build the bridge bundle:

```bash
cd packages/helm-bridge-addon
chmod +x build.sh
./build.sh
```

This creates `rootfs/usr/share/helm-bridge/dist/index.js` from the bridge source files located in `bridge/src/`. The build must happen in Replit where the source code exists.

### Step 2: Prepare Deployment Package

After the build succeeds, create a deployment-ready folder:

```bash
# Navigate to project root (run from Replit shell)
cd ~/workspace

# Create deployment structure
mkdir -p /tmp/helm-addon-deploy/helm-bridge

# Copy repository.yaml to root
cp packages/helm-bridge-addon/repository.yaml /tmp/helm-addon-deploy/

# Copy add-on files to helm-bridge folder
cp packages/helm-bridge-addon/config.yaml /tmp/helm-addon-deploy/helm-bridge/
cp packages/helm-bridge-addon/Dockerfile /tmp/helm-addon-deploy/helm-bridge/
cp packages/helm-bridge-addon/run.sh /tmp/helm-addon-deploy/helm-bridge/
cp packages/helm-bridge-addon/README.md /tmp/helm-addon-deploy/helm-bridge/
cp -r packages/helm-bridge-addon/rootfs /tmp/helm-addon-deploy/helm-bridge/
cp -r packages/helm-bridge-addon/translations /tmp/helm-addon-deploy/helm-bridge/

# Verify the built bundle exists
ls -la /tmp/helm-addon-deploy/helm-bridge/rootfs/usr/share/helm-bridge/dist/

# Check final structure
echo "=== Repository root ==="
ls -la /tmp/helm-addon-deploy/
echo "=== helm-bridge folder ==="
ls -la /tmp/helm-addon-deploy/helm-bridge/
```

### Step 3: Push to GitHub

**Option A: Download and upload manually**
1. Download the `/tmp/helm-addon-deploy/` folder from Replit
2. Push contents to your GitHub repository

**Option B: Use git from Replit (if configured)**
```bash
cd /tmp/helm-addon-deploy
git init
git remote add origin https://github.com/Mjolnir357/Helm-by-nautilink.replit.app.git
git add .
git commit -m "Add Helm Bridge Home Assistant add-on"
git push -u origin main --force
```

## Installing in Home Assistant

Once pushed to GitHub:

1. Open Home Assistant → **Settings** → **Add-ons** → **Add-on Store**
2. Click ⋮ (three dots) → **Repositories**
3. Add: `https://github.com/Mjolnir357/Helm-by-nautilink.replit.app`
4. Click **Add** → **Close**
5. Refresh the page, then find "Helm Bridge" and click **Install**
6. Configure the add-on (cloud_url defaults to `https://helm-by-nautilink.replit.app`)
7. Start the add-on and check logs for the pairing code
8. Use the pairing code in Helm dashboard under **Integrations** → **Home Assistant**

## Troubleshooting

### "No add-ons found" Error
- Ensure `repository.yaml` is at the repository **root** (not inside helm-bridge/)
- Ensure the add-on folder is named exactly `helm-bridge` (matching the slug in config.yaml)
- Check that all files were committed and pushed

### Build Fails in Replit
- Make sure `bridge/src/index.ts` exists in the Replit project
- The build.sh script must run from within the Replit project, not from GitHub

### Add-on Won't Start
- Check Home Assistant add-on logs for error messages
- Verify `dist/index.js` was included in the pushed files

### Pairing Issues
- After starting the add-on in Home Assistant, check the add-on logs for a pairing code
- The code expires after 10 minutes - restart the add-on to generate a new one
- Use this code in the Helm dashboard at https://helm-by-nautilink.replit.app
