const { rm } = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');

async function main() {
  const root = path.resolve(__dirname, '..');
  
  // Only delete the 4 project source code directories
  const projectDirs = [
    'packages/projects/libra-keeper',
    'packages/projects/quest-hunt',
    'packages/projects/story-forge',
    'packages/projects/velvet-galaxy',
  ];

  for (const dir of projectDirs) {
    const fullPath = path.join(root, dir);
    if (existsSync(fullPath)) {
      console.log(`Deleting ${dir}...`);
      await rm(fullPath, { recursive: true, force: true });
      console.log(`  Deleted ${dir}`);
    } else {
      console.log(`  Skipped ${dir} (not found)`);
    }
  }

  // Check if packages/projects/ is now empty, and if so remove it too
  const projectsDir = path.join(root, 'packages/projects');
  if (existsSync(projectsDir)) {
    const { readdir } = require('fs/promises');
    const remaining = await readdir(projectsDir);
    if (remaining.length === 0) {
      console.log('packages/projects/ is now empty, removing it...');
      await rm(projectsDir, { recursive: true, force: true });
      console.log('  Removed empty packages/projects/');
    } else {
      console.log(`packages/projects/ still has: ${remaining.join(', ')}`);
    }
  }

  console.log('\nDone! Project source code removed. Metadata preserved in packages/projects-metadata/.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
