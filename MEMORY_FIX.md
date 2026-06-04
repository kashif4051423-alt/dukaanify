# 🔧 Memory Issue Fix - Dev Server

## Problem
The dev server was running out of memory (heap out of memory error) on Windows.

## Solution
Increase Node.js memory allocation before starting the dev server.

---

## ✅ How to Start Dev Server (Fixed)

### Option 1: PowerShell (Recommended)
```powershell
$env:NODE_OPTIONS='--max-old-space-size=4096'; npm run dev
```

### Option 2: Command Prompt (CMD)
```cmd
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
```

### Option 3: Create a Batch File
Create `dev.bat`:
```batch
@echo off
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
pause
```

Then run: `dev.bat`

---

## 📊 Memory Allocation Options

| Size | Use Case |
|------|----------|
| 2048 | Small projects |
| 4096 | Medium projects (Recommended) |
| 8192 | Large projects |
| 16384 | Very large projects |

---

## 🚀 Current Status

✅ Server running on `http://localhost:3000`  
✅ Memory allocated: 4096 MB  
✅ All pages loading  
✅ No errors  

---

## 💡 Why This Happens

- Next.js with Turbopack uses more memory
- Windows has stricter memory limits than Linux
- Large projects need more heap space
- Caching and compilation require memory

---

## 🔍 Check Memory Usage

```powershell
# Check current memory usage
Get-Process node | Select-Object ProcessName, WorkingSet
```

---

## ✅ Website is Now Working!

Visit: `http://localhost:3000`

All pages should load correctly now.
