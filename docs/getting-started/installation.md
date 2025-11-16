# Installation

This guide walks you through installing DreamOS from scratch, whether you're on Windows, Mac, or Linux.

## System Requirements

### Minimum Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: 18.0.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Recommended Setup

- **Node.js**: 20.x LTS (latest stable)
- **RAM**: 8GB or more
- **Internet**: For API calls and YouTube integration
- **Screen**: 1920x1080 or higher for best experience

## Step-by-Step Installation

### 1. Install Node.js

{% tabs %}
{% tab title="Windows" %}
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (`.msi` file)
3. Follow the installation wizard
4. Verify installation:
```cmd
node --version
npm --version
```
{% endtab %}

{% tab title="macOS" %}
**Option A: Official Installer**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the `.pkg` installer
3. Follow installation steps

**Option B: Homebrew (Recommended)**
```bash
brew install node@20
```

Verify:
```bash
node --version
npm --version
```
{% endtab %}

{% tab title="Linux" %}
**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Fedora:**
```bash
sudo dnf install nodejs
```

Verify:
```bash
node --version
npm --version
```
{% endtab %}
{% endtabs %}

### 2. Install Git

{% tabs %}
{% tab title="Windows" %}
1. Download from [git-scm.com](https://git-scm.com/)
2. Run installer, use default settings
3. Verify:
```cmd
git --version
```
{% endtab %}

{% tab title="macOS" %}
**Already Installed**: macOS includes Git
Or install latest via Homebrew:
```bash
brew install git
```

Verify:
```bash
git --version
```
{% endtab %}

{% tab title="Linux" %}
```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

Verify:
```bash
git --version
```
{% endtab %}
{% endtabs %}

### 3. Clone DreamOS Repository

Open your terminal/command prompt:

```bash
# Navigate to where you want the project
cd ~/Documents  # or C:\Users\YourName\Documents on Windows

# Clone the repository
git clone https://github.com/Ananya1464/DreamOS.git

# Enter the project directory
cd DreamOS
```

### 4. Install Dependencies

This downloads all required packages (React, Framer Motion, Tailwind CSS, etc.):

```bash
npm install
```

**This may take 2-3 minutes.** You'll see progress bars as packages download.

{% hint style="warning" %}
**Seeing errors?** Common fixes:
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and retry: `rm -rf node_modules && npm install`
- Use Node 20 LTS: `nvm install 20 && nvm use 20`
{% endhint %}

### 5. Verify Installation

```bash
# Check all dependencies installed
npm list --depth=0

# Start development server
npm run dev
```

You should see:
```
  VITE v7.2.2  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Open http://localhost:5173/** in your browser. You should see the DreamOS login screen!

## Post-Installation Setup

### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

This creates a `.env` file where you'll add your API keys later.

### Verify File Structure

Your project should look like this:

```
DreamOS/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── utils/          # Helper functions
│   ├── data/           # Demo data
│   └── App.jsx         # Main app
├── public/             # Static assets
├── docs/               # Documentation
├── .env.example        # Example environment variables
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── README.md           # Project readme
```

## Optional: Install DreamOS Globally

If you want to run DreamOS from anywhere:

```bash
# Build the production version
npm run build

# Serve it globally (optional)
npm install -g serve
serve -s dist -p 3000
```

Now access at: `http://localhost:3000`

## IDE Setup (Recommended)

### Visual Studio Code

**Install Extensions:**

1. **ES7+ React/Redux/React-Native snippets** - For React snippets
2. **Tailwind CSS IntelliSense** - For Tailwind autocomplete
3. **Prettier** - Code formatting
4. **ESLint** - Code linting

**Open DreamOS in VS Code:**
```bash
code .
```

### WebStorm / IntelliJ IDEA

1. Open project folder
2. Enable Node.js support
3. Install Tailwind CSS plugin
4. Configure Prettier for formatting

## Troubleshooting

### Issue: `npm install` fails

<details>
<summary><strong>Solution 1: Clear cache and retry</strong></summary>

```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

</details>

<details>
<summary><strong>Solution 2: Use legacy peer deps</strong></summary>

```bash
npm install --legacy-peer-deps
```

</details>

<details>
<summary><strong>Solution 3: Check Node version</strong></summary>

```bash
node --version
# Should be 18.x or 20.x

# If not, install correct version
nvm install 20
nvm use 20
npm install
```

</details>

### Issue: Port 5173 already in use

```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Or use different port:
npm run dev -- --port 3000
```

### Issue: Permission denied errors

```bash
# Mac/Linux: Run with sudo (not recommended)
sudo npm install

# Better: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Issue: EACCES or EPERM errors on Windows

```powershell
# Run PowerShell as Administrator
npm install -g windows-build-tools
npm install
```

## Alternative Installation: Docker (Advanced)

If you prefer containerized deployment:

```dockerfile
# Create Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

```bash
# Build and run
docker build -t dreamos .
docker run -p 5173:5173 dreamos
```

## Next Steps

✅ Installation complete! Now let's configure your API keys:

{% content-ref url="configuration.md" %}
[configuration.md](configuration.md)
{% endcontent-ref %}

Or skip to your first session:

{% content-ref url="first-steps.md" %}
[first-steps.md](first-steps.md)
{% endcontent-ref %}

## Getting Help

- **GitHub Issues**: [Report installation problems](https://github.com/Ananya1464/DreamOS/issues)
- **Discussions**: [Ask the community](https://github.com/Ananya1464/DreamOS/discussions)
- **Email**: ananyadubey1464@gmail.com
