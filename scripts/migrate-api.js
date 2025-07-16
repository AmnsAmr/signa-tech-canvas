#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Migration mappings
const migrations = [
  {
    from: "import { useImages } from '@/hooks/useImages';",
    to: "import { useOptimizedImages } from '@/hooks/useOptimizedImages';"
  },
  {
    from: "import { useContactSettings } from '@/hooks/useContactSettings';",
    to: "import { useOptimizedContactSettings } from '@/hooks/useOptimizedContactSettings';"
  },
  {
    from: "const { images, loading, error } = useImages(",
    to: "const { images, loading, error } = useOptimizedImages("
  },
  {
    from: "const { settings } = useContactSettings();",
    to: "const { settings } = useOptimizedContactSettings();"
  },
  {
    from: "buildApiUrl('/api/images')",
    to: "ImagesApi.getAll()"
  },
  {
    from: "buildUploadUrl(",
    to: "ImagesApi.getImageUrl("
  }
];

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  migrations.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${filePath}`);
  }
}

function migrateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      migrateDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      migrateFile(fullPath);
    }
  });
}

// Run migration
console.log('🚀 Starting API migration...');
migrateDirectory(path.join(__dirname, '../src'));
console.log('✨ Migration complete!');