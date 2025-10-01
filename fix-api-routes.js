const fs = require('fs');
const path = require('path');

const dynamicFlags = `// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

`;

const supabaseClient = `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
`;

// List of API routes to fix
const apiRoutes = [
  'app/api/community/questions/[id]/like/route.ts',
  'app/api/community/questions/[id]/vote/route.ts',
  'app/api/community/questions/[id]/bookmark/route.ts',
  'app/api/community/questions/[id]/view/route.ts',
  'app/api/community/questions/[id]/answers/route.ts',
  'app/api/community/answers/[id]/vote/route.ts',
  'app/api/community/answers/[id]/comments/route.ts',
  'app/api/history/route.ts',
  'app/api/log-query/route.ts',
  'app/api/qna/route.ts',
  'app/api/auth/config/route.ts'
];

apiRoutes.forEach(route => {
  const filePath = path.join(process.cwd(), route);
  
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${route}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add dynamic flags if not already present
    if (!content.includes('export const dynamic')) {
      content = content.replace(/^import/, dynamicFlags + 'import');
    }
    
    // Replace createServerSupabaseClient with regular client
    content = content.replace(
      /import { createServerSupabaseClient } from '@\/lib\/supabase\/server'/g,
      supabaseClient
    );
    
    content = content.replace(
      /const supabase = createServerSupabaseClient\(\)/g,
      '// Using regular Supabase client'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${route}`);
  } else {
    console.log(`⚠ File not found: ${route}`);
  }
});

console.log('Done! All API routes have been updated.');
