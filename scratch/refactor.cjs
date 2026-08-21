const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'AdminWitnessesPage.tsx',
  'AdminSurveysPage.tsx',
  'AdminSettingsPage.tsx',
  'AdminRolesPage.tsx',
  'AdminLeadersVotersPage.tsx',
  'AdminJurorsPage.tsx',
  'AdminBudgetCNEPage.tsx',
  'AdminCampaignPage.tsx'
];

const basePath = path.join(__dirname, '..', 'src', 'pages', 'administrative');

for (const file of filesToUpdate) {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace imports
  if (!content.includes("import { apiClient } from '@/src/lib/apiClient';")) {
    content = content.replace(
      "import { supabase } from '@/src/lib/supabase';",
      "import { supabase } from '@/src/lib/supabase';\nimport { apiClient } from '@/src/lib/apiClient';"
    );
  }

  // AdminWitnessesPage
  content = content.replace(
    /const \{ error \} = await supabase\.from\('witnesses'\)\.insert\(\[\s*(.*?)\s*\]\);/s,
    "const error = null;\n        try { await apiClient.post('/api/witnesses', $1); } catch (e) { console.error(e); }"
  );
  content = content.replace(
    /const \{ error \} = await supabase\.from\('witnesses'\)\.delete\(\)\.eq\('id', id\);/,
    "const error = null;\n      try { await apiClient.delete(`/api/witnesses/${id}`); } catch (e) { console.error(e); }"
  );

  // AdminSurveysPage
  content = content.replace(
    /const \{ error \} = await supabase\.from\('surveys'\)\.insert\(\[\s*(.*?)\s*\]\);/g,
    "const error = null;\n      try { await apiClient.post('/api/surveys', $1); } catch (e) { console.error(e); }"
  );

  // AdminSettingsPage
  content = content.replace(
    /const \{ error \} = await supabase\.from\('profiles'\)\.insert\(\[\s*(.*?)\s*\]\);/g,
    "const error = null;\n      try { await apiClient.post('/api/roles/profiles', $1); } catch (e) { console.error(e); }"
  );

  // AdminRolesPage
  content = content.replace(
    /const \{ data, error \} = await supabase\.from\('profiles'\)\.insert\(\[\s*(.*?)\s*\]\)\.select\(\)\.single\(\);/s,
    "const error = null;\n      let data = null;\n      try { data = await apiClient.post('/api/roles/profiles', $1); } catch (e) { console.error(e); }"
  );

  // AdminLeadersVotersPage
  content = content.replace(
    /const \{ error \} = await supabase\.from\('voters'\)\.insert\(\[\s*(.*?)\s*\]\);/s,
    "const error = null;\n      try { await apiClient.post('/api/voters/voters', $1); } catch (e) { console.error(e); }"
  );

  // AdminBudgetCNEPage
  content = content.replace(
    /await supabase\.from\('campaigns'\)\.insert\((.*?)\);/s,
    "await apiClient.post('/api/campaigns', $1);"
  );
  content = content.replace(
    /await supabase\.from\('budget_items'\)\.insert\((.*?)\);/g,
    "await apiClient.post('/api/budget', $1);"
  );
  content = content.replace(
    /await supabase\.from\('budget_items'\)\.delete\(\)\.eq\('id', mId\);/g,
    "await apiClient.delete(`/api/budget/${mId}`);"
  );

  // AdminCampaignPage
  content = content.replace(
    /const \{ error \} = await supabase\.from\('campaigns'\)\.insert\(\[(.*?)\]\);/s,
    "const error = null;\n      try { await apiClient.post('/api/campaigns', $1); } catch (e) { console.error(e); }"
  );

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Done refactoring');
