const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const content = `NEXT_PUBLIC_SUPABASE_URL=https://efzevdsbgyscrhcvvfyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmemV2ZHNiZ3lzY3JoY3Z2ZnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjM2NzYsImV4cCI6MjA4MzU5OTY3Nn0.lSmS0fFJOfyweyAqgK6TaE_nklOZYdMQPkRNXP8DVlo
`;

fs.writeFileSync(envPath, content, 'utf8');
console.log('Successfully wrote .env.local with UTF-8 encoding');
